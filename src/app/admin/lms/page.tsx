'use client';

import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { LmsLandingView } from '@/components/pawz/lms/LmsLandingView';
import type { DawgNavSection } from '@/lib/types';

export default function LmsLandingPage() {
  const router = useRouter();
  const { setActiveSection } = useAppStore();

  const navigate = (section: DawgNavSection) => {
    setActiveSection(section);
    if (section === 'lms') {
      router.push('/admin/lms');
    } else if (section.startsWith('lms-')) {
      router.push(`/admin/lms/${section.replace('lms-', '')}`);
    } else {
      router.push(`/admin/${section}`);
    }
  };

  return <LmsLandingView onNavigate={navigate} />;
}
