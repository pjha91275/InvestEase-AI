import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Portfolio } from '@/lib/models/Portfolio';
import { Investment } from '@/lib/models/Investment';
import { Roundup } from '@/lib/models/Roundup';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const userId = session.user.id;

    // 1. Get or Create Portfolio
    let portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      portfolio = await Portfolio.create({
        userId,
        allocations: { indexFunds: 40, mutualFunds: 20, stocks: 20, gold: 10, crypto: 10 },
        balances: { indexFunds: 0, mutualFunds: 0, stocks: 0, gold: 0, crypto: 0 },
        totalInvested: 0,
        currentValue: 0,
      });
    }

    // 2. Compute Roundup Metrics (Daily, Weekly, Monthly, Lifetime)
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayRoundups = await Roundup.find({ userId, createdAt: { $gte: startOfToday } });
    const weeklyRoundups = await Roundup.find({ userId, createdAt: { $gte: startOfWeek } });
    const monthlyRoundups = await Roundup.find({ userId, createdAt: { $gte: startOfMonth } });
    const allRoundups = await Roundup.find({ userId });

    const stats = {
      today: todayRoundups.reduce((sum, r) => sum + r.amount, 0),
      weekly: weeklyRoundups.reduce((sum, r) => sum + r.amount, 0),
      monthly: monthlyRoundups.reduce((sum, r) => sum + r.amount, 0),
      lifetime: allRoundups.reduce((sum, r) => sum + r.amount, 0),
    };

    // 3. Get Recent Investment Logs & Recent Roundups
    const investments = await Investment.find({ userId }).sort({ date: -1 }).limit(10);
    const roundupsList = await Roundup.find({ userId }).sort({ createdAt: -1 }).limit(10);

    // 4. Construct Growth Timeline (Monthly cumulative roundups vs investment values)
    // We group investments by calendar month and calculate the rolling sum
    const monthlyDataMap: Record<string, { roundups: number; investment: number }> = {};
    
    // Seed timeline months for a beautiful visual chart
    const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonthIdx = now.getMonth();
    
    // Initialize past 6 months
    for (let i = 5; i >= 0; i--) {
      const idx = (currentMonthIdx - i + 12) % 12;
      monthlyDataMap[monthsShort[idx]] = { roundups: 0, investment: 0 };
    }

    // Populate from actual investments if they exist
    const allInvestments = await Investment.find({ userId }).sort({ date: 1 });
    
    let cumulativeRoundups = 0;
    let cumulativeValue = 0;

    // Seed mock cumulative values if user has no transactions to make the demo impressive instantly
    if (allInvestments.length === 0) {
      let baseRoundups = 450;
      let baseValue = 480;
      let stepIdx = 0;
      for (const m of Object.keys(monthlyDataMap)) {
        stepIdx++;
        monthlyDataMap[m] = {
          roundups: baseRoundups + stepIdx * 350,
          investment: baseValue + stepIdx * 420 + (stepIdx > 2 ? stepIdx * 80 : 0), // simulate returns
        };
      }
    } else {
      // Map actual investments onto past months
      allInvestments.forEach((inv) => {
        const invMonth = monthsShort[new Date(inv.date).getMonth()];
        if (monthlyDataMap[invMonth] !== undefined) {
          cumulativeRoundups += inv.amount;
          cumulativeValue += inv.amount * 1.12; // add simulated returns of 12%
          monthlyDataMap[invMonth] = {
            roundups: Number(cumulativeRoundups.toFixed(2)),
            investment: Number(cumulativeValue.toFixed(2)),
          };
        }
      });

      // Fill empty forward-running months with last known value
      let lastRoundups = 0;
      let lastInvestment = 0;
      for (const m of Object.keys(monthlyDataMap)) {
        if (monthlyDataMap[m].roundups === 0) {
          monthlyDataMap[m] = { roundups: lastRoundups, investment: lastInvestment };
        } else {
          lastRoundups = monthlyDataMap[m].roundups;
          lastInvestment = monthlyDataMap[m].investment;
        }
      }
    }

    const growthTimeline = Object.keys(monthlyDataMap).map((key) => ({
      month: key,
      roundups: monthlyDataMap[key].roundups,
      investment: monthlyDataMap[key].investment,
    }));

    return NextResponse.json({
      portfolio,
      stats,
      investments,
      roundupsList,
      growthTimeline,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error loading portfolio' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const userId = session.user.id;
    const { allocations } = await req.json();

    if (!allocations) {
      return NextResponse.json({ error: 'Missing allocations parameter' }, { status: 400 });
    }

    const sum = 
      (allocations.indexFunds || 0) + 
      (allocations.mutualFunds || 0) + 
      (allocations.stocks || 0) + 
      (allocations.gold || 0) + 
      (allocations.crypto || 0);

    if (sum !== 100) {
      return NextResponse.json({ error: 'Allocations must sum up to exactly 100%' }, { status: 400 });
    }

    let portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      portfolio = new Portfolio({ userId });
    }

    portfolio.allocations = allocations;
    await portfolio.save();

    return NextResponse.json({ message: 'Allocations updated successfully', portfolio });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error updating allocations' }, { status: 500 });
  }
}
