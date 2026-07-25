'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  TrendingUp,
  DollarSign,
  Wallet,
  Target,
  Activity,
  AlertTriangle,
  Calendar,
  PlusCircle,
  Search,
  Sparkles,
  Loader2,
  Bell
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Gauge } from '@/components/ui/Gauge';
import { ResponsiveContainer, Cell, PieChart, Pie, Tooltip } from 'recharts';

interface DashboardData {
  todaySpending: number;
  monthlySpending: number;
  totalBudget: number;
  budgetRemaining: number;
  totalSavings: number;
  savingsTarget: number;
  healthScore: number;
  healthSuggestions: string[];
  recentTransactions: any[];
  fraudAlerts: any[];
  upcomingBills: any[];
  categoryDistribution: any[];
  roundupSavings?: number;
  investmentValue?: number;
  portfolioGrowth?: number;
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/dashboard');
      if (res.ok) {
        const dashboardData = await res.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
        <span className="text-sm font-medium text-text-secondary">Loading dashboard stats...</span>
      </div>
    );
  }

  if (!data) return null;

  // Modern soft color palette for Recharts
  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EC4899', '#8B5CF6', '#06B6D4', '#64748B', '#EF4444'];

  const kpis = [
    {
      title: "Today's Spent",
      value: `₹${data.todaySpending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      desc: "Cleared transactions today",
      icon: DollarSign,
      color: "text-accent-primary bg-accent-primary/10",
    },
    {
      title: "Monthly Spending",
      value: `₹${data.monthlySpending.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      desc: "Cumulative total this month",
      icon: TrendingUp,
      color: "text-accent-warning bg-accent-warning/10",
    },
    {
      title: "Remaining Budget",
      value: data.totalBudget > 0 
        ? `₹${data.budgetRemaining.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        : "Not Set",
      desc: data.totalBudget > 0 ? `Limit: ₹${data.totalBudget.toLocaleString('en-IN')}` : "Set limit in Budget Planner",
      icon: Wallet,
      color: "text-accent-success bg-accent-success/10",
    },
    {
      title: "Round-up Savings",
      value: `₹${(data.roundupSavings || 0).toFixed(2)}`,
      desc: "Auto spare change sweeps",
      icon: Target,
      color: "text-purple-500 bg-purple-500/10",
    },
    {
      title: "Portfolio Valuation",
      value: `₹${(data.investmentValue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      desc: `Returns: ${(data.portfolioGrowth || 0) >= 0 ? '+' : ''}₹${(data.portfolioGrowth || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: "text-accent-success bg-accent-success/10",
    },
    {
      title: "Savings Progress",
      value: `₹${data.totalSavings.toLocaleString('en-IN')}`,
      desc: data.savingsTarget > 0 ? `Target: ₹${data.savingsTarget.toLocaleString('en-IN')}` : "Pots milestones",
      icon: Target,
      color: "text-indigo-500 bg-indigo-500/10",
    },
  ];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[36px] font-bold text-text-primary tracking-tight leading-tight">
            Dashboard
          </h1>
          <p className="text-sm text-text-secondary font-medium mt-1">
            Overview of your daily metrics, budget planner, and savings goals.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link href="/expenses">
            <Button size="sm" className="flex items-center gap-1.5 py-2 px-4 text-xs font-semibold">
              <PlusCircle className="h-4 w-4" /> Add Expense
            </Button>
          </Link>
        </div>
      </div>

      {/* Asymmetric layout grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left/Main Columns (Width 2/3) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* KPI Mini-Cards Row */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {kpis.map((kpi, idx) => {
              const Icon = kpi.icon;
              return (
                <Card key={idx} className="p-6 transition-all duration-150 hover:-translate-y-0.5">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">{kpi.title}</span>
                      <div className="text-xl font-bold text-text-primary tracking-tight">{kpi.value}</div>
                      <span className="text-[11px] text-text-secondary font-medium block">{kpi.desc}</span>
                    </div>
                    <div className={`p-2 rounded-lg shrink-0 ${kpi.color}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Interactive Recharts visual breakdown card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Allocation Split</CardTitle>
                <CardDescription>Visual category breakdown of monthly spends</CardDescription>
              </div>
              <Link href="/analytics" className="text-xs text-accent-primary font-bold hover:underline">
                Full Reports
              </Link>
            </CardHeader>
            <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-8 min-h-[220px]">
              {data.categoryDistribution.length > 0 ? (
                <>
                  <div className="w-full sm:w-1/2 h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.categoryDistribution}
                          innerRadius={55}
                          outerRadius={70}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {data.categoryDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value) => `₹${value}`}
                          contentStyle={{ 
                            backgroundColor: 'var(--card-sec)', 
                            borderColor: 'var(--border-color)', 
                            borderRadius: '12px',
                            fontSize: '12px',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full sm:w-1/2 flex flex-wrap gap-x-6 gap-y-2 mt-4 sm:mt-0 justify-center sm:justify-start">
                    {data.categoryDistribution.map((entry, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-semibold">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                        <span className="text-text-secondary">{entry.name}:</span>
                        <span className="text-text-primary">₹{entry.value.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center text-text-secondary font-medium py-8 text-sm flex flex-col items-center gap-2">
                  <Activity className="h-6 w-6 text-text-secondary" />
                  No transactions cataloged this month. Setting an expense will activate statistics.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest clearances log from your account</CardDescription>
              </div>
              <Link href="/expenses" className="text-xs text-accent-primary font-bold hover:underline">
                View Ledger
              </Link>
            </CardHeader>
            <CardContent>
              {data.recentTransactions.length > 0 ? (
                <div className="divide-y divide-border-color">
                  {data.recentTransactions.map((exp) => (
                    <div key={exp._id} className="py-3.5 flex justify-between items-center gap-4">
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary truncate max-w-[150px] sm:max-w-xs">{exp.title}</h4>
                        <div className="flex gap-2 text-[10px] font-bold text-text-secondary uppercase mt-0.5">
                          <span>{exp.category}</span>
                          <span>•</span>
                          <span>{exp.merchant}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-text-primary">
                          -₹{exp.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="block text-[10px] text-text-secondary font-medium mt-0.5">
                          {new Date(exp.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-text-secondary py-6 text-sm font-medium">
                  No transaction records. Click Add Expense to set one up.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Columns (Width 1/3) */}
        <div className="space-y-8">
          
          {/* Radial Health score dial */}
          <Card className="flex flex-col items-center justify-center p-8">
            <Gauge value={data.healthScore} size={160} strokeWidth={10} label="Health Index" />
          </Card>


          {/* Upcoming utilities card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Upcoming Bills</CardTitle>
              <CardDescription>Track subscription renewals & utilities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.upcomingBills.map((bill, idx) => (
                <div key={idx} className="flex justify-between items-center gap-2 p-3 bg-card-sec rounded-xl border border-border-color text-xs font-semibold">
                  <div>
                    <h5 className="font-semibold text-text-primary truncate max-w-[130px] sm:max-w-xs">{bill.title}</h5>
                    <div className="flex items-center gap-1 text-[9px] font-bold text-text-secondary mt-1 uppercase">
                      <Calendar className="h-3 w-3 shrink-0" />
                      <span>
                        {new Date(bill.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-text-primary">₹{bill.amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
