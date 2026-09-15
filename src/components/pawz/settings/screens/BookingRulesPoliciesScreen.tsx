'use client';

import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  ArrowRight, 
  ShieldAlert, 
  Save, 
  Plus, 
  Copy, 
  Settings 
} from 'lucide-react';

interface ScreenProps {
  onNavigateScreen?: (screenId: string) => void;
  selectedLocation?: string;
  onSelectLocation?: (loc: string) => void;
}

export const BookingRulesPoliciesScreen: React.FC<ScreenProps> = ({
  onNavigateScreen,
  selectedLocation,
  onSelectLocation,
}) => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activeFacility, setActiveFacility] = useState('FRISCO MAIN HQ (1234 MAPLE DRIVE) [PRIMARY]');
  const [emergencyWeatherActive, setEmergencyWeatherActive] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const scheduleRows = [
    { day: 'MONDAY', hours: '07:30 AM - 06:30 PM', shifts: '2 Shifts // 8 Bays Active', sanitize: '12:30 PM - 01:00 PM (Sanitize)', status: 'OPEN' },
    { day: 'TUESDAY', hours: '07:30 AM - 06:30 PM', shifts: '2 Shifts // 8 Bays Active', sanitize: '12:30 PM - 01:00 PM (Sanitize)', status: 'OPEN' },
    { day: 'WEDNESDAY', hours: '07:30 AM - 06:30 PM', shifts: '2 Shifts // 8 Bays Active', sanitize: '12:30 PM - 01:00 PM (Sanitize)', status: 'OPEN' },
    { day: 'THURSDAY', hours: '07:30 AM - 06:30 PM', shifts: '2 Shifts // 8 Bays Active', sanitize: '12:30 PM - 01:00 PM (Sanitize)', status: 'OPEN' },
    { day: 'FRIDAY', hours: '07:30 AM - 06:30 PM', shifts: '2 Shifts // 8 Bays Active', sanitize: '12:30 PM - 01:00 PM (Sanitize)', status: 'OPEN' },
    { day: 'SATURDAY', hours: '08:00 AM - 05:00 PM', shifts: '1 Extended Shift // 8 Bays Active', sanitize: '12:00 PM - 12:30 PM (Sanitize)', status: 'OPEN' },
    { day: 'SUNDAY', hours: 'CLOSED (BOARDING ON-CALL)', shifts: 'Emergency Sanitation Maint Only', sanitize: '—', status: 'CLOSED' },
  ];

  const holidays = [
    { name: 'MEMORIAL DAY', date: 'MAY 26, 2025 // ALL FACILITIES', badge: 'FULL CLOSURE' },
    { name: 'INDEPENDENCE DAY', date: 'JULY 4, 2025 // ALL FACILITIES', badge: 'FULL CLOSURE' },
    { name: 'LABOR DAY', date: 'SEPT 1, 2025 // ALL FACILITIES', badge: 'FULL CLOSURE' },
    { name: 'THANKSGIVING EVE', date: 'NOV 26, 2025 // EARLY LOCKOUT', badge: '07:30 - 02:00' },
    { name: 'THANKSGIVING DAY', date: 'NOV 27, 2025 // ALL FACILITIES', badge: 'FULL CLOSURE' },
    { name: 'CHRISTMAS EVE', date: 'DEC 24, 2025 // EARLY LOCKOUT', badge: '08:00 - 01:00' },
    { name: 'CHRISTMAS DAY', date: 'DEC 25, 2025 // ALL FACILITIES', badge: 'FULL CLOSURE' },
  ];

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

      {/* SUB-NAV / PATH BANNER */}
      <div className="px-6 py-2 border-b border-border bg-muted/30 flex items-center justify-between text-xs tabular-nums">
        <div className="flex items-center gap-2">
          <span className="font-bold">ADMIN SETTINGS</span>
          <span className="text-muted-foreground/70">&gt;&gt;</span>
          <span className="bg-primary text-primary-foreground px-2 py-0.5">ORGANIZATION &amp; MULTI-LOCATION MANAGEMENT</span>
          <span className="text-muted-foreground/70">{"//"}</span>
          <span className="border border-border bg-muted px-1.5 py-0.5 text-[10px] font-bold uppercase">RESTRICTED // ADMIN PERMISSION REQUIRED</span>
          <span className="text-muted-foreground/70">{"//"}</span>
          <span className="text-muted-foreground">STATION_ID: HQ-OPS-ROOT</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => showToast('ADD NEW LOCATION INITIALIZED')}
            className="border border-border bg-card px-2.5 py-1 hover:bg-black hover:text-white font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ ADD NEW LOCATION</span>
          </button>
          <button 
            onClick={() => showToast('HOUR CONFIGURATIONS PERSISTED TO ALL SITES')}
            className="bg-primary text-primary-foreground px-3 py-1 hover:bg-muted font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer"
          >
            <span>[SAVE CONFIG CHANGES]</span>
          </button>
        </div>
      </div>

      {/* PAGE TITLE & SUMMARY HEADER */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="text-xs tabular-nums uppercase text-muted-foreground tracking-wider">BUSINESS PROFILE // ENTITY STRUCTURE // MULTI-UNIT SYNC</div>
            <h2 className="text-2xl font-bold uppercase tracking-tight mt-1">ORGANIZATION, MULTI-LOCATION &amp; BRAND SETTINGS</h2>
            <p className="text-xs tabular-nums text-muted-foreground mt-1 max-w-3xl">
              Configure enterprise brand identities, manage multi-facility tax &amp; merchant bindings, configure physical salon operating hours, and govern global salon holidays across North Texas facilities.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="border border-border p-2.5 bg-muted/30 text-right min-w-[120px]">
              <div className="text-[10px] tabular-nums text-muted-foreground uppercase">ACTIVE LOCATIONS</div>
              <div className="text-xl font-bold tabular-nums">03 SALONS</div>
            </div>
            <div className="border border-border p-2.5 bg-muted/30 text-right min-w-[120px]">
              <div className="text-[10px] tabular-nums text-muted-foreground uppercase">ACTIVE STAFF</div>
              <div className="text-xl font-bold tabular-nums">24 TEAM</div>
            </div>
            <div className="border border-border p-2.5 bg-muted/30 text-right min-w-[140px]">
              <div className="text-[10px] tabular-nums text-muted-foreground uppercase">ENTERPRISE ENTITY</div>
              <div className="text-sm font-bold tabular-nums truncate">All About Pawz Holdings</div>
            </div>
          </div>
        </div>

        {/* OPERATIONS INNER TABS */}
        <div className="flex items-center gap-1 mt-6 border-b border-border -mb-6">
          <button onClick={() => onNavigateScreen?.('org-multiloc')} className="px-4 py-2 bg-muted/40 hover:bg-muted text-foreground tabular-nums text-xs font-bold border-t border-l border-r border-border uppercase cursor-pointer">
            LOCATIONS &amp; SALONS (3)
          </button>
          <button onClick={() => onNavigateScreen?.('org-brand')} className="px-4 py-2 bg-muted/40 hover:bg-muted text-foreground tabular-nums text-xs font-bold border-t border-l border-r border-border uppercase cursor-pointer">
            BRAND &amp; VISUAL IDENTITY
          </button>
          <button onClick={() => {}} className="px-4 py-2 bg-primary text-primary-foreground tabular-nums text-xs font-bold border-t border-l border-r border-border uppercase cursor-pointer">
            ■ OPERATING &amp; HOLIDAY HOURS
          </button>
          <button onClick={() => onNavigateScreen?.('org-social')} className="px-4 py-2 bg-muted/40 hover:bg-muted text-foreground tabular-nums text-xs font-bold border-t border-l border-r border-border uppercase cursor-pointer">
            SOCIAL LINKS &amp; DIRECTORIES
          </button>
          <button onClick={() => onNavigateScreen?.('payments-tax')} className="px-4 py-2 bg-muted/40 hover:bg-muted text-foreground tabular-nums text-xs font-bold border-t border-l border-r border-border uppercase cursor-pointer">
            TAX &amp; LEGAL ENTITY
          </button>
        </div>
      </div>

      {/* MAIN CONFIGURATION GRID */}
      <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* COLUMN 1 & 2 */}
        <div className="xl:col-span-2 space-y-6">
          {/* Section A */}
          <div className="border-2 border-border p-5 bg-card">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-black"></span>
                <h3 className="font-bold text-sm uppercase tabular-nums tracking-wider">SECTION A: FACILITY SELECTOR &amp; TIMEZONE CONFIG</h3>
              </div>
              <span className="text-[10px] tabular-nums text-muted-foreground uppercase">CONFIG_SYNC: REALTIME</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 tabular-nums text-xs">
              <div>
                <label className="block text-[10px] text-muted-foreground uppercase mb-1">ACTIVE LOCATION PROFILE</label>
                <select 
                  value={activeFacility}
                  onChange={(e) => { setActiveFacility(e.target.value); showToast(`MUTATED WORKSPACE CONTEXT: ${e.target.value.split(' ')[0]}`); }}
                  className="w-full border-2 border-border p-2 bg-card font-bold focus:outline-none cursor-pointer"
                >
                  <option value="FRISCO MAIN HQ (1234 MAPLE DRIVE) [PRIMARY]">FRISCO MAIN HQ (1234 MAPLE DRIVE) [PRIMARY]</option>
                  <option value="PLANO WEST BRANCH (5800 LEGACY DRIVE)">PLANO WEST BRANCH (5800 LEGACY DRIVE)</option>
                  <option value="MOBILE GROOMING VAN FLEET (DISPATCH CENTER)">MOBILE GROOMING VAN FLEET (DISPATCH CENTER)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] text-muted-foreground uppercase mb-1">PRIMARY TIMEZONE / CLOCK</label>
                <div className="flex items-center gap-2">
                  <input className="flex-1 border border-border p-2 bg-muted/30 font-bold focus:outline-none" readOnly type="text" value="America/Chicago (CST / UTC-06:00)"/>
                  <div className="border border-border px-2 py-2 bg-muted/40 flex items-center gap-1.5 shrink-0">
                    <span className="text-[10px] text-muted-foreground">DST:</span>
                    <span className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 font-bold">ENABLED</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section B */}
          <div className="border-2 border-border p-5 bg-card">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-black"></span>
                <h3 className="font-bold text-sm uppercase tabular-nums tracking-wider">SECTION B: STANDARD WEEKLY OPERATING SCHEDULE (FRISCO MAIN HQ)</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => showToast('HOURS COPIED TO OTHER NODES')} className="border border-border px-2.5 py-1 text-xs tabular-nums font-bold hover:bg-muted/40 uppercase cursor-pointer">
                  [COPY SCHEDULE TO OTHER LOCATIONS]
                </button>
                <button onClick={() => showToast('WEEKLY HOUR EDITOR ACTIVE')} className="bg-primary text-primary-foreground px-2.5 py-1 text-xs tabular-nums font-bold hover:bg-muted uppercase cursor-pointer">
                  [EDIT HOURS]
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left tabular-nums text-xs border border-border">
                <thead className="bg-muted/40 border-b border-border text-[10px] uppercase text-muted-foreground">
                  <tr>
                    <th className="p-2.5 border-r border-border">DAY OF WEEK</th>
                    <th className="p-2.5 border-r border-border">OPERATIONAL HOURS</th>
                    <th className="p-2.5 border-r border-border">BAY SHIFTS &amp; CAPACITY</th>
                    <th className="p-2.5 border-r border-border">BREAK / SANITATION</th>
                    <th className="p-2.5 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {scheduleRows.map((row) => (
                    <tr key={row.day} className="hover:bg-muted/30">
                      <td className="p-2.5 font-bold border-r border-border">{row.day}</td>
                      <td className={`p-2.5 border-r border-border font-bold ${row.status === 'CLOSED' ? 'text-muted-foreground italic' : ''}`}>{row.hours}</td>
                      <td className="p-2.5 border-r border-border text-muted-foreground">{row.shifts}</td>
                      <td className="p-2.5 border-r border-border text-muted-foreground">{row.sanitize}</td>
                      <td className="p-2.5 text-right">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase ${
                          row.status === 'CLOSED' ? 'border border-border bg-card text-foreground' : 'bg-primary text-primary-foreground'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-3 flex items-center justify-between tabular-nums text-xs">
              <span className="text-[10px] text-muted-foreground">MAX GROOM CAPACITY: 64 SESSIONS / DAY AT CURRENT ROTAS</span>
              <button onClick={() => showToast('SPLIT SHIFT / BREAK TIME CREATOR ACTIVE')} className="border border-border bg-muted/30 hover:bg-muted px-3 py-1 font-bold text-xs uppercase cursor-pointer">
                + ADD SPLIT SHIFT / BREAK TIME
              </button>
            </div>
          </div>
        </div>

        {/* COLUMN 3 */}
        <div className="space-y-6">
          {/* Section C */}
          <div className="border-2 border-border p-4 bg-card">
            <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-black"></span>
                <h4 className="font-bold text-xs uppercase tabular-nums tracking-wider">SECTION C: 2025 HOLIDAY CLOSURES</h4>
              </div>
              <span className="text-[10px] tabular-nums text-muted-foreground">OBSERVED: 7</span>
            </div>

            <div className="flex items-center justify-between bg-muted/30 border border-border p-2 mb-3 text-xs tabular-nums">
              <span className="text-[10px] uppercase text-muted-foreground">CLIENT BLACKOUT DISPATCH:</span>
              <span className="bg-primary text-primary-foreground text-[9px] px-1.5 py-0.5 font-bold uppercase">ENFORCED</span>
            </div>

            <div className="space-y-2 tabular-nums text-xs">
              {holidays.map((h, i) => (
                <div key={i} className="border border-border p-2.5 flex items-center justify-between bg-card">
                  <div className="space-y-0.5">
                    <div className="font-bold uppercase text-foreground">{h.name}</div>
                    <div className="text-[10px] text-muted-foreground">{h.date}</div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 font-bold uppercase border border-border ${
                    h.badge === 'FULL CLOSURE' ? 'bg-muted/40 text-foreground' : 'bg-muted text-foreground'
                  }`}>
                    {h.badge}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-3 pt-2 border-t border-border">
              <button onClick={() => showToast('CUSTOM CLOSURE WIZARD OPENED')} className="w-full border border-border bg-muted/40 hover:bg-muted py-2 tabular-nums text-xs font-bold uppercase cursor-pointer">
                + ADD CUSTOM HOLIDAY / CLOSURE EXCEPTION
              </button>
            </div>
          </div>

          {/* Section D */}
          <div className="border-2 border-border p-4 bg-muted/30">
            <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-black"></span>
                <h4 className="font-bold text-xs uppercase tabular-nums tracking-wider">SECTION D: EMERGENCY WEATHER OVERRIDE</h4>
              </div>
              <span className={`px-1.5 py-0.5 text-[9px] font-bold uppercase ${
                emergencyWeatherActive ? 'bg-destructive text-white animate-pulse' : 'bg-primary text-primary-foreground'
              }`}>
                {emergencyWeatherActive ? 'MUTING ACTIVATED' : 'IDLE - NORMAL'}
              </span>
            </div>
            
            <p className="text-xs tabular-nums text-muted-foreground mb-3">
              North Texas extreme freeze and storm protocol. When triggered, locks online scheduling instantly and triggers Twilio batch SMS broadcast to all queued pet owners.
            </p>
            
            <div className="border border-border p-3 bg-card space-y-2 tabular-nums text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold">FREEZE / ICY ROAD PROTOCOL:</span>
                <span className={`text-[10px] font-bold ${emergencyWeatherActive ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {emergencyWeatherActive ? 'TRIGGERED & BROADCASTING' : 'STANDBY'}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground">TARGET: FRISCO HQ, PLANO WEST &amp; 3 MOBILE UNITS</div>
              <button 
                onClick={() => {
                  setEmergencyWeatherActive(!emergencyWeatherActive);
                  showToast(emergencyWeatherActive ? 'EMERGENCY LOCKDOWN CANCELLED' : 'EMERGENCY WEATHER SYSTEM DEPLOYED - TWILIO PIPELINE DISPATCHED');
                }}
                className={`w-full py-1.5 text-xs font-bold uppercase transition-colors cursor-pointer border ${
                  emergencyWeatherActive 
                    ? 'bg-destructive text-white border-destructive hover:bg-destructive' 
                    : 'bg-primary text-primary-foreground border-border hover:bg-muted'
                }`}
              >
                {emergencyWeatherActive ? '[DEACTIVATE SYSTEM WEATHER RECOVERY]' : '[ACTIVATE EMERGENCY OVERRIDE & NOTIFY]'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM TELEMETRY FOOTER BAR */}
      <div className="mt-auto  border-border bg-muted/30 px-6 py-2.5 flex items-center justify-between text-xs tabular-nums">
        <div className="flex items-center gap-4 text-muted-foreground">
          <span className="">HOST: US-CENTRAL-NODE-01</span>
          <span className="">{"//"}</span>
          <span className="">LATENCY: 12ms</span>
          <span className="">{"//"}</span>
          <span className="">MULTI_LOC_STATUS: PASS (ALL NODES HEALTHY)</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground">DB: SUPABASE_POSTGRES_CORE</span>
          <span className="bg-primary text-primary-foreground px-2 py-0.5 font-bold">[V2.4 COMMIT]</span>
        </div>
      </div>
    </div>
  );
};
