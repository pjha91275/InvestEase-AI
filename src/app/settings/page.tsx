'use client';

import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Loader2, Sun, Moon, ShieldAlert, Key } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/components/ThemeProvider';

export default function Settings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleDeleteAccount = async () => {
    const confirmation = confirm(
      'WARNING: Are you absolutely sure you want to delete your InvestEase AI profile? This will permanently wipe all your budget settings, savings targets, and transaction histories. This action is irreversible!'
    );

    if (!confirmation) return;

    setLoading(true);
    setError('');

    try {
      await fetch('/api/profile', { method: 'DELETE' }).catch(() => {});
      signOut({ callbackUrl: '/' });
    } catch (err) {
      setError('Failed to process deletion request');
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
        <span className="text-sm font-medium text-text-secondary">Loading settings...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl animate-fadeIn">
      {/* Header Block */}
      <div>
        <h1 className="text-2xl sm:text-[36px] font-bold tracking-tight text-text-primary">
          Preferences & Settings
        </h1>
        <p className="text-sm text-text-secondary font-medium mt-1">
          Configure security modules, display preferences, and account metadata.
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

      <div className="space-y-6">
        {/* Visual Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle>Display Theme</CardTitle>
            <CardDescription>Toggle between dark and light mode aesthetics</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-sm font-semibold text-text-primary">
                {theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
              </span>
              <p className="text-xs text-text-secondary font-medium leading-relaxed">
                Adjusts colors to fit low-light dashboard review sessions.
              </p>
            </div>
            <Button
              variant="secondary"
              onClick={toggleTheme}
              className="flex items-center gap-2 cursor-pointer shrink-0"
            >
              {theme === 'light' ? (
                <>
                  <Moon className="h-4 w-4 text-accent-primary" />
                  <span>Use Dark Mode</span>
                </>
              ) : (
                <>
                  <Sun className="h-4 w-4 text-accent-warning" />
                  <span>Use Light Mode</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Security Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-4.5 w-4.5 text-text-secondary stroke-[1.5]" />
              <span>Password & Security</span>
            </CardTitle>
            <CardDescription>Credential updates and session authentications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-card-sec border border-border-color rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs font-medium text-text-secondary leading-relaxed">
              <div>
                <span className="font-bold text-text-primary block mb-1">Active Credentials:</span>
                Your profile password remains stored under one-way cryptographical hashes (bcrypt).
              </div>
              <Button disabled variant="outline" className="text-xs font-semibold shrink-0">
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border border-accent-danger/20 bg-accent-danger/5">
          <CardHeader>
            <CardTitle className="text-accent-danger flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 shrink-0 stroke-[1.5]" />
              <span>Danger Zone</span>
            </CardTitle>
            <CardDescription className="text-accent-danger/70">Destructive irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div className="space-y-1">
              <span className="text-sm font-semibold text-text-primary">Delete Profile Account</span>
              <p className="text-xs text-text-secondary font-medium leading-relaxed">
                Permanently purge your account registration, category logs, budgets, and savings history records.
              </p>
            </div>
            <Button
              variant="danger"
              disabled={loading}
              onClick={handleDeleteAccount}
              className="w-full sm:w-fit font-bold border-accent-danger/20 shrink-0"
            >
              {loading ? 'Deleting Purging...' : 'Delete Account'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
