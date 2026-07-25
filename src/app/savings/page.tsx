'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Target, Trash2, Calendar, ShieldCheck, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Progress } from '@/components/ui/Progress';

interface SavingsGoal {
  _id: string;
  title: string;
  targetAmount: number;
  currentSavings: number;
  deadline: string;
}

export default function SavingsGoals() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Forms State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formTitle, setFormTitle] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formCurrent, setFormCurrent] = useState('0');
  const [formDeadline, setFormDeadline] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Add savings amount Dialog State
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [depositLoading, setDepositLoading] = useState(false);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/savings');
      if (res.ok) {
        const data = await res.json();
        setGoals(data);
      } else {
        throw new Error('Failed to load savings pots');
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
      fetchGoals();
    }
  }, [status, router]);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetch('/api/savings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formTitle,
          targetAmount: parseFloat(formTarget),
          currentSavings: parseFloat(formCurrent || '0'),
          deadline: new Date(formDeadline).toISOString(),
        }),
      });

      const d = await res.json();

      if (res.ok) {
        setSuccess(`Savings pot "${formTitle}" created.`);
        setFormTitle('');
        setFormTarget('');
        setFormCurrent('0');
        setFormDeadline('');
        setShowAddForm(false);
        fetchGoals();
        setTimeout(() => setSuccess(''), 4000);
      } else {
        throw new Error(d.error || 'Failed to create goal');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoal) return;
    setDepositLoading(true);
    setError('');
    setSuccess('');

    try {
      const updatedSavings = selectedGoal.currentSavings + parseFloat(depositAmount);

      const res = await fetch('/api/savings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedGoal._id,
          currentSavings: updatedSavings,
        }),
      });

      const d = await res.json();

      if (res.ok) {
        setSuccess(`Deposited ₹${parseFloat(depositAmount).toLocaleString('en-IN')} to "${selectedGoal.title}".`);
        setSelectedGoal(null);
        setDepositAmount('');
        fetchGoals();
        setTimeout(() => setSuccess(''), 4000);
      } else {
        throw new Error(d.error || 'Failed to deposit savings');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setDepositLoading(false);
    }
  };

  const handleDeleteGoal = async (id: string) => {
    if (!confirm('Are you sure you want to delete this savings pot?')) return;
    try {
      const res = await fetch(`/api/savings?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchGoals();
      } else {
        const d = await res.json();
        throw new Error(d.error || 'Failed to remove pot');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Block */}
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-[36px] font-bold tracking-tight text-text-primary">
            Savings Goals
          </h1>
          <p className="text-sm text-text-secondary font-medium mt-1">
            Build milestones, deposit logs, and manage target deadlines.
          </p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} size="sm" className="flex items-center gap-1.5 font-semibold">
          <Plus className="h-4.5 w-4.5" />
          <span>New Savings Pot</span>
        </Button>
      </div>

      {success && (
        <div className="p-4 rounded-xl border border-accent-success/20 bg-accent-success/5 text-accent-success flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4.5 w-4.5 text-accent-success" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl border border-accent-danger/20 bg-accent-danger/5 text-accent-danger flex items-center gap-2 text-sm font-semibold">
          <X className="h-4.5 w-4.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Add Goal Form Container */}
      {showAddForm && (
        <Card className="border border-accent-primary/20">
          <CardHeader className="flex flex-row justify-between items-center mb-4">
            <div>
              <CardTitle>Log Savings Pot</CardTitle>
              <CardDescription>Allocate a new goal milestone target (in ₹)</CardDescription>
            </div>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 rounded-lg text-text-secondary hover:text-text-primary cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateGoal} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Goal Title"
                placeholder="e.g. Ladakh Road Trip Pot"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                disabled={formLoading}
              />
              <Input
                label="Target Amount (₹)"
                type="number"
                placeholder="e.g. 40000"
                required
                value={formTarget}
                onChange={(e) => setFormTarget(e.target.value)}
                disabled={formLoading}
              />
              <Input
                label="Starting Capital (₹)"
                type="number"
                value={formCurrent}
                onChange={(e) => setFormCurrent(e.target.value)}
                disabled={formLoading}
              />
              <Input
                label="Deadline Date"
                type="date"
                required
                value={formDeadline}
                onChange={(e) => setFormDeadline(e.target.value)}
                disabled={formLoading}
              />
              <div className="col-span-1 md:col-span-2 flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading} className="px-6">
                  {formLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Log Pot'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Deposit Savings Modal */}
      {selectedGoal && (
        <div className="fixed inset-0 z-50 bg-background/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-card rounded-[20px] border border-border-color p-8 shadow-md space-y-5 animate-fadeIn">
            <div className="flex justify-between items-center">
              <h3 className="text-[18px] font-semibold text-text-primary">Add Savings Capital</h3>
              <button
                onClick={() => setSelectedGoal(null)}
                className="p-1 rounded-lg text-text-secondary hover:text-text-primary cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleDeposit} className="space-y-4">
              <p className="text-xs text-text-secondary font-medium">
                Add savings capital directly to <strong>{selectedGoal.title}</strong>.
              </p>
              <Input
                label="Deposit Value (₹)"
                type="number"
                placeholder="e.g. 5000"
                required
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                disabled={depositLoading}
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedGoal(null)}
                  disabled={depositLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={depositLoading} className="px-6">
                  {depositLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Deposit Funds'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Goals Dashboard Card list */}
      {loading ? (
        <div className="py-20 flex justify-center items-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
        </div>
      ) : goals.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const percent = goal.targetAmount > 0 ? (goal.currentSavings / goal.targetAmount) * 100 : 0;
            const remaining = Math.max(goal.targetAmount - goal.currentSavings, 0);
            return (
              <Card key={goal._id} className="flex flex-col justify-between transition-all duration-150 hover:-translate-y-0.5">
                <div>
                  <CardHeader className="flex flex-row justify-between items-start gap-4 mb-4">
                    <div className="space-y-1">
                      <CardTitle>{goal.title}</CardTitle>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-text-secondary uppercase">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-text-secondary" />
                        <span>
                          Target: {new Date(goal.deadline).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteGoal(goal._id)}
                      className="p-1 rounded-lg text-text-secondary hover:text-accent-danger transition-colors cursor-pointer"
                      title="Remove Goal"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-baseline">
                      <span className="text-2xl font-bold text-text-primary">
                        ₹{goal.currentSavings.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-text-secondary font-semibold">
                        of ₹{goal.targetAmount.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <Progress value={percent} colorClass={percent >= 100 ? 'bg-accent-success' : 'bg-accent-primary'} />

                    <div className="flex justify-between text-[11px] text-text-secondary font-semibold">
                      <span>Saved: {percent.toFixed(0)}%</span>
                      <span>Left: ₹{remaining.toLocaleString('en-IN')}</span>
                    </div>
                  </CardContent>
                </div>
                
                <CardFooter className="mt-4 pt-4 border-t border-border-color">
                  <Button
                    onClick={() => setSelectedGoal(goal)}
                    variant="outline"
                    className="w-full text-xs font-semibold py-2"
                  >
                    Deposit Savings
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <CardContent className="py-6 flex flex-col items-center gap-3">
            <Target className="h-10 w-10 text-text-secondary stroke-[1.5]" />
            <h3 className="text-[18px] font-semibold text-text-primary">No savings pots configured</h3>
            <p className="text-xs text-text-secondary max-w-sm font-medium leading-relaxed">
              Build custom milestones (emergency funds, SIP portfolios, vacation pots) and track your margins.
            </p>
            <Button onClick={() => setShowAddForm(true)} size="sm" className="mt-2 font-semibold">
              Create First Pot
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
