import { connectToDatabase } from '@/lib/db';
import { Expense } from '@/lib/models/Expense';
import { Budget } from '@/lib/models/Budget';
import { SavingsGoal } from '@/lib/models/SavingsGoal';
import { User } from '@/lib/models/User';

export async function calculateFinancialHealth(userId: string) {
  await connectToDatabase();
  
  const user = await User.findById(userId);
  if (!user) {
    return {
      score: 0,
      suggestions: ['User profile not found.'],
      breakdown: { savingsRate: 0, budget: 0, distribution: 0, emergency: 0, consistency: 0 }
    };
  }

  const income = user.income || 3000; // Fallback to baseline if income is not configured
  
  // Get active month formatted as YYYY-MM
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // 1. Fetch current month expenses
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const expenses = await Expense.find({
    userId,
    date: { $gte: startOfMonth },
  });
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  // 2. Fetch budget
  const budgetObj = await Budget.findOne({ userId, month: currentMonth });
  const totalBudget = budgetObj ? budgetObj.limit : 0;

  // 3. Fetch savings goals
  const savingsGoals = await SavingsGoal.find({ userId });
  const totalSavings = savingsGoals.reduce((sum, goal) => sum + goal.currentSavings, 0);

  // --- SCORE COMPUTATION ---
  let score = 0;
  const suggestions: string[] = [];

  // Area A: Savings Rate (Max 35 points)
  // Formula: (Income - Expenses) / Income
  const savingsRate = income > 0 ? (income - totalExpenses) / income : 0;
  let savingsRateScore = 0;
  if (savingsRate >= 0.3) {
    savingsRateScore = 35;
  } else if (savingsRate >= 0.2) {
    savingsRateScore = 30;
    suggestions.push('Increase your savings rate to 30% or more to accelerate your wealth building.');
  } else if (savingsRate >= 0.1) {
    savingsRateScore = 20;
    suggestions.push('Your savings rate is below the recommended 20%. Try cutting down minor desires.');
  } else if (savingsRate > 0) {
    savingsRateScore = 10;
    suggestions.push('You are barely saving. Review your monthly subscriptions and recurrent costs.');
  } else {
    savingsRateScore = 0;
    suggestions.push('CRITICAL: You are spending more than you earn! Immediately draft a core needs-only budget.');
  }
  score += savingsRateScore;

  // Area B: Budget Utilization (Max 25 points)
  let budgetScore = 0;
  if (totalBudget > 0) {
    const utilization = totalExpenses / totalBudget;
    if (utilization >= 0.7 && utilization <= 0.9) {
      budgetScore = 25;
    } else if (utilization < 0.7) {
      budgetScore = 20; // Under-utilized, good, but could invest surplus
      suggestions.push('You have remaining room in your budgets. Consider moving surplus directly into savings goals.');
    } else if (utilization <= 1.0) {
      budgetScore = 15;
      suggestions.push('You are near the limit of your total budget. Watch your pending expenses closely.');
    } else {
      budgetScore = 5;
      suggestions.push('You have exceeded your total monthly budget limit. Review which categories blew your cap.');
    }
  } else {
    budgetScore = 10;
    suggestions.push('Setting a monthly budget limit helps you monitor allocations. Navigate to Budget Planner to set one.');
  }
  score += budgetScore;

  // Area C: Expense Distribution (Max 15 points)
  // Needs: Bills, Medical, Education. Wants: Food, Shopping, Travel, Entertainment, Others
  let needsTotal = 0;
  let wantsTotal = 0;
  expenses.forEach((exp) => {
    if (['Bills', 'Medical', 'Education'].includes(exp.category)) {
      needsTotal += exp.amount;
    } else {
      wantsTotal += exp.amount;
    }
  });

  let distributionScore = 15;
  if (totalExpenses > 0) {
    const needsRatio = needsTotal / totalExpenses;
    const wantsRatio = wantsTotal / totalExpenses;
    
    // Ideal: Needs <= 50%, Wants <= 30%
    if (needsRatio > 0.6) {
      distributionScore -= 5;
      suggestions.push('Your essential needs represent a high percentage of your costs. Search for utility savings.');
    }
    if (wantsRatio > 0.4) {
      distributionScore -= 5;
      suggestions.push('Discretionary wants (shopping, travel, entertainment) are high. Restrict impulsive buys.');
    }
  } else {
    distributionScore = 10;
  }
  score += Math.max(distributionScore, 0);

  // Area D: Emergency Savings Index (Max 15 points)
  const emergencyThreshold = income * 3;
  let emergencyScore = 0;
  if (totalSavings >= emergencyThreshold) {
    emergencyScore = 15;
  } else if (totalSavings >= emergencyThreshold / 2) {
    emergencyScore = 10;
    suggestions.push('You are midway to building a solid 3-month emergency fund. Keep contributing!');
  } else if (totalSavings > 0) {
    emergencyScore = 5;
    suggestions.push('Your emergency buffer is low. Aim to save at least $1,000 as a primary milestone.');
  } else {
    emergencyScore = 0;
    suggestions.push('You do not have any active emergency savings. Start a savings goal dedicated to emergencies.');
  }
  score += emergencyScore;

  // Area E: Spending Consistency (Max 10 points)
  let consistencyScore = 10;
  if (expenses.length > 5) {
    const largestExpense = Math.max(...expenses.map((e) => e.amount), 0);
    if (largestExpense > totalExpenses * 0.7) {
      consistencyScore = 5;
      suggestions.push('One single transaction dominated your monthly costs. Try to amortize major investments.');
    }
  } else if (expenses.length === 0) {
    consistencyScore = 5;
  } else {
    consistencyScore = 8;
  }
  score += consistencyScore;

  const finalScore = Math.min(Math.max(Math.round(score), 0), 100);

  if (finalScore >= 80 && suggestions.length === 0) {
    suggestions.push('Excellent financial hygiene! You are managing expenses, budgets, and savings goals optimally.');
  }

  return {
    score: finalScore,
    suggestions: suggestions.slice(0, 4),
    breakdown: {
      savingsRate: savingsRateScore,
      budget: budgetScore,
      distribution: distributionScore,
      emergency: emergencyScore,
      consistency: consistencyScore,
    },
  };
}
