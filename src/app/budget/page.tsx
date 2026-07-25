'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, ShieldCheck, Wallet, ArrowUpRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/Progress';

interface Budget {
  limit: number;
  categoryBudgets: { [key: string]: number };
}

interface Expense {
  category: string;
  amount: number;
}

export default function BudgetPlanner() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [budget, setBudget] = useState<Budget | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Real-time extra dependencies states
  const [income, setIncome] = useState(85000);
  const [healthScore, setHealthScore] = useState<number | null>(null);

  // Form State
  const [overallLimit, setOverallLimit] = useState('');
  const [categoryLimits, setCategoryLimits] = useState<{ [key: string]: string }>({});
  const [saving, setSaving] = useState(false);

  const categories = ['Food', 'Travel', 'Shopping', 'Education', 'Medical', 'Entertainment', 'Bills', 'Others'];

  const fetchBudgetData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const budgetRes = await fetch('/api/budgets');
      const expensesRes = await fetch('/api/expenses');
      const profileRes = await fetch('/api/profile');
      const healthRes = await fetch('/api/health');

      if (budgetRes.ok && expensesRes.ok) {
        const budgetData = await budgetRes.json();
        const expensesData = await expensesRes.json();

        setBudget(budgetData);
        setExpenses(expensesData);

        if (budgetData && budgetData.limit > 0) {
          setOverallLimit(budgetData.limit.toString());
          const catLimits: { [key: string]: string } = {};
          categories.forEach((cat) => {
            catLimits[cat] = (budgetData.categoryBudgets?.[cat] || 0).toString();
          });
          setCategoryLimits(catLimits);
        } else {
          // Initialize empty defaults
          setOverallLimit('0');
          const catLimits: { [key: string]: string } = {};
          categories.forEach((cat) => {
            catLimits[cat] = '0';
          });
          setCategoryLimits(catLimits);
        }
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setIncome(profileData.income || 85000);
      }

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealthScore(healthData.score);
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred loading data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchBudgetData();
    }
  }, [status, router]);

  // Aggregate expenses by category this month
  const getCategorySpending = (cat: string) => {
    return expenses
      .filter((exp) => exp.category === cat)
      .reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getTotalSpending = () => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const now = new Date();
    const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Validate allocations
    const parsedOverallLimit = parseFloat(overallLimit || '0');
    const catSum = Object.values(categoryLimits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);

    if (parsedOverallLimit < 0 || catSum < 0) {
      setError('Allocated budget thresholds cannot be negative.');
      setSaving(false);
      return;
    }

    if (parsedOverallLimit < catSum) {
      setError(`Validation Error: Overall monthly spending limit (₹${parsedOverallLimit.toLocaleString('en-IN')}) cannot be less than the sum of category allocations (₹${catSum.toLocaleString('en-IN')}).`);
      setSaving(false);
      return;
    }

    const catBudgets: { [key: string]: number } = {};
    categories.forEach((cat) => {
      catBudgets[cat] = parseFloat(categoryLimits[cat] || '0');
    });

    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          month: currentMonthStr,
          limit: parsedOverallLimit,
          categoryBudgets: catBudgets,
        }),
      });

      const d = await res.json();
      if (res.ok) {
        setSuccess('Budget details updated successfully.');
        setBudget(d);
        
        // Re-fetch health score from MongoDB immediately to keep it aligned
        const healthRes = await fetch('/api/health');
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setHealthScore(healthData.score);
        }

        setTimeout(() => setSuccess(''), 4000);
      } else {
        throw new Error(d.error || 'Failed to update budget configurations');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCategoryLimitChange = (cat: string, val: string) => {
    const updatedLimits = {
      ...categoryLimits,
      [cat]: val,
    };
    setCategoryLimits(updatedLimits);

    // Recalculate sum and adjust overall limit if sum exceeds current overall limit
    const newSum = Object.entries(updatedLimits).reduce((sum, [c, v]) => sum + (parseFloat(v) || 0), 0);
    const currentOverall = parseFloat(overallLimit) || 0;
    if (newSum > currentOverall) {
      setOverallLimit(newSum.toString());
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
        <span className="text-sm font-medium text-text-secondary">Loading budgets data...</span>
      </div>
    );
  }

  // Real-time calculations for responsive UI feel
  const totalSpent = getTotalSpending();
  const parsedOverallLimit = parseFloat(overallLimit) || 0;
  const categorySum = Object.values(categoryLimits).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const remainingBudget = Math.max(parsedOverallLimit - totalSpent, 0);
  const percentSpent = parsedOverallLimit > 0 ? (totalSpent / parsedOverallLimit) * 100 : 0;
  const savingsProjection = Math.max(income - parsedOverallLimit, 0);

  const getProgressColor = (percent: number) => {
    if (percent >= 100) return 'bg-accent-danger';
    if (percent >= 85) return 'bg-accent-warning';
    return 'bg-accent-success';
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Block */}
      <div>
        <h1 className="text-2xl sm:text-[36px] font-bold tracking-tight text-text-primary">
          Budget Planner
        </h1>
        <p className="text-sm text-text-secondary font-medium mt-1">
          Define spending thresholds, categorize targets, and limit overspending.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl border border-accent-success/20 bg-accent-success/5 text-accent-success flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4.5 w-4.5" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl border border-accent-danger/20 bg-accent-danger/5 text-accent-danger flex items-center gap-2 text-sm font-semibold">
          <ArrowUpRight className="h-4.5 w-4.5 rotate-45" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Overall Usage Card and Limit Adjustments Form */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Form Adjustment */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Adjust Monthly Limits</CardTitle>
              <CardDescription>Configure overall spending thresholds and allocate portions to specific categories (in ₹)</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveBudget} className="space-y-6">
                <div className="pb-6 border-b border-border-color">
                  <Input
                    label="Overall Monthly Spending Limit (₹)"
                    type="number"
                    placeholder="e.g. 50000"
                    required
                    value={overallLimit}
                    onChange={(e) => setOverallLimit(e.target.value)}
                    disabled={saving}
                  />
                  {parsedOverallLimit < categorySum && (
                    <span className="block text-xs font-semibold text-accent-warning mt-2">
                      ⚠️ Warning: Overall budget limit is currently less than category allocations (₹{categorySum.toLocaleString('en-IN')}).
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-text-secondary uppercase tracking-wider">
                    Category Allocations
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {categories.map((cat) => (
                      <Input
                        key={cat}
                        label={`${cat} Limit`}
                        type="number"
                        placeholder="e.g. 5000"
                        value={categoryLimits[cat] || ''}
                        onChange={(e) => handleCategoryLimitChange(cat, e.target.value)}
                        disabled={saving}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <Button type="submit" disabled={saving} className="px-8 py-2.5 font-semibold">
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    Save Budget Adjustments
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Overall Stats Visualizer */}
        <div className="space-y-6">
          {/* Financial Health & Savings Projections */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Financial Projections</CardTitle>
              <CardDescription>Estimated savings metrics and health index</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-card-sec border border-border-color rounded-xl text-center">
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Health Score</span>
                  <span className="text-2xl font-extrabold text-accent-success block mt-1.5">
                    {healthScore !== null ? `${healthScore}/100` : '...'}
                  </span>
                </div>
                <div className="p-4 bg-card-sec border border-border-color rounded-xl text-center">
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider block">Savings Est.</span>
                  <span className="text-lg font-bold text-text-primary block mt-2">
                    ₹{savingsProjection.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <div className="text-[10px] text-text-secondary font-medium leading-relaxed bg-card p-3 rounded-lg border border-border-color">
                📌 **Live Calculations:** Estimated monthly savings are based on your profile income (**₹{income.toLocaleString('en-IN')}**) minus your monthly spending limit (**₹{parsedOverallLimit.toLocaleString('en-IN')}**).
              </div>
            </CardContent>
          </Card>

          {/* Main threshold health */}
          <Card className="flex flex-col justify-between">
            <div>
              <CardHeader>
                <CardTitle>Monthly Allotment Health</CardTitle>
                <CardDescription>Total expenditure relative to your budget</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {parsedOverallLimit > 0 ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-3xl font-bold text-text-primary">
                        ₹{totalSpent.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-text-secondary font-semibold">
                        of ₹{parsedOverallLimit.toLocaleString('en-IN')} Limit
                      </span>
                    </div>

                    <Progress value={percentSpent} colorClass={getProgressColor(percentSpent)} />

                    <div className="flex justify-between text-xs text-text-secondary font-semibold pt-1">
                      <span>Spent: {percentSpent.toFixed(0)}%</span>
                      <span>Remaining: ₹{remainingBudget.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-text-secondary text-sm font-medium flex flex-col items-center gap-2">
                    <Wallet className="h-6 w-6" />
                    No budget limits set. Use the form on the left to set thresholds.
                  </div>
                )}
              </CardContent>
            </div>
          </Card>

          {/* Sub-category tracking */}
          <Card>
            <CardHeader>
              <CardTitle>Sub-Category Ledgers</CardTitle>
              <CardDescription>Track categories individually</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {categories.map((cat) => {
                const catLimit = parseFloat(categoryLimits[cat]) || 0;
                const catSpent = getCategorySpending(cat);
                const percent = catLimit > 0 ? (catSpent / catLimit) * 100 : 0;
                
                if (catLimit === 0 && catSpent === 0) return null;

                return (
                  <div key={cat} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-text-primary">{cat}</span>
                      <span className="text-text-secondary">
                        ₹{catSpent.toLocaleString('en-IN')} / {catLimit > 0 ? `₹${catLimit.toLocaleString('en-IN')}` : 'No Limit'}
                      </span>
                    </div>
                    {catLimit > 0 && (
                      <Progress value={percent} colorClass={getProgressColor(percent)} />
                    )}
                  </div>
                );
              })}

              {parsedOverallLimit === 0 && totalSpent === 0 && (
                <div className="text-center text-text-secondary text-xs font-medium py-4">
                  Define budget constraints to display split metrics here.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
