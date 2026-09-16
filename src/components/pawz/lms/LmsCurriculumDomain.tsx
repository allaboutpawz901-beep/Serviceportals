'use client';
import * as React from 'react';
import { BookOpen, PenLine, Layers, Clock, CheckCircle2 } from 'lucide-react';
import { LmsDomainShell, StatusPill, LMS_DOMAIN_RAIL } from './LmsDomainShell';
import type { DawgNavSection } from '@/lib/types';

const TABS = [
  { id: 'pathways', label: 'Pathways', count: 9 },
  { id: 'programs', label: 'Programs / Courses', count: 47 },
  { id: 'modules', label: 'Modules', count: 184 },
  { id: 'lessons', label: 'Lessons', count: 1247 },
  { id: 'versioning', label: 'Versioning', count: 23 },
];

export function LmsCurriculumDomain({ onNavigate }: { onNavigate: (s: DawgNavSection) => void }) {
  const [tab, setTab] = React.useState('pathways');
  const rail = LMS_DOMAIN_RAIL.map((r) => ({ ...r, current: r.id === 'lms-curriculum' }));

  const kpiTiles = [
    { label: 'Pathways', value: '9', caption: '3 published', tone: 'success' as const, icon: Layers },
    { label: 'Courses', value: '47', caption: '5 in draft', tone: 'warning' as const, icon: BookOpen },
    { label: 'Lessons', value: '1,247', caption: '+84 this month', icon: PenLine },
    { label: 'Avg Module Length', value: '42 min', caption: 'pacing rule applied', icon: Clock },
  ];

  const pathwayRows = [
    ['PW-01', 'Foundations of Grooming', 'Beginner', '6 courses · 84 hrs', 'Published v3', 'success'],
    ['PW-02', 'Advanced Styling & Breed standards', 'Mastery', '8 courses · 142 hrs', 'Published v2', 'success'],
    ['PW-03', 'Whole-Human Workforce Readiness', 'Intermediate', '5 courses · 38 hrs', 'Published v1', 'success'],
    ['PW-04', 'Salon Business Launchpad', 'Intermediate', '4 courses · 26 hrs', 'Draft', 'warning'],
    ['PW-05', 'Safety, Restraint & First Aid', 'Beginner', '3 courses · 22 hrs', 'Published v4', 'success'],
  ].map(([id, name, level, scope, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3"><StatusPill status={level as string} tone={level === 'Mastery' ? 'info' : 'default'} /></td>
      <td className="p-3 text-[12px] text-foreground/80">{scope}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success' | 'warning'} /></td>
    </tr>
  ));

  const programRows = [
    ['CRS-101', 'Canine Safety, Restraint & Stress-Free Handling', 'Safety & Handling', 'Beginner', 'v3', 'Published'],
    ['CRS-204', 'Scissor & Clipper Technique Mastery', 'Styling & Technique', 'Mastery', 'v2', 'Published'],
    ['CRS-309', 'Benefits-Cliff Coaching for New Groomers', 'Whole-Human', 'Intermediate', 'v1', 'Published'],
    ['CRS-411', 'Salon Bookkeeping & Tax Readiness', 'Operations', 'Intermediate', 'v1', 'Draft'],
    ['CRS-508', 'Cat Grooming Fundamentals', 'Health & First Aid', 'Beginner', 'v2', 'Published'],
  ].map(([id, title, cat, level, ver, status]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{title}</td>
      <td className="p-3 text-[12px] text-foreground/80">{cat}</td>
      <td className="p-3"><StatusPill status={level as string} /></td>
      <td className="p-3 font-mono text-[12px]">{ver}</td>
      <td className="p-3"><StatusPill status={status as string} tone={status === 'Published' ? 'success' : 'warning'} /></td>
    </tr>
  ));

  const moduleRows = [
    ['MOD-101.1', 'Connect: Why restraint matters', 'CRS-101', '8 min', 'video', 'Published'],
    ['MOD-101.2', 'Learn: Canine stress signals', 'CRS-101', '12 min', 'reading', 'Published'],
    ['MOD-101.3', 'See-it: Demonstration video', 'CRS-101', '6 min', 'video', 'Published'],
    ['MOD-101.4', 'Do-it: Hands-on practice', 'CRS-101', '24 min', 'practical', 'Published'],
    ['MOD-101.5', 'Check: Knowledge check', 'CRS-101', '4 min', 'quiz', 'Published'],
  ].map(([id, title, course, len, type, status]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{title}</td>
      <td className="p-3 font-mono text-[12px]">{course}</td>
      <td className="p-3 tabular-nums">{len}</td>
      <td className="p-3"><StatusPill status={type as string} tone="info" /></td>
      <td className="p-3"><StatusPill status={status as string} tone="success" /></td>
    </tr>
  ));

  const lessonRows = [
    ['LSN-1248', 'Reading a dog\'s body language — the 5 signals', 'video', '12 min', 'AI-narrated', 'Approved'],
    ['LSN-1249', 'Proper scissor grip and posture', 'video', '14 min', 'Human', 'Approved'],
    ['LSN-1250', 'When to refuse a groom (safety)', 'reading', '8 min', 'Human', 'Approved'],
    ['LSN-1251', 'Practice: Tub setup checklist', 'practical', '30 min', '—', 'Pending review'],
  ].map(([id, title, type, len, source, status]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{title}</td>
      <td className="p-3"><StatusPill status={type as string} tone="info" /></td>
      <td className="p-3 tabular-nums">{len}</td>
      <td className="p-3 text-[12px] text-foreground/80">{source}</td>
      <td className="p-3"><StatusPill status={status as string} tone={status === 'Approved' ? 'success' : 'warning'} /></td>
    </tr>
  ));

  const versionRows = [
    ['CRS-101', 'v3', 'v2', 'Maya Whitfield', '2025-05-09', 'Added 2 lessons on fear-free handling', 'success'],
    ['CRS-204', 'v2', 'v1', 'Renée Castellanos', '2025-04-22', 'Refreshed scissor diagrams', 'success'],
    ['CRS-411', 'v1', '—', 'Karl Voss', '2025-05-11', 'Initial draft', 'warning'],
  ].map(([course, ver, prev, author, date, note, tone]) => (
    <tr key={`${course}-${ver}`} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px]">{course}</td>
      <td className="p-3 font-mono font-semibold">{ver}</td>
      <td className="p-3 font-mono text-muted-foreground">{prev}</td>
      <td className="p-3 text-[12px]">{author}</td>
      <td className="p-3 text-[12px] text-muted-foreground">{date}</td>
      <td className="p-3 text-[12px] text-foreground/80">{note}</td>
      <td className="p-3"><StatusPill status={tone === 'success' ? 'Live' : 'Draft'} tone={tone as 'success' | 'warning'} /></td>
    </tr>
  ));

  const tabContents = {
    pathways: {
      columns: [
        { header: 'ID' }, { header: 'Pathway' }, { header: 'Level' },
        { header: 'Scope' }, { header: 'Status' },
      ],
      rows: pathwayRows,
      tableHeader: <span className="text-[12px] font-semibold">9 pathways · 3 published, 1 in draft</span>,
    },
    programs: {
      columns: [
        { header: 'Course ID' }, { header: 'Title' }, { header: 'Category' },
        { header: 'Level' }, { header: 'Version' }, { header: 'Status' },
      ],
      rows: programRows,
      tableHeader: <span className="text-[12px] font-semibold">47 courses · 42 published, 5 in draft</span>,
    },
    modules: {
      columns: [
        { header: 'Module ID' }, { header: 'Title' }, { header: 'Course' },
        { header: 'Length', align: 'right' as const }, { header: 'Type' }, { header: 'Status' },
      ],
      rows: moduleRows,
      tableHeader: <span className="text-[12px] font-semibold">184 modules — connect/learn/see-it/do-it/check phases</span>,
    },
    lessons: {
      columns: [
        { header: 'Lesson ID' }, { header: 'Title' }, { header: 'Type' },
        { header: 'Length', align: 'right' as const }, { header: 'Source' }, { header: 'Status' },
      ],
      rows: lessonRows,
      tableHeader: <span className="text-[12px] font-semibold">1,247 lessons · pacing rule: 1 minute per 240 words</span>,
    },
    versioning: {
      columns: [
        { header: 'Course' }, { header: 'New' }, { header: 'Prev' },
        { header: 'Author' }, { header: 'Published' }, { header: 'Change Note' }, { header: 'State' },
      ],
      rows: versionRows,
      tableHeader: <span className="text-[12px] font-semibold">Curriculum versioning — does enrollment pin version? (open question)</span>,
    },
  };

  return (
    <LmsDomainShell
      domainNumber="02"
      domainName="Curriculum"
      contextLabel="ACADEMY / LMS — Domain 02 · Curriculum Authoring"
      title="Curriculum Authoring"
      description="Pathways → Programs → Modules → Lessons → Content Blocks. Modules follow the connect/learn/see-it/do-it/check pedagogical phases. Coursework is authored once, then AI teaches from authored content for opt-in learners while the same content is directly consumable for self-paced learners."
      statusItems={[
        { label: 'Pathways', value: '9', tone: 'success' },
        { label: 'Courses', value: '47' },
        { label: 'Drafts', value: '5', tone: 'warning' },
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
