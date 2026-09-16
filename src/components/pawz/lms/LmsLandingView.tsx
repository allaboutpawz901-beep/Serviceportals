'use client';

import * as React from 'react';
import {
  GraduationCap, ShieldCheck, PenLine, Film, Layers, Sparkles,
  Gauge, ClipboardCheck, Award, HeartHandshake, BellRing,
  FileCheck, ArrowRightLeft, Bot, ArrowRight, Users, BookOpen,
  TrendingUp, AlertTriangle, CheckCircle2, Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/pawz/_shared/PageHeader';
import type { DawgNavSection } from '@/lib/types';

interface LmsDomainCard {
  id: DawgNavSection;
  number: string;
  name: string;
  shortName: string;
  description: string;
  icon: React.ElementType;
  owns: string[];
  surfacesAs: string[];
  stats: { label: string; value: string; tone?: 'success' | 'warning' | 'default' }[];
  accent: string;
}

const DOMAINS: LmsDomainCard[] = [
  {
    id: 'lms-identity',
    number: '01',
    name: 'Identity & Access',
    shortName: 'Identity',
    description: 'Shared tenant layer + LMS-scoped roles, minor/guardian consent, cross-tenant staff grant.',
    icon: ShieldCheck,
    owns: ['LMS role per (user_id, tenant_id)', 'Minor + guardian consent flags', 'LMS-only session state', 'Cross-tenant staff grant'],
    surfacesAs: ['Login', 'Role-based nav', 'Org / tenant switcher', 'Cross-tenant caseload view'],
    stats: [
      { label: 'Active learners', value: '248' },
      { label: 'Instructors', value: '14', tone: 'success' },
      { label: 'Pending consent', value: '6', tone: 'warning' },
    ],
    accent: 'from-teal-500/10 to-teal-500/5',
  },
  {
    id: 'lms-curriculum',
    number: '02',
    name: 'Curriculum Authoring',
    shortName: 'Curriculum',
    description: 'Pathways, programs, modules, lessons, content blocks with connect/learn/see-it/do-it/check phases.',
    icon: PenLine,
    owns: ['Pathways & programs', 'Modules & lessons', 'Content blocks (text, structured steps)', 'Prerequisites', 'Curriculum versioning'],
    surfacesAs: ['Instructor / curriculum-admin authoring tool'],
    stats: [
      { label: 'Pathways', value: '9' },
      { label: 'Courses', value: '47', tone: 'success' },
      { label: 'Drafts', value: '5', tone: 'warning' },
    ],
    accent: 'from-amber-500/10 to-amber-500/5',
  },
  {
    id: 'lms-media',
    number: '03',
    name: 'Media & Content Assets',
    shortName: 'Media',
    description: 'Video, audio, document, SCORM file references with captions, transcripts, accessibility variants.',
    icon: Film,
    owns: ['Video / audio / document / SCORM references', 'Captions & transcripts', 'Accessibility variants', 'Storage paths'],
    surfacesAs: ['Embedded players / readers inside a lesson'],
    stats: [
      { label: 'Assets', value: '1,284' },
      { label: 'SCORM', value: '38', tone: 'success' },
      { label: 'Missing captions', value: '12', tone: 'warning' },
    ],
    accent: 'from-rose-500/10 to-rose-500/5',
  },
  {
    id: 'lms-delivery',
    number: '04',
    name: 'Delivery & Enrollment',
    shortName: 'Delivery',
    description: 'Cohorts, program enrollments, pacing schedule, per-learner delivery-mode selection (AI-guided vs self-paced).',
    icon: Layers,
    owns: ['Cohorts (org-type tenants)', 'Program enrollments', 'Pacing schedule', 'Delivery-mode selection per learner', 'Live session scheduling'],
    surfacesAs: ['Learner course list / dashboard', 'Instructor cohort roster'],
    stats: [
      { label: 'Active cohorts', value: '11' },
      { label: 'Enrollments', value: '248', tone: 'success' },
      { label: 'AI-guided mode', value: '62%' },
    ],
    accent: 'from-indigo-500/10 to-indigo-500/5',
  },
  {
    id: 'lms-ai-teaching',
    number: '05',
    name: 'AI Teaching & Personalization',
    shortName: 'AI Teaching',
    description: 'LeashGuide chat, consent gate, turn-by-turn pedagogy log, personalization state, human escalation routing.',
    icon: Sparkles,
    owns: ['Consent gate', 'AI teaching sessions', 'Turn-by-turn interaction log', 'Personalization state', 'Human escalation routing'],
    surfacesAs: ['LeashGuide chat / tutor interface', 'Escalation banner routing to a human'],
    stats: [
      { label: 'Active sessions', value: '34' },
      { label: 'Escalations (7d)', value: '8', tone: 'warning' },
      { label: 'Consent rate', value: '91%' },
    ],
    accent: 'from-fuchsia-500/10 to-fuchsia-500/5',
  },
  {
    id: 'lms-progress',
    number: '06',
    name: 'Progress & Completion Engine',
    shortName: 'Progress',
    description: 'Mode-agnostic lesson/module progress + audited clock-hour ledger + formal completion rule per course.',
    icon: Gauge,
    owns: ['Lesson / module progress', 'Audited clock-hour ledger', 'Formal completion rule per course'],
    surfacesAs: ['Progress bars', '"X of Y clock hours complete"', 'Instructor completion dashboard'],
    stats: [
      { label: 'Clock hours (MTD)', value: '4,182' },
      { label: 'Completions', value: '37', tone: 'success' },
      { label: 'At-risk', value: '14', tone: 'warning' },
    ],
    accent: 'from-emerald-500/10 to-emerald-500/5',
  },
  {
    id: 'lms-assessment',
    number: '07',
    name: 'Assessment & Grading',
    shortName: 'Assessment',
    description: 'Quiz banks, rubrics, artifact submission + instructor review, retake policy, AI-assisted competency (human-verified).',
    icon: ClipboardCheck,
    owns: ['Quiz / question bank', 'Rubrics', 'Artifact submission + instructor review', 'Retake policy', 'AI-assisted competency assessment'],
    surfacesAs: ['Learner submission flow', 'Instructor grading queue'],
    stats: [
      { label: 'In grading queue', value: '23', tone: 'warning' },
      { label: 'Quizzes', value: '184' },
      { label: 'Avg score', value: '84%' },
    ],
    accent: 'from-cyan-500/10 to-cyan-500/5',
  },
  {
    id: 'lms-credentials',
    number: '08',
    name: 'Skills & Credential Registry',
    shortName: 'Credentials',
    description: 'Skill domains, atomic skills, course skill targets, skill signoffs, credentials / diplomas / badges, verification codes.',
    icon: Award,
    owns: ['skill_domains (~15-20)', 'skills (atomic)', 'course_skill_targets', 'skill_signoffs', 'Credentials / diplomas / badges', 'Verification codes'],
    surfacesAs: ['Learner skill / credential wallet', 'Public verification page'],
    stats: [
      { label: 'Credentials issued', value: '142', tone: 'success' },
      { label: 'Skill signoffs', value: '1,847' },
      { label: 'Verifications (30d)', value: '63' },
    ],
    accent: 'from-violet-500/10 to-violet-500/5',
  },
  {
    id: 'lms-support',
    number: '09',
    name: 'Whole-Human Support',
    shortName: 'Support',
    description: 'Support referrals, safety incidents, workforce outcomes, benefits-cliff coaching, navigator caseload.',
    icon: HeartHandshake,
    owns: ['Support referrals (housing, transport, benefits, legal, childcare)', 'Safety incidents', 'Workforce outcomes', 'Benefits-cliff coaching records', 'Navigator caseload'],
    surfacesAs: ['Private navigator caseload view', "Learner's own referrals view"],
    stats: [
      { label: 'Open referrals', value: '47', tone: 'warning' },
      { label: 'Safety incidents', value: '3', tone: 'warning' },
      { label: 'Placed in jobs', value: '29', tone: 'success' },
    ],
    accent: 'from-pink-500/10 to-pink-500/5',
  },
  {
    id: 'lms-communications',
    number: '10',
    name: 'Communication & Notifications',
    shortName: 'Comms',
    description: 'Announcements, notification preferences + delivery log (email/SMS/push), live-session reminders.',
    icon: BellRing,
    owns: ['Announcements (course/cohort)', 'Notification preferences + delivery log', 'Live-session reminders'],
    surfacesAs: ['Learner notification inbox', 'Instructor broadcast tool'],
    stats: [
      { label: 'Sent (7d)', value: '1,247' },
      { label: 'Delivery rate', value: '98.4%', tone: 'success' },
      { label: 'Bounced', value: '4', tone: 'warning' },
    ],
    accent: 'from-orange-500/10 to-orange-500/5',
  },
  {
    id: 'lms-compliance',
    number: '11',
    name: 'Compliance & Reporting',
    shortName: 'Compliance',
    description: 'Clock-hour audit ledger view, funder/grant outcome reports, platform-wide audit log, minor-consent guardrail.',
    icon: FileCheck,
    owns: ['Clock-hour audit ledger view', 'Funder / grant outcome report generation', 'Platform-wide audit log', 'Minor-consent guardrail enforcement'],
    surfacesAs: ['Compliance officer / org-admin report exports'],
    stats: [
      { label: 'Audit events (7d)', value: '8,492' },
      { label: 'Reports due', value: '2', tone: 'warning' },
      { label: 'Minor guardrails', value: '12' },
    ],
    accent: 'from-lime-500/10 to-lime-500/5',
  },
  {
    id: 'lms-bridge',
    number: '12',
    name: 'Platform Bridge / Conversion',
    shortName: 'Bridge',
    description: 'Real FK-backed conversion record, free post-graduation software license grant, salon stub sync.',
    icon: ArrowRightLeft,
    owns: ['Real FK-backed conversion record', 'Free post-graduation software license grant', 'Salon "stub" syncs into commerce_branches / crm_customers'],
    surfacesAs: ['"You\'re eligible for your free Leashed.io license" moment', 'Platform-side "Welcome, here\'s your credential" moment'],
    stats: [
      { label: 'Conversions', value: '38', tone: 'success' },
      { label: 'Licenses granted', value: '34' },
      { label: 'Pending opt-in', value: '4', tone: 'warning' },
    ],
    accent: 'from-sky-500/10 to-sky-500/5',
  },
  {
    id: 'lms-ai-instructor',
    number: '13',
    name: 'AI Instructor Skills',
    shortName: 'AI Instructor',
    description: 'AI instructor persona & voice, AI-generated lecture delivery, content drafting, assessment generation, roleplay simulation.',
    icon: Bot,
    owns: ['AI instructor persona & voice', 'AI-generated lecture delivery', 'AI-assisted content drafting', 'AI-assisted assessment generation', 'AI-assisted roleplay simulation', 'AI session telemetry (pedagogy only)'],
    surfacesAs: ['LeashGuide AI instructor interface', 'Instructor authoring assistant panel', 'AI-generated draft review queue (human approval required)'],
    stats: [
      { label: 'Drafts pending review', value: '17', tone: 'warning' },
      { label: 'Lectures generated', value: '248' },
      { label: 'Human-approved', value: '94%' },
    ],
    accent: 'from-purple-500/10 to-purple-500/5',
  },
];

export interface LmsLandingViewProps {
  onNavigate: (section: DawgNavSection) => void;
}

export function LmsLandingView({ onNavigate }: LmsLandingViewProps) {
  const totalLearners = 248;
  const activeCohorts = 11;
  const clockHoursMTD = 4182;
  const credentialsIssued = 142;

  return (
    <div className="flex flex-col w-full">
      <PageHeader
        contextLabel="ACADEMY / LMS — All About Pawz Grooming Academy"
        statusItems={[
          { label: 'Cohorts active', value: `${activeCohorts}`, tone: 'success' },
          { label: 'Learners', value: `${totalLearners}` },
          { label: 'Clock hours (MTD)', value: clockHoursMTD.toLocaleString() },
          { label: 'Credentials issued', value: `${credentialsIssued}`, tone: 'success' },
        ]}
        title="Grooming Academy"
        badge={`${DOMAINS.length} domains`}
        description="Hybrid vocational + whole-human learning platform. Coursework is authored once, taught by AI for opt-in learners and directly consumable for self-paced learners, both feeding one audited clock-hour ledger."
        actions={
          <button
            onClick={() => onNavigate('lms-compliance')}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-md bg-primary text-primary-foreground text-[13px] font-semibold transition-colors hover:bg-primary/90 cursor-pointer"
          >
            <FileCheck className="size-4" />
            Compliance Center
          </button>
        }
      />

      {/* Quick KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-6 py-4 border-b border-border bg-muted/20">
        {[
          { label: 'Active Learners', value: totalLearners, icon: Users, tone: 'success' },
          { label: 'Live Courses', value: 47, icon: BookOpen, tone: 'default' },
          { label: 'Clock Hours (MTD)', value: clockHoursMTD.toLocaleString(), icon: Clock, tone: 'default' },
          { label: 'Completions (MTD)', value: 37, icon: TrendingUp, tone: 'success' },
        ].map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3 shadow-card">
              <span className={cn(
                'inline-flex size-10 items-center justify-center rounded-lg',
                kpi.tone === 'success' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
              )}>
                <Icon className="size-5" />
              </span>
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{kpi.label}</span>
                <span className="text-xl font-display font-semibold tabular-nums text-foreground">{kpi.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Domain grid — all 13 domains prominent */}
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Learning Domains</h2>
          <span className="text-[12px] text-muted-foreground">Click any domain to drill into its workspace</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {DOMAINS.map((domain) => {
            const Icon = domain.icon;
            return (
              <button
                key={domain.id}
                onClick={() => onNavigate(domain.id)}
                className="group text-left bg-card border border-border rounded-xl shadow-card overflow-hidden transition-all duration-150 hover:-translate-y-0.5 hover:shadow-card-md hover:border-primary/30 cursor-pointer flex flex-col"
              >
                {/* Card header with gradient accent */}
                <div className={cn('relative p-5 bg-gradient-to-br', domain.accent, 'border-b border-border')}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="inline-flex size-10 items-center justify-center rounded-lg bg-background border border-border text-foreground shadow-card shrink-0">
                        <Icon className="size-5" />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] font-bold text-muted-foreground">{domain.number}</span>
                          <h3 className="font-display text-base font-semibold text-foreground truncate">{domain.name}</h3>
                        </div>
                        <p className="text-[12px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">{domain.description}</p>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 divide-x divide-border border-b border-border bg-muted/20">
                  {domain.stats.map((stat, i) => (
                    <div key={i} className="px-3 py-2.5 text-center">
                      <div className={cn(
                        'text-base font-display font-semibold tabular-nums',
                        stat.tone === 'success' && 'text-success',
                        stat.tone === 'warning' && 'text-warning',
                        !stat.tone && 'text-foreground'
                      )}>
                        {stat.value}
                      </div>
                      <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mt-0.5">{stat.label}</div>
                    </div>
                  ))}
                </div>

                {/* Owns + Surfaces */}
                <div className="p-4 flex-1 flex flex-col gap-3">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Owns</div>
                    <ul className="space-y-1">
                      {domain.owns.slice(0, 3).map((item, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[12px] text-foreground/80">
                          <CheckCircle2 className="size-3 text-success shrink-0 mt-0.5" />
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">Surfaces As</div>
                    <p className="text-[12px] text-foreground/80 leading-relaxed">{domain.surfacesAs.join(' · ')}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cross-cutting principles strip */}
      <div className="px-6 pb-8">
        <div className="bg-card border border-border rounded-xl shadow-card p-5">
          <h3 className="font-display text-base font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="size-4 text-warning" />
            Cross-Cutting Locked Decisions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { title: 'One Postgres DB', body: 'Shared tenant identity across LMS + grooming platform. LMS gets its own schema (lms.*). Real FKs across schemas.' },
              { title: 'Licensure is Real', body: 'Grooming clock-hours are audit-grade: immutable, computed, human-verified before any credit is issued.' },
              { title: 'Teaching is Hybrid', body: 'Coursework authored once. AI teaches from authored content for opt-in learners. Same content directly consumable for self-paced.' },
              { title: 'Whole-Human Mission', body: 'Behavioral / life-skills content is load-bearing (Domain 9). Not an afterthought.' },
            ].map((item, i) => (
              <div key={i} className="border border-border rounded-lg p-3 bg-background">
                <div className="text-[12px] font-semibold text-foreground mb-1">{item.title}</div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
