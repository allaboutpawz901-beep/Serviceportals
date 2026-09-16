'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { LandingLoginView } from '@/components/pawz/LandingLoginView';
import type { DawgNavSection } from '@/lib/types';

export default function Home() {
  const router = useRouter();
  const { currentUser, setUser, setActiveSection } = useAppStore();

  // Redirect to appropriate portal based on role
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      router.replace('/admin/dashboard');
    } else if (currentUser?.role === 'groomer') {
      router.replace('/groomer/dashboard');
    } else if (currentUser?.role === 'customer') {
      router.replace('/customer/dashboard');
    }
  }, [currentUser, router]);

  // Show landing/login when not authenticated
  if (!currentUser) {
    return (
      <LandingLoginView
        onLogin={(user, initialSec) => {
          setUser(user);
          if (initialSec) {
            setActiveSection(initialSec as DawgNavSection);
          }
          // Redirect based on role
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

  // While redirecting, show nothing
  return null;
}
