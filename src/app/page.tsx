'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { LandingLoginView } from '@/components/pawz/LandingLoginView';
import type { DawgNavSection } from '@/lib/types';

export default function Home() {
  const router = useRouter();
  const { setUser, setActiveSection } = useAppStore();

  // The landing page IS the home. It renders and takes NO action until the user
  // explicitly clicks LOG IN. No auto-redirect, no banner, no surprises.
  return (
    <LandingLoginView
      onLogin={(user, initialSec) => {
        setUser(user);
        if (initialSec) {
          setActiveSection(initialSec as DawgNavSection);
        }
        // The only navigation that happens is from an explicit user click
        if (user.role === 'admin') {
          router.push(`/admin/${initialSec || 'dashboard'}`);
        } else if (user.role === 'groomer') {
          router.push('/groomer/dashboard');
        } else if (user.role === 'customer') {
          router.push('/customer/dashboard');
        }
      }}
    />
  );
}
