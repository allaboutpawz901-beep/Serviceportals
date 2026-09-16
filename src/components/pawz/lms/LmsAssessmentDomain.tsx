'use client';
import * as React from 'react';
import { ClipboardCheck, Award, AlertTriangle, BookOpen, CheckCircle2 } from 'lucide-react';
import { LmsDomainShell, StatusPill, LMS_DOMAIN_RAIL } from './LmsDomainShell';
import type { DawgNavSection } from '@/lib/types';

const TABS = [
  { id: 'queue', label: 'Grading Queue', count: 23 },
  { id: 'quizzes', label: 'Quiz / Question Bank', count: 184 },
  { id: 'rubrics', label: 'Rubrics', count: 47 },
  { id: 'submissions', label: 'Artifact Submissions', count: 248 },
  { id: 'retake', label: 'Retake Policy', count: 12 },
];

export function LmsAssessmentDomain({ onNavigate }: { onNavigate: (s: DawgNavSection) => void }) {
  const [tab, setTab] = React.useState('queue');
  const rail = LMS_DOMAIN_RAIL.map((r) => ({ ...r, current: r.id === 'lms-assessment' }));

  const kpiTiles = [
    { label: 'In Grading Queue', value: '23', caption: 'oldest 3 days', tone: 'warning' as const, icon: AlertTriangle },
    { label: 'Quizzes', value: '184', caption: '62 AI-assisted', icon: BookOpen },
    { label: 'Avg Score', value: '84%', caption: '+2% vs last mo', tone: 'success' as const, icon: ClipboardCheck },
    { label: 'Retakes (7d)', value: '12', caption: 'within policy', icon: CheckCircle2 },
  ];

  const queueRows = [
    ['SUB-2001', 'L-1042', 'Marcus Bell', 'CRS-101', 'Practical: Tub setup', 'Submitted 3d ago', 'Pending', 'warning'],
    ['SUB-2002', 'L-1045', 'Aaliyah Chen', 'CRS-508', 'Quiz: Cat handling', 'Submitted 1d ago', 'Pending', 'warning'],
    ['SUB-2003', 'L-1044', 'Derek Omori', 'CRS-101', 'Practical: Restraint', 'Submitted 5d ago', 'Overdue', 'destructive'],
    ['SUB-2004', 'L-1048', 'Aria Patel', 'CRS-309', 'Reflective journal', 'Submitted 2d ago', 'Pending', 'warning'],
  ].map(([id, learner, name, course, artifact, submitted, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-mono text-[12px]">{learner}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 font-mono text-[12px]">{course}</td>
      <td className="p-3 text-[12px] text-foreground/80">{artifact}</td>
      <td className="p-3 text-[12px] text-muted-foreground">{submitted}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'warning' | 'destructive'} /></td>
    </tr>
  ));

  const quizRows = [
    ['QZ-101-A', 'Safety Knowledge Check', 'CRS-101', '15 questions', 'AI-assisted', 'success'],
    ['QZ-204-A', 'Scissor Technique Quiz', 'CRS-204', '20 questions', 'Human-authored', 'success'],
    ['QZ-508-A', 'Cat Handling Quiz', 'CRS-508', '12 questions', 'AI-assisted', 'success'],
  ].map(([id, name, course, count, source, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 font-mono text-[12px]">{course}</td>
      <td className="p-3 text-[12px] text-foreground/80">{count}</td>
      <td className="p-3"><StatusPill status={source as string} tone={source === 'AI-assisted' ? 'info' : 'default'} /></td>
      <td className="p-3"><StatusPill status="Live" tone={tone as 'success'} /></td>
    </tr>
  ));

  const rubricRows = [
    ['RUB-101', 'Practical: Tub setup', '5 criteria', '4 levels each', 'CRS-101', 'success'],
    ['RUB-204', 'Scissor technique assessment', '8 criteria', '4 levels each', 'CRS-204', 'success'],
    ['RUB-309', 'Reflective journal rubric', '4 criteria', '3 levels each', 'CRS-309', 'success'],
  ].map(([id, name, criteria, levels, course, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 text-[12px]">{criteria}</td>
      <td className="p-3 text-[12px]">{levels}</td>
      <td className="p-3 font-mono text-[12px]">{course}</td>
      <td className="p-3"><StatusPill status="Active" tone={tone as 'success'} /></td>
    </tr>
  ));

  const submissionRows = [
    ['SUB-2001', 'L-1042', 'Marcus Bell', 'Practical', 'tub-setup-photo.jpg', 'In review', 'warning'],
    ['SUB-2002', 'L-1045', 'Aaliyah Chen', 'Quiz', 'auto-graded', 'Graded 92%', 'success'],
    ['SUB-2003', 'L-1044', 'Derek Omori', 'Practical', 'restraint-video.mp4', 'Overdue', 'destructive'],
    ['SUB-2004', 'L-1048', 'Aria Patel', 'Journal', 'journal.pdf', 'In review', 'warning'],
  ].map(([id, learner, name, type, artifact, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-mono text-[12px]">{learner}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3"><StatusPill status={type as string} tone="info" /></td>
      <td className="p-3 text-[12px] text-foreground/80">{artifact}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'warning' | 'success' | 'destructive'} /></td>
    </tr>
  ));

  const retakeRows = [
    ['RT-01', 'L-1044', 'Derek Omori', 'QZ-101-A', '2 of 3 used', 'Within policy', 'success'],
    ['RT-02', 'L-1051', 'Tyler Nguyen', 'QZ-508-A', '3 of 3 used', 'Policy exhausted', 'warning'],
    ['RT-03', 'L-1046', 'Jaylen Brooks', 'QZ-204-A', '0 of 3 used', 'Not yet attempted', 'default'],
  ].map(([id, learner, name, quiz, used, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-mono text-[12px]">{learner}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 font-mono text-[12px]">{quiz}</td>
      <td className="p-3 text-[12px] text-foreground/80">{used}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success' | 'warning' | 'default'} /></td>
    </tr>
  ));

  const tabContents = {
    queue: {
      columns: [
        { header: 'Submission' }, { header: 'Learner' }, { header: 'Name' },
        { header: 'Course' }, { header: 'Artifact' }, { header: 'Submitted' }, { header: 'Status' },
      ],
      rows: queueRows,
      tableHeader: <span className="text-[12px] font-semibold">23 in grading queue · marking workflow supports assign different markers + moderation</span>,
    },
    quizzes: {
      columns: [
        { header: 'Quiz ID' }, { header: 'Name' }, { header: 'Course' },
        { header: 'Questions', align: 'right' as const }, { header: 'Source' }, { header: 'State' },
      ],
      rows: quizRows,
      tableHeader: <span className="text-[12px] font-semibold">184 quizzes · 62 AI-assisted (practice items), all human-approved before publish</span>,
    },
    rubrics: {
      columns: [
        { header: 'Rubric ID' }, { header: 'Name' }, { header: 'Criteria', align: 'right' as const },
        { header: 'Levels', align: 'right' as const }, { header: 'Course' }, { header: 'State' },
      ],
      rows: rubricRows,
      tableHeader: <span className="text-[12px] font-semibold">47 rubrics — competency-based grading + peer/self assessment supported</span>,
    },
    submissions: {
      columns: [
        { header: 'Submission' }, { header: 'Learner' }, { header: 'Name' },
        { header: 'Type' }, { header: 'Artifact' }, { header: 'Status' },
      ],
      rows: submissionRows,
      tableHeader: <span className="text-[12px] font-semibold">Artifact submission + instructor review · in-line marking + annotate files in browser</span>,
    },
    retake: {
      columns: [
        { header: 'Retake ID' }, { header: 'Learner' }, { header: 'Name' },
        { header: 'Quiz' }, { header: 'Policy Use' }, { header: 'Status' },
      ],
      rows: retakeRows,
      tableHeader: <span className="text-[12px] font-semibold">Retake policy — 3 attempts per quiz, instructor can override</span>,
    },
  };

  return (
    <LmsDomainShell
      domainNumber="07"
      domainName="Assessment"
      contextLabel="ACADEMY / LMS — Domain 07 · Assessment & Grading"
      title="Assessment & Grading"
      description="Quiz banks, rubrics, artifact submission with instructor review, retake policy, and AI-assisted competency assessment. Every AI-assisted assessment requires mandatory human verification before it can trigger a skill signoff (Domain 8)."
      statusItems={[
        { label: 'In queue', value: '23', tone: 'warning' },
        { label: 'Avg score', value: '84%', tone: 'success' },
        { label: 'Retakes (7d)', value: '12' },
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
