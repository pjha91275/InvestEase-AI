'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Shield, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get('registered')) {
      setSuccess('Account created successfully! Log in to access your dashboard.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await signIn('credentials', {
        email: email.toLowerCase(),
        password,
        redirect: false,
      });

      if (res?.error) {
        throw new Error(res.error || 'Invalid email or password');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    const demoEmail = 'demo@investease.ai';
    const demoPassword = 'password123';

    try {
      // Try registering the demo account in case DB is fresh
      await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Demo Account',
          email: demoEmail,
          password: demoPassword,
        }),
      }).catch(() => {}); // Ignore errors if already registered

      const res = await signIn('credentials', {
        email: demoEmail,
        password: demoPassword,
        redirect: false,
      });

      if (res?.error) {
        throw new Error(res.error || 'Failed to sign in with demo credentials');
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border border-border-color p-8 rounded-[20px] bg-card shadow-sm">
      <CardHeader className="text-center flex flex-col items-center p-0 mb-6">
        <Link href="/" className="flex items-center gap-2.5 group mb-4">
          <div className="p-1.5 bg-accent-primary rounded-lg text-white">
            <Shield className="h-4.5 w-4.5" />
          </div>
          <span className="text-base font-semibold tracking-tight text-text-primary">
            InvestEase <span className="text-accent-primary">AI</span>
          </span>
        </Link>
        <CardTitle className="text-lg font-semibold text-text-primary">
          Welcome Back
        </CardTitle>
        <CardDescription className="text-xs text-text-secondary mt-1">
          Enter your login credentials to review your dashboard.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {success && (
          <div className="mb-4 p-3 bg-accent-success/5 border border-accent-success/20 text-accent-success rounded-xl flex items-center gap-2 text-xs font-semibold">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-accent-danger/5 border border-accent-danger/20 text-accent-danger rounded-xl flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="name@company.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <Button type="submit" className="w-full flex justify-center items-center gap-2 mt-6 py-2.5" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Signing In...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" /> Sign In
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 flex flex-col gap-2">
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-border-color" />
            <span className="flex-shrink mx-4 text-text-secondary text-[10px] font-bold tracking-widest uppercase">Or</span>
            <div className="flex-grow border-t border-border-color" />
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full flex justify-center items-center gap-2 text-accent-primary font-semibold py-2.5 mt-2"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            Launch Instantly with Demo Account
          </Button>
        </div>

        <p className="mt-6 text-center text-xs font-medium text-text-secondary">
          Don't have an account?{' '}
          <Link href="/register" className="text-accent-primary hover:underline font-semibold">
            Register Here
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

export default function Login() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-8 bg-card border border-border-color rounded-[20px]">
        <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
