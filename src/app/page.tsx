'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { LandingLoginView } from '@/components/pawz/LandingLoginView';
import type { DawgNavSection } from '@/lib/types';

function HomeContent() {
  const router = useRouter();
  const { setUser, setActiveSection } = useAppStore();

  return (
    <LandingLoginView
      onLogin={(user, initialSec) => {
        setUser(user);
        if (initialSec) {
          setActiveSection(initialSec as DawgNavSection);
        }
        const targetUrl =
          user.role === 'admin'
            ? `/admin/${initialSec || 'dashboard'}`
            : user.role === 'groomer'
            ? '/groomer/dashboard'
            : '/customer/dashboard';
        router.push(targetUrl);
      }}
    />
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen w-full bg-black" />}>
      <HomeContent />
    </Suspense>
  );
}

