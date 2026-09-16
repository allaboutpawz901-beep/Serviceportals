'use client';
import * as React from 'react';
import { FileCheck, Clock, ShieldCheck, AlertTriangle, Download } from 'lucide-react';
import { LmsDomainShell, StatusPill, LMS_DOMAIN_RAIL } from './LmsDomainShell';
import type { DawgNavSection } from '@/lib/types';

const TABS = [
  { id: 'clockhour', label: 'Clock-Hour Audit Ledger', count: 4182 },
  { id: 'funder', label: 'Funder / Grant Reports', count: 2 },
  { id: 'audit', label: 'Platform Audit Log', count: 8492 },
  { id: 'minor', label: 'Minor-Consent Guardrails', count: 12 },
];

export function LmsComplianceDomain({ onNavigate }: { onNavigate: (s: DawgNavSection) => void }) {
  const [tab, setTab] = React.useState('clockhour');
  const rail = LMS_DOMAIN_RAIL.map((r) => ({ ...r, current: r.id === 'lms-compliance' }));

  const kpiTiles = [
    { label: 'Audit Events (7d)', value: '8,492', caption: 'all preserved', icon: FileCheck },
    { label: 'Reports Due', value: '2', caption: 'EDA grant + state board', tone: 'warning' as const, icon: AlertTriangle },
    { label: 'Clock Hours (MTD)', value: '4,182', caption: 'immutable ledger', icon: Clock },
    { label: 'Minor Guardrails', value: '12', caption: 'all enforced', tone: 'success' as const, icon: ShieldCheck },
  ];

  const clockRows = [
    ['L-1042', 'CRS-101', 'Maya Whitfield', '2025-05-12 14:30', '2.5', 'Verified', 'success'],
    ['L-1042', 'CRS-101', 'Maya Whitfield', '2025-05-12 15:00', '0.5', 'Verified', 'success'],
    ['L-1044', 'CRS-101', 'Maya Whitfield', '2025-05-13 09:00', '0.3', 'Verified', 'success'],
    ['L-1045', 'CRS-508', 'Renée Castellanos', '2025-05-14 11:00', '0.4', 'Verified', 'success'],
  ].map(([learner, course, verifier, timestamp, hours, status, tone]) => (
    <tr key={`${learner}-${course}-${timestamp}`} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{learner}</td>
      <td className="p-3 font-mono text-[12px]">{course}</td>
      <td className="p-3 text-[12px] text-foreground/80">{verifier}</td>
      <td className="p-3 text-[12px] text-muted-foreground">{timestamp}</td>
      <td className="p-3 tabular-nums font-mono font-semibold">{hours}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success'} /></td>
    </tr>
  ));

  const funderRows = [
    ['R-EDA-2025-Q2', 'EDA Grant — Workforce Development', 'Q2 2025', 'Due 2025-06-30', 'Outcomes + clock hours', 'In progress', 'warning'],
    ['R-SB-2025-AN', 'State Board of Cosmetology — Annual', '2025', 'Due 2025-12-31', 'Clock hours + credentials', 'Not started', 'warning'],
    ['R-INT-2025-M5', 'Internal Board — Monthly', 'May 2025', 'Due 2025-06-15', 'Enrollment + progress', 'In progress', 'warning'],
  ].map(([id, name, period, due, contents, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 text-[12px]">{period}</td>
      <td className="p-3 text-[12px] text-muted-foreground">{due}</td>
      <td className="p-3 text-[12px] text-foreground/80">{contents}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'warning'} /></td>
    </tr>
  ));

  const auditRows = [
    ['AU-90001', 'permission.change', 'platform_admin Karl Voss', '2025-05-16 09:14', 'Granted PA-303 cross-tenant', 'success'],
    ['AU-90002', 'ledger.entry.immutable', 'system', '2025-05-16 09:00', 'Clock-hour ledger entry L-1042 CRS-101', 'success'],
    ['AU-90003', 'minor.consent.block', 'system', '2025-05-15 18:22', 'Blocked L-1046 from AI session', 'success'],
    ['AU-90004', 'credential.issue', 'org_admin Adaeze', '2025-05-14 16:30', 'Issued CR-2001 to Aaliyah Chen', 'success'],
  ].map(([id, event, actor, timestamp, detail, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3"><StatusPill status={event as string} tone="info" /></td>
      <td className="p-3 text-[12px] text-foreground/80">{actor}</td>
      <td className="p-3 text-[12px] text-muted-foreground">{timestamp}</td>
      <td className="p-3 text-[12px] text-foreground/80">{detail}</td>
      <td className="p-3"><StatusPill status="Immutable" tone={tone as 'success'} /></td>
    </tr>
  ));

  const minorRows = [
    ['MG-01', 'L-1046', 'Jaylen Brooks', 'AI session attempt', 'Blocked (guardian consent pending)', 'success'],
    ['MG-02', 'L-1051', 'Tyler Nguyen', 'AI session attempt', 'Blocked (guardian consent pending)', 'success'],
    ['MG-03', 'L-1053', 'Mason Cole', 'Cohort enrollment', 'Blocked (no guardian identified)', 'success'],
    ['MG-04', 'L-1048', 'Aria Patel', 'Cohort enrollment', 'Allowed (guardian consented)', 'success'],
  ].map(([id, learner, name, action, result, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-mono text-[12px]">{learner}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 text-[12px] text-foreground/80">{action}</td>
      <td className="p-3 text-[12px] text-foreground/80">{result}</td>
      <td className="p-3"><StatusPill status="Enforced" tone={tone as 'success'} /></td>
    </tr>
  ));

  const tabContents = {
    clockhour: {
      columns: [
        { header: 'Learner' }, { header: 'Course' }, { header: 'Verifier' },
        { header: 'Timestamp' }, { header: 'Hours', align: 'right' as const }, { header: 'Status' },
      ],
      rows: clockRows,
      tableHeader: <span className="text-[12px] font-semibold">Immutable clock-hour audit ledger — human-verified, audit source of truth</span>,
      footer: <div className="flex items-center justify-between text-[11px] text-muted-foreground"><span>4,182 hours MTD · all verified</span><button className="inline-flex items-center gap-1 text-primary font-medium cursor-pointer"><Download className="size-3" />Export CSV</button></div>,
    },
    funder: {
      columns: [
        { header: 'Report ID' }, { header: 'Name' }, { header: 'Period' },
        { header: 'Due' }, { header: 'Contents' }, { header: 'Status' },
      ],
      rows: funderRows,
      tableHeader: <span className="text-[12px] font-semibold">Funder / grant outcome report generation — EDA grant + state board + internal board</span>,
    },
    audit: {
      columns: [
        { header: 'ID' }, { header: 'Event' }, { header: 'Actor' },
        { header: 'Timestamp' }, { header: 'Detail' }, { header: 'State' },
      ],
      rows: auditRows,
      tableHeader: <span className="text-[12px] font-semibold">Platform-wide audit log — IMMUTABLE, never redacted</span>,
    },
    minor: {
      columns: [
        { header: 'ID' }, { header: 'Learner' }, { header: 'Name' },
        { header: 'Action' }, { header: 'Result' }, { header: 'State' },
      ],
      rows: minorRows,
      tableHeader: <span className="text-[12px] font-semibold">Minor-consent guardrail enforcement — all attempts logged</span>,
    },
  };

  return (
    <LmsDomainShell
      domainNumber="11"
      domainName="Compliance"
      contextLabel="ACADEMY / LMS — Domain 11 · Compliance & Reporting"
      title="Compliance & Reporting"
      description="Clock-hour audit ledger (read-only view of Domain 6's immutable ledger), funder / grant outcome report generation, platform-wide immutable audit log, and minor-consent guardrail enforcement. Surfaces to compliance officers and org-admins as exports."
      statusItems={[
        { label: 'Audit events (7d)', value: '8,492' },
        { label: 'Reports due', value: '2', tone: 'warning' },
        { label: 'Guardrails enforced', value: '12', tone: 'success' },
      ]}
      kpiTiles={kpiTiles}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      tabContents={tabContents}
      onNavigate={onNavigate}
      domainRail={rail}
    />
  );
}
