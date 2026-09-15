'use client';

import React, { useState } from 'react';
import { 
  Shield, 
  Terminal, 
  Users, 
  Check, 
  Lock, 
  Eye, 
  Edit2, 
  Trash2, 
  Key, 
  EyeOff, 
  HelpCircle,
  FileJson,
  Maximize2,
  CheckSquare,
  Square,
  Save
} from 'lucide-react';

interface ScreenProps {
  onNavigateScreen?: (screenId: string) => void;
  selectedLocation?: string;
  onSelectLocation?: (loc: string) => void;
}

interface Permission {
  id: string;
  module: string;
  desc: string;
  view: boolean;
  edit: boolean;
  del: boolean;
  pii: boolean | 'masked';
  editLabel?: string;
  viewLabel?: string;
  piiLabel?: string;
  restricted?: boolean;
  hidden?: boolean;
  locked?: boolean;
}

export const UsersStaffRolesScreen: React.FC<ScreenProps> = ({
  onNavigateScreen,
  selectedLocation = 'FRISCO HQ (MAIN LOC)',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'roster' | 'magic' | 'checklist' | 'audit'>('checklist');
  const [activeTier, setActiveTier] = useState<'tier1' | 'tier2' | 'tier3' | 'tier4' | 'tier5' | 'tier6'>('tier4');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const [permissions, setPermissions] = useState<Permission[]>([
    { id: '1', module: 'Daily Grooming Dashboard', desc: 'Overview of assigned stations, daily kennel load, and dog queue status', view: true, edit: false, del: false, pii: false },
    { id: '2', module: 'Appointments Queue & Calendar', desc: 'View schedule; groomer reassigns styling slot and updates appointment status', view: true, edit: true, del: false, pii: false, editLabel: 'YES [STATUS]' },
    { id: '3', module: 'Live 21-Stage Kanban Pipeline', desc: 'Bath, Blow Dry, Dematting, Scissor Finish, Quality Inspection transitions', view: true, edit: true, del: false, pii: false, editLabel: 'YES [STAGE]' },
    { id: '4', module: 'Time Tracking & Clock In/Out', desc: 'Personal shift punch registry and grooming station timer capture', view: true, edit: true, del: false, pii: false, editLabel: 'YES [PUNCH]' },
    { id: '5', module: 'Customers & Canine Health Records', desc: 'Canine coat condition, behavioral flags, vet vaccines. PII address/phone masked.', view: true, edit: true, del: false, pii: 'masked', viewLabel: 'YES [PET ONLY]', editLabel: 'YES [NOTES/IMG]' },
    { id: '6', module: 'Walk-in Register & POS', desc: 'Retail cash drawer, swipe hardware, tips distribution, and walk-in invoice tenders', view: false, edit: false, del: false, pii: false, restricted: true },
    { id: '7', module: 'Retail Products & Backbar Inventory', desc: 'Check stock of shampoos, specialty conditioners, dematting sprays, and ear cleaners', view: true, edit: false, del: false, pii: 'masked', viewLabel: 'YES [STOCK]', piiLabel: 'NO [COST MASKED]' },
    { id: '8', module: 'Purchase Orders & Vendor Receiving', desc: 'Wholesale supplier agreements, freight receiving dock, and inventory invoicing', view: false, edit: false, del: false, pii: false, hidden: true },
    { id: '9', module: 'Order Fulfillment & Outbound Shipping', desc: 'E-commerce order dispatch, carrier label generation, and logistics manifest', view: false, edit: false, del: false, pii: false, hidden: true },
    { id: '10', module: 'Personal Commission & Tip Ledger', desc: 'Employee-specific styling split percentages, cash tip payouts, and payroll cycle review', view: true, edit: false, del: false, pii: true, viewLabel: 'YES [OWN]', piiLabel: 'YES [SELF]' },
    { id: '11', module: 'Salon Invoices & Aging Ledger', desc: 'Storewide accounts receivable, delinquent accounts, batch tax breakdowns', view: false, edit: false, del: false, pii: false, restricted: true },
    { id: '12', module: 'Escrow Deposits & Forfeitures', desc: 'Pre-booking holiday deposits, no-show forfeitures, balance releases', view: false, edit: false, del: false, pii: false, restricted: true },
    { id: '13', module: 'Stripe Gateway & Direct Bank Payouts', desc: 'Live merchant token configuration, ACH transfer schedules, gateway webhooks', view: false, edit: false, del: false, pii: false, restricted: true },
    { id: '14', module: 'Salon Configuration & Business Rules Engine', desc: 'Organization entity, tax matrices, Twilio SMS webhooks, and Booking Wizard rules', view: false, edit: false, del: false, pii: false, locked: true },
  ]);

  const togglePermission = (id: string, field: 'view' | 'edit' | 'del' | 'pii') => {
    setPermissions(prev => prev.map(p => {
      if (p.id === id) {
        if (p.restricted || p.hidden || p.locked) return p;
        if (field === 'pii') {
          const nextVal = p.pii === true ? false : p.pii === 'masked' ? true : 'masked';
          return { ...p, pii: nextVal };
        }
        const boolField = field as 'view' | 'edit' | 'del';
        return { ...p, [boolField]: !p[boolField] };
      }
      return p;
    }));
    showToast('MUTATED PERMISSION CELL - STAGED FOR REVISION LEDGER');
  };

  return (
    <div className="w-full bg-card text-foreground font-sans antialiased text-xs">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-3 border border-white z-50 flex items-center gap-3 tabular-nums text-xs shadow-2xl">
          <span className="w-2 h-2 bg-card animate-pulse"></span>
          <span className="uppercase font-bold tracking-wider">{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="ml-2 text-white hover:opacity-70 cursor-pointer">✕</button>
        </div>
      )}

      {/* TOP GLOBAL ADMIN SUB-NAVIGATION */}
      <div className="w-full bg-card border-b border-border">
        {/* Level 1 Settings Tabs */}
        <div className="flex items-center overflow-x-auto border-b border-border bg-muted/40 px-6">
          <button onClick={() => onNavigateScreen?.('overview')} className="px-4 py-3 tabular-nums font-bold text-muted-foreground hover:text-foreground whitespace-nowrap">
            01 OVERVIEW
          </button>
          <button onClick={() => onNavigateScreen?.('org-multiloc')} className="px-4 py-3 tabular-nums font-bold text-muted-foreground hover:text-foreground whitespace-nowrap">
            02 ORGANIZATION
          </button>
          <button onClick={() => showToast('VIEWING USERS & ACCESS')} className="px-4 py-3 tabular-nums bg-card text-foreground font-bold  border-border whitespace-nowrap flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-black"></span>
            03 USERS &amp; ACCESS [ACTIVE]
          </button>
          <button onClick={() => onNavigateScreen?.('booking-ops')} className="px-4 py-3 tabular-nums font-bold text-muted-foreground hover:text-foreground whitespace-nowrap">
            04 BOOKING &amp; OPS
          </button>
          <button onClick={() => onNavigateScreen?.('services-pricing')} className="px-4 py-3 tabular-nums font-bold text-muted-foreground hover:text-foreground whitespace-nowrap">
            05 SERVICES &amp; PRICING
          </button>
          <button onClick={() => onNavigateScreen?.('revenue-stripe')} className="px-4 py-3 tabular-nums font-bold text-muted-foreground hover:text-foreground whitespace-nowrap">
            06 PAYMENTS
          </button>
          <button onClick={() => onNavigateScreen?.('cms-wizard')} className="px-4 py-3 tabular-nums font-bold text-muted-foreground hover:text-foreground whitespace-nowrap">
            07 WEBSITE
          </button>
        </div>

        {/* Level 2 Contextual Pills Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-2 bg-card gap-2 border-b border-border">
          <div className="flex items-center gap-2 overflow-x-auto tabular-nums">
            <button 
              onClick={() => { setActiveSubTab('roster'); showToast('ROSTER TAB'); }}
              className={`px-3 py-1 text-xs border border-border hover:bg-muted/40 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'roster' ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-foreground'
              }`}
            >
              STAFF ROSTER [24]
            </button>
            <button 
              onClick={() => { setActiveSubTab('magic'); showToast('Invites & tokens tab'); }}
              className={`px-3 py-1 text-xs border border-border hover:bg-muted/40 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'magic' ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-foreground'
              }`}
            >
              EMAIL INVITES &amp; TOKENS
            </button>
            <button 
              onClick={() => { setActiveSubTab('checklist'); showToast('ROLE MATRIX ACTIVE'); }}
              className={`px-3 py-1 text-xs font-bold border border-border whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeSubTab === 'checklist' ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-foreground'
              }`}
            >
              <CheckSquare className="w-3.5 h-3.5" />
              ROLE CHECKLIST &amp; PERMISSIONS [ACTIVE]
            </button>
            <button 
              onClick={() => { setActiveSubTab('audit'); showToast('AUDIT LOGS TAB'); }}
              className={`px-3 py-1 text-xs border border-border hover:bg-muted/40 whitespace-nowrap cursor-pointer ${
                activeSubTab === 'audit' ? 'bg-primary text-primary-foreground' : 'bg-muted/40 text-foreground'
              }`}
            >
              AUDIT &amp; ACCESS LOGS
            </button>
          </div>
          <div className="hidden lg:flex items-center gap-2 tabular-nums text-[10px]">
            <span>POLICY REV: <strong className="text-foreground font-bold">SEC-4029-B</strong></span>
            <span className="bg-success/10 border border-success text-success px-2 py-0.5 font-bold">STRICT ENFORCEMENT</span>
          </div>
        </div>
      </div>

      {/* WORKSPACE CANVAS */}
      <div className="p-6 space-y-6">
        {/* Executive Header Banner */}
        <div className="border border-border bg-card p-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-1 max-w-3xl">
              <h2 className="text-xl font-bold uppercase tracking-tight text-foreground">
                Staff Roles &amp; Permissions Matrix
              </h2>
              <p className="text-muted-foreground leading-relaxed font-sans text-xs">
                Configure module access and action permissions for each staff tier (Managers, Groomers, Bathers, Front Desk, and Assistants).
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => showToast('Role matrix reset to defaults')} className="px-3 py-1.5 bg-card hover:bg-muted/30 border border-border font-bold uppercase cursor-pointer text-xs">
                Reset Defaults
              </button>
              <button 
                onClick={() => showToast('Permissions saved successfully')}
                className="px-4 py-1.5 bg-black hover:bg-muted text-white font-bold uppercase flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </div>
          </div>
        </div>

        {/* Role Tier Horizontal Selector Bar */}
        <div className="border border-border bg-card">
          <div className="px-4 py-2 bg-muted/40 border-b border-border flex items-center justify-between tabular-nums text-[11px]">
            <span className="font-bold text-foreground uppercase">SELECT ACTIVE TIER TO CONFIGURE / 06 TIERS DEFINED</span>
            <span className="text-muted-foreground">SCOPE: TENANT_ALL_FACILITIES</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-x divide-y lg:divide-y-0 divide-black bg-muted/30">
            {[
              { id: 'tier1', code: 'TIER_01', title: 'Super Admin', desc: 'FULL ROOT ACCESS', bg: 'bg-black' },
              { id: 'tier2', code: 'TIER_02', title: 'General Manager', desc: 'BRANCH LEVEL OP', bg: 'bg-muted/300' },
              { id: 'tier3', code: 'TIER_03', title: 'Lead Groomer', desc: 'MASTER STYLIST', bg: 'bg-muted' },
              { id: 'tier4', code: 'TIER_04', title: 'Staff Groomer', desc: 'STATION APPOINTMENTS', bg: 'bg-black', active: true },
              { id: 'tier5', code: 'TIER_05', title: 'Bather & Assistant', desc: 'BATHING / PREP', bg: 'bg-muted/300' },
              { id: 'tier6', code: 'TIER_06', title: 'Front Desk / POS', desc: 'CASHIER & INTAKE', bg: 'bg-muted' },
            ].map((tier) => (
              <button 
                key={tier.id}
                onClick={() => { setActiveTier(tier.id as any); showToast(`SWITCHED EDITING SCOPE TO ${tier.title.toUpperCase()}`); }}
                className={`p-3 text-left transition-colors flex flex-col justify-between h-20 cursor-pointer ${
                  tier.active ? 'bg-card border-2 border-border -m-[1.5px] z-10 shadow-card' : 'hover:bg-muted/40'
                }`}
              >
                <div className="flex items-center justify-between mb-1 tabular-nums text-[10px]">
                  <span className={tier.active ? 'text-warning font-bold' : 'text-muted-foreground'}>{tier.code} {tier.active && '[ACTIVE]'}</span>
                  <span className={`w-2 h-2 ${tier.bg}`}></span>
                </div>
                <span className="font-bold text-foreground font-sans leading-tight block truncate">{tier.title}</span>
                <span className="text-[10px] text-muted-foreground uppercase block tracking-wider leading-none mt-1">{tier.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Main Granular Permission Matrix Table */}
        <div className="border border-border bg-card shadow-card-md">
          {/* Matrix Header Info Bar */}
          <div className="px-4 py-3 bg-muted/40  border-border flex flex-col md:flex-row md:items-center justify-between gap-2 tabular-nums">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-foreground uppercase">ROLE TARGET: STAFF GROOMER (STAFF_TIER_04)</span>
              <span className="border border-border px-1.5 bg-card text-[10px] font-bold text-foreground">14 GRANTED / 26 RESTRICTED</span>
            </div>
            <div className="flex items-center gap-4 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-success inline-block border border-border"></span>
                <span className="text-foreground">ENABLED [GRANT]</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-muted inline-block border border-border"></span>
                <span className="text-muted-foreground">DENIED [LOCKED]</span>
              </div>
            </div>
          </div>

          {/* Table Structure */}
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/40  border-border tabular-nums text-[11px] uppercase tracking-wider text-foreground">
                  <th className="p-3 w-2/5 border-r border-border font-bold">MODULE ENTITY &amp; ACTION CONTEXT</th>
                  <th className="p-3 text-center w-[15%] border-r border-border">
                    <div className="flex items-center justify-center gap-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>VIEW / READ</span>
                    </div>
                  </th>
                  <th className="p-3 text-center w-[15%] border-r border-border">
                    <div className="flex items-center justify-center gap-1">
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>CREATE / EDIT</span>
                    </div>
                  </th>
                  <th className="p-3 text-center w-[15%] border-r border-border">
                    <div className="flex items-center justify-center gap-1">
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>DELETE / VOID</span>
                    </div>
                  </th>
                  <th className="p-3 text-center w-[15%]">
                    <div className="flex items-center justify-center gap-1 text-warning">
                      <Lock className="w-3.5 h-3.5" />
                      <span>FINANCIAL / PII</span>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border tabular-nums text-[11px]">
                
                {/* SECTION 1: SALON OPS */}
                <tr className="bg-muted/30  border-b border-border">
                  <td className="px-4 py-2 tabular-nums font-bold text-foreground" colSpan={5}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-black inline-block"></span>
                        <span className="uppercase text-[10px] tracking-wider">SEC:01 // SALON OPERATIONS MODULES</span>
                      </div>
                      <span className="text-muted-foreground uppercase text-[9px]">CORE GROOMING WORKFLOWS</span>
                    </div>
                  </td>
                </tr>

                {permissions.map((p) => {
                  if (p.restricted || p.hidden || p.locked) {
                    let label = 'LOCKED';
                    let cellBg = 'bg-muted/40 opacity-60';
                    if (p.hidden) { label = 'HIDDEN'; }
                    if (p.restricted) { label = 'RESTRICTED'; }

                    return (
                      <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3 border-r border-border">
                          <div className="flex flex-col">
                            <span className="font-bold text-foreground text-xs block">{p.module}</span>
                            <span className="text-muted-foreground text-[10px] leading-tight mt-0.5">{p.desc}</span>
                          </div>
                        </td>
                        <td className={`p-3 text-center border-r border-border ${cellBg}`} colSpan={4}>
                          <div className="inline-flex items-center gap-1 px-3 py-1 border border-border bg-muted/40 text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
                            <Lock className="w-3.5 h-3.5" />
                            <span>{label}</span>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 border-r border-border">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground text-xs block">{p.module}</span>
                          <span className="text-muted-foreground text-[10px] leading-tight mt-0.5">{p.desc}</span>
                        </div>
                      </td>
                      
                      {/* VIEW */}
                      <td className="p-3 text-center border-r border-border bg-card">
                        <button 
                          onClick={() => togglePermission(p.id, 'view')}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 border transition-all cursor-pointer ${
                            p.view 
                              ? 'border-success bg-success/10 text-success font-bold' 
                              : 'border-border bg-card text-muted-foreground/70'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {p.view ? 'check_box' : 'check_box_outline_blank'}
                          </span>
                          <span className="text-[10px] uppercase font-bold">{p.view ? (p.viewLabel || 'YES') : 'NO'}</span>
                        </button>
                      </td>

                      {/* EDIT */}
                      <td className="p-3 text-center border-r border-border bg-card">
                        <button 
                          onClick={() => togglePermission(p.id, 'edit')}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 border transition-all cursor-pointer ${
                            p.edit 
                              ? 'border-success bg-success/10 text-success font-bold' 
                              : 'border-border bg-card text-muted-foreground/70'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {p.edit ? 'check_box' : 'check_box_outline_blank'}
                          </span>
                          <span className="text-[10px] uppercase font-bold">{p.edit ? (p.editLabel || 'YES') : 'NO'}</span>
                        </button>
                      </td>

                      {/* DELETE */}
                      <td className="p-3 text-center border-r border-border bg-card">
                        <button 
                          onClick={() => togglePermission(p.id, 'del')}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 border transition-all cursor-pointer ${
                            p.del 
                              ? 'border-success bg-success/10 text-success font-bold' 
                              : 'border-border bg-card text-muted-foreground/70'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[14px]">
                            {p.del ? 'check_box' : 'check_box_outline_blank'}
                          </span>
                          <span className="text-[10px] uppercase font-bold">{p.del ? 'YES' : 'NO'}</span>
                        </button>
                      </td>

                      {/* FINANCIAL / PII */}
                      <td className="p-3 text-center bg-card">
                        {p.pii === 'masked' ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 border border-warning bg-warning/5 text-warning font-bold text-[10px] uppercase">
                            <EyeOff className="w-3.5 h-3.5" />
                            <span>MASKED</span>
                          </div>
                        ) : (
                          <button 
                            onClick={() => togglePermission(p.id, 'pii')}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 border transition-all cursor-pointer ${
                              p.pii === true
                                ? 'border-success bg-success/10 text-success font-bold' 
                                : 'border-border bg-card text-muted-foreground/70'
                            }`}
                          >
                            <span className="material-symbols-outlined text-[14px]">
                              {p.pii === true ? 'check_box' : 'check_box_outline_blank'}
                            </span>
                            <span className="text-[10px] uppercase font-bold">{p.pii === true ? (p.piiLabel || 'YES') : 'NO'}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}

              </tbody>
            </table>
          </div>

          {/* Quick Toggle Action Toolbar */}
          <div className="p-4 bg-muted/40 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4 tabular-nums">
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded-md accent-black border border-border cursor-pointer" />
                <span className="font-bold text-foreground text-xs">AUTO-COMMIT PERMISSION GRANTS TO REVISION LEDGER</span>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => showToast('EXPANDED ALL CAPABILITY EXCRIPTORS')} className="px-3 py-1.5 bg-card border border-border hover:bg-muted/40 cursor-pointer font-bold">
                EXPAND ALL DESCRIPTORS
              </button>
              <button onClick={() => showToast('EXPORTED SECURITY REVISION POLICY')} className="px-3 py-1.5 bg-card border border-border hover:bg-muted/40 cursor-pointer font-bold flex items-center gap-1.5">
                <FileJson className="w-3.5 h-3.5" />
                EXPORT POLICY JSON [SEC_TIER_04]
              </button>
            </div>
          </div>
        </div>

        {/* Summary & Override Rules Callout Banner */}
        <div className="border border-border bg-muted/30 p-5 space-y-4 shadow-card-md">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-foreground" />
              <span className="font-bold font-sans text-sm text-foreground">GROOMER VIEW RESTRICTION POLICY ACTIVE</span>
            </div>
            <span className="tabular-nums text-[9px] px-2 py-0.5 bg-primary text-primary-foreground font-bold uppercase">
              SEC_POLICY_ENFORCED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 tabular-nums text-[11px] leading-relaxed">
            <div className="border border-border bg-card p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-warning font-bold uppercase">
                <EyeOff className="w-3.5 h-3.5" />
                <span>RESTRICTED CAPABILITIES</span>
              </div>
              <p className="text-muted-foreground font-sans mt-1">
                Groomer profiles automatically suppress business financial ledgers, system operational configurations, COGS inventory purchase costs, and client credit card tokens.
              </p>
            </div>

            <div className="border border-border bg-card p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-success font-bold uppercase">
                <Check className="w-3.5 h-3.5" />
                <span>UNRESTRICTED CAPABILITIES</span>
              </div>
              <p className="text-muted-foreground font-sans mt-1">
                Full read and write execution over assigned dogs, coat triage records, 21-stage dog workflow advance machine, styling photo upload, and personal timeclock tracking.
              </p>
            </div>

            <div className="border border-border bg-card p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-foreground font-bold uppercase">
                <Terminal className="w-3.5 h-3.5" />
                <span>AUDIT TRAIL VERIFICATION</span>
              </div>
              <div className="text-muted-foreground mt-1 tabular-nums text-[11px] space-y-0.5">
                <div><strong className="text-foreground font-bold">SYS ADMIN:</strong> David Chen</div>
                <div><strong className="text-foreground font-bold">REVISION:</strong> 2025-05-18 14:02 CST</div>
                <div><strong className="text-foreground font-bold">HASH:</strong> 9a2f7c04e8b31a5d</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
