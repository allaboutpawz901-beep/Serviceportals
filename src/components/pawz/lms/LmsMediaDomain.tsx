'use client';
import * as React from 'react';
import { Film, FileText, Captions, Accessibility, HardDrive } from 'lucide-react';
import { LmsDomainShell, StatusPill, LMS_DOMAIN_RAIL } from './LmsDomainShell';
import type { DawgNavSection } from '@/lib/types';

const TABS = [
  { id: 'assets', label: 'Assets', count: 1284 },
  { id: 'captions', label: 'Captions & Transcripts', count: 892 },
  { id: 'scorm', label: 'SCORM / xAPI', count: 38 },
  { id: 'accessibility', label: 'Accessibility Variants', count: 247 },
  { id: 'storage', label: 'Storage Paths', count: 4 },
];

export function LmsMediaDomain({ onNavigate }: { onNavigate: (s: DawgNavSection) => void }) {
  const [tab, setTab] = React.useState('assets');
  const rail = LMS_DOMAIN_RAIL.map((r) => ({ ...r, current: r.id === 'lms-media' }));

  const kpiTiles = [
    { label: 'Total Assets', value: '1,284', caption: '4.8 TB used', icon: Film },
    { label: 'SCORM/xAPI', value: '38', caption: 'all compliant', tone: 'success' as const, icon: FileText },
    { label: 'Captioned', value: '892', caption: '70% coverage', tone: 'warning' as const, icon: Captions },
    { label: 'Accessibility variants', value: '247', caption: 'audio desc + transcripts', icon: Accessibility },
  ];

  const assetRows = [
    ['AST-501', 'restraint-demo.mp4', 'video', 'CRS-101', '142 MB', 'Yes', 'success'],
    ['AST-502', 'scissor-grip.mp4', 'video', 'CRS-204', '88 MB', 'Yes', 'success'],
    ['AST-503', 'fear-free-handling.pdf', 'document', 'CRS-101', '3.2 MB', '—', 'default'],
    ['AST-504', 'tub-setup-checklist.docx', 'document', 'CRS-101', '412 KB', '—', 'default'],
    ['AST-505', 'cat-groom-basics.mp4', 'video', 'CRS-508', '210 MB', 'No', 'warning'],
  ].map(([id, name, type, course, size, caption, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3"><StatusPill status={type as string} tone="info" /></td>
      <td className="p-3 font-mono text-[12px]">{course}</td>
      <td className="p-3 tabular-nums">{size}</td>
      <td className="p-3"><StatusPill status={caption as string} tone={tone as 'success' | 'warning' | 'default'} /></td>
    </tr>
  ));

  const captionRows = [
    ['AST-501', 'English (orig)', 'AI-generated v2', 'Human-approved', 'success'],
    ['AST-501', 'Spanish (es-MX)', 'AI-generated v1', 'Human-approved', 'success'],
    ['AST-502', 'English (orig)', 'AI-generated v1', 'Pending review', 'warning'],
    ['AST-505', 'English (orig)', 'Not generated', 'Missing', 'destructive'],
  ].map(([asset, lang, src, status, tone]) => (
    <tr key={`${asset}-${lang}`} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{asset}</td>
      <td className="p-3 font-medium text-foreground">{lang}</td>
      <td className="p-3 text-[12px] text-foreground/80">{src}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success' | 'warning' | 'destructive'} /></td>
    </tr>
  ));

  const scormRows = [
    ['SCM-01', 'safety-basics-scorm-12.zip', 'SCORM 1.2', 'CRS-101', 'Passed', 'success'],
    ['SCM-02', 'scissor-technique-scorm-2004.zip', 'SCORM 2004', 'CRS-204', 'Passed', 'success'],
    ['SCM-03', 'xapi-cat-grooming.zip', 'xAPI', 'CRS-508', 'Passed', 'success'],
  ].map(([id, name, std, course, status, tone]) => (
    <tr key={id as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{id}</td>
      <td className="p-3 font-medium text-foreground">{name}</td>
      <td className="p-3"><StatusPill status={std as string} tone="info" /></td>
      <td className="p-3 font-mono text-[12px]">{course}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success'} /></td>
    </tr>
  ));

  const a11yRows = [
    ['AST-501', 'Audio description track', 'en', 'Human-approved', 'success'],
    ['AST-501', 'Full transcript', 'en', 'AI-generated', 'success'],
    ['AST-501', 'Full transcript', 'es-MX', 'AI-generated', 'success'],
    ['AST-502', 'Audio description track', 'en', 'Missing', 'destructive'],
  ].map(([asset, type, lang, status, tone]) => (
    <tr key={`${asset}-${type}-${lang}`} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-muted-foreground">{asset}</td>
      <td className="p-3 font-medium text-foreground">{type}</td>
      <td className="p-3">{lang}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success' | 'destructive'} /></td>
    </tr>
  ));

  const storageRows = [
    ['s3://pawz-lms-media/videos/', '847 assets · 3.2 TB', 'us-east-1', 'Active', 'success'],
    ['s3://pawz-lms-media/docs/', '384 assets · 1.2 GB', 'us-east-1', 'Active', 'success'],
    ['s3://pawz-lms-media/scorm/', '38 assets · 412 MB', 'us-east-1', 'Active', 'success'],
    ['s3://pawz-lms-submissions/', 'submissions bucket?', 'us-east-1', 'Open question', 'warning'],
  ].map(([path, count, region, status, tone]) => (
    <tr key={path as string} className="hover:bg-accent/30 transition-colors">
      <td className="p-3 font-mono text-[12px] text-foreground">{path}</td>
      <td className="p-3 text-[12px] text-foreground/80">{count}</td>
      <td className="p-3 text-[12px] text-muted-foreground">{region}</td>
      <td className="p-3"><StatusPill status={status as string} tone={tone as 'success' | 'warning'} /></td>
    </tr>
  ));

  const tabContents = {
    assets: {
      columns: [
        { header: 'ID' }, { header: 'Filename' }, { header: 'Type' },
        { header: 'Course' }, { header: 'Size', align: 'right' as const }, { header: 'Caption' },
      ],
      rows: assetRows,
      tableHeader: <span className="text-[12px] font-semibold">1,284 assets across 3 buckets</span>,
    },
    captions: {
      columns: [
        { header: 'Asset' }, { header: 'Language' }, { header: 'Source' }, { header: 'Status' },
      ],
      rows: captionRows,
      tableHeader: <span className="text-[12px] font-semibold">892 captions · 12 missing · AI-generated tracks require human approval</span>,
    },
    scorm: {
      columns: [
        { header: 'ID' }, { header: 'Package' }, { header: 'Standard' },
        { header: 'Course' }, { header: 'Validation' },
      ],
      rows: scormRows,
      tableHeader: <span className="text-[12px] font-semibold">38 SCORM/xAPI packages — all compliant</span>,
    },
    accessibility: {
      columns: [
        { header: 'Asset' }, { header: 'Variant' }, { header: 'Lang' }, { header: 'Status' },
      ],
      rows: a11yRows,
      tableHeader: <span className="text-[12px] font-semibold">247 accessibility variants — WCAG AA target</span>,
    },
    storage: {
      columns: [
        { header: 'Path' }, { header: 'Contents' }, { header: 'Region' }, { header: 'Status' },
      ],
      rows: storageRows,
      tableHeader: <span className="text-[12px] font-semibold">Open question: should submissions live in own bucket-tracking table?</span>,
    },
  };

  return (
    <LmsDomainShell
      domainNumber="03"
      domainName="Media Asset"
      contextLabel="ACADEMY / LMS — Domain 03 · Media & Content Assets"
      title="Media & Content Assets"
      description="Video, audio, document, and SCORM file references with captions, transcripts, and accessibility variants. Attached to content blocks during authoring, embedded as players/readers inside lessons, attached to announcements, and used for artifact submission storage."
      statusItems={[
        { label: 'Assets', value: '1,284' },
        { label: 'SCORM', value: '38', tone: 'success' },
        { label: 'Missing captions', value: '12', tone: 'warning' },
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
