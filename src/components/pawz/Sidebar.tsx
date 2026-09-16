'use client';

import React from 'react';
import { DawgNavSection, LocationItem } from '@/lib/types';
import {
  PawPrint,
  LayoutGrid,
  Users,
  Calendar,
  CreditCard,
  FileText,
  Coins,
  RotateCcw,
  Gift,
  Tag,
  CalendarClock,
  Package,
  BarChart3,
  Settings,
  MapPin,
  ChevronDown,
  Plus,
  X,
  Receipt,
  FileSearch,
  Truck,
  ArrowDownLeft,
  Inbox,
  Terminal,
  BookOpen,
  Scale,
  CalendarRange,
  GraduationCap,
  ShieldCheck,
  PenLine,
  Film,
  Layers,
  Sparkles,
  Gauge,
  ClipboardCheck,
  Award,
  HeartHandshake,
  BellRing,
  FileCheck,
  ArrowRightLeft,
  Bot,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeSection: DawgNavSection;
  onSelectSection: (section: DawgNavSection) => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  selectedLocation: string;
  onSelectLocation: (loc: string) => void;
  locationsList?: LocationItem[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

interface NavGroup {
  category?: string;
  categoryDefaultSection?: DawgNavSection;
  items: {
    id: DawgNavSection;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  mobileOpen,
  onCloseMobile,
  selectedLocation,
  onSelectLocation,
  locationsList,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const [showLocationMenu, setShowLocationMenu] = React.useState(false);

  const fallbackLocations = [
    'All About Pawz – Main Location',
    'All About Pawz – Westside Spa',
    'All About Pawz – Mobile Van #1',
  ];

  const displayLocations =
    locationsList && locationsList.length > 0
      ? locationsList.map((l) => l.name)
      : fallbackLocations;

  const navGroups: NavGroup[] = [
    {
      category: 'CRM',
      categoryDefaultSection: 'dashboard',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
        { id: 'customers', label: 'Customers', icon: Users },
        { id: 'pets', label: 'Pets & Patients', icon: PawPrint },
        { id: 'appointments', label: 'Appointments', icon: Calendar },
        { id: 'grooming-records', label: 'Grooming Records', icon: FileText },
        { id: 'calendar', label: 'Full Calendar', icon: CalendarRange },
        { id: 'services', label: 'Services & Pricing', icon: Tag },
        { id: 'staff', label: 'Staff & Groomers', icon: Users },
        { id: 'schedule', label: 'Schedule & Shifts', icon: CalendarClock },
      ],
    },
    {
      category: 'ORDERS',
      categoryDefaultSection: 'orders',
      items: [
        { id: 'orders', label: 'Orders & POS', icon: Receipt },
        { id: 'order-details', label: 'Order Details', icon: FileSearch },
        { id: 'inventory', label: 'Products & Inventory', icon: Package },
        { id: 'shipping', label: 'Shipping Station', icon: Truck },
        { id: 'returns', label: 'Returns & RMA', icon: ArrowDownLeft },
        { id: 'purchase-orders', label: 'Purchase Orders', icon: Inbox },
      ],
    },
    {
      category: 'ACCOUNTING',
      categoryDefaultSection: 'books',
      items: [
        { id: 'books', label: 'Books & Records', icon: BookOpen },
        { id: 'invoices', label: 'Invoices & Sales', icon: FileText },
        { id: 'payments', label: 'Payments & Register', icon: CreditCard },
        { id: 'deposits', label: 'Deposits & Escrow', icon: Coins },
        { id: 'refunds', label: 'Refunds & Disputes', icon: RotateCcw },
        { id: 'gift-cards', label: 'Gift Cards & Credits', icon: Gift },
        { id: 'payroll', label: 'Payroll & Commissions', icon: Users },
        { id: 'taxes', label: 'Taxes & Compliance', icon: Scale },
        { id: 'reports', label: 'Financial Reports', icon: BarChart3 },
        { id: 'financial-settings', label: 'Financial Settings', icon: Settings },
        { id: 'stripe-connections', label: 'Stripe Connections', icon: Terminal },
      ],
    },
    {
      category: 'ACADEMY / LMS',
      categoryDefaultSection: 'lms',
      items: [
        { id: 'lms', label: 'Academy Home', icon: GraduationCap },
        { id: 'lms-identity', label: 'Identity & Access', icon: ShieldCheck },
        { id: 'lms-curriculum', label: 'Curriculum Authoring', icon: PenLine },
        { id: 'lms-media', label: 'Media & Content Assets', icon: Film },
        { id: 'lms-delivery', label: 'Delivery & Enrollment', icon: Layers },
        { id: 'lms-ai-teaching', label: 'AI Teaching & Personalization', icon: Sparkles },
        { id: 'lms-progress', label: 'Progress & Completion', icon: Gauge },
        { id: 'lms-assessment', label: 'Assessment & Grading', icon: ClipboardCheck },
        { id: 'lms-credentials', label: 'Skills & Credentials', icon: Award },
        { id: 'lms-support', label: 'Whole-Human Support', icon: HeartHandshake },
        { id: 'lms-communications', label: 'Communication & Notifications', icon: BellRing },
        { id: 'lms-compliance', label: 'Compliance & Reporting', icon: FileCheck },
        { id: 'lms-bridge', label: 'Platform Bridge / Conversion', icon: ArrowRightLeft },
        { id: 'lms-ai-instructor', label: 'AI Instructor Skills', icon: Bot },
      ],
    },
  ];

  const navButtonClass = (isActive: boolean) =>
    cn(
      'group/item relative w-full flex items-center rounded-md text-[13px] leading-none transition-colors duration-150 cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background',
      isCollapsed ? 'justify-center p-2.5' : 'gap-2.5 px-3 py-2',
      isActive
        ? 'bg-accent text-accent-foreground font-medium'
        : 'text-foreground/80 hover:bg-accent hover:text-foreground'
    );

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-xs lg:hidden"
        />
      )}

      <TooltipProvider delayDuration={150}>
        <aside
          className={cn(
            'fixed top-0 bottom-0 left-0 z-50 flex flex-col flex-shrink-0 h-screen overflow-hidden select-none bg-background text-foreground transition-[width,transform] duration-200 ease-in-out',
            mobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0',
            isCollapsed ? 'lg:w-16' : 'lg:w-64'
          )}
        >
          {/* Brand Header — sticky at top */}
          <div
            className={cn(
              'sticky top-0 z-10 flex items-center justify-between flex-shrink-0 bg-background/95 backdrop-blur-sm',
              isCollapsed ? 'flex-col gap-2 p-3' : 'p-3.5'
            )}
          >
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="size-4 text-brand-foreground">
                <PawPrint className="h-4 w-4" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <h1 className="truncate font-bar text-sm font-semibold leading-none tracking-tight text-foreground">
                    All About Pawz
                  </h1>
                  <p className="mt-1 text-[10px] font-medium text-muted-foreground">
                    Service Portal
                  </p>
                </div>
              )}
            </div>
            <button
              onClick={onCloseMobile}
              type="button"
              aria-label="Close Mobile Navigation"
              className="lg:hidden inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation Groups List */}
          <nav className="custom-scrollbar flex-1 overflow-y-hidden py-2 text-foreground">
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} className="space-y-0.5">
                {group.category && !isCollapsed && (
                  <div className="px-3 pt-3 pb-1">
                    <button
                      onClick={() => {
                        if (group.categoryDefaultSection) {
                          onSelectSection(group.categoryDefaultSection);
                          onCloseMobile();
                        }
                      }}
                      className="font-bar text-[10px] font-medium uppercase tracking-wider text-muted-foreground transition-colors hover:text-foreground cursor-pointer text-left"
                    >
                      {group.category}
                    </button>
                  </div>
                )}
                <ul className="space-y-0.5 px-2">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;

                    const button = (
                      <button
                        onClick={() => {
                          onSelectSection(item.id);
                          onCloseMobile();
                        }}
                        className={navButtonClass(isActive)}
                      >
                        <Icon
                          className={cn(
                            'h-4 w-4 shrink-0 transition-colors duration-150',
                            isActive
                              ? 'text-accent-foreground'
                              : 'text-muted-foreground group-hover/item:text-foreground'
                          )}
                        />
                        {!isCollapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
                        {!isCollapsed && item.badge && !isActive && (
                          <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );

                    return (
                      <li key={item.id} className="relative">
                        {isCollapsed ? (
                          <Tooltip>
                            <TooltipTrigger asChild>{button}</TooltipTrigger>
                            <TooltipContent side="right" sideOffset={8}>
                              {item.label}
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          button
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        </aside>
      </TooltipProvider>
    </>
  );
};
