'use client';
import * as React from 'react';
import { Bot, Video, FileText, ClipboardCheck, Sparkles, AlertTriangle } from 'lucide-react';
import { LmsDomainShell, StatusPill, LMS_DOMAIN_RAIL } from './LmsDomainShell';
import type { DawgNavSection } from '@/lib/types';

const TABS = [
  { id: 'persona', label: 'AI Persona & Voice', count: 1 },
  { id: 'lectures', label: 'AI-Generated Lectures', count: 248 },
  { id: 'drafts', label: 'Draft Review Queue', count: 17 },
  { id: 'roleplay', label: 'Roleplay Simulations', count: 14 },
  { id: 'telemetry', label: 'Session Telemetry', count: 0 },
];

export function LmsAiInstructorDomain({ onNavigate }: { onNavigate: (s: DawgNavSection) => void }) {
  const [tab, setTab] = React.useState('persona');
  const rail = LMS_DOMAIN_RAIL.map((r) => ({ ...r, current: r.id === 'lms-ai-instructor' }));

  const kpiTiles = [
    { label: 'Drafts Pending Review', value: '17', caption: 'human approval required', tone: 'warning' as const, icon: AlertTriangle },
    { label: 'Lectures Generated', value: '248', caption: 'all human-approved', tone: 'success' as const, icon: Video },
    { label: 'Human-Approved Rate', value: '94%', caption: 'AI draft → human review', tone: 'success' as const, icon: ClipboardCheck },
    { label: 'Roleplay Sessions', value: '14', caption: 'soft-skill practice', icon: Sparkles },
  ];

  const personaRows = [
    ['Name', 'LeashGuide'],
    ['Voice', 'Warm, patient, encouraging — middle-school reading level'],
    ['Domain expertise', 'Grooming safety, styling, whole-human support'],
    ['Escalation policy', 'Crisis keyword → immediate human + crisis line'],
    ['Content sourcing', 'Reads authored content blocks only (Domain 2)'],
    ['Attribution', 'AI-drafted content always labeled; human reviewer tracked'],
  ].map(([k, v]) => (
    <tr key={k as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground uppercase">{k}</td>
      <td className="p-3 text-[12px] text-foreground/80">{v}</td>
    </tr>
  ));

  const lectureRows = [
    ['LEC-01', 'AI-narrated', 'CRS-101 / Lesson 4', 'Reading a dog\'s body language', 'video', '12 min', 'success'],
    ['LEC-02', 'AI-narrated', 'CRS-204 / Lesson 2', 'Scissor grip fundamentals', 'video', '14 min', 'success'],
    ['LEC-03', 'AI-drafted', 'CRS-101 / Lesson 6', 'When to refuse a groom (safety)', 'reading', '8 min', 'success'],
    ['LEC-04', 'AI-composed', 'CRS-508 / Lesson 3', 'Cat handling PDF + video mashup', 'mashup', '18 min', 'success'],
  ].map(([id, source, lesson, title, type, len, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3"><StatusPill status={source as string} tone="info" /></td>
      <td className="p-3 font-mono text-[12px]">{lesson}</td>
      <td className="p-3 font-medium text-foreground">{title}</td>
      <td className="p-3"><StatusPill status={type as string} /></td>
      <td className="p-3 tabular-nums">{len}</td>
      <td className="p-3"><StatusPill status="Published" tone={tone as 'success'} /></td>
    </tr>
  ));

  const draftRows = [
    ['DR-01', 'Practice quiz — CRS-101 Module 3', 'quiz items', 'AI-assisted', 'Maya Whitfield', 'Pending review', 'warning'],
    ['DR-02', 'Article lecture — Fear-free handling', 'reading', 'AI-drafted', 'Maya Whitfield', 'Pending review', 'warning'],
    ['DR-03', 'Announcement — Cohort A milestone', 'announcement', 'AI-drafted', 'Adaeze Nwosu', 'Pending review', 'warning'],
    ['DR-04', 'Coding test cases — POS integration', 'coding', 'AI-assisted', 'Karl Voss', 'Pending review', 'warning'],
  ].map(([id, title, kind, source, reviewer, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{title}</td>
      <td className="p-3"><StatusPill status={kind as string} /></td>
      <td className="p-3"><StatusPill status={source as string} tone="info" /></td>
      <td className="p-3 text-[12px] text-foreground/80">{reviewer}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'warning'} /></td>
    </tr>
  ));

  const roleRows = [
    ['RP-01', 'L-1042', 'Marcus Bell', 'Difficult customer de-escalation', 'AI roleplay', 'Complete', 'success'],
    ['RP-02', 'L-1045', 'Aaliyah Chen', 'Benefits-cliff conversation with employer', 'AI roleplay', 'Complete', 'success'],
    ['RP-03', 'L-1048', 'Aria Patel', 'Salon team conflict resolution', 'AI roleplay', 'In progress', 'warning'],
  ].map(([id, learner, name, scenario, mode, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-mono text-[12px]">{learner}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 text-[12px] text-foreground/80">{scenario}</td>
      <td className="p-3"><StatusPill status={mode as string} tone="info" /></td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success' | 'warning'} /></td>
    </tr>
  ));

  const telemetryRows = [
    ['S-5042', 'L-1042', 'CRS-101 / L4', 'AI-narrated video', '12 min', '0.4', 'success'],
    ['S-5043', 'L-1044', 'CRS-101 / L6', 'AI-drafted reading', '4 min', '0.6', 'warning'],
    ['S-5044', 'L-1045', 'CRS-204 / L2', 'AI-composed mashup', '22 min', '0.3', 'success'],
  ].map(([session, learner, lesson, type, dur, frustr, tone]) => (
    <tr key={session as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{session}</td>
      <td className="p-3 font-mono text-[12px]">{learner}</td>
      <td className="p-3 text-[12px] text-foreground/80">{lesson}</td>
      <td className="p-3"><StatusPill status={type as string} tone="info" /></td>
      <td className="p-3 tabular-nums">{dur}</td>
      <td className="p-3 tabular-nums font-medium"><span className={tone === 'warning' ? 'text-warning' : 'text-foreground'}>{frustr}</span></td>
      <td className="p-3"><StatusPill status="Logged" tone={tone as 'success' | 'warning'} /></td>
    </tr>
  ));

  const tabContents = {
    persona: {
      columns: [
        { header: 'Attribute' }, { header: 'Value' },
      ],
      rows: personaRows,
      tableHeader: <span className="text-[12px] font-semibold">LeashGuide AI instructor persona & voice — pedagogy signals only, no content surveillance</span>,
    },
    lectures: {
      columns: [
        { header: 'ID' }, { header: 'Source' }, { header: 'Lesson' },
        { header: 'Title' }, { header: 'Type' }, { header: 'Length', align: 'right' as const }, { header: 'State' },
      ],
      rows: lectureRows,
      tableHeader: <span className="text-[12px] font-semibold">AI-generated lecture delivery — pacing rule: 1 min per 240 words</span>,
    },
    drafts: {
      columns: [
        { header: 'ID' }, { header: 'Title' }, { header: 'Kind' },
        { header: 'Source' }, { header: 'Reviewer' }, { header: 'Status' },
      ],
      rows: draftRows,
      tableHeader: <span className="text-[12px] font-semibold">17 drafts pending human review — open question: human-approval gate before AI-drafted content publishes?</span>,
    },
    roleplay: {
      columns: [
        { header: 'ID' }, { header: 'Learner' }, { header: 'Name' },
        { header: 'Scenario' }, { header: 'Mode' }, { header: 'Status' },
      ],
      rows: roleRows,
      tableHeader: <span className="text-[12px] font-semibold">AI-assisted soft-skill roleplay simulations — escalates to Whole-Human Support on flag</span>,
    },
    telemetry: {
      columns: [
        { header: 'Session' }, { header: 'Learner' }, { header: 'Lesson' },
        { header: 'Type' }, { header: 'Duration', align: 'right' as const }, { header: 'Frustration Sig', align: 'right' as const }, { header: 'State' },
      ],
      rows: telemetryRows,
      tableHeader: <span className="text-[12px] font-semibold">AI session telemetry — pedagogy signals only (frustration, confusion, pacing)</span>,
    },
  };

  return (
    <LmsDomainShell
      domainNumber="13"
      domainName="AI Instructor"
      contextLabel="ACADEMY / LMS — Domain 13 · AI Instructor Skills"
      title="AI Instructor Skills"
      description="LeashGuide AI instructor persona & voice, AI-generated lecture delivery (video / article / mashup), AI-assisted content drafting, AI-assisted assessment generation, AI-assisted roleplay simulation, and AI session telemetry (pedagogy signals only). All AI-drafted content requires human approval before publishing."
      statusItems={[
        { label: 'Drafts pending', value: '17', tone: 'warning' },
        { label: 'Lectures', value: '248', tone: 'success' },
        { label: 'Human-approved', value: '94%', tone: 'success' },
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
