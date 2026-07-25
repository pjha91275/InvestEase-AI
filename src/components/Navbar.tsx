'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Shield, LayoutDashboard, LogOut, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/Button';

export default function Navbar() {
  const { data: session } = useSession();
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/85 backdrop-blur-md border-b border-border-color transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="p-1.5 bg-accent-primary rounded-lg text-white">
                <Shield className="h-4.5 w-4.5" />
              </div>
              <span className="text-base font-semibold tracking-tight text-text-primary">
                InvestEase <span className="text-accent-primary">AI</span>
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-text-secondary">
            <Link href="/#features" className="hover:text-text-primary transition-colors">Features</Link>
            <Link href="/#why-us" className="hover:text-text-primary transition-colors">Why InvestEase</Link>
            <Link href="/#workflow" className="hover:text-text-primary transition-colors">How It Works</Link>
            <Link href="/#pricing" className="hover:text-text-primary transition-colors">Pricing</Link>
          </div>

          {/* Action Blocks */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-card-sec transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <Moon className="h-4 w-4 text-accent-primary" />
                  <span className="hidden sm:inline">Dark</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-medium">
                  <Sun className="h-4 w-4 text-accent-warning" />
                  <span className="hidden sm:inline">Light</span>
                </div>
              )}
            </button>

            {session ? (
              <div className="flex items-center gap-2.5">
                <Link href="/dashboard">
                  <Button variant="secondary" size="sm" className="flex items-center gap-1.5 font-medium">
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="flex items-center gap-1.5 border-accent-danger/25 text-accent-danger hover:bg-accent-danger/5"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Sign Out</span>
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-semibold text-xs sm:text-sm">
                    Log In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm" className="font-semibold text-xs sm:text-sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
