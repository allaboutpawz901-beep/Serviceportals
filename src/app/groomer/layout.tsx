'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { GroomerPortalView } from '@/components/pawz/GroomerPortalView';

export default function GroomerLayout({ children }: { children: React.ReactNode }) {
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
    if (currentUser.role === 'customer') {
      router.replace('/customer/dashboard');
      return;
    }
  }, [currentUser, router]);

  if (!currentUser || currentUser.role !== 'groomer') {
    return null;
  }

  return (
    <GroomerPortalView
      currentUser={currentUser}
      onSwitchToAdmin={() => {
        setUser({
          id: 'usr-admin-1',
          name: 'Admin User',
          email: 'admin@test.com',
          role: 'admin',
          stationName: 'Central Management',
        });
        router.push('/admin/dashboard');
      }}
      onSignOut={() => {
        setUser(null);
        router.push('/');
      }}
    />
  );
}
