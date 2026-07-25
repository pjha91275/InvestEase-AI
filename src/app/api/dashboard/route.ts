import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectToDatabase } from '@/lib/db';
import { Expense } from '@/lib/models/Expense';
import { Budget } from '@/lib/models/Budget';
import { SavingsGoal } from '@/lib/models/SavingsGoal';
import { Portfolio } from '@/lib/models/Portfolio';
import { Roundup } from '@/lib/models/Roundup';
import { calculateFinancialHealth } from '@/lib/rules/health';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
  }

  try {
    await connectToDatabase();
    const userId = session.user.id;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // 1. Today's Spending
    const todayExpenses = await Expense.find({
      userId,
      date: { $gte: startOfToday },
    });
    const todaySpending = todayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // 2. Monthly Spending
    const monthlyExpenses = await Expense.find({
      userId,
      date: { $gte: startOfMonth },
    });
    const monthlySpending = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);

    // 3. Budget Remaining
    const budgetObj = await Budget.findOne({ userId, month: currentMonthStr });
    const totalBudget = budgetObj ? budgetObj.limit : 0;
    const budgetRemaining = totalBudget > 0 ? Math.max(totalBudget - monthlySpending, 0) : 0;

    // 4. Savings Progress
    const savingsGoals = await SavingsGoal.find({ userId });
    const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.currentSavings, 0);
    const savingsTarget = savingsGoals.reduce((sum, goal) => sum + goal.targetAmount, 0);

    // 5. Financial Health
    const health = await calculateFinancialHealth(userId);

    // 6. Recent Transactions
    const recentTransactions = await Expense.find({ userId })
      .sort({ date: -1 })
      .limit(5);

    // 7. Fraud Alerts (Removed Security Engine checks)
    const fraudAlerts: any[] = [];

    // 7b. Fetch Portfolio and Roundup Aggregates
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

    const allRoundups = await Roundup.find({ userId });
    const roundupSavings = allRoundups.reduce((sum, r) => sum + r.amount, 0);
    const investmentValue = portfolio.currentValue;
    const totalInvested = portfolio.totalInvested;
    const portfolioGrowth = investmentValue - totalInvested;

    // 8. Upcoming Bills (Category: Bills, sort by date)
    const upcomingBills = await Expense.find({
      userId,
      category: 'Bills',
      date: { $gte: now },
    })
      .sort({ date: 1 })
      .limit(3);

    // Provide mock bills if none are present to keep the UI rich and dynamic
    const finalUpcomingBills = upcomingBills.length > 0 ? upcomingBills : [
      {
        _id: 'mock-bill-1',
        title: 'Electricity Bill',
        amount: 3200.00,
        category: 'Bills',
        merchant: 'Adani Electricity',
        date: new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000),
        paymentMethod: 'UPI Autopay',
      },
      {
        _id: 'mock-bill-2',
        title: 'High-speed Broadband',
        amount: 1199.00,
        category: 'Bills',
        merchant: 'JioFiber Broadband',
        date: new Date(now.getTime() + 11 * 24 * 60 * 60 * 1000),
        paymentMethod: 'UPI Autopay',
      }
    ];

    // 9. Monthly Category distribution
    const categoryTotals: Record<string, number> = {};
    monthlyExpenses.forEach((exp) => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });

    const categoryDistribution = Object.keys(categoryTotals).map((cat) => ({
      name: cat,
      value: categoryTotals[cat],
    }));

    return NextResponse.json({
      todaySpending,
      monthlySpending,
      totalBudget,
      budgetRemaining,
      totalSavings,
      savingsTarget,
      healthScore: health.score,
      healthSuggestions: health.suggestions,
      recentTransactions,
      fraudAlerts,
      upcomingBills: finalUpcomingBills,
      categoryDistribution,
      roundupSavings,
      investmentValue,
      portfolioGrowth,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error loading dashboard metrics' }, { status: 500 });
  }
}
