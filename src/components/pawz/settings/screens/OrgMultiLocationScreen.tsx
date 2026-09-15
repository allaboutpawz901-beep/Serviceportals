'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Layers, 
  Sliders, 
  Plus, 
  Save, 
  Tag, 
  Check, 
  Globe, 
  MessageSquare, 
  HelpCircle 
} from 'lucide-react';

interface ScreenProps {
  onNavigateScreen?: (screenId: string) => void;
  selectedLocation?: string;
  onSelectLocation?: (loc: string) => void;
}

export const OrgMultiLocationScreen: React.FC<ScreenProps> = ({
  onNavigateScreen,
  selectedLocation,
  onSelectLocation,
}) => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'locations' | 'brand' | 'hours' | 'social' | 'tax'>('locations');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
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
            onClick={() => showToast('PROVISION NEW LOCATION WIZARD ACTIVE')}
            className="border border-border bg-card px-2.5 py-1 hover:bg-black hover:text-white font-bold text-xs uppercase flex items-center gap-1.5 cursor-pointer"
          >
            <span>+ ADD NEW LOCATION</span>
          </button>
          <button 
            onClick={() => showToast('ALL CONFIGURATION CHANGES SAVED TO SUPABASE')}
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
          <button 
            onClick={() => { setActiveSubTab('locations'); showToast('VIEWING LOCATIONS'); }}
            className={`px-4 py-2 tabular-nums text-xs font-bold border-t border-l border-r border-border uppercase cursor-pointer ${
              activeSubTab === 'locations' ? 'bg-primary text-primary-foreground' : 'bg-muted/40 hover:bg-muted text-foreground'
            }`}
          >
            ■ LOCATIONS &amp; SALONS (3)
          </button>
          <button 
            onClick={() => { onNavigateScreen?.('org-brand'); }}
            className="px-4 py-2 bg-muted/40 hover:bg-muted text-foreground tabular-nums text-xs font-bold border-t border-l border-r border-border uppercase cursor-pointer"
          >
            BRAND &amp; VISUAL IDENTITY
          </button>
          <button 
            onClick={() => { onNavigateScreen?.('booking-rules'); }}
            className="px-4 py-2 bg-muted/40 hover:bg-muted text-foreground tabular-nums text-xs font-bold border-t border-l border-r border-border uppercase cursor-pointer"
          >
            OPERATING &amp; HOLIDAY HOURS
          </button>
          <button 
            onClick={() => { onNavigateScreen?.('org-social'); }}
            className="px-4 py-2 bg-muted/40 hover:bg-muted text-foreground tabular-nums text-xs font-bold border-t border-l border-r border-border uppercase cursor-pointer"
          >
            SOCIAL LINKS &amp; DIRECTORIES
          </button>
          <button 
            onClick={() => { onNavigateScreen?.('payments-tax'); }}
            className="px-4 py-2 bg-muted/40 hover:bg-muted text-foreground tabular-nums text-xs font-bold border-t border-l border-r border-border uppercase cursor-pointer"
          >
            TAX &amp; LEGAL ENTITY
          </button>
        </div>
      </div>

      {/* MAIN CONFIGURATION GRID */}
      <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* COLUMN 1 & 2: MULTI-LOCATION DIRECTORY & ACTIVE EDIT FORM */}
        <div className="xl:col-span-2 space-y-6">

          {/* LOCATION 01: FRISCO HQ (PRIMARY) */}
          <div className="border-2 border-border p-5 bg-card">
            <div className="flex items-start justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-primary text-primary-foreground tabular-nums font-bold flex items-center justify-center text-xs">
                  01
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base uppercase">ALL ABOUT PAWZ - FRISCO HQ (MAIN LOCATION)</h3>
                    <span className="bg-primary text-primary-foreground tabular-nums text-[10px] px-1.5 py-0.2 font-bold uppercase">PRIMARY HQ</span>
                    <span className="border border-border tabular-nums text-[10px] px-1.5 py-0.2 uppercase bg-success/10 text-success border-green-800">ONLINE &amp; ACTIVE</span>
                  </div>
                  <div className="text-xs tabular-nums text-muted-foreground">FACILITY_ID: LOC-TX-FRISCO-001 // ROUTING NODE: OMS-01</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { onSelectLocation?.('FRISCO HQ'); showToast('SWITCHED CONSOLE NODE TO FRISCO HQ'); }}
                  className="border border-border px-2 py-1 text-xs tabular-nums font-bold hover:bg-muted/40 uppercase cursor-pointer"
                >
                  [SWITCH TO THIS]
                </button>
                <button 
                  onClick={() => showToast('EDITING FRISCO HQ DETAILS')}
                  className="bg-primary text-primary-foreground px-2 py-1 text-xs tabular-nums font-bold hover:bg-muted uppercase cursor-pointer"
                >
                  [EDIT DETAILS]
                </button>
              </div>
            </div>

            {/* DETAIL FIELDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs tabular-nums">
              <div className="space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] block">PHYSICAL ADDRESS</span>
                <p className="font-bold">1234 MAPLE DRIVE</p>
                <p className="">FRISCO, TX 75034</p>
                <p className="text-muted-foreground">COLLIN COUNTY {"//"} ZONE 1</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] block">COMMUNICATIONS &amp; DISPATCH</span>
                <p className="font-bold">TEL: (214) 555-0198</p>
                <p className="">SMS: +1 (800) 555-PAWZ</p>
                <p className="text-muted-foreground">EMAIL: FRISCO@ALLABOUTPAWZ.COM</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] block">STATION CAPACITY &amp; STAFF</span>
                <p className="font-bold">GROOMING STATIONS: 08 BAYS</p>
                <p className="">ACTIVE GROOMERS: 12 ON ROTA</p>
                <p className="text-muted-foreground">POS TERMINALS: 03 LANE TERMINALS</p>
              </div>
            </div>

            {/* CAPACITY & OPERATIONAL HOURS SUMMARY */}
            <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] tabular-nums bg-muted/30 p-2.5">
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase">MON - FRI HOURS</span>
                <span className="font-bold">07:30 AM - 06:30 PM</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase">SATURDAY HOURS</span>
                <span className="font-bold">08:00 AM - 05:00 PM</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase">SUNDAY STATUS</span>
                <span className="font-bold text-muted-foreground">CLOSED (BOARDING ON-CALL)</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase">TAX REGION / RATE</span>
                <span className="font-bold">TX_STATE (8.25%)</span>
              </div>
            </div>
          </div>

          {/* LOCATION 02: PLANO WEST EXPANSION */}
          <div className="border border-border p-5 bg-card">
            <div className="flex items-start justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-muted text-foreground tabular-nums font-bold flex items-center justify-center text-xs border border-border">
                  02
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base uppercase">ALL ABOUT PAWZ - PLANO WEST BRANCH</h3>
                    <span className="border border-border tabular-nums text-[10px] px-1.5 py-0.2 uppercase bg-muted/40">BRANCH SALON</span>
                    <span className="border border-border tabular-nums text-[10px] px-1.5 py-0.2 uppercase bg-success/10 text-success border-green-800">ONLINE &amp; ACTIVE</span>
                  </div>
                  <div className="text-xs tabular-nums text-muted-foreground">FACILITY_ID: LOC-TX-PLANO-002 // ROUTING NODE: OMS-02</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { onSelectLocation?.('PLANO WEST'); showToast('SWITCHED CONSOLE NODE TO PLANO WEST'); }}
                  className="border border-border px-2 py-1 text-xs tabular-nums font-bold hover:bg-muted/40 uppercase cursor-pointer"
                >
                  [SWITCH TO THIS]
                </button>
                <button 
                  onClick={() => showToast('EDITING PLANO WEST DETAILS')}
                  className="border border-border px-2 py-1 text-xs tabular-nums font-bold hover:bg-black hover:text-white uppercase cursor-pointer"
                >
                  [EDIT DETAILS]
                </button>
              </div>
            </div>

            {/* DETAIL FIELDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs tabular-nums">
              <div className="space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] block">PHYSICAL ADDRESS</span>
                <p className="font-bold">5800 LEGACY DRIVE, STE C</p>
                <p className="">PLANO, TX 75024</p>
                <p className="text-muted-foreground">DALLAS/COLLIN {"//"} ZONE 2</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] block">COMMUNICATIONS &amp; DISPATCH</span>
                <p className="font-bold">TEL: (972) 555-8921</p>
                <p className="">SMS: +1 (800) 555-PAWZ #2</p>
                <p className="text-muted-foreground">EMAIL: PLANO@ALLABOUTPAWZ.COM</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] block">STATION CAPACITY &amp; STAFF</span>
                <p className="font-bold">GROOMING STATIONS: 05 BAYS</p>
                <p className="">ACTIVE GROOMERS: 07 ON ROTA</p>
                <p className="text-muted-foreground">POS TERMINALS: 02 LANE TERMINALS</p>
              </div>
            </div>

            {/* CAPACITY & OPERATIONAL HOURS SUMMARY */}
            <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] tabular-nums bg-muted/30 p-2.5">
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase">MON - FRI HOURS</span>
                <span className="font-bold">08:00 AM - 06:00 PM</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase">SATURDAY HOURS</span>
                <span className="font-bold">08:30 AM - 04:30 PM</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase">SUNDAY STATUS</span>
                <span className="font-bold text-muted-foreground">CLOSED</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase">TAX REGION / RATE</span>
                <span className="font-bold">TX_STATE (8.25%)</span>
              </div>
            </div>
          </div>

          {/* LOCATION 03: MOBILE GROOMING VAN FLEET (DISPATCH CENTER) */}
          <div className="border border-border p-5 bg-card">
            <div className="flex items-start justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 bg-muted text-foreground tabular-nums font-bold flex items-center justify-center text-xs border border-border">
                  03
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base uppercase">ALL ABOUT PAWZ - MOBILE VAN DISPATCH FLEET</h3>
                    <span className="border border-border tabular-nums text-[10px] px-1.5 py-0.2 uppercase bg-muted/40">MOBILE UNIT</span>
                    <span className="border border-border tabular-nums text-[10px] px-1.5 py-0.2 uppercase bg-success/10 text-success border-green-800">ONLINE &amp; DISPATCHING</span>
                  </div>
                  <div className="text-xs tabular-nums text-muted-foreground">FACILITY_ID: LOC-TX-MOBILE-VAN-003 // FLEET CENTER: 03 VANS ACTIVE</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { onSelectLocation?.('MOBILE VAN'); showToast('SWITCHED CONSOLE NODE TO MOBILE VAN'); }}
                  className="border border-border px-2 py-1 text-xs tabular-nums font-bold hover:bg-muted/40 uppercase cursor-pointer"
                >
                  [SWITCH TO THIS]
                </button>
                <button 
                  onClick={() => showToast('EDITING MOBILE FLEET DETAILS')}
                  className="border border-border px-2 py-1 text-xs tabular-nums font-bold hover:bg-black hover:text-white uppercase cursor-pointer"
                >
                  [EDIT DETAILS]
                </button>
              </div>
            </div>

            {/* DETAIL FIELDS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs tabular-nums">
              <div className="space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] block">DISPATCH BASE DOCK</span>
                <p className="font-bold">1234 MAPLE DRIVE (REAR BAY)</p>
                <p className="">FRISCO, TX 75034</p>
                <p className="text-muted-foreground">SERVICE RADIUS: 25 MILES</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] block">COMMUNICATIONS &amp; GPS</span>
                <p className="font-bold">DISPATCH TEL: (214) 555-0199</p>
                <p className="">TELEMETRY: VERIZON CONNECT GPS</p>
                <p className="text-muted-foreground">EMAIL: DISPATCH@ALLABOUTPAWZ.COM</p>
              </div>
              <div className="space-y-1">
                <span className="text-muted-foreground uppercase text-[10px] block">FLEET VANS &amp; CREW</span>
                <p className="font-bold">ACTIVE VANS: VAN-01, 02, 03</p>
                <p className="">MOBILE GROOMERS: 05 CERTIFIED</p>
                <p className="text-muted-foreground">CELLULAR TAP TERMINALS: 03 ACTIVE</p>
              </div>
            </div>

            {/* CAPACITY & OPERATIONAL HOURS SUMMARY */}
            <div className="mt-4 pt-3 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-2 text-[11px] tabular-nums bg-muted/30 p-2.5">
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase">OPERATING DAYS</span>
                <span className="font-bold">TUE - SAT {"//"} 08:00 - 05:00</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase">AVERAGE STOPS / VAN</span>
                <span className="font-bold">5.4 CLIENTS / DAY</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase">CALL-OUT SURCHARGE</span>
                <span className="font-bold">$35.00 TRAVEL / DOCK</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase">STATE REGISTRATION</span>
                <span className="font-bold">TX_COMMERCIAL_FLEET</span>
              </div>
            </div>
          </div>

          {/* RAPID LOCATION CREATOR INTAKE FORM (MODAL/SECTION) */}
          <div className="border-2 border-border p-5 bg-muted/30">
            <div className="flex items-center justify-between border-b border-border pb-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-bold tabular-nums text-xs uppercase bg-primary text-primary-foreground px-2 py-0.5">+ DRAFT STATION</span>
                <h4 className="font-bold text-sm uppercase">PROVISION NEW BUSINESS LOCATION / RETAIL CENTER</h4>
              </div>
              <span className="text-xs tabular-nums text-muted-foreground">NEW SALON OR DISPATCH POD</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs tabular-nums mb-4">
              <div>
                <label className="block text-muted-foreground mb-1 uppercase text-[10px]">FACILITY NAME // CODE</label>
                <input type="text" placeholder="e.g. All About Pawz - Dallas Uptown" className="w-full border border-border p-2 bg-card focus:outline-none" />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 uppercase text-[10px]">FACILITY TYPE</label>
                <select className="w-full border border-border p-2 bg-card focus:outline-none">
                  <option>Brick &amp; Mortar Salon + Retail</option>
                  <option>Mobile Van Dispatch Center</option>
                  <option>Curbside Boutique Kiosk</option>
                  <option>Warehouse &amp; Fulfillment Depot</option>
                </select>
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 uppercase text-[10px]">MERCHANT / STRIPE ACCOUNT</label>
                <select className="w-full border border-border p-2 bg-card focus:outline-none">
                  <option>Stripe Connected // Acct #acct_pawz_main</option>
                  <option>Separate Sub-Merchant Account</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs tabular-nums mb-4">
              <div className="md:col-span-2">
                <label className="block text-muted-foreground mb-1 uppercase text-[10px]">STREET ADDRESS</label>
                <input type="text" placeholder="Street Address Line 1" className="w-full border border-border p-2 bg-card focus:outline-none" />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 uppercase text-[10px]">CITY, STATE, ZIP</label>
                <input type="text" placeholder="City, TX 75000" className="w-full border border-border p-2 bg-card focus:outline-none" />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1 uppercase text-[10px]">STATION CAPACITY</label>
                <input type="number" placeholder="4 Stations" className="w-full border border-border p-2 bg-card focus:outline-none" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <button className="border border-border bg-card px-4 py-1.5 text-xs tabular-nums uppercase font-bold hover:bg-muted cursor-pointer">CLEAR FORM</button>
              <button 
                onClick={() => showToast('NEW STATION DRAFT COMMITTED TO CLUSTER REPLICATION')}
                className="bg-primary text-primary-foreground px-5 py-1.5 text-xs tabular-nums uppercase font-bold hover:bg-muted cursor-pointer"
              >
                SAVE &amp; INITIALIZE REPLICATION
              </button>
            </div>
          </div>

        </div>

        {/* COLUMN 3: GLOBAL BRAND IDENTITY & MULTI-LOCATION SWITCHER */}
        <div className="space-y-6">

          {/* MULTI-LOCATION CONSOLE SWITCHER */}
          <div className="border-2 border-border p-4 bg-card">
            <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
              <h4 className="font-bold text-xs uppercase tabular-nums tracking-wider">ACTIVE CONSOLE SWITCHER</h4>
              <span className="text-[10px] tabular-nums text-muted-foreground">HOTKEY: [ALT+L]</span>
            </div>
            <p className="text-xs tabular-nums text-muted-foreground mb-3">
              Selecting a location remaps calendar queues, client check-in registers, local tax rules, and employee timecards.
            </p>

            <div className="space-y-2 tabular-nums text-xs">
              <div 
                onClick={() => { onSelectLocation?.('FRISCO HQ'); showToast('CONNECTED TO FRISCO MAIN HQ'); }}
                className={`border-2 p-3 flex items-center justify-between cursor-pointer ${
                  selectedLocation?.toUpperCase().includes('FRISCO') ? 'border-border bg-muted/40 font-bold' : 'border-border bg-card hover:bg-muted/30'
                }`}
              >
                <div>
                  <div className="font-bold uppercase flex items-center gap-1.5">
                    <span className={`w-2 h-2 ${selectedLocation?.toUpperCase().includes('FRISCO') ? 'bg-black' : 'border border-border'}`}></span>
                    <span>FRISCO MAIN HQ</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">12 Groomers // 8 Bays // Primary</div>
                </div>
                {selectedLocation?.toUpperCase().includes('FRISCO') && <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 font-bold">CURRENT</span>}
              </div>

              <div 
                onClick={() => { onSelectLocation?.('PLANO WEST'); showToast('CONNECTED TO PLANO WEST BRANCH'); }}
                className={`border p-3 flex items-center justify-between cursor-pointer ${
                  selectedLocation?.toUpperCase().includes('PLANO') ? 'border-border bg-muted/40 font-bold' : 'border-border bg-card hover:bg-muted/30'
                }`}
              >
                <div>
                  <div className="font-bold uppercase flex items-center gap-1.5">
                    <span className={`w-2 h-2 ${selectedLocation?.toUpperCase().includes('PLANO') ? 'bg-black' : 'border border-border'}`}></span>
                    <span>PLANO WEST BRANCH</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">7 Groomers // 5 Bays // Branch</div>
                </div>
                {selectedLocation?.toUpperCase().includes('PLANO') ? (
                  <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 font-bold">CURRENT</span>
                ) : (
                  <button className="border border-border text-[10px] px-1.5 py-0.5 font-bold hover:bg-black hover:text-white uppercase cursor-pointer">CONNECT</button>
                )}
              </div>

              <div 
                onClick={() => { onSelectLocation?.('MOBILE VAN'); showToast('CONNECTED TO MOBILE VAN FLEET'); }}
                className={`border p-3 flex items-center justify-between cursor-pointer ${
                  selectedLocation?.toUpperCase().includes('MOBILE') ? 'border-border bg-muted/40 font-bold' : 'border-border bg-card hover:bg-muted/30'
                }`}
              >
                <div>
                  <div className="font-bold uppercase flex items-center gap-1.5">
                    <span className={`w-2 h-2 ${selectedLocation?.toUpperCase().includes('MOBILE') ? 'bg-black' : 'border border-border'}`}></span>
                    <span>MOBILE VAN FLEET</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground">5 Groomers // 3 Vans // In-Transit</div>
                </div>
                {selectedLocation?.toUpperCase().includes('MOBILE') ? (
                  <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 font-bold">CURRENT</span>
                ) : (
                  <button className="border border-border text-[10px] px-1.5 py-0.5 font-bold hover:bg-black hover:text-white uppercase cursor-pointer">CONNECT</button>
                )}
              </div>

              <div 
                onClick={() => showToast('CONSOLIDATED ROLLUP PREVIEW GENERATED')}
                className="border border-border border-dashed p-3 hover:bg-muted/30 flex items-center justify-between cursor-pointer"
              >
                <div className="text-muted-foreground">
                  <span className="font-bold uppercase text-[11px]">+ ENTERPRISE ALL-LOCATIONS</span>
                  <div className="text-[10px]">Consolidated Rollup &amp; Global Ledger</div>
                </div>
                <button className="border border-border text-[10px] px-1.5 py-0.5 font-bold hover:bg-black hover:text-white uppercase">VIEW ALL</button>
              </div>
            </div>
          </div>

          {/* BRAND & IDENTITY ASSETS PANEL */}
          <div className="border-2 border-border p-4 bg-card">
            <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
              <h4 className="font-bold text-xs uppercase tabular-nums tracking-wider">BRAND ASSETS &amp; THEME</h4>
              <span className="text-[10px] tabular-nums bg-muted/40 border border-border px-1">TOKEN: PAWZ_CORE</span>
            </div>

            <div className="space-y-3 tabular-nums text-xs">
              <div>
                <span className="text-muted-foreground uppercase text-[10px] block mb-1">REGISTERED TRADEMARKS &amp; BRAND NAME</span>
                <input type="text" defaultValue="All About Pawz / All About Pawz Enterprises" className="w-full border border-border p-2 font-bold bg-muted/30 focus:bg-card focus:outline-none" />
              </div>

              <div>
                <span className="text-muted-foreground uppercase text-[10px] block mb-1">BRAND SLOGAN &amp; RECEIPT FOOTER</span>
                <input type="text" defaultValue="Luxury Pet Care &amp; Dedicated Canine Stylists" className="w-full border border-border p-2 bg-muted/30 focus:bg-card focus:outline-none" />
              </div>

              <div>
                <span className="text-muted-foreground uppercase text-[10px] block mb-1">CORE LOGO &amp; WATERMARK ASSET</span>
                <div className="border border-border p-3 bg-muted/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs">
                      🐾
                    </div>
                    <div>
                      <div className="font-bold text-xs">BRAND_LOGO_V2.SVG</div>
                      <div className="text-[10px] text-muted-foreground">VECTOR // 512x512 // MONOCHROME</div>
                    </div>
                  </div>
                  <button onClick={() => showToast('UPLOAD LOGO TRIGGERED')} className="border border-border px-2 py-1 text-[10px] uppercase font-bold hover:bg-black hover:text-white cursor-pointer">[REPLACE]</button>
                </div>
              </div>

              {/* COLOR & DESIGN SYSTEM TOKENS */}
              <div className="pt-2 border-t border-border">
                <span className="text-muted-foreground uppercase text-[10px] block mb-2">COLOR &amp; TOKEN SPECIFICATION</span>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <div className="border border-border p-2 bg-card flex items-center justify-between">
                    <span className="">PRIMARY:</span>
                    <span className="font-bold">#000000 [BLACK]</span>
                  </div>
                  <div className="border border-border p-2 bg-card flex items-center justify-between">
                    <span className="">SURFACE:</span>
                    <span className="font-bold">#FFFFFF [WHITE]</span>
                  </div>
                  <div className="border border-border p-2 bg-muted/40 flex items-center justify-between">
                    <span className="">ACCENT DIM:</span>
                    <span className="font-bold">#F3F3F4 [GRAY]</span>
                  </div>
                  <div className="border border-border p-2 bg-card flex items-center justify-between">
                    <span className="">CORNERS:</span>
                    <span className="font-bold">0px [SQUARE]</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SOCIAL PROFILES & DIRECTORY INTEGRATIONS */}
          <div className="border-2 border-border p-4 bg-card">
            <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
              <h4 className="font-bold text-xs uppercase tabular-nums tracking-wider">CHANNELS &amp; DIRECTORIES</h4>
              <span className="text-[10px] tabular-nums text-muted-foreground">SYNC: 4 NETWORKS</span>
            </div>

            <div className="space-y-2 tabular-nums text-xs">
              <div className="flex items-center justify-between border border-border p-2 bg-muted/30">
                <span className="font-bold">GOOGLE BUSINESS PROFILE</span>
                <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.2">SYNCED (4.9★)</span>
              </div>
              <div className="flex items-center justify-between border border-border p-2 bg-muted/30">
                <span className="font-bold">INSTAGRAM (@ALLABOUTPAWZ)</span>
                <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.2">CONNECTED</span>
              </div>
              <div className="flex items-center justify-between border border-border p-2 bg-muted/30">
                <span className="font-bold">YELP PET SERVICES</span>
                <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.2">ACTIVE</span>
              </div>
              <div className="flex items-center justify-between border border-border p-2 bg-muted/30">
                <span className="font-bold">FACEBOOK LOCAL PAGE</span>
                <span className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.2">CONNECTED</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM TELEMETRY FOOTER BAR */}
      <div className="mt-auto border-t-2 border-border bg-muted/30 px-6 py-2.5 flex items-center justify-between text-xs tabular-nums">
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
