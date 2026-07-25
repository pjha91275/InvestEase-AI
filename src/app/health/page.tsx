'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Activity, Sparkles, TrendingUp, ShieldAlert, CheckCircle, Percent, Wallet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Gauge } from '@/components/ui/Gauge';
import { Progress } from '@/components/ui/Progress';

interface HealthReport {
  score: number;
  suggestions: string[];
  breakdown: {
    savingsRate: number;
    budget: number;
    distribution: number;
    emergency: number;
    consistency: number;
  };
}

export default function FinancialHealth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [report, setReport] = useState<HealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchHealthReport = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        setReport(data);
      } else {
        throw new Error('Failed to generate health indexes');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred generating score report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchHealthReport();
    }
  }, [status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
        <span className="text-sm font-medium text-text-secondary">Assessing aggregate index...</span>
      </div>
    );
  }

  if (!report) return null;

  const scoreCategories = [
    {
      name: 'Savings Rate',
      weight: 35,
      score: report.breakdown.savingsRate,
      desc: 'Ratios of earnings moved directly to savings goals.',
      icon: Percent,
      color: 'bg-accent-success',
    },
    {
      name: 'Budget Utilization',
      weight: 25,
      score: report.breakdown.budget,
      desc: 'Success staying within designated monthly caps.',
      icon: Wallet,
      color: 'bg-accent-primary',
    },
    {
      name: 'Expense Distribution',
      weight: 15,
      score: report.breakdown.distribution,
      desc: 'Balanced spending profile focusing on needs over wants.',
      icon: Activity,
      color: 'bg-indigo-500',
    },
    {
      name: 'Emergency Buffer',
      weight: 15,
      score: report.breakdown.emergency,
      desc: 'Liquid savings reserve coverages against basic costs.',
      icon: ShieldAlert,
      color: 'bg-accent-warning',
    },
    {
      name: 'Spending Consistency',
      weight: 10,
      score: report.breakdown.consistency,
      desc: 'Volume distribution of transactions over standard averages.',
      icon: TrendingUp,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Block */}
      <div>
        <h1 className="text-2xl sm:text-[36px] font-bold tracking-tight text-text-primary">
          Financial Health Score
        </h1>
        <p className="text-sm text-text-secondary font-medium mt-1">
          Review dynamic, rule-based evaluations scoring savings, budgets, and distribution vectors.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl border border-accent-danger/25 bg-accent-danger/5 text-accent-danger text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Column (circular gauge) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <Card className="flex flex-col items-center justify-center text-center p-8">
            <h3 className="text-base font-bold text-text-primary mb-6">Aggregate Index</h3>
            <Gauge value={report.score} size={180} strokeWidth={10} label="Health Index" />
            
            <div className="mt-6 p-4 rounded-xl bg-card-sec border border-border-color w-full text-xs font-medium text-text-secondary leading-relaxed">
              {report.score >= 80 ? (
                <span className="text-accent-success font-bold block mb-1">Excellent Status!</span>
              ) : report.score >= 50 ? (
                <span className="text-accent-primary font-bold block mb-1">Fair Status</span>
              ) : (
                <span className="text-accent-danger font-bold block mb-1">Attention Required</span>
              )}
              Sticking within category budgets and raising emergency fund deposits is the fastest route to high indexes.
            </div>
          </Card>
        </div>

        {/* Right Column (Category progress bars and suggestions) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Breakdown progress list */}
          <Card>
            <CardHeader>
              <CardTitle>Habits Breakdown</CardTitle>
              <CardDescription>Points allocation per evaluated habits category</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {scoreCategories.map((cat, idx) => {
                const percentage = (cat.score / cat.weight) * 100;
                const CatIcon = cat.icon;

                return (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-text-primary">
                      <span className="flex items-center gap-2">
                        <CatIcon className="h-4.5 w-4.5 text-text-secondary stroke-[1.5]" />
                        {cat.name}
                      </span>
                      <span>
                        {cat.score} <span className="text-[10px] text-text-secondary font-medium"> / {cat.weight} pts</span>
                      </span>
                    </div>
                    <Progress value={percentage} colorClass={cat.color} />
                    <span className="text-[10px] text-text-secondary font-medium block leading-relaxed pl-6">
                      {cat.desc}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Suggestions card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-accent-primary" />
                <span>Smart Improvement Recommendations</span>
              </CardTitle>
              <CardDescription>Automated advice based on budget limits and savings rates</CardDescription>
            </CardHeader>
            <CardContent>
              {report.suggestions.length > 0 ? (
                <ul className="space-y-3.5">
                  {report.suggestions.map((sug, idx) => (
                    <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-text-primary font-medium leading-relaxed">
                      <CheckCircle className="h-4.5 w-4.5 text-accent-success shrink-0 mt-0.5" />
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="py-4 text-center text-text-secondary text-sm font-medium">
                  Congratulations! All evaluated financial markers are in good standing.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
