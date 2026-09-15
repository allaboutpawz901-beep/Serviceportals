'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { CustomerPortalView } from '@/components/pawz/CustomerPortalView';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { currentUser, setUser } = useAppStore();

  useEffect(() => {
    if (!currentUser) {
      router.replace('/');
      return;
    }
    if (currentUser.role === 'admin') {
      router.replace('/admin/dashboard');
      return;
    }
    if (currentUser.role === 'groomer') {
      router.replace('/groomer/dashboard');
      return;
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'customer') {
    return null;
  }

  return (
    <CustomerPortalView
      currentUser={currentUser}
      onSwitchToAdmin={() => {
        setUser({
          id: 'usr-admin-1',
          name: 'Admin User',
          email: 'admin@test.com',
          role: 'admin',
        });
        router.push('/admin/dashboard');
      }}
      onSwitchToGroomer={() => {
        setUser({
          id: 'usr-groomer-1',
          name: 'Sarah M.',
          email: 'groomer@test.com',
          role: 'groomer',
          stationName: 'Station #3 (Spa Suite)',
        });
        router.push('/groomer/dashboard');
      }}
      onSignOut={() => {
        setUser(null);
        router.push('/');
      }}
    />
  );
}
