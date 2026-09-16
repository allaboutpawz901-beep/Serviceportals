'use client';
import * as React from 'react';
import { Layers, Users, Sparkles, BookOpen, Clock } from 'lucide-react';
import { LmsDomainShell, StatusPill, LMS_DOMAIN_RAIL } from './LmsDomainShell';
import type { DawgNavSection } from '@/lib/types';

const TABS = [
  { id: 'cohorts', label: 'Cohorts', count: 11 },
  { id: 'enrollments', label: 'Enrollments', count: 248 },
  { id: 'pacing', label: 'Pacing Schedule', count: 11 },
  { id: 'mode', label: 'Delivery Mode', count: 248 },
  { id: 'mycourses', label: 'My Courses', count: 0 },
];

export function LmsDeliveryDomain({ onNavigate }: { onNavigate: (s: DawgNavSection) => void }) {
  const [tab, setTab] = React.useState('cohorts');
  const rail = LMS_DOMAIN_RAIL.map((r) => ({ ...r, current: r.id === 'lms-delivery' }));

  const kpiTiles = [
    { label: 'Active Cohorts', value: '11', caption: '3 starting this month', tone: 'success' as const, icon: Layers },
    { label: 'Enrollments', value: '248', caption: '+12 this week', icon: Users },
    { label: 'AI-Guided Mode', value: '62%', caption: 'opted-in learners', tone: 'info' as const, icon: Sparkles },
    { label: 'Self-Paced', value: '38%', caption: 'fallback mode', icon: BookOpen },
  ];

  const cohortRows = [
    ['C-GROOM-2025-A', 'Cohort A — Spring 2025', 'All About Pawz Academy', '24', '2025-04-15', 'In progress', 'success'],
    ['C-GROOM-2025-B', 'Cohort B — Spring 2025', 'All About Pawz Academy', '18', '2025-04-29', 'In progress', 'success'],
    ['C-GROOM-2025-C', 'Cohort C — Summer 2025', 'All About Pawz Academy', '22', '2025-06-03', 'Enrolling', 'info'],
    ['C-SALON-PRO-01', 'Salon Pro Cohort 01', 'Salon Pro Academy', '14', '2025-05-20', 'In progress', 'success'],
  ].map(([id, name, tenant, size, start, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 text-[12px] text-foreground/80">{tenant}</td>
      <td className="p-3 tabular-nums">{size}</td>
      <td className="p-3 text-[12px] text-muted-foreground">{start}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success' | 'info'} /></td>
    </tr>
  ));

  const enrollRows = [
    ['L-1042', 'Marcus Bell', 'C-GROOM-2025-A', 'Pathway PW-01', 'AI-Guided', '32%', 'success'],
    ['L-1043', 'Sofia Reyes', 'C-GROOM-2025-B', 'Pathway PW-02', 'Self-Paced', '64%', 'success'],
    ['L-1044', 'Derek Omori', '—', 'Pathway PW-01', 'AI-Guided', '38%', 'warning'],
    ['L-1045', 'Aaliyah Chen', 'C-GROOM-2025-A', 'Pathway PW-05', 'Self-Paced', '78%', 'success'],
  ].map(([id, name, cohort, pathway, mode, progress, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 font-mono text-[12px]">{cohort}</td>
      <td className="p-3 text-[12px] text-foreground/80">{pathway}</td>
      <td className="p-3"><StatusPill status={mode as string} tone={mode === 'AI-Guided' ? 'info' : 'default'} /></td>
      <td className="p-3 tabular-nums font-medium"><span className={tone === 'warning' ? 'text-warning' : 'text-foreground'}>{progress}</span></td>
    </tr>
  ));

  const pacingRows = [
    ['C-GROOM-2025-A', 'Week 6 of 12', 'Module 3: Safety handling', 'On track', 'success'],
    ['C-GROOM-2025-B', 'Week 4 of 12', 'Module 2: Restraint basics', 'Behind by 1 week', 'warning'],
    ['C-GROOM-2025-C', 'Not started', 'Orientation scheduled 2025-06-03', 'Enrolling', 'info'],
  ].map(([cohort, week, focus, status, tone]) => (
    <tr key={cohort as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px]">{cohort}</td>
      <td className="p-3 font-medium text-foreground">{week}</td>
      <td className="p-3 text-[12px] text-foreground/80">{focus}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success' | 'warning' | 'info'} /></td>
    </tr>
  ));

  const modeRows = [
    ['L-1042', 'Marcus Bell', 'AI-Guided', 'Consented 2025-04-15', 'Active', 'info'],
    ['L-1043', 'Sofia Reyes', 'Self-Paced', '—', 'Active', 'default'],
    ['L-1044', 'Derek Omori', 'AI-Guided', 'Consented 2025-04-20', 'Active', 'info'],
    ['L-1046', 'Jaylen Brooks', 'Pending', 'Guardian consent required', 'Blocked', 'warning'],
  ].map(([id, name, mode, consent, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3"><StatusPill status={mode as string} tone={tone as 'info' | 'default' | 'warning'} /></td>
      <td className="p-3 text-[12px] text-foreground/80">{consent}</td>
      <td className="p-3"><StatusPill status={status as string} tone={status === 'Active' ? 'success' : 'warning'} /></td>
    </tr>
  ));

  const mycourseRows = [
    ['CRS-101', 'Canine Safety & Handling', 'In progress', '32%', 'success'],
    ['CRS-204', 'Scissor & Clipper Mastery', 'Not started', '0%', 'default'],
    ['CRS-309', 'Benefits-Cliff Coaching', 'Completed', '100%', 'success'],
    ['CRS-411', 'Salon Bookkeeping', 'In progress', '48%', 'success'],
  ].map(([id, name, status, progress, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success' | 'default'} /></td>
      <td className="p-3 tabular-nums font-medium">{progress}</td>
    </tr>
  ));

  const tabContents = {
    cohorts: {
      columns: [
        { header: 'Cohort ID' }, { header: 'Name' }, { header: 'Tenant' },
        { header: 'Size', align: 'right' as const }, { header: 'Start' }, { header: 'Status' },
      ],
      rows: cohortRows,
      tableHeader: <span className="text-[12px] font-semibold">11 active cohorts · organization-type tenants only</span>,
    },
    enrollments: {
      columns: [
        { header: 'Learner' }, { header: 'Name' }, { header: 'Cohort' },
        { header: 'Pathway' }, { header: 'Mode' }, { header: 'Progress', align: 'right' as const },
      ],
      rows: enrollRows,
      tableHeader: <span className="text-[12px] font-semibold">248 enrollments · 62% AI-guided, 38% self-paced</span>,
    },
    pacing: {
      columns: [
        { header: 'Cohort' }, { header: 'Week' }, { header: 'Current Focus' }, { header: 'Status' },
      ],
      rows: pacingRows,
      tableHeader: <span className="text-[12px] font-semibold">Pacing schedule per cohort — open question: can learners switch delivery mode mid-course?</span>,
    },
    mode: {
      columns: [
        { header: 'Learner' }, { header: 'Name' }, { header: 'Mode' }, { header: 'Consent' }, { header: 'Status' },
      ],
      rows: modeRows,
      tableHeader: <span className="text-[12px] font-semibold">Per-learner delivery-mode selection — AI-Guided requires consent gate</span>,
    },
    mycourses: {
      columns: [
        { header: 'Course ID' }, { header: 'Title' }, { header: 'Status' }, { header: 'Progress', align: 'right' as const },
      ],
      rows: mycourseRows,
      tableHeader: <span className="text-[12px] font-semibold">My course page — current / past / future courses</span>,
    },
  };

  return (
    <LmsDomainShell
      domainNumber="04"
      domainName="Enrollment"
      contextLabel="ACADEMY / LMS — Domain 04 · Delivery & Enrollment"
      title="Delivery & Enrollment"
      description="Cohorts (organization-type tenants only) own program enrollments, pacing schedule, and per-learner delivery-mode selection. AI-Guided requires a consent gate. Both modes write into one Progress & Completion engine — there is no fork."
      statusItems={[
        { label: 'Active cohorts', value: '11', tone: 'success' },
        { label: 'AI-guided share', value: '62%' },
        { label: 'Enrollments', value: '248' },
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
