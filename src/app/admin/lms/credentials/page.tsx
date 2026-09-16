'use client';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { LmsCredentialsDomain } from '@/components/pawz/lms/LmsCredentialsDomain';
import type { DawgNavSection } from '@/lib/types';

export default function Page() {
  const router = useRouter();
  const { setActiveSection } = useAppStore();
  const navigate = (s: DawgNavSection) => {
    setActiveSection(s);
    if (s === 'lms') router.push('/admin/lms');
    else if (s.startsWith('lms-')) router.push(`/admin/lms/${s.replace('lms-', '')}`);
    else router.push(`/admin/${s}`);
  };
  return <LmsCredentialsDomain onNavigate={navigate} />;
}
