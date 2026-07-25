'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to sign up');
      }

      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
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
          Create an Account
        </CardTitle>
        <CardDescription className="text-xs text-text-secondary mt-1">
          Get started with premium AI guardrails for your wealth.
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0">
        {error && (
          <div className="mb-4 p-3 bg-accent-danger/5 border border-accent-danger/20 text-accent-danger rounded-xl flex items-center gap-2 text-xs font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
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
                <Loader2 className="h-4 w-4 animate-spin" /> Creating Account...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" /> Sign Up
              </>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs font-medium text-text-secondary">
          Already have an account?{' '}
          <Link href="/login" className="text-accent-primary hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
