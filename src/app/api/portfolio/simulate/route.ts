import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Portfolio } from '@/lib/models/Portfolio';
import { Notification } from '@/lib/models/Notification';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const userId = session.user.id;

    let portfolio = await Portfolio.findOne({ userId });
    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Performance rates mock configuration
    // (Volatilities: Index: medium, Mutual: low, Stocks: high, Gold: low-safe, Crypto: extreme)
    const drift = {
      indexFunds: (Math.random() * 4 - 1.5) / 100,  // -1.5% to +2.5%
      mutualFunds: (Math.random() * 3 - 1.0) / 100, // -1.0% to +2.0%
      stocks: (Math.random() * 8 - 3.0) / 100,      // -3.0% to +5.0%
      gold: (Math.random() * 2 - 0.5) / 100,        // -0.5% to +1.5%
      crypto: (Math.random() * 25 - 10.0) / 100,    // -10.0% to +15.0%
    };

    const oldVal = portfolio.currentValue || 0;
    
    // Apply drifts to balances
    portfolio.balances.indexFunds = Number((portfolio.balances.indexFunds * (1 + drift.indexFunds)).toFixed(2));
    portfolio.balances.mutualFunds = Number((portfolio.balances.mutualFunds * (1 + drift.mutualFunds)).toFixed(2));
    portfolio.balances.stocks = Number((portfolio.balances.stocks * (1 + drift.stocks)).toFixed(2));
    portfolio.balances.gold = Number((portfolio.balances.gold * (1 + drift.gold)).toFixed(2));
    portfolio.balances.crypto = Number((portfolio.balances.crypto * (1 + drift.crypto)).toFixed(2));

    // Re-sum total currentValue
    const newVal = 
      portfolio.balances.indexFunds + 
      portfolio.balances.mutualFunds + 
      portfolio.balances.stocks + 
      portfolio.balances.gold + 
      portfolio.balances.crypto;

    portfolio.currentValue = Number(newVal.toFixed(2));
    await portfolio.save();

    const difference = portfolio.currentValue - oldVal;
    const diffPercent = oldVal > 0 ? Number(((difference / oldVal) * 100).toFixed(2)) : 0;

    // Log Notification
    let notificationMsg = `Simulated market update applied. Portfolio value is now ₹${portfolio.currentValue.toLocaleString('en-IN')}`;
    if (diffPercent !== 0) {
      const direction = diffPercent > 0 ? 'grew by' : 'slipped by';
      notificationMsg += ` (${direction} ${Math.abs(diffPercent)}%)`;
    }

    await Notification.create({
      userId,
      title: 'Market Performance Simulated',
      message: notificationMsg,
      type: diffPercent >= 0 ? 'success' : 'alert',
      isRead: false,
    });

    return NextResponse.json({
      message: 'Simulation completed',
      drift,
      difference,
      diffPercent,
      portfolio,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error running simulation' }, { status: 500 });
  }
}
