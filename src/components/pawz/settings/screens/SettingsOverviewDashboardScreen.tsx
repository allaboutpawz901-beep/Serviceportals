'use client';

import React, { useState } from 'react';

interface ScreenProps {
  onNavigateScreen?: (screenId: string) => void;
  selectedLocation?: string;
  onSelectLocation?: (loc: string) => void;
}

export const SettingsOverviewDashboardScreen: React.FC<ScreenProps> = ({
  onNavigateScreen,
}) => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const modules = [
    {
      id: 'org-multiloc',
      title: 'Locations & Branches',
      desc: 'Manage physical salon facilities and mobile vans. Configure capacity, addresses, and contact lines.',
      status: 'Active',
      badge: 'Facilities',
      primaryAction: 'Manage Locations',
    },
    {
      id: 'org-brand',
      title: 'Brand & Identity',
      desc: 'Company logos, typography, SMS headers, and receipt branding templates.',
      status: 'Configured',
      badge: 'Branding',
      primaryAction: 'Edit Brand Assets',
    },
    {
      id: 'users-staff',
      title: 'Staff & Role Permissions',
      desc: 'Team access permissions, groomer commission splits, shift assignments, and PIN security.',
      status: 'Active',
      badge: 'Team',
      primaryAction: 'Manage Staff & Roles',
    },
    {
      id: 'booking-ops',
      title: 'Booking Rules & Windows',
      desc: 'Lead times, auto table assignments, deposit rules, cancellation windows, and pet vaccination requirements.',
      status: 'Enforced',
      badge: 'Operations',
      primaryAction: 'Configure Booking Rules',
    },
    {
      id: 'booking-rules',
      title: 'Business & Holiday Hours',
      desc: 'Weekly salon operating hours, extended weekend blocks, and annual holiday blackout calendar.',
      status: 'Active',
      badge: 'Hours',
      primaryAction: 'Set Operating Hours',
    },
    {
      id: 'services-pricing',
      title: 'Services & Pricing Matrix',
      desc: 'Core grooming tiers, breed weight surcharge rules, and recurring membership packages.',
      status: 'Active',
      badge: 'Pricing',
      primaryAction: 'Open Pricing Matrix',
    },
    {
      id: 'services-catalog',
      title: 'Service Add-ons Catalog',
      desc: 'Spa add-on descriptions, duration buffers, and specialty treatment configurations.',
      status: 'Active',
      badge: 'Catalog',
      primaryAction: 'Edit Add-ons Catalog',
    },
    {
      id: 'customer-portal',
      title: 'Client Portal Settings',
      desc: 'Self-service client booking portal, digital intake cards, and appointment management.',
      status: 'Active',
      badge: 'Portal',
      primaryAction: 'Configure Client Portal',
    },
    {
      id: 'org-social',
      title: 'Social & Directory Links',
      desc: 'Google Business Profile place ID, Yelp profile, Instagram, and review invitation links.',
      status: 'Connected',
      badge: 'Profiles',
      primaryAction: 'Edit Social Links',
    },
    {
      id: 'cms-wizard',
      title: 'Website CMS & Booking Widget',
      desc: 'Online booking flow configuration, website copy, and embeddable appointment widgets.',
      status: 'Published',
      badge: 'CMS',
      primaryAction: 'Customize Website Widget',
    },
    {
      id: 'system-telemetry',
      title: 'System Logs & Health',
      desc: 'Database connectivity, webhook monitors, activity audit trails, and platform diagnostics.',
      status: 'Operational',
      badge: 'System',
      primaryAction: 'View System Health',
    },
  ];

  return (
    <div className="w-full bg-card text-foreground font-sans antialiased text-xs">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-3 border border-white z-50 flex items-center gap-3 tabular-nums text-xs shadow-2xl">
          <span className="w-2 h-2 bg-card animate-pulse"></span>
          <span className="uppercase font-bold tracking-wider">{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="ml-2 text-white hover:opacity-70 cursor-pointer">✕</button>
        </div>
      )}

      {/* HEADER HERO */}
      <div className="p-6 border-b border-border bg-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-tight text-foreground font-sans">
              Settings Overview
            </h1>
            <p className="text-xs text-muted-foreground mt-1 max-w-2xl">
              Configure salon operations, branch profiles, staff permissions, service matrices, and client booking parameters.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => onNavigateScreen?.('org-multiloc')}
              className="h-8 px-3 border border-border bg-card font-bold hover:bg-muted/40 cursor-pointer"
            >
              Branch Locations
            </button>
            <button
              onClick={() => onNavigateScreen?.('users-staff')}
              className="h-8 px-4 bg-primary text-primary-foreground border border-border font-bold hover:bg-muted cursor-pointer"
            >
              Staff &amp; Permissions
            </button>
          </div>
        </div>
      </div>

      {/* SCREEN DIRECTORY BENTO GRID */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
        {modules.map((m) => (
          <div
            key={m.id}
            className="border border-border bg-card p-5 flex flex-col justify-between hover:bg-muted/30 transition-colors space-y-4"
          >
            <div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span className="font-bold text-xs uppercase text-foreground">{m.title}</span>
                <span className="border border-border px-1.5 py-0.5 text-[10px] font-bold text-foreground uppercase">
                  {m.badge}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed">
                {m.desc}
              </p>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between">
              <span className="text-[11px] font-medium text-muted-foreground">{m.status}</span>
              <button
                onClick={() => onNavigateScreen?.(m.id)}
                className="px-3 py-1.5 bg-primary text-primary-foreground text-xs uppercase font-bold hover:bg-muted cursor-pointer"
              >
                {m.primaryAction} →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
