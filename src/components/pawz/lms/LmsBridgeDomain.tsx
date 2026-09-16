'use client';
import * as React from 'react';
import { ArrowRightLeft, Award, Gift, Store, CheckCircle2 } from 'lucide-react';
import { LmsDomainShell, StatusPill, LMS_DOMAIN_RAIL } from './LmsDomainShell';
import type { DawgNavSection } from '@/lib/types';

const TABS = [
  { id: 'conversions', label: 'Conversion Records', count: 38 },
  { id: 'licenses', label: 'Free License Grants', count: 34 },
  { id: 'salon-stubs', label: 'Salon Stubs', count: 29 },
  { id: 'eligibility', label: 'Eligibility Gate', count: 142 },
];

export function LmsBridgeDomain({ onNavigate }: { onNavigate: (s: DawgNavSection) => void }) {
  const [tab, setTab] = React.useState('conversions');
  const rail = LMS_DOMAIN_RAIL.map((r) => ({ ...r, current: r.id === 'lms-bridge' }));

  const kpiTiles = [
    { label: 'Conversions', value: '38', caption: 'credential → business', tone: 'success' as const, icon: ArrowRightLeft },
    { label: 'Licenses Granted', value: '34', caption: 'free post-grad', tone: 'success' as const, icon: Gift },
    { label: 'Salon Stubs Synced', value: '29', caption: 'into commerce_branches', icon: Store },
    { label: 'Pending Opt-In', value: '4', caption: 'awaiting learner choice', tone: 'warning' as const, icon: Award },
  ];

  const convRows = [
    ['CV-01', 'L-1042', 'Marcus Bell', 'CR-2002', '2025-05-12', 'License granted + salon stub', 'success'],
    ['CV-02', 'L-1045', 'Aaliyah Chen', 'CR-2001', '2025-05-14', 'License granted + salon stub', 'success'],
    ['CV-03', 'L-1048', 'Aria Patel', 'CR-2003', '2025-05-15', 'Pending — awaiting opt-in', 'warning'],
  ].map(([id, learner, name, cred, date, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-mono text-[12px]">{learner}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 font-mono text-[12px]">{cred}</td>
      <td className="p-3 text-[12px] text-muted-foreground">{date}</td>
      <td className="p-3 text-[12px] text-foreground/80">{status}</td>
      <td className="p-3"><StatusPill status={tone === 'success' ? 'Complete' : 'Pending'} tone={tone as 'success' | 'warning'} /></td>
    </tr>
  ));

  const licRows = [
    ['LIC-01', 'CV-01', 'L-1042', 'Leashed.io — Groomer Pro', '1 year free', '2025-05-12', 'Active', 'success'],
    ['LIC-02', 'CV-02', 'L-1045', 'Leashed.io — Salon Owner', '1 year free', '2025-05-14', 'Active', 'success'],
  ].map(([id, conv, learner, product, term, date, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-mono text-[12px]">{conv}</td>
      <td className="p-3 font-mono text-[12px]">{learner}</td>
      <td className="p-3 font-medium text-foreground">{product}</td>
      <td className="p-3 text-[12px] text-foreground/80">{term}</td>
      <td className="p-3 text-[12px] text-muted-foreground">{date}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success'} /></td>
    </tr>
  ));

  const stubRows = [
    ['ST-01', 'CV-01', 'L-1042', "Marcus's Mobile Grooming", 'commerce_branches', 'Synced', 'success'],
    ['ST-02', 'CV-02', 'L-1045', 'Aaliyah Salon Studio', 'commerce_branches + crm_customers', 'Synced', 'success'],
  ].map(([id, conv, learner, salon, target, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-mono text-[12px]">{conv}</td>
      <td className="p-3 font-mono text-[12px]">{learner}</td>
      <td className="p-3 font-medium text-foreground">{salon}</td>
      <td className="p-3 font-mono text-[12px] text-foreground/80">{target}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success'} /></td>
    </tr>
  ));

  const eligRows = [
    ['L-1042', 'Marcus Bell', 'CR-2002 Safety & Handling', 'Eligible', 'success'],
    ['L-1045', 'Aaliyah Chen', 'CR-2001 Foundation Diploma', 'Eligible', 'success'],
    ['L-1048', 'Aria Patel', 'CR-2003 (pending signoff)', 'Not yet eligible', 'warning'],
    ['L-1044', 'Derek Omori', '—', 'In progress', 'default'],
  ].map(([id, name, cred, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 text-[12px] text-foreground/80">{cred}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success' | 'warning' | 'default'} /></td>
    </tr>
  ));

  const tabContents = {
    conversions: {
      columns: [
        { header: 'ID' }, { header: 'Learner' }, { header: 'Name' },
        { header: 'Credential' }, { header: 'Date' }, { header: 'Outcome' }, { header: 'Status' },
      ],
      rows: convRows,
      tableHeader: <span className="text-[12px] font-semibold">Real FK-backed conversion records — credential + explicit opt-in required</span>,
    },
    licenses: {
      columns: [
        { header: 'License ID' }, { header: 'Conversion' }, { header: 'Learner' },
        { header: 'Product' }, { header: 'Term' }, { header: 'Date' }, { header: 'Status' },
      ],
      rows: licRows,
      tableHeader: <span className="text-[12px] font-semibold">Free post-graduation software license grant — Leashed.io Groomer Pro / Salon Owner</span>,
    },
    'salon-stubs': {
      columns: [
        { header: 'Stub ID' }, { header: 'Conversion' }, { header: 'Learner' },
        { header: 'Salon Name' }, { header: 'Syncs Into' }, { header: 'Status' },
      ],
      rows: stubRows,
      tableHeader: <span className="text-[12px] font-semibold">Salon stub syncs into live commerce_branches + crm_customers — real FKs</span>,
    },
    eligibility: {
      columns: [
        { header: 'Learner' }, { header: 'Name' }, { header: 'Credential' }, { header: 'Eligibility' },
      ],
      rows: eligRows,
      tableHeader: <span className="text-[12px] font-semibold">Open question: name exact gate that turns "has a credential" → "has platform access"</span>,
    },
  };

  return (
    <LmsDomainShell
      domainNumber="12"
      domainName="Conversion"
      contextLabel="ACADEMY / LMS — Domain 12 · Platform Bridge / Conversion"
      title="Platform Bridge / Conversion"
      description="Real FK-backed conversion record (no soft references). Free post-graduation software license grant. Salon stub syncs directly into the live platform's commerce_branches and crm_customers tables. Triggered when a credential is earned AND the learner explicitly opts to launch a business."
      statusItems={[
        { label: 'Conversions', value: '38', tone: 'success' },
        { label: 'Licenses', value: '34', tone: 'success' },
        { label: 'Pending opt-in', value: '4', tone: 'warning' },
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
