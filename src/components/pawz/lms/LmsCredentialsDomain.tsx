'use client';
import * as React from 'react';
import { Award, CheckCircle2, ShieldCheck, Search, BookOpen } from 'lucide-react';
import { LmsDomainShell, StatusPill, LMS_DOMAIN_RAIL } from './LmsDomainShell';
import type { DawgNavSection } from '@/lib/types';

const TABS = [
  { id: 'domains', label: 'Skill Domains', count: 17 },
  { id: 'skills', label: 'Atomic Skills', count: 384 },
  { id: 'targets', label: 'Course Skill Targets', count: 247 },
  { id: 'signoffs', label: 'Skill Signoffs', count: 1847 },
  { id: 'credentials', label: 'Credentials & Badges', count: 142 },
  { id: 'verification', label: 'Verification Codes', count: 63 },
];

export function LmsCredentialsDomain({ onNavigate }: { onNavigate: (s: DawgNavSection) => void }) {
  const [tab, setTab] = React.useState('domains');
  const rail = LMS_DOMAIN_RAIL.map((r) => ({ ...r, current: r.id === 'lms-credentials' }));

  const kpiTiles = [
    { label: 'Credentials Issued', value: '142', caption: '+12 this month', tone: 'success' as const, icon: Award },
    { label: 'Skill Signoffs', value: '1,847', caption: 'human-verified', icon: CheckCircle2 },
    { label: 'Verifications (30d)', value: '63', caption: 'employers + state board', icon: Search },
    { label: 'Skill Domains', value: '17', caption: 'durable categories', icon: BookOpen },
  ];

  const domainRows = [
    ['SD-01', 'Safety & Handling', '38 skills', 'intro+practice+master', 'success'],
    ['SD-02', 'Styling & Technique', '62 skills', 'intro+practice+master', 'success'],
    ['SD-03', 'Health & First Aid', '24 skills', 'intro+practice', 'success'],
    ['SD-04', 'Operations & Business', '41 skills', 'intro+practice+master', 'success'],
    ['SD-05', 'Whole-Human / Life Skills', '38 skills', 'intro+practice', 'success'],
  ].map(([id, name, count, levels, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 text-[12px] text-foreground/80">{count}</td>
      <td className="p-3 text-[12px] text-foreground/80">{levels}</td>
      <td className="p-3"><StatusPill status="Active" tone={tone as 'success'} /></td>
    </tr>
  ));

  const skillRows = [
    ['SK-001', 'Scruff restraint (fear-free)', 'SD-01', 'atomic', 'intro+practice+master', 'success'],
    ['SK-014', 'Scissor over comb technique', 'SD-02', 'atomic', 'intro+practice+master', 'success'],
    ['SK-038', 'Clipper guard selection', 'SD-02', 'atomic', 'intro+practice', 'success'],
    ['SK-101', 'Tub-side safety check', 'SD-01', 'atomic', 'intro', 'success'],
  ].map(([id, name, domain, kind, levels, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 font-mono text-[12px]">{domain}</td>
      <td className="p-3"><StatusPill status={kind as string} /></td>
      <td className="p-3 text-[12px] text-foreground/80">{levels}</td>
      <td className="p-3"><StatusPill status="Reusable" tone={tone as 'success'} /></td>
    </tr>
  ));

  const targetRows = [
    ['CRS-101', 'SK-001', 'introduced', '—', 'success'],
    ['CRS-101', 'SK-014', 'practiced', '—', 'success'],
    ['CRS-204', 'SK-014', 'mastered', '—', 'success'],
    ['CRS-508', 'SK-038', 'introduced', '—', 'success'],
  ].map(([course, skill, level, _, tone]) => (
    <tr key={`${course}-${skill}`} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px]">{course}</td>
      <td className="p-3 font-mono text-[12px]">{skill}</td>
      <td className="p-3"><StatusPill status={level as string} tone={level === 'mastered' ? 'success' : 'info'} /></td>
      <td className="p-3 text-[12px] text-muted-foreground">Open question: confirm domain/skill/target-level split</td>
      <td className="p-3"><StatusPill status="Mapped" tone={tone as 'success'} /></td>
    </tr>
  ));

  const signoffRows = [
    ['SO-9123', 'L-1042', 'Marcus Bell', 'SK-014', 'Maya Whitfield', '2025-05-12', 'success'],
    ['SO-9124', 'L-1045', 'Aaliyah Chen', 'SK-038', 'AI-verified + Maya', '2025-05-14', 'success'],
    ['SO-9125', 'L-1044', 'Derek Omori', 'SK-001', 'Maya Whitfield', '2025-05-10', 'success'],
  ].map(([id, learner, name, skill, verifier, date, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-mono text-[12px]">{learner}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 font-mono text-[12px]">{skill}</td>
      <td className="p-3 text-[12px] text-foreground/80">{verifier}</td>
      <td className="p-3 text-[12px] text-muted-foreground">{date}</td>
      <td className="p-3"><StatusPill status="Signed" tone={tone as 'success'} /></td>
    </tr>
  ));

  const credRows = [
    ['CR-2001', 'L-1045', 'Aaliyah Chen', 'Foundation Groomer Diploma', '2025-05-14', 'Issued', 'success'],
    ['CR-2002', 'L-1042', 'Marcus Bell', 'Safety & Handling Badge', '2025-05-12', 'Issued', 'success'],
    ['CR-2003', 'L-1048', 'Aria Patel', 'Whole-Human Life Skills Badge', '2025-05-15', 'Pending signoff', 'warning'],
  ].map(([id, learner, name, cred, date, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-mono text-[12px]">{learner}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 text-[12px] text-foreground/80">{cred}</td>
      <td className="p-3 text-[12px] text-muted-foreground">{date}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success' | 'warning'} /></td>
    </tr>
  ));

  const verifRows = [
    ['VRF-8842', 'CR-2001', 'PetSmart HR', '2025-05-16', 'Valid', 'success'],
    ['VRF-8843', 'CR-2002', 'State Board of Cosmetology', '2025-05-15', 'Valid', 'success'],
    ['VRF-8844', 'CR-2003', '—', '—', 'Pending issuance', 'warning'],
  ].map(([id, cred, verifier, date, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-mono text-[12px]">{cred}</td>
      <td className="p-3 font-medium text-foreground">{verifier}</td>
      <td className="p-3 text-[12px] text-muted-foreground">{date}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success' | 'warning'} /></td>
    </tr>
  ));

  const tabContents = {
    domains: {
      columns: [
        { header: 'ID' }, { header: 'Skill Domain' }, { header: 'Skills', align: 'right' as const },
        { header: 'Levels' }, { header: 'State' },
      ],
      rows: domainRows,
      tableHeader: <span className="text-[12px] font-semibold">17 durable skill domains (target: 15-20)</span>,
    },
    skills: {
      columns: [
        { header: 'ID' }, { header: 'Skill' }, { header: 'Domain' },
        { header: 'Kind' }, { header: 'Levels' }, { header: 'State' },
      ],
      rows: skillRows,
      tableHeader: <span className="text-[12px] font-semibold">384 atomic reusable skills (low hundreds target)</span>,
    },
    targets: {
      columns: [
        { header: 'Course' }, { header: 'Skill' }, { header: 'Level' }, { header: 'Note' }, { header: 'State' },
      ],
      rows: targetRows,
      tableHeader: <span className="text-[12px] font-semibold">course_skill_targets — introduced / practiced / mastered</span>,
    },
    signoffs: {
      columns: [
        { header: 'ID' }, { header: 'Learner' }, { header: 'Name' },
        { header: 'Skill' }, { header: 'Verifier' }, { header: 'Date' }, { header: 'State' },
      ],
      rows: signoffRows,
      tableHeader: <span className="text-[12px] font-semibold">1,847 skill signoffs — AI-verified signoffs require mandatory human verification</span>,
    },
    credentials: {
      columns: [
        { header: 'ID' }, { header: 'Learner' }, { header: 'Name' },
        { header: 'Credential' }, { header: 'Date' }, { header: 'Status' },
      ],
      rows: credRows,
      tableHeader: <span className="text-[12px] font-semibold">142 credentials issued · Mozilla Open Badges compatible</span>,
    },
    verification: {
      columns: [
        { header: 'ID' }, { header: 'Credential' }, { header: 'Verifier' }, { header: 'Date' }, { header: 'Status' },
      ],
      rows: verifRows,
      tableHeader: <span className="text-[12px] font-semibold">Public verification page — 63 verifications (30d)</span>,
    },
  };

  return (
    <LmsDomainShell
      domainNumber="08"
      domainName="Credential"
      contextLabel="ACADEMY / LMS — Domain 08 · Skills & Credential Registry"
      title="Skills & Credential Registry"
      description="Skill domains (~15-20 durable categories) → atomic skills (low hundreds) → course_skill_targets (introduced/practiced/mastered) → skill_signoffs → credentials. A passed assessment triggers a skill signoff; accumulated signoffs unlock credentials. Credentials have public verification codes."
      statusItems={[
        { label: 'Issued', value: '142', tone: 'success' },
        { label: 'Signoffs', value: '1,847' },
        { label: 'Verifications (30d)', value: '63' },
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
