'use client';

import * as React from 'react';
import { Users, ShieldCheck, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { LmsDomainShell, StatusPill, LMS_DOMAIN_RAIL } from './LmsDomainShell';
import type { DawgNavSection } from '@/lib/types';

const TABS = [
  { id: 'learners', label: 'Learners', count: 248 },
  { id: 'instructors', label: 'Instructors & Staff', count: 14 },
  { id: 'roles', label: 'LMS Roles', count: 5 },
  { id: 'consent', label: 'Minor Consent', count: 12 },
  { id: 'cross-tenant', label: 'Cross-Tenant Staff', count: 3 },
];

export function LmsIdentityDomain({ onNavigate }: { onNavigate: (s: DawgNavSection) => void }) {
  const [tab, setTab] = React.useState('learners');

  const rail = LMS_DOMAIN_RAIL.map((r) => ({ ...r, current: r.id === 'lms-identity' }));

  const kpiTiles = [
    { label: 'Active Learners', value: '248', caption: '+12 this week', tone: 'success' as const, icon: Users },
    { label: 'Instructors', value: '14', caption: '3 cross-tenant', icon: ShieldCheck },
    { label: 'Pending Consent', value: '6', caption: 'Avg age 16.2', tone: 'warning' as const, icon: AlertTriangle },
    { label: 'Role Definitions', value: '5', caption: 'learner → platform_admin', icon: CheckCircle2 },
  ];

  const learnersRows = [
    ['L-1042', 'Marcus Bell', 'learner', 'Cohort Groom-2025-A', '91%', 'Consented', 'success'],
    ['L-1043', 'Sofia Reyes', 'learner', 'Cohort Groom-2025-B', '64%', 'Consented', 'success'],
    ['L-1044', 'Derek Omori', 'learner', 'Self-paced', '38%', 'Pending', 'warning'],
    ['L-1045', 'Aaliyah Chen', 'learner', 'Cohort Groom-2025-A', '78%', 'Consented', 'success'],
    ['L-1046', 'Jaylen Brooks', 'learner', 'Cohort Groom-2025-C', '12%', 'Minor — guardian pending', 'warning'],
  ].map(([id, name, role, cohort, progress, consent, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3"><StatusPill status={role as string} /></td>
      <td className="p-3 text-[12px] text-foreground/80">{cohort}</td>
      <td className="p-3 tabular-nums font-medium">{progress}</td>
      <td className="p-3"><StatusPill status={consent as string} tone={tone as 'success' | 'warning'} /></td>
    </tr>
  ));

  const instructorRows = [
    ['I-201', 'Maya Whitfield', 'instructor', 'Safety & Handling', 'Active', 'success'],
    ['I-202', 'Renée Castellanos', 'instructor', 'Styling & Technique', 'Active', 'success'],
    ['I-203', 'Tobias Park', 'support_navigator', 'Whole-Human Support', 'Active', 'success'],
    ['I-204', 'Adaeze Nwosu', 'org_admin', 'Cohort Groom-2025-A', 'Active', 'success'],
    ['I-205', 'Karl Voss', 'platform_admin', 'Cross-tenant', 'Suspended', 'destructive'],
  ].map(([id, name, role, focus, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3"><StatusPill status={role as string} tone="info" /></td>
      <td className="p-3 text-[12px] text-foreground/80">{focus}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success' | 'destructive'} /></td>
    </tr>
  ));

  const roleRows = [
    ['learner', 'View enrolled courses, submit work, chat with AI tutor', '248', 'success'],
    ['instructor', 'Author curriculum, grade submissions, manage cohort roster', '14', 'info'],
    ['support_navigator', 'Caseload, referrals, safety incidents, workforce outcomes', '4', 'info'],
    ['org_admin', 'Org-wide enrollments, grading queue, aggregate dashboards, funder reports', '8', 'info'],
    ['platform_admin', 'Cross-tenant visibility, platform audit log, license grants', '3', 'warning'],
  ].map(([role, desc, count, tone]) => (
    <tr key={role as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-foreground font-semibold">{role}</td>
      <td className="p-3 text-[12px] text-foreground/80">{desc}</td>
      <td className="p-3 tabular-nums font-medium text-center"><StatusPill status={`${count} holders`} tone={tone as 'success' | 'info' | 'warning'} /></td>
    </tr>
  ));

  const consentRows = [
    ['L-1046', 'Jaylen Brooks', '16', 'Danielle Brooks (mother)', 'Sent 2025-05-08', 'Pending', 'warning'],
    ['L-1048', 'Aria Patel', '17', 'Ravi Patel (father)', 'Signed 2025-05-01', 'Consented', 'success'],
    ['L-1051', 'Tyler Nguyen', '15', 'Linh Nguyen (mother)', 'Sent 2025-05-10', 'Pending', 'warning'],
    ['L-1053', 'Mason Cole', '16', 'Guardian not identified', '—', 'Action needed', 'destructive'],
  ].map(([id, name, age, guardian, sent, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 tabular-nums">{age}</td>
      <td className="p-3 text-[12px] text-foreground/80">{guardian}</td>
      <td className="p-3 text-[12px] text-muted-foreground">{sent}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'warning' | 'success' | 'destructive'} /></td>
    </tr>
  ));

  const crossRows = [
    ['PA-301', 'Maya Whitfield', 'Leashed Academy (Tenant A)', 'All About Pawz Academy (Tenant B)', 'Read-only grading', 'Active', 'success'],
    ['PA-302', 'Tobias Park', 'Leashed Academy', 'Salon Pro Academy', 'Caseload visibility (RLS)', 'Active', 'success'],
    ['PA-303', 'Karl Voss', 'Platform-wide', 'All tenants', 'Full platform_admin mirror', 'Active', 'success'],
  ].map(([id, name, from, to, scope, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 text-[12px] text-foreground/80">{from}</td>
      <td className="p-3 text-[12px] text-foreground/80">{to}</td>
      <td className="p-3 text-[12px] text-muted-foreground">{scope}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success'} /></td>
    </tr>
  ));

  const tabContents = {
    learners: {
      columns: [
        { header: 'ID' }, { header: 'Learner' }, { header: 'Role' },
        { header: 'Cohort / Mode' }, { header: 'Progress', align: 'right' as const }, { header: 'Consent' },
      ],
      rows: learnersRows,
      tableHeader: <span className="text-[12px] font-semibold">248 learners · 91% consented</span>,
    },
    instructors: {
      columns: [
        { header: 'ID' }, { header: 'Name' }, { header: 'LMS Role' },
        { header: 'Focus Area' }, { header: 'Status' },
      ],
      rows: instructorRows,
      tableHeader: <span className="text-[12px] font-semibold">14 active instructors + navigators + admins</span>,
    },
    roles: {
      columns: [
        { header: 'Role' }, { header: 'Description' }, { header: 'Holders', align: 'center' as const },
      ],
      rows: roleRows,
      tableHeader: <span className="text-[12px] font-semibold">5 LMS role definitions (mirrors platform_module_permissions)</span>,
    },
    consent: {
      columns: [
        { header: 'ID' }, { header: 'Learner' }, { header: 'Age', align: 'right' as const },
        { header: 'Guardian' }, { header: 'Sent' }, { header: 'Status' },
      ],
      rows: consentRows,
      tableHeader: <span className="text-[12px] font-semibold">12 minor learners · 6 pending guardian consent</span>,
    },
    'cross-tenant': {
      columns: [
        { header: 'Grant ID' }, { header: 'Staff' }, { header: 'From Tenant' },
        { header: 'To Tenant' }, { header: 'Scope' }, { header: 'Status' },
      ],
      rows: crossRows,
      tableHeader: <span className="text-[12px] font-semibold">3 cross-tenant staff grants (RLS-enforced)</span>,
    },
  };

  return (
    <LmsDomainShell
      domainNumber="01"
      domainName="Identity"
      contextLabel="ACADEMY / LMS — Domain 01 · Identity & Access"
      title="Identity & Access"
      description="Shared tenant layer (public.tenants / tenant_memberships / auth.users) is the single source of truth. LMS gets its own schema (lms.*) with real cross-schema FKs. Roles: learner, instructor, support_navigator, org_admin, platform_admin."
      statusItems={[
        { label: 'Total users', value: '262' },
        { label: 'Consented', value: '91%', tone: 'success' },
        { label: 'Pending consent', value: '6', tone: 'warning' },
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
