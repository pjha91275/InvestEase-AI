'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Briefcase, DollarSign, Target, Save, CheckSquare, Square } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface UserProfile {
  name: string;
  email: string;
  income: number;
  occupation: string;
  monthlySavingsGoal: number;
  notifications: {
    budgetAlerts: boolean;
    savingsReminders: boolean;
  };
}

export default function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // State
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Form State fields
  const [income, setIncome] = useState('');
  const [occupation, setOccupation] = useState('');
  const [monthlySavingsGoal, setMonthlySavingsGoal] = useState('');
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [savingsReminders, setSavingsReminders] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile');
      if (res.ok) {
        const u: UserProfile = await res.json();
        setProfile(u);
        setIncome(u.income.toString());
        setOccupation(u.occupation);
        setMonthlySavingsGoal(u.monthlySavingsGoal.toString());
        setBudgetAlerts(u.notifications?.budgetAlerts ?? true);
        setSavingsReminders(u.notifications?.savingsReminders ?? true);
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setSaveLoading(true);

    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          income: parseFloat(income) || 0,
          occupation,
          monthlySavingsGoal: parseFloat(monthlySavingsGoal) || 0,
          notifications: {
            budgetAlerts,
            savingsReminders,
          },
        }),
      });

      if (res.ok) {
        setSuccess('Profile updated successfully!');
        fetchProfile();
      } else {
        const d = await res.json();
        throw new Error(d.error || 'Failed to save changes');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred saving configurations');
    } finally {
      setSaveLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
        <span className="text-sm font-medium text-text-secondary">Loading user profile...</span>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Block */}
      <div>
        <h1 className="text-2xl sm:text-[36px] font-bold tracking-tight text-text-primary">
          My Profile
        </h1>
        <p className="text-sm text-text-secondary font-medium mt-1">
          Adjust occupational metrics, salary indexes, and system notifications toggles.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-xl border border-accent-success/20 bg-accent-success/5 text-accent-success text-sm font-semibold">
          {success}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl border border-accent-danger/25 bg-accent-danger/5 text-accent-danger text-sm font-semibold">
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left Card (static details card) */}
        <div className="lg:col-span-1">
          <Card className="flex flex-col items-center text-center p-8">
            <div className="w-16 h-16 rounded-full bg-accent-primary flex items-center justify-center text-white font-semibold text-xl">
              {profile.name.charAt(0).toUpperCase()}
            </div>
            
            <h2 className="text-base font-semibold text-text-primary mt-4">{profile.name}</h2>
            <span className="text-xs text-text-secondary font-medium mt-0.5">{profile.email}</span>

            <div className="border-t border-border-color mt-6 pt-6 w-full space-y-4 text-left">
              <div className="flex items-center gap-3 text-xs font-semibold text-text-primary">
                <Briefcase className="h-4.5 w-4.5 text-text-secondary shrink-0" />
                <span>Job: {profile.occupation || 'Not Configured'}</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-text-primary">
                <DollarSign className="h-4.5 w-4.5 text-text-secondary shrink-0" />
                <span>Income: ₹{profile.income.toLocaleString('en-IN')} / mo</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-semibold text-text-primary">
                <Target className="h-4.5 w-4.5 text-text-secondary shrink-0" />
                <span>Savings Goal: ₹{profile.monthlySavingsGoal.toLocaleString('en-IN')} / mo</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Card (configuration form) */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Configure Profile Settings</CardTitle>
              <CardDescription>Keep metrics accurate to improve financial health calculations</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Current Occupation"
                    placeholder="e.g. Senior Software Architect"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    disabled={saveLoading}
                  />
                  <Input
                    label="Monthly Base Income (₹)"
                    type="number"
                    placeholder="e.g. 85000"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    disabled={saveLoading}
                  />
                  <div className="col-span-1 md:col-span-2">
                    <Input
                      label="Target Monthly Savings pot (₹)"
                      type="number"
                      placeholder="e.g. 25000"
                      value={monthlySavingsGoal}
                      onChange={(e) => setMonthlySavingsGoal(e.target.value)}
                      disabled={saveLoading}
                    />
                  </div>
                </div>

                {/* Notifications preferences checkmarks */}
                <div className="border-t border-border-color pt-6">
                  <span className="text-xs font-bold text-text-secondary uppercase tracking-wider block mb-4">
                    Preference Notifications
                  </span>
                  
                  <div className="space-y-4">
                    <button
                      type="button"
                      disabled={saveLoading}
                      onClick={() => setBudgetAlerts(!budgetAlerts)}
                      className="flex items-start gap-3 text-sm font-semibold text-text-primary hover:text-accent-primary transition-colors cursor-pointer text-left w-full"
                    >
                      {budgetAlerts ? (
                        <CheckSquare className="h-5 w-5 text-accent-primary shrink-0 mt-0.5" />
                      ) : (
                        <Square className="h-5 w-5 text-text-secondary/50 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="text-xs font-semibold text-text-primary">Monthly Budget Alerts</span>
                        <span className="block text-[10px] text-text-secondary font-medium mt-0.5 leading-relaxed">
                          Notify me when category spend exceeds 80% or 100% of limits.
                        </span>
                      </div>
                    </button>


                    <button
                      type="button"
                      disabled={saveLoading}
                      onClick={() => setSavingsReminders(!savingsReminders)}
                      className="flex items-start gap-3 text-sm font-semibold text-text-primary hover:text-accent-primary transition-colors cursor-pointer text-left w-full"
                    >
                      {savingsReminders ? (
                        <CheckSquare className="h-5 w-5 text-accent-primary shrink-0 mt-0.5" />
                      ) : (
                        <Square className="h-5 w-5 text-text-secondary/50 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="text-xs font-semibold text-text-primary">Savings Goal Reminders</span>
                        <span className="block text-[10px] text-text-secondary font-medium mt-0.5 leading-relaxed">
                          Receive reminders to add funds to active active benchmarks nearing target dates.
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={saveLoading} className="px-6 flex items-center gap-2">
                    {saveLoading ? <Loader2 className="h-4.5 w-4.5 animate-spin" /> : <Save className="h-4.5 w-4.5" />}
                    Save Settings
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
