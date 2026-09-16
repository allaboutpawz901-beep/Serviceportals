'use client';
import * as React from 'react';
import { HeartHandshake, AlertTriangle, Home, TrendingUp, Users } from 'lucide-react';
import { LmsDomainShell, StatusPill, LMS_DOMAIN_RAIL } from './LmsDomainShell';
import type { DawgNavSection } from '@/lib/types';

const TABS = [
  { id: 'caseload', label: 'Navigator Caseload', count: 248 },
  { id: 'referrals', label: 'Support Referrals', count: 47 },
  { id: 'incidents', label: 'Safety Incidents', count: 3 },
  { id: 'outcomes', label: 'Workforce Outcomes', count: 29 },
  { id: 'benefits', label: 'Benefits-Cliff Coaching', count: 12 },
];

export function LmsSupportDomain({ onNavigate }: { onNavigate: (s: DawgNavSection) => void }) {
  const [tab, setTab] = React.useState('caseload');
  const rail = LMS_DOMAIN_RAIL.map((r) => ({ ...r, current: r.id === 'lms-support' }));

  const kpiTiles = [
    { label: 'Open Referrals', value: '47', caption: 'avg 11 days to close', tone: 'warning' as const, icon: HeartHandshake },
    { label: 'Safety Incidents', value: '3', caption: 'all triaged', tone: 'warning' as const, icon: AlertTriangle },
    { label: 'Placed in Jobs', value: '29', caption: 'after credential', tone: 'success' as const, icon: TrendingUp },
    { label: 'Caseload Size', value: '62', caption: 'per navigator', icon: Users },
  ];

  const caseloadRows = [
    ['L-1042', 'Marcus Bell', 'Tobias Park', 'Housing referral open', 'Low', 'success'],
    ['L-1044', 'Derek Omori', 'Tobias Park', 'Benefits-cliff coaching', 'Medium', 'warning'],
    ['L-1046', 'Jaylen Brooks', 'Tobias Park', 'Guardian consent blocker', 'Medium', 'warning'],
    ['L-1048', 'Aria Patel', 'Tobias Park', 'Resolved (placed in job)', 'Low', 'success'],
  ].map(([id, name, navigator, focus, risk, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 text-[12px] text-foreground/80">{navigator}</td>
      <td className="p-3 text-[12px] text-foreground/80">{focus}</td>
      <td className="p-3"><StatusPill status={risk as string} tone={tone as 'success' | 'warning'} /></td>
    </tr>
  ));

  const referralRows = [
    ['R-501', 'L-1042', 'Marcus Bell', 'Housing', 'Family Promise', 'Referred', 'warning'],
    ['R-502', 'L-1044', 'Derek Omori', 'Transportation', 'United Way', 'In progress', 'warning'],
    ['R-503', 'L-1045', 'Aaliyah Chen', 'Childcare', 'YMCA', 'Resolved', 'success'],
    ['R-504', 'L-1048', 'Aria Patel', 'Legal', 'Legal Aid Society', 'Resolved', 'success'],
    ['R-505', 'L-1051', 'Tyler Nguyen', 'Benefits (SNAP)', 'County DHS', 'Referred', 'warning'],
  ].map(([id, learner, name, kind, partner, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-mono text-[12px]">{learner}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3"><StatusPill status={kind as string} tone="info" /></td>
      <td className="p-3 text-[12px] text-foreground/80">{partner}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'warning' | 'success'} /></td>
    </tr>
  ));

  const incidentRows = [
    ['SI-01', 'L-1044', 'Derek Omori', 'Cohort B · CRS-101', 'Dog bite (minor)', '2025-05-13', 'Triage complete', 'success'],
    ['SI-02', 'L-1051', 'Tyler Nguyen', 'Cohort C · CRS-508', 'Disclosed crisis during AI session', '2025-05-15', 'Routed to crisis line', 'warning'],
    ['SI-03', 'L-1046', 'Jaylen Brooks', 'Cohort C', 'Minor consent violation attempt', '2025-05-12', 'Guardrail blocked', 'success'],
  ].map(([id, learner, name, context, incident, date, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-mono text-[12px]">{learner}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 text-[12px] text-foreground/80">{context}</td>
      <td className="p-3 text-[12px] text-foreground/80">{incident}</td>
      <td className="p-3 text-[12px] text-muted-foreground">{date}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success' | 'warning'} /></td>
    </tr>
  ));

  const outcomeRows = [
    ['WO-01', 'L-1048', 'Aria Patel', 'Employment', 'PetSmart groomer', '2025-05-10', '+$4/hr wage', 'success'],
    ['WO-02', 'L-1045', 'Aaliyah Chen', 'Employment', 'Independent salon', '2025-05-08', 'Hired', 'success'],
    ['WO-03', 'L-1042', 'Marcus Bell', 'Business launch', 'Launched mobile grooming', '2025-05-12', 'Stub synced → Platform Bridge', 'success'],
    ['WO-04', 'L-1044', 'Derek Omori', 'Wage change', '+$2.50/hr at current employer', '2025-05-14', 'Retention 6mo', 'success'],
  ].map(([id, learner, name, kind, detail, date, note, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-mono text-[12px]">{learner}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3"><StatusPill status={kind as string} tone="info" /></td>
      <td className="p-3 text-[12px] text-foreground/80">{detail}</td>
      <td className="p-3 text-[12px] text-muted-foreground">{date}</td>
      <td className="p-3 text-[12px] text-foreground/80">{note}</td>
      <td className="p-3"><StatusPill status="Logged" tone={tone as 'success'} /></td>
    </tr>
  ));

  const benefitRows = [
    ['BC-01', 'L-1044', 'Derek Omori', 'SNAP cliff risk', 'Coaching session 2 of 4', 'In progress', 'warning'],
    ['BC-02', 'L-1051', 'Tyler Nguyen', 'Medicaid cliff risk', 'Coaching session 1 of 4', 'In progress', 'warning'],
    ['BC-03', 'L-1042', 'Marcus Bell', 'Childcare subsidy', 'Resolved — bridge plan set', 'Resolved', 'success'],
  ].map(([id, learner, name, risk, session, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-mono text-[12px]">{learner}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 text-[12px] text-foreground/80">{risk}</td>
      <td className="p-3 text-[12px] text-foreground/80">{session}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'warning' | 'success'} /></td>
    </tr>
  ));

  const tabContents = {
    caseload: {
      columns: [
        { header: 'Learner' }, { header: 'Name' }, { header: 'Navigator' },
        { header: 'Open Focus' }, { header: 'Risk' },
      ],
      rows: caseloadRows,
      tableHeader: <span className="text-[12px] font-semibold">Private navigator caseload view — RLS-enforced, per navigator</span>,
    },
    referrals: {
      columns: [
        { header: 'ID' }, { header: 'Learner' }, { header: 'Name' },
        { header: 'Kind' }, { header: 'Partner' }, { header: 'Status' },
      ],
      rows: referralRows,
      tableHeader: <span className="text-[12px] font-semibold">47 open referrals — housing, transport, benefits, legal, childcare</span>,
    },
    incidents: {
      columns: [
        { header: 'ID' }, { header: 'Learner' }, { header: 'Name' },
        { header: 'Context' }, { header: 'Incident' }, { header: 'Date' }, { header: 'Status' },
      ],
      rows: incidentRows,
      tableHeader: <span className="text-[12px] font-semibold">3 safety incidents (7d) — all triaged, RLS-enforced visibility</span>,
    },
    outcomes: {
      columns: [
        { header: 'ID' }, { header: 'Learner' }, { header: 'Name' },
        { header: 'Kind' }, { header: 'Detail' }, { header: 'Date' }, { header: 'Note' }, { header: 'State' },
      ],
      rows: outcomeRows,
      tableHeader: <span className="text-[12px] font-semibold">Workforce outcomes feed funder reports (Domain 11) and Platform Bridge (Domain 12)</span>,
    },
    benefits: {
      columns: [
        { header: 'ID' }, { header: 'Learner' }, { header: 'Name' },
        { header: 'Risk' }, { header: 'Session' }, { header: 'Status' },
      ],
      rows: benefitRows,
      tableHeader: <span className="text-[12px] font-semibold">Benefits-cliff coaching records — bridge plans to avoid taking a raise that loses benefits</span>,
    },
  };

  return (
    <LmsDomainShell
      domainNumber="09"
      domainName="Support"
      contextLabel="ACADEMY / LMS — Domain 09 · Whole-Human Support"
      title="Whole-Human Support (Workforce & Behavioral)"
      description="The mission is whole-human, not just vocational. Support referrals (housing, transportation, benefits, legal, childcare), safety incidents, workforce outcomes, benefits-cliff coaching, and navigator caseload. Receives escalations from AI Teaching (Domain 5), feeds outcomes to Compliance (Domain 11) and Platform Bridge (Domain 12)."
      statusItems={[
        { label: 'Open referrals', value: '47', tone: 'warning' },
        { label: 'Job placements', value: '29', tone: 'success' },
        { label: 'Caseload', value: '248' },
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
