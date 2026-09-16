'use client';
import * as React from 'react';
import { Gauge, Clock, CheckCircle2, AlertTriangle, BookOpen } from 'lucide-react';
import { LmsDomainShell, StatusPill, LMS_DOMAIN_RAIL } from './LmsDomainShell';
import type { DawgNavSection } from '@/lib/types';

const TABS = [
  { id: 'lesson', label: 'Lesson / Module Progress', count: 248 },
  { id: 'ledger', label: 'Clock-Hour Ledger', count: 4182 },
  { id: 'completion', label: 'Completion Rules', count: 47 },
  { id: 'instructor', label: 'Instructor Completion Dashboard', count: 11 },
];

export function LmsProgressDomain({ onNavigate }: { onNavigate: (s: DawgNavSection) => void }) {
  const [tab, setTab] = React.useState('lesson');
  const rail = LMS_DOMAIN_RAIL.map((r) => ({ ...r, current: r.id === 'lms-progress' }));

  const kpiTiles = [
    { label: 'Clock Hours (MTD)', value: '4,182', caption: 'audit-grade', icon: Clock },
    { label: 'Completions (MTD)', value: '37', caption: '+12 vs last month', tone: 'success' as const, icon: CheckCircle2 },
    { label: 'At-Risk Learners', value: '14', caption: 'flagged for navigator', tone: 'warning' as const, icon: AlertTriangle },
    { label: 'Avg Completion', value: '73%', caption: 'across all courses', icon: Gauge },
  ];

  const lessonRows = [
    ['L-1042', 'Marcus Bell', 'CRS-101', 'Module 3', '12 / 15 lessons', '80%', 'success'],
    ['L-1043', 'Sofia Reyes', 'CRS-204', 'Module 1', '4 / 12 lessons', '33%', 'warning'],
    ['L-1044', 'Derek Omori', 'CRS-101', 'Module 1', '2 / 15 lessons', '13%', 'destructive'],
    ['L-1045', 'Aaliyah Chen', 'CRS-508', 'Module 4', '14 / 14 lessons', '100%', 'success'],
  ].map(([id, name, course, mod, lessons, pct, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 font-mono text-[12px]">{course}</td>
      <td className="p-3 text-[12px]">{mod}</td>
      <td className="p-3 text-[12px] text-foreground/80">{lessons}</td>
      <td className="p-3 tabular-nums font-medium"><span className={tone === 'success' ? 'text-success' : tone === 'warning' ? 'text-warning' : 'text-destructive'}>{pct}</span></td>
    </tr>
  ));

  const ledgerRows = [
    ['L-1042', 'CRS-101', 'MOD-101.4', '2025-05-12', 'Practical', '2.5', 'Verified', 'success'],
    ['L-1042', 'CRS-101', 'MOD-101.5', '2025-05-12', 'Quiz', '0.5', 'Verified', 'success'],
    ['L-1044', 'CRS-101', 'MOD-101.1', '2025-05-13', 'Video', '0.3', 'Verified', 'success'],
    ['L-1045', 'CRS-508', 'MOD-508.3', '2025-05-14', 'Reading', '0.4', 'Verified', 'success'],
  ].map(([learner, course, mod, date, type, hours, status, tone]) => (
    <tr key={`${learner}-${course}-${mod}-${date}`} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{learner}</td>
      <td className="p-3 font-mono text-[12px]">{course}</td>
      <td className="p-3 font-mono text-[12px]">{mod}</td>
      <td className="p-3 text-[12px] text-muted-foreground">{date}</td>
      <td className="p-3"><StatusPill status={type as string} tone="info" /></td>
      <td className="p-3 tabular-nums font-mono font-semibold">{hours}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success'} /></td>
    </tr>
  ));

  const completionRows = [
    ['CRS-101', 'Foundation Safety', 'Pass quiz ≥80% + practical signoff + 18 clock hours', '37 / 248', 'success'],
    ['CRS-204', 'Scissor Mastery', 'All rubric criteria + 36 clock hours + instructor signoff', '12 / 248', 'success'],
    ['CRS-309', 'Benefits-Cliff Coaching', 'Attendance 100% + reflective journal', '89 / 248', 'success'],
    ['CRS-411', 'Salon Bookkeeping', 'Pass quiz ≥70% + 12 clock hours', '—', 'warning'],
  ].map(([course, name, rule, count, tone]) => (
    <tr key={course as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px]">{course}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 text-[12px] text-foreground/80">{rule}</td>
      <td className="p-3 text-[12px]">{count} completions</td>
      <td className="p-3"><StatusPill status={tone === 'success' ? 'Active' : 'In draft'} tone={tone as 'success' | 'warning'} /></td>
    </tr>
  ));

  const instructorRows = [
    ['C-GROOM-2025-A', '24 learners', '8 ahead', '14 on track', '2 at risk', '83% avg', 'success'],
    ['C-GROOM-2025-B', '18 learners', '3 ahead', '10 on track', '5 at risk', '64% avg', 'warning'],
    ['C-GROOM-2025-C', '22 learners', '—', '—', '—', 'Enrolling', 'info'],
  ].map(([cohort, size, ahead, track, risk, avg, tone]) => (
    <tr key={cohort as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px]">{cohort}</td>
      <td className="p-3 text-[12px]">{size}</td>
      <td className="p-3 text-[12px] text-success">{ahead}</td>
      <td className="p-3 text-[12px] text-foreground/80">{track}</td>
      <td className="p-3 text-[12px] text-warning">{risk}</td>
      <td className="p-3 tabular-nums font-medium">{avg}</td>
      <td className="p-3"><StatusPill status={tone === 'success' ? 'Healthy' : tone === 'warning' ? 'Watch' : 'Pre-start'} tone={tone as 'success' | 'warning' | 'info'} /></td>
    </tr>
  ));

  const tabContents = {
    lesson: {
      columns: [
        { header: 'Learner' }, { header: 'Name' }, { header: 'Course' },
        { header: 'Module' }, { header: 'Lessons' }, { header: 'Progress', align: 'right' as const },
      ],
      rows: lessonRows,
      tableHeader: <span className="text-[12px] font-semibold">Mode-agnostic lesson progress — same engine for AI-guided and self-paced</span>,
    },
    ledger: {
      columns: [
        { header: 'Learner' }, { header: 'Course' }, { header: 'Module' },
        { header: 'Date' }, { header: 'Type' }, { header: 'Hours', align: 'right' as const }, { header: 'Status' },
      ],
      rows: ledgerRows,
      tableHeader: <span className="text-[12px] font-semibold">Audited clock-hour ledger — IMMUTABLE, computed, human-verified. Audit source of truth for Domain 11.</span>,
    },
    completion: {
      columns: [
        { header: 'Course' }, { header: 'Name' }, { header: 'Completion Rule' }, { header: 'Completions' }, { header: 'State' },
      ],
      rows: completionRows,
      tableHeader: <span className="text-[12px] font-semibold">Formal completion rule per course — open question: get the completion-rule table right</span>,
    },
    instructor: {
      columns: [
        { header: 'Cohort' }, { header: 'Size' }, { header: 'Ahead' },
        { header: 'On Track' }, { header: 'At Risk' }, { header: 'Avg', align: 'right' as const }, { header: 'Health' },
      ],
      rows: instructorRows,
      tableHeader: <span className="text-[12px] font-semibold">Instructor completion dashboard — at-risk learners auto-flagged for Whole-Human Support</span>,
    },
  };

  return (
    <LmsDomainShell
      domainNumber="06"
      domainName="Progress"
      contextLabel="ACADEMY / LMS — Domain 06 · Progress & Completion Engine"
      title="Progress & Completion Engine"
      description="Mode-agnostic lesson/module progress feeds an audited clock-hour ledger. The ledger is IMMUTABLE, computed, and human-verified — it is the audit source of truth that Compliance & Reporting (Domain 11) reads from. Formal completion rules per course gate credential issuance."
      statusItems={[
        { label: 'Clock hours (MTD)', value: '4,182' },
        { label: 'Completions', value: '37', tone: 'success' },
        { label: 'At-risk', value: '14', tone: 'warning' },
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
