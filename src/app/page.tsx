'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { LandingLoginView } from '@/components/pawz/LandingLoginView';
import { ArrowRight, LogOut, X, PawPrint } from 'lucide-react';
import type { DawgNavSection } from '@/lib/types';

export default function Home() {
  const router = useRouter();
  const { currentUser, setUser, setActiveSection } = useAppStore();
  const [bannerDismissed, setBannerDismissed] = useState(false);

  const portalPath = currentUser
    ? currentUser.role === 'admin'
      ? '/admin/dashboard'
      : currentUser.role === 'groomer'
        ? '/groomer/dashboard'
        : '/customer/dashboard'
    : null;

  const continueToPortal = () => {
    if (!currentUser) return;
    if (currentUser.role === 'admin') {
      setActiveSection('dashboard' as DawgNavSection);
      router.push('/admin/dashboard');
    } else if (currentUser.role === 'groomer') {
      router.push('/groomer/dashboard');
    } else if (currentUser.role === 'customer') {
      router.push('/customer/dashboard');
    }
  };

  const signOut = () => {
    setUser(null);
    setBannerDismissed(false);
  };

  return (
    <div className="relative">
      {/* Welcome-back banner — only for authenticated users, dismissible, NEVER auto-redirects */}
      {currentUser && portalPath && !bannerDismissed && (
        <div className="fixed top-0 left-0 right-0 z-[60] bg-primary text-primary-foreground shadow-lg">
          <div className="mx-auto max-w-6xl px-4 py-2.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <PawPrint className="size-4 shrink-0" />
              <span className="text-[13px] font-medium truncate">
                Welcome back, <span className="font-semibold">{currentUser.name || currentUser.email}</span>. You&apos;re signed in as <span className="font-semibold uppercase">{currentUser.role}</span>.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={continueToPortal}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-background text-foreground text-[12px] font-semibold hover:bg-background/90 transition-colors cursor-pointer"
              >
                Continue to {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'groomer' ? 'Groomer' : 'Customer'} Portal
                <ArrowRight className="size-3.5" />
              </button>
              <button
                onClick={signOut}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-primary-foreground/30 text-primary-foreground text-[12px] font-medium hover:bg-primary-foreground/10 transition-colors cursor-pointer"
              >
                <LogOut className="size-3.5" />
                Sign Out
              </button>
              <button
                onClick={() => setBannerDismissed(true)}
                aria-label="Dismiss"
                className="inline-flex items-center justify-center size-8 rounded-md text-primary-foreground/80 hover:bg-primary-foreground/10 transition-colors cursor-pointer"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* The landing page IS the home — always renders, never auto-redirects */}
      <div className={currentUser && portalPath && !bannerDismissed ? 'pt-12' : ''}>
        <LandingLoginView
          onLogin={(user, initialSec) => {
            setUser(user);
            if (initialSec) {
              setActiveSection(initialSec as DawgNavSection);
            }
            // Explicit login action — navigate to the portal the user chose
            if (user.role === 'admin') {
              router.push(`/admin/${initialSec || 'dashboard'}`);
            } else if (user.role === 'groomer') {
              router.push('/groomer/dashboard');
            } else if (user.role === 'customer') {
              router.push('/customer/dashboard');
            }
          }}
        />
      </div>
    </div>
  );
}
