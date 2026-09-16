'use client';
import * as React from 'react';
import { BellRing, Mail, MessageSquare, Send, CheckCircle2 } from 'lucide-react';
import { LmsDomainShell, StatusPill, LMS_DOMAIN_RAIL } from './LmsDomainShell';
import type { DawgNavSection } from '@/lib/types';

const TABS = [
  { id: 'inbox', label: 'Notification Inbox', count: 1247 },
  { id: 'announcements', label: 'Announcements', count: 38 },
  { id: 'preferences', label: 'Notification Preferences', count: 248 },
  { id: 'log', label: 'Delivery Log', count: 1247 },
  { id: 'reminders', label: 'Live-Session Reminders', count: 11 },
];

export function LmsCommunicationsDomain({ onNavigate }: { onNavigate: (s: DawgNavSection) => void }) {
  const [tab, setTab] = React.useState('inbox');
  const rail = LMS_DOMAIN_RAIL.map((r) => ({ ...r, current: r.id === 'lms-communications' }));

  const kpiTiles = [
    { label: 'Sent (7d)', value: '1,247', caption: 'email + SMS + push', icon: Send },
    { label: 'Delivery Rate', value: '98.4%', caption: '+0.3% vs last', tone: 'success' as const, icon: CheckCircle2 },
    { label: 'Bounced', value: '4', caption: 'investigated', tone: 'warning' as const, icon: Mail },
    { label: 'Announcements', value: '38', caption: 'active', icon: BellRing },
  ];

  const inboxRows = [
    ['N-9001', 'L-1042', 'Marcus Bell', 'Cohort milestone reached', 'email', 'Delivered', 'success'],
    ['N-9002', 'L-1044', 'Derek Omori', 'Live session reminder: 2 hrs', 'SMS', 'Delivered', 'success'],
    ['N-9003', 'L-1045', 'Aaliyah Chen', 'At-risk nudge: CRS-508', 'email', 'Delivered', 'success'],
    ['N-9004', 'L-1048', 'Aria Patel', 'Credential earned: badge', 'push', 'Delivered', 'success'],
    ['N-9005', 'L-1046', 'Jaylen Brooks', 'Guardian consent reminder', 'email', 'Bounced', 'destructive'],
  ].map(([id, learner, name, subject, channel, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-mono text-[12px]">{learner}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3 text-[12px] text-foreground/80">{subject}</td>
      <td className="p-3"><StatusPill status={channel as string} tone="info" /></td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success' | 'destructive'} /></td>
    </tr>
  ));

  const announceRows = [
    ['A-101', 'Cohort A — Module 3 starts Monday', 'Cohort-level', 'Maya Whitfield', '2025-05-15', 'Published', 'success'],
    ['A-102', 'Live lab session rescheduled', 'Cohort B', 'Maya Whitfield', '2025-05-14', 'Published', 'success'],
    ['A-103', 'Clock-hour deadline approaching (30d)', 'Platform-wide', 'Karl Voss', '2025-05-12', 'Published', 'success'],
    ['A-104', 'Credential ceremony invitation', 'Cohort A', 'Maya Whitfield', '2025-05-16', 'Draft', 'warning'],
  ].map(([id, title, scope, author, date, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{title}</td>
      <td className="p-3"><StatusPill status={scope as string} /></td>
      <td className="p-3 text-[12px] text-foreground/80">{author}</td>
      <td className="p-3 text-[12px] text-muted-foreground">{date}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success' | 'warning'} /></td>
    </tr>
  ));

  const prefRows = [
    ['L-1042', 'Marcus Bell', 'email', 'on', 'success'],
    ['L-1042', 'Marcus Bell', 'SMS', 'off', 'default'],
    ['L-1042', 'Marcus Bell', 'push', 'on', 'success'],
    ['L-1045', 'Aaliyah Chen', 'email', 'on', 'success'],
    ['L-1045', 'Aaliyah Chen', 'SMS', 'on', 'success'],
  ].map(([id, name, channel, pref, tone]) => (
    <tr key={`${id}-${channel}`} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3"><StatusPill status={channel as string} tone="info" /></td>
      <td className="p-3"><StatusPill status={pref as string} tone={tone as 'success' | 'default'} /></td>
    </tr>
  ));

  const logRows = [
    ['DL-501', 'N-9001', 'email', '2025-05-16 09:14', 'Delivered', 'success'],
    ['DL-502', 'N-9002', 'SMS', '2025-05-16 07:00', 'Delivered', 'success'],
    ['DL-503', 'N-9005', 'email', '2025-05-15 18:22', 'Bounced (mailbox full)', 'destructive'],
    ['DL-504', 'N-9003', 'email', '2025-05-15 14:08', 'Delivered', 'success'],
  ].map(([id, notif, channel, timestamp, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-mono text-[12px]">{notif}</td>
      <td className="p-3"><StatusPill status={channel as string} tone="info" /></td>
      <td className="p-3 text-[12px] text-muted-foreground">{timestamp}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success' | 'destructive'} /></td>
    </tr>
  ));

  const reminderRows = [
    ['R-01', 'C-GROOM-2025-A', 'Live lab: Safety handling', '2025-05-17 10:00', 'Reminder sent T-2h', 'success'],
    ['R-02', 'C-GROOM-2025-B', 'Live lab: Scissor technique', '2025-05-18 14:00', 'Reminder scheduled', 'success'],
    ['R-03', 'C-GROOM-2025-C', 'Orientation', '2025-06-03 09:00', 'Reminder scheduled', 'success'],
  ].map(([id, cohort, session, when, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-mono text-[12px]">{cohort}</td>
      <td className="p-3 font-medium text-foreground">{session}</td>
      <td className="p-3 text-[12px] text-muted-foreground">{when}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success'} /></td>
    </tr>
  ));

  const tabContents = {
    inbox: {
      columns: [
        { header: 'ID' }, { header: 'Learner' }, { header: 'Name' },
        { header: 'Subject' }, { header: 'Channel' }, { header: 'Status' },
      ],
      rows: inboxRows,
      tableHeader: <span className="text-[12px] font-semibold">1,247 notifications sent (7d) — learner notification inbox</span>,
    },
    announcements: {
      columns: [
        { header: 'ID' }, { header: 'Title' }, { header: 'Scope' },
        { header: 'Author' }, { header: 'Date' }, { header: 'Status' },
      ],
      rows: announceRows,
      tableHeader: <span className="text-[12px] font-semibold">38 announcements — course / cohort / platform-wide broadcast tool</span>,
    },
    preferences: {
      columns: [
        { header: 'Learner' }, { header: 'Name' }, { header: 'Channel' }, { header: 'Preference' },
      ],
      rows: prefRows,
      tableHeader: <span className="text-[12px] font-semibold">Per-learner notification preferences (email / SMS / push)</span>,
    },
    log: {
      columns: [
        { header: 'Log ID' }, { header: 'Notification' }, { header: 'Channel' },
        { header: 'Timestamp' }, { header: 'Status' },
      ],
      rows: logRows,
      tableHeader: <span className="text-[12px] font-semibold">Delivery log — channel reliability matters for this population</span>,
    },
    reminders: {
      columns: [
        { header: 'ID' }, { header: 'Cohort' }, { header: 'Session' }, { header: 'When' }, { header: 'Status' },
      ],
      rows: reminderRows,
      tableHeader: <span className="text-[12px] font-semibold">Live-session reminders — scheduled T-2h before each hands-on lab</span>,
    },
  };

  return (
    <LmsDomainShell
      domainNumber="10"
      domainName="Communication"
      contextLabel="ACADEMY / LMS — Domain 10 · Communication & Notifications"
      title="Communication & Notifications"
      description="Announcements (course / cohort / platform-wide), per-learner notification preferences with delivery log across email / SMS / push, and live-session reminders. Receives triggers from Delivery (session reminders), Progress (at-risk nudges), Support (navigator follow-up), and Skills (credential earned)."
      statusItems={[
        { label: 'Sent (7d)', value: '1,247' },
        { label: 'Delivery rate', value: '98.4%', tone: 'success' },
        { label: 'Bounced', value: '4', tone: 'warning' },
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
