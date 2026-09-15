'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Sidebar } from '@/components/pawz/Sidebar';
import { Header } from '@/components/pawz/Header';
import { cn } from '@/lib/utils';
import type { DawgNavSection } from '@/lib/types';

const customerSections: { id: DawgNavSection; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'appointments', label: 'My Appointments' },
  { id: 'pets', label: 'My Pets' },
  { id: 'invoices', label: 'Invoices' },
];

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [hasHydrated, setHasHydrated] = useState(false);
  const { currentUser, setUser, activeSection, setActiveSection, mobileOpen, setMobileOpen, isSidebarCollapsed, toggleSidebar, selectedLocation, setSelectedLocation, locations, activeModal, setActiveModal } = useAppStore();

  useEffect(() => {
    const unsub = useAppStore.persist.onFinishHydration(() => setHasHydrated(true));
    if (useAppStore.persist.hasHydrated()) setHasHydrated(true);
    return unsub;
  }, []);

  useEffect(() => {
    if (!hasHydrated) return;
    if (!currentUser) { router.replace('/'); return; }
    if (currentUser.role === 'admin') { router.replace('/admin/dashboard'); return; }
    if (currentUser.role === 'groomer') { router.replace('/groomer/dashboard'); return; }
  }, [hasHydrated, currentUser, router]);

  if (!hasHydrated || !currentUser || currentUser.role !== 'customer') {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const navigate = (section: DawgNavSection) => {
    setActiveSection(section);
    router.push(`/customer/${section === 'dashboard' ? 'dashboard' : section}`);
  };

  return (
    <div className="h-screen w-screen flex overflow-hidden bg-background text-foreground antialiased font-sans">
      <Sidebar
        activeSection={activeSection}
        onSelectSection={navigate}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
        locationsList={locations}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />

      <main className={cn(
        'flex-1 flex flex-col h-full overflow-hidden bg-background text-foreground',
        isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64',
        'transition-[margin] duration-200 ease-in-out'
      )}>
        <Header
          onOpenMobileMenu={() => setMobileOpen(true)}
          onOpenSearch={() => setActiveModal('search')}
          currentDate="May 12, 2025"
          onNavigateSection={navigate}
          activeSection={activeSection}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={toggleSidebar}
          onSignOut={() => { setUser(null); router.push('/'); }}
          currentUser={currentUser}
          selectedLocation={selectedLocation}
          onSelectLocation={setSelectedLocation}
          locationsList={locations.map((l) => l.name)}
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-background">
          <nav className="flex items-center gap-1 px-4 py-1.5 border-b border-border bg-card overflow-x-auto custom-scrollbar">
            {customerSections.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigate(item.id)}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-md px-2.5 h-7 text-[12px] font-medium transition-colors cursor-pointer whitespace-nowrap',
                    isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
          {children}
        </div>
      </main>
    </div>
  );
}
