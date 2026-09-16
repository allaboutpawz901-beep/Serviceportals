'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import {
  PageHeader,
  PageTabs,
  PageToolbar,
  FilterSelect,
  KpiTiles,
  DataTable,
  type KpiTile,
  type DataTableColumn,
  type PageTabItem,
} from '@/components/pawz/_shared/PageHeader';
import {
  Search, Plus, Download, ArrowRight, AlertTriangle,
  CheckCircle2, Clock, ShieldCheck, Sparkles,
} from 'lucide-react';
import type { DawgNavSection } from '@/lib/types';

export interface LmsDomainTabContent {
  /** Rendered inside the toolbar row (filters / search). */
  toolbar?: React.ReactNode;
  /** Rendered in the table header bar (summary). */
  tableHeader?: React.ReactNode;
  /** Table columns. */
  columns: DataTableColumn[];
  /** Rows (raw data). */
  rows: React.ReactNode[];
  /** Footer bar (pagination etc). */
  footer?: React.ReactNode;
  /** Optional secondary panel below the table. */
  sidePanel?: React.ReactNode;
}

export interface LmsDomainShellProps {
  domainNumber: string;
  domainName: string;
  contextLabel: string;
  title: string;
  description: string;
  statusItems?: React.ComponentProps<typeof PageHeader>['statusItems'];
  kpiTiles: KpiTile[];
  tabs: PageTabItem[];
  activeTab: string;
  onTabChange: (id: string) => void;
  tabContents: Record<string, LmsDomainTabContent>;
  onNavigate: (section: DawgNavSection) => void;
  /** Cross-domain navigation shown as a sticky rail on the right. */
  domainRail?: { id: DawgNavSection; label: string; current?: boolean }[];
}

export function LmsDomainShell({
  domainNumber,
  domainName,
  contextLabel,
  title,
  description,
  statusItems,
  kpiTiles,
  tabs,
  activeTab,
  onTabChange,
  tabContents,
  onNavigate,
  domainRail,
}: LmsDomainShellProps) {
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const content = tabContents[activeTab] ?? Object.values(tabContents)[0];

  return (
    <div className="flex flex-col w-full">
      <PageHeader
        contextLabel={contextLabel}
        statusItems={statusItems}
        title={title}
        badge={`Domain ${domainNumber}`}
        description={description}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSearch('')}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-input bg-background text-[13px] font-medium text-foreground transition-colors hover:bg-accent cursor-pointer"
            >
              <Download className="size-4" />
              <span className="hidden sm:inline">Export</span>
            </button>
            <button
              className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold transition-colors hover:bg-primary/90 cursor-pointer"
            >
              <Plus className="size-4" />
              <span className="hidden sm:inline">New {domainName.split(' ')[0]}</span>
            </button>
          </div>
        }
      />

      {/* KPI Tiles */}
      <div className="px-6 py-4 border-b border-border bg-muted/20">
        <KpiTiles tiles={kpiTiles} />
      </div>

      {/* Tabs */}
      <PageTabs tabs={tabs} activeId={activeTab} onSelect={onTabChange} />

      {/* Toolbar + Table */}
      <div className="flex flex-col lg:flex-row gap-4 p-6">
        <div className="flex-1 min-w-0 flex flex-col gap-4">
          <PageToolbar>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search records..."
                  className="h-8 w-56 rounded-md border border-input bg-background pl-8 pr-3 text-[12px] text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <FilterSelect value={filter} onChange={setFilter} aria-label="Filter">
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="archived">Archived</option>
              </FilterSelect>
              {content?.toolbar}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <Clock className="size-3" />
              <span>Synced just now</span>
            </div>
          </PageToolbar>

          {content && (
            <DataTable
              columns={content.columns}
              headerBar={content.tableHeader}
              footerBar={content.footer}
              hasRows={content.rows.length > 0}
              emptyState={
                <div className="flex flex-col items-center gap-2 py-6">
                  <AlertTriangle className="size-6 text-muted-foreground" />
                  <span className="text-[13px] text-muted-foreground">No {domainName.toLowerCase()} records match the current filters.</span>
                </div>
              }
            >
              {content.rows}
            </DataTable>
          )}

          {content?.sidePanel && (
            <div className="mt-2">{content.sidePanel}</div>
          )}
        </div>

        {/* Domain rail — quick switch to other LMS domains */}
        {domainRail && domainRail.length > 0 && (
          <aside className="lg:w-56 shrink-0">
            <div className="bg-card border border-border rounded-xl shadow-card p-3 lg:sticky lg:top-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-2 py-1.5 flex items-center gap-1.5">
                <Sparkles className="size-3" />
                Academy Domains
              </div>
              <ul className="space-y-0.5 max-h-[480px] overflow-y-auto custom-scrollbar">
                {domainRail.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => onNavigate(item.id)}
                      className={cn(
                        'w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-[12px] text-left transition-colors cursor-pointer',
                        item.current
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <span className="truncate">{item.label}</span>
                      {item.current ? (
                        <CheckCircle2 className="size-3 text-primary shrink-0" />
                      ) : (
                        <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
              <div className="mt-2 pt-2 border-t border-border">
                <button
                  onClick={() => onNavigate('lms')}
                  className="w-full flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-md text-[12px] font-medium text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 cursor-pointer transition-colors"
                >
                  <ShieldCheck className="size-3.5" />
                  Academy Home
                </button>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}

/** Helper: standard status pill used inside table cells. */
export function StatusPill({ status, tone = 'default' }: { status: string; tone?: 'default' | 'success' | 'warning' | 'destructive' | 'info' }) {
  const TONE: Record<string, string> = {
    default: 'bg-muted text-muted-foreground border-border',
    success: 'bg-success/10 text-success border-success/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    destructive: 'bg-destructive/10 text-destructive border-destructive/20',
    info: 'bg-info/10 text-info border-info/20',
  };
  return (
    <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide border', TONE[tone])}>
      {status}
    </span>
  );
}

/** Helper: the standard domain rail for all 13 LMS domains. */
export const LMS_DOMAIN_RAIL: { id: DawgNavSection; label: string }[] = [
  { id: 'lms', label: 'Academy Home' },
  { id: 'lms-identity', label: '01 · Identity & Access' },
  { id: 'lms-curriculum', label: '02 · Curriculum Authoring' },
  { id: 'lms-media', label: '03 · Media & Content Assets' },
  { id: 'lms-delivery', label: '04 · Delivery & Enrollment' },
  { id: 'lms-ai-teaching', label: '05 · AI Teaching & Personalization' },
  { id: 'lms-progress', label: '06 · Progress & Completion' },
  { id: 'lms-assessment', label: '07 · Assessment & Grading' },
  { id: 'lms-credentials', label: '08 · Skills & Credentials' },
  { id: 'lms-support', label: '09 · Whole-Human Support' },
  { id: 'lms-communications', label: '10 · Communication & Notifications' },
  { id: 'lms-compliance', label: '11 · Compliance & Reporting' },
  { id: 'lms-bridge', label: '12 · Platform Bridge / Conversion' },
  { id: 'lms-ai-instructor', label: '13 · AI Instructor Skills' },
];
