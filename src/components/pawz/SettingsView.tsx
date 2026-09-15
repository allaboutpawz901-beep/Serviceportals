'use client';

import React, { useState, useEffect } from 'react';
import { LocationItem, DawgNavSection } from '@/lib/types';
import { SystemSettings, DEFAULT_SETTINGS } from '@/lib/settings-types';
import {
  Search,
  Bell,
  HelpCircle,
  ExternalLink,
  LayoutGrid,
  Building2,
  Users,
  Calendar,
  Tag,
  CreditCard,
  Globe,
  UserCheck,
  MessageSquare,
  Package,
  BarChart3,
  Sliders,
  ChevronRight,
  ArrowLeft,
  X,
  GraduationCap,
  Activity,
} from 'lucide-react';

// Import All 16 Dedicated Design Screens
import { SettingsOverviewDashboardScreen } from './settings/screens/SettingsOverviewDashboardScreen';
import { OrgMultiLocationScreen } from './settings/screens/OrgMultiLocationScreen';
import { BusinessProfileScreen } from './settings/screens/BusinessProfileScreen';
import { OrgBrandIdentityScreen } from './settings/screens/OrgBrandIdentityScreen';
import { UsersStaffRolesScreen } from './settings/screens/UsersStaffRolesScreen';
import { BookingOperationsRulesScreen } from './settings/screens/BookingOperationsRulesScreen';
import { BookingRulesPoliciesScreen } from './settings/screens/BookingRulesPoliciesScreen';
import { ServicesPricingMatrixScreen } from './settings/screens/ServicesPricingMatrixScreen';
import { ServicesAddonCatalogScreen } from './settings/screens/ServicesAddonCatalogScreen';
import { StripeIntegrationScreen } from './settings/screens/StripeIntegrationScreen';
import { PaymentsTaxLegalScreen } from './settings/screens/PaymentsTaxLegalScreen';
import { InvoicesAgingLedgerScreen } from './settings/screens/InvoicesAgingLedgerScreen';
import { CmsBookingWizardScreen } from './settings/screens/CmsBookingWizardScreen';
import { CustomerPortalScreen } from './settings/screens/CustomerPortalScreen';
import { OrgSocialDirectoriesScreen } from './settings/screens/OrgSocialDirectoriesScreen';
import { OmsAddProductScreen } from './settings/screens/OmsAddProductScreen';
import { SystemHealthTelemetryScreen } from './settings/screens/SystemHealthTelemetryScreen';
import { AnalyticsReportingScreen } from './settings/screens/AnalyticsReportingScreen';
import { EscrowDepositsForfeituresScreen } from './settings/screens/EscrowDepositsForfeituresScreen';

// Secondary LMS Tab
import { LMSTab } from './settings/LMSTab';

interface SettingsViewProps {
  locations: LocationItem[];
  selectedLocation: string;
  onSelectLocation: (locName: string) => void;
  onAddLocation: (newLoc: Partial<LocationItem>) => void;
  onDeleteLocation?: (id: string) => void;
  onNavigateSection?: (section: DawgNavSection) => void;
  onOpenQuickAction?: (action: 'appointment' | 'customer' | 'pet' | 'payment' | 'invoice') => void;
  initialTab?: string;
}

export type SettingsTabId =
  | 'overview'
  | 'organization'
  | 'org-multiloc'
  | 'org-brand'
  | 'users'
  | 'users-staff'
  | 'lms'
  | 'booking'
  | 'booking-ops'
  | 'booking-rules'
  | 'services'
  | 'services-pricing'
  | 'services-catalog'
  | 'payments'
  | 'revenue-stripe'
  | 'payments-tax'
  | 'website'
  | 'cms-wizard'
  | 'portal'
  | 'customer-portal'
  | 'communications'
  | 'org-social'
  | 'inventory'
  | 'oms-add-product'
  | 'reports'
  | 'invoices-aging'
  | 'health'
  | 'system'
  | 'system-telemetry'
  | 'analytics-reporting'
  | 'escrow-deposits';

interface TabConfig {
  id: SettingsTabId;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

interface TabCategory {
  title: string;
  tabs: TabConfig[];
}

const TAB_CATEGORIES: TabCategory[] = [
  {
    title: 'ORGANIZATION & LOCATIONS',
    tabs: [
      { id: 'overview', label: 'Settings Overview', icon: LayoutGrid },
      { id: 'business-profile', label: 'Business Profile', icon: Building2 },
      { id: 'org-multiloc', label: 'Locations & Branches', icon: Building2 },
      { id: 'org-brand', label: 'Brand & Identity', icon: Tag },
    ],
  },
  {
    title: 'TEAM & ACCESS',
    tabs: [
      { id: 'users-staff', label: 'Staff & Role Permissions', icon: Users, badge: 'Active' },
      { id: 'lms', label: 'Staff Academy & Training', icon: GraduationCap },
    ],
  },
  {
    title: 'OPERATIONS & BOOKING',
    tabs: [
      { id: 'booking-ops', label: 'Booking Rules & Windows', icon: Calendar },
      { id: 'booking-rules', label: 'Business & Holiday Hours', icon: Calendar },
      { id: 'services-pricing', label: 'Services & Pricing Matrix', icon: Tag },
      { id: 'services-catalog', label: 'Service Add-ons Catalog', icon: Tag },
      { id: 'customer-portal', label: 'Client Portal Settings', icon: UserCheck },
      { id: 'org-social', label: 'Social & Directory Links', icon: MessageSquare },
    ],
  },
  {
    title: 'WEBSITE & SYSTEM',
    tabs: [
      { id: 'cms-wizard', label: 'Website CMS & Widget', icon: Globe },
      { id: 'system-telemetry', label: 'System Logs & Health', icon: Activity, badge: 'Live' },
    ],
  },
];

const ALL_TABS: TabConfig[] = TAB_CATEGORIES.flatMap((c) => c.tabs);

export const SettingsView: React.FC<SettingsViewProps> = ({
  locations,
  selectedLocation,
  onSelectLocation,
  onAddLocation,
  onDeleteLocation,
  onNavigateSection,
  onOpenQuickAction,
  initialTab = 'overview',
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTabId>(
    (initialTab as SettingsTabId) || 'overview'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Database settings state
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SETTINGS);
  const [isSettingsLoading, setIsSettingsLoading] = useState(true);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          setSystemSettings(data);
        }
      } catch (err) {
        console.error("Failed to load settings from Supabase API:", err);
      } finally {
        setIsSettingsLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const saveSettingsToDb = async (updates: Partial<SystemSettings>) => {
    setSystemSettings((prev) => ({ ...prev, ...updates }));
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error("Failed to save settings to database:", err);
    }
  };

  const navigateToScreen = (screenId: string) => {
    setActiveTab(screenId as SettingsTabId);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Quick search filter
  const filteredTabs = searchQuery.trim()
    ? ALL_TABS.filter(
        (t) =>
          t.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const activeTabConfig =
    ALL_TABS.find((t) => t.id === activeTab) ||
    ALL_TABS.find((t) => {
      if (activeTab === 'users') return t.id === 'users-staff';
      if (activeTab === 'organization') return t.id === 'org-multiloc';
      if (activeTab === 'booking') return t.id === 'booking-ops';
      if (activeTab === 'services') return t.id === 'services-pricing';
      if (activeTab === 'payments') return t.id === 'revenue-stripe';
      if (activeTab === 'website') return t.id === 'cms-wizard';
      if (activeTab === 'portal') return t.id === 'customer-portal';
      if (activeTab === 'communications') return t.id === 'org-social';
      if (activeTab === 'inventory') return t.id === 'oms-add-product';
      if (activeTab === 'reports') return t.id === 'invoices-aging';
      if (activeTab === 'health' || activeTab === 'system') return t.id === 'system-telemetry';
      return false;
    }) ||
    ALL_TABS[0];

  const ActiveIcon = activeTabConfig.icon;

  return (
    <div className="min-h-full bg-card text-foreground font-bar antialiased text-[13px]">
      {/* Top Header Bar */}
      <header className="px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border bg-card sticky top-0 z-40">
        <div>
          <h1 className="text-base font-semibold tracking-tight text-foreground font-bar">
            Organization Settings
          </h1>
          <p className="text-[13px] text-muted-foreground mt-0.5">
            Manage branches, team permissions, booking parameters, service matrices, and salon operations.
          </p>
        </div>

        {/* Header Right Utilities */}
        <div className="flex items-center gap-3">
          {/* Quick Search */}
          <div className="relative w-64 md:w-72">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings..."
              className="w-full pl-9 pr-8 h-8 bg-muted/30 border border-border rounded-md text-[13px] focus:bg-card focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {searchQuery.trim().length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1 bg-card border border-border shadow-2xl p-1 z-50 space-y-1">
                {filteredTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      navigateToScreen(tab.id);
                      setSearchQuery('');
                    }}
                    className="w-full text-left px-3 py-2 text-xs hover:bg-black hover:text-white tabular-nums flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <tab.icon className="w-3.5 h-3.5" />
                      <span>{tab.label}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* System Alerts Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-1.5 text-foreground hover:bg-muted/40 border border-border cursor-pointer"
              title="System Alerts"
            >
              <Bell className="w-4 h-4" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-1.5 w-80 bg-card border border-border shadow-2xl p-3 z-50 space-y-2 tabular-nums text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="font-bold uppercase text-foreground">SYSTEM AUDIT ALERTS</span>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    [CLOSE]
                  </button>
                </div>
                <div className="space-y-1.5 text-[11px]">
                  <div className="p-2 border border-border bg-muted/30 text-foreground">
                    <p className="font-bold uppercase">WAL S3 Backup Synchronized</p>
                    <p className="text-muted-foreground text-[10px]">Continuous PITR logging nominal at 03:00 UTC.</p>
                  </div>
                  <div className="p-2 border border-border bg-muted/30 text-foreground">
                    <p className="font-bold uppercase">Stripe Connect Ledger</p>
                    <p className="text-muted-foreground text-[10px]">$4,120.00 daily settlement batch confirmed.</p>
                  </div>
                  <div className="p-2 border border-border bg-muted/30 text-foreground">
                    <p className="font-bold uppercase">RBAC Elevation Logged</p>
                    <p className="text-muted-foreground text-[10px]">Jessica Lee unauthorized access attempt blocked (403).</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Help Info */}
          <button
            onClick={() => setShowHelpModal(true)}
            className="p-1.5 text-foreground hover:bg-muted/40 border border-border cursor-pointer"
            title="Help"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Public Wizard Action */}
          <button
            onClick={() => navigateToScreen('cms-wizard')}
            className="inline-flex items-center gap-1.5 px-3 h-8 bg-primary hover:bg-primary/90 text-primary-foreground text-[12px] font-medium rounded-md border border-border cursor-pointer transition-colors duration-150"
          >
            <span>Public Wizard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2-Column Workspace: Left Settings Nav + Right Screen Canvas */}
      <div className="flex flex-col lg:flex-row min-h-[calc(100vh-65px)] lg:h-[calc(100vh-65px)] lg:overflow-hidden">
        {/* Left Navigation Sidebar — matches global sidebar font (Montserrat) */}
        <aside className="w-full lg:w-64 xl:w-72 bg-card border-r border-border shrink-0 flex flex-col justify-between text-[13px] select-none lg:overflow-y-auto lg:h-full font-bar">
          <div className="p-3 space-y-5">
            {TAB_CATEGORIES.map((cat, catIdx) => (
              <div key={catIdx} className="space-y-1">
                <div className="px-2 pb-1 text-[10px] font-medium tracking-wider text-muted-foreground uppercase">
                  {cat.title}
                </div>
                <div className="space-y-0.5">
                  {cat.tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isTabActive =
                      activeTab === tab.id ||
                      (tab.id === 'org-multiloc' && activeTab === 'organization') ||
                      (tab.id === 'users-staff' && activeTab === 'users') ||
                      (tab.id === 'booking-ops' && activeTab === 'booking') ||
                      (tab.id === 'services-pricing' && activeTab === 'services') ||
                      (tab.id === 'revenue-stripe' && activeTab === 'payments') ||
                      (tab.id === 'cms-wizard' && activeTab === 'website') ||
                      (tab.id === 'customer-portal' && activeTab === 'portal') ||
                      (tab.id === 'org-social' && activeTab === 'communications') ||
                      (tab.id === 'oms-add-product' && activeTab === 'inventory') ||
                      (tab.id === 'invoices-aging' && activeTab === 'reports') ||
                      (tab.id === 'system-telemetry' && (activeTab === 'system' || activeTab === 'health'));

                    return (
                      <button
                        key={tab.id}
                        onClick={() => navigateToScreen(tab.id)}
                        className={`w-full text-left px-3 py-2 text-[13px] font-medium flex items-center justify-between cursor-pointer transition-colors duration-150 rounded-md border ${
                          isTabActive
                            ? 'bg-primary/10 text-primary border-primary/20'
                            : 'border-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Icon className={`w-3.5 h-3.5 shrink-0 ${isTabActive ? 'text-primary' : 'text-muted-foreground'}`} />
                          <span className="truncate">{tab.label}</span>
                        </div>
                        {tab.badge && (
                          <span
                            className={`text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded-full ${
                              isTabActive
                                ? 'bg-muted text-white border border-border'
                                : 'bg-muted/40 text-foreground border border-border'
                            }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar Footer Info */}
          <div className="p-3 border-t border-border bg-card space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-muted-foreground font-medium">Active Branch:</span>
              <span className="font-bold text-foreground truncate max-w-[140px]">{selectedLocation}</span>
            </div>
          </div>
        </aside>

        {/* Right Settings Screen Canvas */}
        <main className="flex-1 min-w-0 bg-card lg:overflow-y-auto lg:h-full">
          {/* Active Screen Router */}
          {activeTab === 'overview' && (
            <SettingsOverviewDashboardScreen
              onNavigateScreen={navigateToScreen}
              selectedLocation={selectedLocation}
              onSelectLocation={onSelectLocation}
            />
          )}

          {(activeTab === 'org-multiloc' || activeTab === 'organization') && (
            <OrgMultiLocationScreen
              onNavigateScreen={navigateToScreen}
              selectedLocation={selectedLocation}
              onSelectLocation={onSelectLocation}
            />
          )}

          {activeTab === 'business-profile' && (
            <BusinessProfileScreen
              onNavigateScreen={navigateToScreen}
              selectedLocation={selectedLocation}
              onSelectLocation={onSelectLocation}
              systemSettings={systemSettings}
              saveSettingsToDb={saveSettingsToDb}
            />
          )}

          {activeTab === 'org-brand' && (
            <OrgBrandIdentityScreen
              onNavigateScreen={navigateToScreen}
              selectedLocation={selectedLocation}
              onSelectLocation={onSelectLocation}
              systemSettings={systemSettings}
              saveSettingsToDb={saveSettingsToDb}
            />
          )}

          {(activeTab === 'users-staff' || activeTab === 'users') && (
            <UsersStaffRolesScreen
              onNavigateScreen={navigateToScreen}
              selectedLocation={selectedLocation}
              onSelectLocation={onSelectLocation}
            />
          )}

          {(activeTab === 'booking-ops' || activeTab === 'booking') && (
            <BookingOperationsRulesScreen
              onNavigateScreen={navigateToScreen}
              selectedLocation={selectedLocation}
              onSelectLocation={onSelectLocation}
              systemSettings={systemSettings}
              saveSettingsToDb={saveSettingsToDb}
            />
          )}

          {activeTab === 'booking-rules' && (
            <BookingRulesPoliciesScreen
              onNavigateScreen={navigateToScreen}
              selectedLocation={selectedLocation}
              onSelectLocation={onSelectLocation}
              systemSettings={systemSettings}
              saveSettingsToDb={saveSettingsToDb}
            />
          )}

          {(activeTab === 'services-pricing' || activeTab === 'services') && (
            <ServicesPricingMatrixScreen
              onNavigateScreen={navigateToScreen}
              selectedLocation={selectedLocation}
              onSelectLocation={onSelectLocation}
              systemSettings={systemSettings}
              saveSettingsToDb={saveSettingsToDb}
            />
          )}

          {activeTab === 'services-catalog' && (
            <ServicesAddonCatalogScreen
              onNavigateScreen={navigateToScreen}
              selectedLocation={selectedLocation}
              onSelectLocation={onSelectLocation}
            />
          )}

          {(activeTab === 'revenue-stripe' || activeTab === 'payments') && (
            <StripeIntegrationScreen
              onNavigateScreen={navigateToScreen}
              selectedLocation={selectedLocation}
              onSelectLocation={onSelectLocation}
              systemSettings={systemSettings}
              saveSettingsToDb={saveSettingsToDb}
            />
          )}

          {activeTab === 'payments-tax' && (
            <PaymentsTaxLegalScreen
              onNavigateScreen={navigateToScreen}
              selectedLocation={selectedLocation}
              onSelectLocation={onSelectLocation}
              systemSettings={systemSettings}
              saveSettingsToDb={saveSettingsToDb}
            />
          )}

          {(activeTab === 'invoices-aging' || activeTab === 'reports') && (
            <InvoicesAgingLedgerScreen
              onNavigateScreen={navigateToScreen}
              selectedLocation={selectedLocation}
              onSelectLocation={onSelectLocation}
              systemSettings={systemSettings}
              saveSettingsToDb={saveSettingsToDb}
            />
          )}

          {(activeTab === 'cms-wizard' || activeTab === 'website') && (
            <CmsBookingWizardScreen
              onNavigateScreen={navigateToScreen}
              selectedLocation={selectedLocation}
              onSelectLocation={onSelectLocation}
              systemSettings={systemSettings}
              saveSettingsToDb={saveSettingsToDb}
            />
          )}

          {(activeTab === 'customer-portal' || activeTab === 'portal') && (
            <CustomerPortalScreen
              onNavigateScreen={navigateToScreen}
              selectedLocation={selectedLocation}
              onSelectLocation={onSelectLocation}
              systemSettings={systemSettings}
              saveSettingsToDb={saveSettingsToDb}
            />
          )}

          {(activeTab === 'org-social' || activeTab === 'communications') && (
            <OrgSocialDirectoriesScreen
              onNavigateScreen={navigateToScreen}
              selectedLocation={selectedLocation}
              onSelectLocation={onSelectLocation}
              systemSettings={systemSettings}
              saveSettingsToDb={saveSettingsToDb}
            />
          )}

          {(activeTab === 'oms-add-product' || activeTab === 'inventory') && (
            <OmsAddProductScreen
              onNavigateScreen={navigateToScreen}
              selectedLocation={selectedLocation}
              onSelectLocation={onSelectLocation}
            />
          )}

          {(activeTab === 'system-telemetry' || activeTab === 'system' || activeTab === 'health') && (
            <SystemHealthTelemetryScreen
              onNavigateScreen={navigateToScreen}
              selectedLocation={selectedLocation}
              onSelectLocation={onSelectLocation}
              systemSettings={systemSettings}
              saveSettingsToDb={saveSettingsToDb}
            />
          )}

          {activeTab === 'analytics-reporting' && (
            <AnalyticsReportingScreen
              onNavigateScreen={navigateToScreen}
              selectedLocation={selectedLocation}
              onSelectLocation={onSelectLocation}
            />
          )}

          {activeTab === 'escrow-deposits' && (
            <EscrowDepositsForfeituresScreen
              onNavigateScreen={navigateToScreen}
              selectedLocation={selectedLocation}
              onSelectLocation={onSelectLocation}
              systemSettings={systemSettings}
              saveSettingsToDb={saveSettingsToDb}
            />
          )}

          {activeTab === 'lms' && <LMSTab />}
        </main>
      </div>

      {/* Help Center Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-foreground/[0-9]0 flex items-center justify-center p-4">
          <div className="bg-card border-2-black max-w-md w-full p-5 shadow-2xl space-y-4 tabular-nums text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-foreground" />
                <h3 className="font-medium text-[11px] text-muted-foreground">Documentation</h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="text-foreground hover:opacity-70 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-muted-foreground">
              <div className="p-2.5 border border-border bg-muted/30 text-foreground">
                <p className="font-bold uppercase">1:1 Database Marriage</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  All 16 admin modules map directly to PostgreSQL tables for enterprise RBAC, multi-location capacity, Stripe Connect, and client portals.
                </p>
              </div>
              <div className="p-2.5 border border-border bg-muted/30 text-foreground">
                <p className="font-bold uppercase">Live Audit &amp; Telemetry</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Every permission change or billing event is cryptographically recorded in the SOC-2 immutable WORM audit ledger.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowHelpModal(false)}
                className="px-4 py-1.5 bg-primary text-primary-foreground font-bold uppercase cursor-pointer"
              >
                [DISMISS]
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
