'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import {
  LayoutDashboard,
  CreditCard,
  Wallet,
  Target,
  ShieldAlert,
  Search,
  Activity,
  BarChart3,
  Sparkles,
  Settings,
  User,
  LogOut,
  Shield,
  Menu,
  X,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = React.useState(false);

  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Expense Tracker', href: '/expenses', icon: CreditCard },
    { name: 'Budget Planner', href: '/budget', icon: Wallet },
    { name: 'Savings Goals', href: '/savings', icon: Target },
    { name: 'Portfolio Simulator', href: '/portfolio', icon: TrendingUp },
    { name: 'Financial Health', href: '/health', icon: Activity },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'AI Assistant', href: '/ai-assistant', icon: Sparkles },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Top Header Bar */}
      <div className="md:hidden sticky top-0 z-40 w-full bg-card border-b border-border-color px-6 py-3 flex items-center justify-between transition-colors duration-200">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="p-1.5 bg-accent-primary rounded-lg text-white">
            <Shield className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight text-text-primary">
            InvestEase <span className="text-accent-primary text-xs">AI</span>
          </span>
        </Link>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-card-sec cursor-pointer"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Slide-over backdrop for mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-background/50 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-card border-r border-border-color p-6 flex flex-col justify-between transition-transform duration-200 md:translate-x-0 md:sticky md:h-screen ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col space-y-6">
          {/* Logo Header */}
          <div className="hidden md:flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="p-1.5 bg-accent-primary rounded-lg text-white">
                <Shield className="h-4.5 w-4.5" />
              </div>
              <span className="text-base font-semibold tracking-tight text-text-primary">
                InvestEase <span className="text-accent-primary">AI</span>
              </span>
            </Link>
          </div>

          {/* User card container */}
          {session?.user && (
            <div className="flex items-center gap-3 p-3 bg-card-sec rounded-xl border border-border-color">
              <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center text-white font-semibold text-xs shrink-0">
                {session.user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold text-text-primary truncate">
                  {session.user.name}
                </span>
                <span className="text-[10px] text-text-secondary truncate">
                  {session.user.email}
                </span>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-card-sec border border-border-color text-text-primary'
                      : 'text-text-secondary hover:text-text-primary hover:bg-card-sec/50'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                      isActive ? 'text-accent-primary' : 'text-text-secondary'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col gap-2 pt-4 border-t border-border-color">
          <Button
            variant="outline"
            onClick={() => {
              signOut({ callbackUrl: '/' });
            }}
            className="flex items-center justify-start gap-3 w-full border-accent-danger/20 text-accent-danger hover:bg-accent-danger/5 text-xs font-medium py-2 rounded-xl"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>
    </>
  );
}
