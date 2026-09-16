'use client';
import * as React from 'react';
import { Sparkles, MessageSquare, AlertTriangle, HeartHandshake, Gauge } from 'lucide-react';
import { LmsDomainShell, StatusPill, LMS_DOMAIN_RAIL } from './LmsDomainShell';
import type { DawgNavSection } from '@/lib/types';

const TABS = [
  { id: 'sessions', label: 'AI Sessions', count: 34 },
  { id: 'consent', label: 'Consent Gate', count: 248 },
  { id: 'log', label: 'Turn-by-Turn Log', count: 0 },
  { id: 'personalization', label: 'Personalization State', count: 248 },
  { id: 'escalation', label: 'Human Escalation', count: 8 },
];

export function LmsAiTeachingDomain({ onNavigate }: { onNavigate: (s: DawgNavSection) => void }) {
  const [tab, setTab] = React.useState('sessions');
  const rail = LMS_DOMAIN_RAIL.map((r) => ({ ...r, current: r.id === 'lms-ai-teaching' }));

  const kpiTiles = [
    { label: 'Active Sessions', value: '34', caption: 'live now', tone: 'info' as const, icon: Sparkles },
    { label: 'Consent Rate', value: '91%', caption: 'opted-in learners', tone: 'success' as const, icon: MessageSquare },
    { label: 'Escalations (7d)', value: '8', caption: 'routed to humans', tone: 'warning' as const, icon: AlertTriangle },
    { label: 'Avg Frustration Sig', value: '0.4', caption: 'below threshold', icon: Gauge },
  ];

  const sessionRows = [
    ['S-5042', 'L-1042', 'Marcus Bell', 'CRS-101 · Lesson 4', '12 min', 'Active', 'info'],
    ['S-5043', 'L-1044', 'Derek Omori', 'CRS-101 · Lesson 6', '4 min', 'Active', 'info'],
    ['S-5044', 'L-1045', 'Aaliyah Chen', 'CRS-204 · Lesson 2', '22 min', 'Active', 'info'],
    ['S-5045', 'L-1048', 'Aria Patel', 'CRS-309 · Lesson 1', '8 min', 'Escalated', 'warning'],
  ].map(([id, learner, name, lesson, dur, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-mono text-[12px]">{learner}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 text-[12px] text-foreground/80">{lesson}</td>
      <td className="p-3 tabular-nums">{dur}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'info' | 'warning'} /></td>
    </tr>
  ));

  const consentRows = [
    ['L-1042', 'Marcus Bell', 'Consented', '2025-04-15', 'Revocable any time', 'success'],
    ['L-1043', 'Sofia Reyes', 'Declined', '2025-04-16', 'Self-paced fallback', 'default'],
    ['L-1044', 'Derek Omori', 'Consented', '2025-04-20', 'Revocable any time', 'success'],
    ['L-1046', 'Jaylen Brooks', 'Blocked', '—', 'Guardian consent required', 'warning'],
  ].map(([id, name, status, date, note, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success' | 'default' | 'warning'} /></td>
      <td className="p-3 text-[12px] text-muted-foreground">{date}</td>
      <td className="p-3 text-[12px] text-foreground/80">{note}</td>
    </tr>
  ));

  const logRows = [
    ['S-5042', 't-01', 'learner', 'I don\'t get the difference between scruffing and head control', 'neutral', 'default'],
    ['S-5042', 't-02', 'ai', 'Great question. Scruffing is a brief restraint at the loose skin...', 'clarifying', 'info'],
    ['S-5042', 't-03', 'learner', 'Oh ok. Is that bad for the dog?', 'curious', 'default'],
    ['S-5042', 't-04', 'ai', 'It can be. Let me show you a fear-free alternative...', 'teaching', 'info'],
    ['S-5042', 't-05', 'learner', 'I tried it on my dog and he yelped', 'frustration signal', 'warning'],
  ].map(([session, turn, actor, content, signal, tone]) => (
    <tr key={`${session}-${turn}`} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{session}</td>
      <td className="p-3 font-mono text-[12px]">{turn}</td>
      <td className="p-3"><StatusPill status={actor as string} tone={actor === 'ai' ? 'info' : 'default'} /></td>
      <td className="p-3 text-[12px] text-foreground/80 max-w-md">{content}</td>
      <td className="p-3"><StatusPill status={signal as string} tone={tone as 'info' | 'warning' | 'default'} /></td>
    </tr>
  ));

  const persRows = [
    ['L-1042', 'Marcus Bell', 'Step-by-step', 'Encouraging', 'Beginner', 'Slower pace', 'success'],
    ['L-1044', 'Derek Omori', 'Visual-first', 'Direct', 'Beginner', 'Default pace', 'success'],
    ['L-1045', 'Aaliyah Chen', 'Reference-heavy', 'Concise', 'Intermediate', 'Faster pace', 'success'],
  ].map(([id, name, style, tone, level, pace, tone2]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 text-[12px]">{style}</td>
      <td className="p-3 text-[12px]">{tone}</td>
      <td className="p-3"><StatusPill status={level as string} /></td>
      <td className="p-3 text-[12px]">{pace}</td>
      <td className="p-3"><StatusPill status="Tuned" tone={tone2 as 'success'} /></td>
    </tr>
  ));

  const escalRows = [
    ['ESC-01', 'S-5045', 'L-1048', 'Aria Patel', 'Repeated frustration signal (3x)', 'Navigator Tobias', 'Resolved', 'success'],
    ['ESC-02', 'S-5031', 'L-1051', 'Tyler Nguyen', 'Crisis keyword detected', 'Crisis line + Navigator', 'Active', 'warning'],
    ['ESC-03', 'S-5012', 'L-1046', 'Jaylen Brooks', 'Minor + guardian consent issue', 'org_admin Adaeze', 'Active', 'warning'],
  ].map(([id, session, learner, name, trigger, routed, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-mono text-[12px]">{session}</td>
      <td className="p-3 font-mono text-[12px]">{learner}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 text-[12px] text-foreground/80">{trigger}</td>
      <td className="p-3 text-[12px] text-foreground/80">{routed}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success' | 'warning'} /></td>
    </tr>
  ));

  const tabContents = {
    sessions: {
      columns: [
        { header: 'Session' }, { header: 'Learner ID' }, { header: 'Name' },
        { header: 'Lesson' }, { header: 'Duration', align: 'right' as const }, { header: 'Status' },
      ],
      rows: sessionRows,
      tableHeader: <span className="text-[12px] font-semibold">34 active AI teaching sessions (LeashGuide chat)</span>,
    },
    consent: {
      columns: [
        { header: 'Learner' }, { header: 'Name' }, { header: 'Status' }, { header: 'Date' }, { header: 'Note' },
      ],
      rows: consentRows,
      tableHeader: <span className="text-[12px] font-semibold">Consent gate — 91% opted in, revocable any time, required before AI-Guided mode</span>,
    },
    log: {
      columns: [
        { header: 'Session' }, { header: 'Turn' }, { header: 'Actor' }, { header: 'Content' }, { header: 'Pedagogy Signal' },
      ],
      rows: logRows,
      tableHeader: <span className="text-[12px] font-semibold">Turn-by-turn interaction log — pedagogy signals only (NOT content surveillance)</span>,
    },
    personalization: {
      columns: [
        { header: 'Learner' }, { header: 'Name' }, { header: 'Style' }, { header: 'Tone' },
        { header: 'Level' }, { header: 'Pace' }, { header: 'State' },
      ],
      rows: persRows,
      tableHeader: <span className="text-[12px] font-semibold">Personalization state — pace / tone / difficulty adapted per learner</span>,
    },
    escalation: {
      columns: [
        { header: 'ID' }, { header: 'Session' }, { header: 'Learner' }, { header: 'Name' },
        { header: 'Trigger' }, { header: 'Routed To' }, { header: 'Status' },
      ],
      rows: escalRows,
      tableHeader: <span className="text-[12px] font-semibold">8 escalations (7d) — routed to Whole-Human Support (Domain 9)</span>,
    },
  };

  return (
    <LmsDomainShell
      domainNumber="05"
      domainName="AI Session"
      contextLabel="ACADEMY / LMS — Domain 05 · AI Teaching & Personalization"
      title="AI Teaching & Personalization"
      description="LeashGuide chat teaches from authored content blocks for opt-in learners. The turn-by-turn log captures pedagogy signals only (NOT content surveillance). Repeated confusion or frustration signals escalate to a human — routed into Whole-Human Support."
      statusItems={[
        { label: 'Sessions', value: '34', tone: 'info' },
        { label: 'Consent', value: '91%', tone: 'success' },
        { label: 'Escalations (7d)', value: '8', tone: 'warning' },
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
