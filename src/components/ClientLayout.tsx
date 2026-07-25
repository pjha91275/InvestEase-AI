'use client';

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { ThemeProvider } from '@/components/ThemeProvider';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Public/Auth routes that do not get the dashboard sidebar
  const isPublicLanding = pathname === '/';
  const isAuthRoute = pathname === '/login' || pathname === '/register';

  if (isAuthRoute) {
    return (
      <SessionProvider>
        <ThemeProvider>
          <main className="min-h-screen bg-background text-text-primary flex items-center justify-center p-6">
            {children}
          </main>
        </ThemeProvider>
      </SessionProvider>
    );
  }

  if (isPublicLanding) {
    return (
      <SessionProvider>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col bg-background text-text-primary transition-colors duration-200">
            <Navbar />
            <main className="flex-grow">{children}</main>
          </div>
        </ThemeProvider>
      </SessionProvider>
    );
  }

  // Dashboard layout: sidebar on left, content scroll container on right
  return (
    <SessionProvider>
      <ThemeProvider>
        <div className="min-h-screen flex flex-col md:flex-row bg-background text-text-primary transition-colors duration-200">
          <Sidebar />
          <main className="flex-grow p-6 md:p-10 max-w-7xl mx-auto w-full overflow-x-hidden">
            {children}
          </main>
        </div>
      </ThemeProvider>
    </SessionProvider>
  );
}
