import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/lib/db';
import { User } from '@/lib/models/User';
import { Expense } from '@/lib/models/Expense';
import { Budget } from '@/lib/models/Budget';
import { SavingsGoal } from '@/lib/models/SavingsGoal';
import { Portfolio } from '@/lib/models/Portfolio';
import { Roundup } from '@/lib/models/Roundup';
import { Investment } from '@/lib/models/Investment';
import mongoose from 'mongoose';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Please fill in all details' }, { status: 400 });
    }

    await connectToDatabase();

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const isDemo = email.toLowerCase() === 'demo@investease.ai';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      income: isDemo ? 85000 : 0,
      occupation: isDemo ? 'Senior Product Designer' : '',
      monthlySavingsGoal: isDemo ? 25000 : 0,
      notifications: {
        budgetAlerts: true,
        savingsReminders: true,
      },
    });

    // Automatically seed a complete set of mock stats if registering the Demo Account (Indian Context)
    if (isDemo) {
      const userId = user._id;
      const now = new Date();
      const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // 1. Create monthly budget sheet (in ₹)
      await Budget.create({
        userId,
        month: currentMonthStr,
        limit: 45000,
        categoryBudgets: {
          Food: 12000,
          Travel: 8000,
          Shopping: 10000,
          Education: 3000,
          Medical: 2000,
          Entertainment: 4000,
          Bills: 5000,
          Others: 3000,
        },
      });

      // 2. Seed active savings goals (in ₹)
      await SavingsGoal.create([
        {
          userId,
          title: '3-Month Emergency Fund',
          targetAmount: 150000,
          currentSavings: 62000,
          category: 'Emergency Fund',
          deadline: new Date(now.getFullYear(), now.getMonth() + 8, 15),
        },
        {
          userId,
          title: 'Mutual Funds SIP Pot',
          targetAmount: 25000,
          currentSavings: 18000,
          category: 'Bike',
          deadline: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        },
        {
          userId,
          title: 'MacBook Upgrade Fund',
          targetAmount: 180000,
          currentSavings: 60000,
          category: 'Laptop',
          deadline: new Date(now.getTime() + 120 * 24 * 60 * 60 * 1000),
        },
      ]);

      // 3. Seed mock expenses with fractional amounts (in ₹) to trigger roundups
      const expenseSeeds = [
        {
          userId,
          title: 'JioFiber Broadband Bill',
          amount: 999.45,
          category: 'Bills',
          merchant: 'Jio Infocomm',
          date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
          paymentMethod: 'Bank Transfer',
          notes: 'Auto-debit setup',
        },
        {
          userId,
          title: 'Zomato Dinner Delivery',
          amount: 1250.35,
          category: 'Food',
          merchant: 'Zomato',
          date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
          paymentMethod: 'Credit Card',
        },
        {
          userId,
          title: 'Blinkit Instant Groceries',
          amount: 680.15,
          category: 'Food',
          merchant: 'Blinkit',
          date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
          paymentMethod: 'Debit Card',
        },
        {
          userId,
          title: 'Uber Hired Ride to Office',
          amount: 342.60,
          category: 'Travel',
          merchant: 'Uber India',
          date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
          paymentMethod: 'Credit Card',
        },
        {
          userId,
          title: 'Amazon Shopping (Desk Mat)',
          amount: 1499.20,
          category: 'Shopping',
          merchant: 'Amazon',
          date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000),
          paymentMethod: 'Credit Card',
        },
        {
          userId,
          title: 'IRCTC Train Booking (Family)',
          amount: 2450.85,
          category: 'Travel',
          merchant: 'IRCTC',
          date: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
          paymentMethod: 'Bank Transfer',
        },
        {
          userId,
          title: 'Luxury Lounge Dinner',
          amount: 421.65,
          category: 'Entertainment',
          merchant: 'Grand Luxury Lounge',
          date: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 20, 15),
          paymentMethod: 'Credit Card',
        },
      ];

      const createdExpenses = await Expense.create(expenseSeeds);

      // Create roundups for each expense seed
      const generatedRoundups: any[] = [];
      createdExpenses.forEach((exp) => {
        const amt = exp.amount;
        const rounded = Math.ceil(amt);
        const diff = Number((rounded - amt).toFixed(2));
        if (diff > 0) {
          generatedRoundups.push({
            userId,
            expenseId: exp._id,
            amount: diff,
            originalAmount: amt,
            roundedAmount: rounded,
            merchant: exp.merchant,
            status: 'Invested',
            createdAt: exp.date,
          });
        }
      });
      await Roundup.create(generatedRoundups);

      // 4. Create User's Portfolio
      const totalSeedInvested = generatedRoundups.reduce((sum, r) => sum + r.amount, 0) + 2900;
      await Portfolio.create({
        userId,
        allocations: { indexFunds: 40, mutualFunds: 20, stocks: 20, gold: 10, crypto: 10 },
        balances: {
          indexFunds: Number((totalSeedInvested * 0.40).toFixed(2)),
          mutualFunds: Number((totalSeedInvested * 0.20).toFixed(2)),
          stocks: Number((totalSeedInvested * 0.20).toFixed(2)),
          gold: Number((totalSeedInvested * 0.10).toFixed(2)),
          crypto: Number((totalSeedInvested * 0.10).toFixed(2)),
        },
        totalInvested: Number(totalSeedInvested.toFixed(2)),
        currentValue: Number((totalSeedInvested * 1.078).toFixed(2)), // simulate +7.8% returns
      });

      // 5. Seed some past Investment sweeps for the last 6 months
      const pastMonths = [5, 4, 3, 2, 1, 0];
      const monthlyInvestments: any[] = [];
      const monthlyRoundupSeeds: any[] = [];

      pastMonths.forEach((m) => {
        const date = new Date(now.getTime() - m * 30 * 24 * 60 * 60 * 1000);
        const amount = 350 + Math.random() * 100;
        monthlyInvestments.push({
          userId,
          amount: Number(amount.toFixed(2)),
          date,
          allocationsApplied: {
            indexFunds: Number((amount * 0.40).toFixed(2)),
            mutualFunds: Number((amount * 0.20).toFixed(2)),
            stocks: Number((amount * 0.20).toFixed(2)),
            gold: Number((amount * 0.10).toFixed(2)),
            crypto: Number((amount * 0.10).toFixed(2)),
          },
          description: `Monthly auto round-up sweeps`,
        });

        // Add corresponding roundup seeds for listing
        monthlyRoundupSeeds.push({
          userId,
          expenseId: new mongoose.Types.ObjectId(),
          amount: Number((0.15 + Math.random() * 0.8).toFixed(2)),
          originalAmount: Number((10 + Math.random() * 400).toFixed(2)),
          roundedAmount: 0,
          merchant: m % 2 === 0 ? 'Swiggy' : 'Amazon',
          status: 'Invested',
          createdAt: date,
        });
      });

      monthlyRoundupSeeds.forEach(r => {
        r.roundedAmount = Math.ceil(r.originalAmount);
        r.amount = Number((r.roundedAmount - r.originalAmount).toFixed(2));
      });

      await Investment.create(monthlyInvestments);
      await Roundup.create(monthlyRoundupSeeds);
    }

    return NextResponse.json(
      { message: 'Registration successful', user: { id: user._id, name: user.name, email: user.email } },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error during signup' }, { status: 500 });
  }
}
