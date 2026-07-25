'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCw, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  merchant: string;
  date: string;
  paymentMethod: string;
}

export default function Analytics() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [income, setIncome] = useState<number>(85000); // realistic Indian salary default
  const [loading, setLoading] = useState(true);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [growthTimeline, setGrowthTimeline] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      // Fetch user profile to get income
      const resProfile = await fetch('/api/profile');
      if (resProfile.ok) {
        const u = await resProfile.json();
        setIncome(u.income || 85000);
      }

      // Fetch expenses
      const resExpenses = await fetch('/api/expenses');
      if (resExpenses.ok) {
        const expData = await resExpenses.json();
        setExpenses(expData);
      }

      // Fetch portfolio
      const resPortfolio = await fetch('/api/portfolio');
      if (resPortfolio.ok) {
        const portData = await resPortfolio.json();
        setPortfolio(portData.portfolio);
        setGrowthTimeline(portData.growthTimeline);
        setStats(portData.stats);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchAnalyticsData();
    }
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
        <span className="text-sm font-medium text-text-secondary">Compiling financial charts...</span>
      </div>
    );
  }

  // --- COMPUTE STATISTICS FOR CHARTS ---

  // 1. Spending over time (Area Chart)
  const last7Days: Record<string, number> = {};
  const today = new Date();
  
  // Initialize last 7 days
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    last7Days[dateStr] = 0;
  }

  expenses.forEach((exp) => {
    const expDate = new Date(exp.date);
    const dateStr = expDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    if (last7Days[dateStr] !== undefined) {
      last7Days[dateStr] += exp.amount;
    }
  });

  const dailyTrendData = Object.keys(last7Days).map((key) => ({
    name: key,
    Spent: last7Days[key],
  }));

  // 2. Category totals (Pie Chart)
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((exp) => {
    categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
  });

  const pieData = Object.keys(categoryTotals).map((cat) => ({
    name: cat,
    value: parseFloat(categoryTotals[cat].toFixed(2)),
  }));

  // 3. Category bar comparison
  const barData = Object.keys(categoryTotals).map((cat) => ({
    name: cat,
    Amount: categoryTotals[cat],
  }));

  // 4. General Stats
  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const averageSpent = expenses.length > 0 ? totalSpent / expenses.length : 0;
  
  // Computed Savings & Investments Rates
  const totalInvested = portfolio?.totalInvested || 0;
  const investmentValue = portfolio?.currentValue || 0;
  const growthDifference = investmentValue - totalInvested;
  
  // Savings Rate calculation: (Saved monthly margins + roundups invested) / Monthly Income
  // Normalized as a percentage
  const savingsAmount = Math.max(income - totalSpent, 0) + totalInvested;
  const savingsRate = income > 0 ? Number(((savingsAmount / income) * 100).toFixed(1)) : 0;

  // 5. Portfolio allocation Pie Chart
  const allocPieData = portfolio ? [
    { name: 'Index Funds', value: portfolio.balances.indexFunds || 1 },
    { name: 'Mutual Funds', value: portfolio.balances.mutualFunds || 1 },
    { name: 'Stocks', value: portfolio.balances.stocks || 1 },
    { name: 'Gold', value: portfolio.balances.gold || 1 },
    { name: 'Crypto', value: portfolio.balances.crypto || 1 },
  ].filter(p => p.value > 0) : [];

  // Color set matching clean accents
  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#64748B', '#EF4444'];
  const ALLOC_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6'];

  const chartTooltipStyle = {
    backgroundColor: 'var(--card-sec)',
    borderColor: 'var(--border-color)',
    borderRadius: '12px',
    fontSize: '11px',
    color: 'var(--text-primary)',
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Block */}
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-[36px] font-bold tracking-tight text-text-primary">
            Interactive Analytics
          </h1>
          <p className="text-sm text-text-secondary font-medium mt-1">
            Visual graphs mapping spending logs, allocations, and trend timelines.
          </p>
        </div>
        <Button variant="secondary" onClick={fetchAnalyticsData} size="sm" className="p-2.5">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid sm:grid-cols-4 gap-4">
        <Card className="p-5">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Historical Spending</span>
          <div className="text-xl font-bold text-text-primary mt-1">
            ₹{totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[9px] text-text-secondary font-medium block mt-1">Sum of all logged database entries</span>
        </Card>

        <Card className="p-5">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Invested Value</span>
          <div className="text-xl font-bold text-text-primary mt-1">
            ₹{investmentValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className={`text-[9px] font-semibold mt-1 block ${growthDifference >= 0 ? 'text-accent-success' : 'text-accent-danger'}`}>
            Growth: {growthDifference >= 0 ? '+' : ''}₹{growthDifference.toFixed(2)}
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Savings Rate</span>
          <div className="text-xl font-bold text-text-primary mt-1">
            {savingsRate}%
          </div>
          <span className="text-[9px] text-text-secondary font-medium block mt-1">Margins + Roundups vs Income</span>
        </Card>

        <Card className="p-5">
          <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Earnings Ratio Balance</span>
          <div className="text-xl font-bold text-text-primary mt-1">
            ₹{Math.max(income - totalSpent, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </div>
          <span className="text-[9px] text-text-secondary font-medium block mt-1">Residual value out of ₹{income.toLocaleString()} monthly income</span>
        </Card>
      </div>

      {/* Main Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* Spending trend Area Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Spending Trend (Last 7 Days)</CardTitle>
            <CardDescription>Daily sum fluctuations of purchase clearings</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="var(--text-secondary)" opacity={0.6} fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-secondary)" opacity={0.6} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value) => `₹${value}`} contentStyle={chartTooltipStyle} />
                <CartesianGrid vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                <Area type="monotone" dataKey="Spent" stroke="#2563EB" strokeWidth={1.5} fillOpacity={1} fill="url(#colorSpent)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Investment Growth Timeline (Area chart) */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Growth Timeline</CardTitle>
            <CardDescription>Compounding portfolio value vs roundups invested</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {growthTimeline.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={growthTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" stroke="var(--text-secondary)" opacity={0.6} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-secondary)" opacity={0.6} fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => `₹${value}`} contentStyle={chartTooltipStyle} />
                  <CartesianGrid vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                  <Area type="monotone" name="Valuation" dataKey="investment" stroke="#10B981" strokeWidth={1.5} fillOpacity={1} fill="url(#colorValue)" />
                  <Area type="monotone" name="Invested" dataKey="roundups" stroke="#64748B" strokeWidth={1} fillOpacity={0} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="py-24 text-center text-text-secondary text-sm font-medium">
                Seeding sweeps logs...
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Visual comparison of categories balances</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="var(--text-secondary)" opacity={0.6} fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="var(--text-secondary)" opacity={0.6} fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip formatter={(value) => `₹${value}`} contentStyle={chartTooltipStyle} />
                  <CartesianGrid vertical={false} stroke="rgba(148, 163, 184, 0.08)" />
                  <Bar dataKey="Amount" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="py-24 text-center text-text-secondary font-medium text-sm">
                No transaction logs set. Add expenses to populate bar metrics.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Portfolio Allocation breakdown shares */}
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Allocations</CardTitle>
            <CardDescription>Visual asset allocation splits in simulator</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex flex-col sm:flex-row items-center justify-center gap-6">
            {allocPieData.length > 0 ? (
              <>
                <div className="w-full sm:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={allocPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={55}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {allocPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={ALLOC_COLORS[index % ALLOC_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => `₹${Number(value || 0).toFixed(2)}`} contentStyle={chartTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full sm:w-1/2 flex flex-col gap-2 max-h-60 overflow-y-auto">
                  {allocPieData.map((entry, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs font-semibold p-2 bg-card-sec/40 rounded-lg border border-border-color/40">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ALLOC_COLORS[idx % ALLOC_COLORS.length] }} />
                        <span className="text-text-secondary">{entry.name}</span>
                      </div>
                      <span className="text-text-primary">₹{entry.value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="py-24 text-center text-text-secondary text-sm font-medium">
                Activate Portfolio Simulator allocations to view asset share charts.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category share Pie chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Category Shares</CardTitle>
            <CardDescription>Relative percentages of expenses distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-72 flex flex-col md:flex-row items-center justify-center gap-8">
            {pieData.length > 0 ? (
              <>
                <div className="w-full md:w-1/2 h-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${value}`} contentStyle={chartTooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="w-full md:w-1/2 flex flex-wrap gap-x-6 gap-y-3 justify-center md:justify-start max-h-60 overflow-y-auto pr-2">
                  {pieData.map((entry, idx) => {
                    const ratio = ((entry.value / totalSpent) * 100).toFixed(0);
                    return (
                      <div key={idx} className="flex items-center gap-2.5 text-xs font-semibold">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-text-secondary font-medium">{entry.name}:</span>
                        <span className="text-text-primary">₹{entry.value.toLocaleString('en-IN')}</span>
                        <span className="text-text-secondary text-[10px] font-bold">({ratio}%)</span>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="py-24 text-center text-text-secondary text-sm font-medium flex flex-col items-center gap-2 w-full">
                <Activity className="h-8 w-8 text-text-secondary animate-pulse" />
                No logs detected. Set up transactions to preview distribution charts.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
