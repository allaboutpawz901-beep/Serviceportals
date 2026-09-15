'use client';

import React, { useState } from 'react';
import { 
  DollarSign, 
  Tag, 
  Settings, 
  Percent, 
  Scissors, 
  Sparkles, 
  Clock, 
  HelpCircle, 
  RefreshCw, 
  Download, 
  Lock,
  Plus
} from 'lucide-react';

interface ScreenProps {
  onNavigateScreen?: (screenId: string) => void;
  selectedLocation?: string;
  onSelectLocation?: (loc: string) => void;
}

export const ServicesPricingMatrixScreen: React.FC<ScreenProps> = ({
  onNavigateScreen,
  selectedLocation,
  onSelectLocation,
}) => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [sizeTier, setSizeTier] = useState<'toy' | 'small' | 'medium' | 'large' | 'giant'>('medium');
  
  const [services, setServices] = useState([
    { id: 'bath-brush', name: 'Bath & Brush Out', category: 'STANDARD', dur: '45-60 min', toy: '45.00', small: '55.00', medium: '65.00', large: '80.00', giant: '110.00' },
    { id: 'full-groom', name: 'Full Style & Precision Haircut', category: 'PREMIUM', dur: '90-120 min', toy: '75.00', small: '85.00', medium: '95.00', large: '115.00', giant: '150.00' },
    { id: 'dematting-tx', name: 'Specialty Dematting & Fur Prep', category: 'THERAPY', dur: '30-45 min', toy: '35.00', small: '40.00', medium: '50.00', large: '65.00', giant: '85.00' },
    { id: 'deshed-ultra', name: 'Furminator Deshedding Therapy', category: 'THERAPY', dur: '45 min', toy: '30.00', small: '35.00', medium: '45.00', large: '55.00', giant: '75.00' },
    { id: 'puppy-intro', name: 'Puppy Socialization & First Trim', category: 'STANDARD', dur: '45 min', toy: '40.00', small: '45.00', medium: '—', large: '—', giant: '—' },
  ]);

  const [addons, setAddons] = useState([
    { id: 'blueberry-facial', name: 'Blueberry Revitalizing Facial', price: '14.00', category: 'COSMETIC', opt: 'Auto-applied to VIP Package' },
    { id: 'teeth-brushing', name: 'Dental Enzymes & Teeth Brushing', price: '12.00', category: 'WELLNESS', opt: 'Includes dental foam' },
    { id: 'nail-grinding', name: 'Nail Grinding & Dremel Finish', price: '18.00', category: 'STANDARD', opt: 'Upgrade from standard clip' },
    { id: 'gland-expression', name: 'Anal Gland Manual Expression', price: '15.00', category: 'WELLNESS', opt: 'Hygienic prep' },
    { id: 'flea-tick-dip', name: 'Medicated Flea & Tick Botanical Bath', price: '25.00', category: 'THERAPY', opt: 'Requires 10-min soak' },
  ]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handlePriceChange = (serviceId: string, sizeField: string, val: string) => {
    setServices(prev => prev.map(s => {
      if (s.id === serviceId) {
        return { ...s, [sizeField]: val };
      }
      return s;
    }));
    showToast('PRICE POINT CELL MUTATED - READY TO PERSIST');
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

      {/* SECURITY CLEARANCE BAR */}
      <div className="w-full bg-primary text-primary-foreground px-4 py-2 flex flex-wrap items-center justify-between border-b border-border text-[10px] tabular-nums tracking-widest uppercase">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2 h-2 bg-red-600"></span>
          <span className="text-destructive font-bold tracking-tight">RESTRICTED SERVICES LEDGER</span>
          <span className="text-muted-foreground">{"//"}</span>
          <span className="text-white">AUTH_SCOPE: SUPER_ADMIN_LEVEL_0</span>
          <span className="text-muted-foreground">{"//"}</span>
          <span className="text-muted-foreground/50">NODE: TX-PROD-PRICING-01</span>
        </div>
        <div className="flex items-center gap-4 text-[10px] tabular-nums text-muted-foreground/70">
          <span>CATALOG REVISION: v4.2.1-COMMIT</span>
          <span>CURRENCY: USD</span>
        </div>
      </div>

      {/* BREADCRUMB & EXECUTIVE TOOLBAR */}
      <div className="w-full bg-card border-b border-border p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 tabular-nums text-[10px] text-muted-foreground">
            <span>ADMIN SETTINGS</span>
            <span className="text-foreground font-bold">&gt;&gt;</span>
            <span className="text-foreground font-bold">SERVICES &amp; PRICING MATRIX</span>
            <span className="text-foreground font-bold">&gt;&gt;</span>
            <span className="bg-primary text-primary-foreground px-1 text-[9px] font-bold">PRICING MATRIX</span>
          </div>
          <div className="flex items-baseline gap-2">
            <h1 className="font-bold text-lg md:text-xl tracking-tight uppercase text-foreground">SERVICES, ADD-ONS &amp; PRICING MATRIX</h1>
            <span className="tabular-nums text-[11px] text-muted-foreground">{"// SCALE: CANINE MASS INDEX"}</span>
          </div>
        </div>
        
        {/* ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={() => showToast('NEW BASE SERVICE SKU CREATED')}
            className="h-8 px-3 bg-card border border-border text-foreground tabular-nums text-[10px] uppercase hover:bg-black hover:text-white transition-none flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + CREATE BASE SERVICE SKU
          </button>
          <button 
            onClick={() => showToast('SERVICE MATRIX EXPORTED IN JSON')}
            className="h-8 px-3 bg-card border border-border text-foreground tabular-nums text-[10px] uppercase hover:bg-muted/40 transition-none flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORT MATRIX JSON
          </button>
          <button 
            onClick={() => showToast('PRICING RULES SAVED TO POSTGRES SCHEMAS')}
            className="h-8 px-3 bg-primary text-primary-foreground border border-border tabular-nums text-[10px] uppercase hover:bg-muted transition-none flex items-center gap-1.5 cursor-pointer"
          >
            SAVE PRICING POLICY
          </button>
        </div>
      </div>

      {/* RESTRICTED SETTINGS SUB-NAV TAB MATRIX */}
      <div className="w-full bg-muted/40 border-b border-border overflow-x-auto">
        <div className="flex items-stretch min-w-max text-[11px] tabular-nums">
          <button onClick={() => onNavigateScreen?.('org-multiloc')} className="px-4 py-2 border-r border-border/20 hover:bg-card text-muted-foreground cursor-pointer">
            01 LOCATIONS &amp; SALONS
          </button>
          <button onClick={() => onNavigateScreen?.('users-staff')} className="px-4 py-2 border-r border-border/20 hover:bg-card text-muted-foreground cursor-pointer">
            02 USERS, STAFF &amp; ROLES
          </button>
          <button onClick={() => onNavigateScreen?.('booking-rules')} className="px-4 py-2 border-r border-border/20 hover:bg-card text-muted-foreground cursor-pointer">
            03 BOOKING RULES &amp; POLICIES
          </button>
          <button onClick={() => onNavigateScreen?.('revenue-stripe')} className="px-4 py-2 border-r border-border/20 hover:bg-card text-muted-foreground cursor-pointer">
            04 REVENUE &amp; STRIPE GATEWAY
          </button>
          <button onClick={() => onNavigateScreen?.('system-telemetry')} className="px-4 py-2 border-r border-border/20 hover:bg-card text-muted-foreground cursor-pointer">
            05 SYSTEM HEALTH &amp; TELEMETRY
          </button>
          <div className="px-4 py-2 bg-primary text-primary-foreground border-r border-border flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 bg-card inline-block"></span>
            <span>06 SERVICES &amp; PRICING MATRIX</span>
            <span className="text-[9px] px-1 bg-card text-foreground uppercase font-bold ml-1">[ACTIVE]</span>
          </div>
          <button onClick={() => onNavigateScreen?.('analytics-reporting')} className="px-4 py-2 border-r border-border/20 hover:bg-card text-muted-foreground cursor-pointer">
            07 ANALYTICS &amp; REPORTING
          </button>
          <button onClick={() => onNavigateScreen?.('cms-wizard')} className="px-4 py-2 text-muted-foreground hover:bg-card cursor-pointer">
            08 CMS &amp; BOOKING WIZARD
          </button>
        </div>
      </div>

      {/* TWO COLUMN SERVICE MATRIX CONTENT */}
      <div className="p-6 grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* COLUMN 1-8: MAIN PRICING TABLE BY CANINE BREED MASS SIZES */}
        <div className="xl:col-span-8 bg-card border-2 border-border flex flex-col shadow-[4px_4px_0px_#000000]">
          <div className="px-4 py-2.5  border-border bg-muted/40 flex items-center justify-between tabular-nums">
            <div className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-foreground" />
              <span className="font-bold text-xs uppercase text-foreground">SEC:A // BASE SERVICES PRICING SCALE BY MASS BRACKET</span>
            </div>
            <span className="text-[10px] text-muted-foreground">MANDATORY RE-CALCULATION ENG: ACTIVE</span>
          </div>

          <div className="p-4 bg-muted/30 border-b border-border tabular-nums text-xs leading-relaxed text-muted-foreground">
            Base services are dynamic. The Booking Wizard prompts owners for pet weight, lookup table maps the breed to the corresponding Mass Bracket, and locks in the precise rate. Cells below can be directly adjusted.
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse tabular-nums text-xs">
              <thead>
                <tr className="bg-muted/40  border-border text-[10px] uppercase text-foreground">
                  <th className="p-3 w-1/3 border-r border-border font-bold">SERVICE CODE / BASE DESIGNATION</th>
                  <th className="p-3 border-r border-border text-center font-bold">TOY BRACKET<span className="block text-[9px] text-muted-foreground font-normal">&lt; 10 LBS</span></th>
                  <th className="p-3 border-r border-border text-center font-bold">SMALL BRACKET<span className="block text-[9px] text-muted-foreground font-normal">10 - 25 LBS</span></th>
                  <th className="p-3 border-r border-border text-center font-bold">MEDIUM BRACKET<span className="block text-[9px] text-muted-foreground font-normal">25 - 50 LBS</span></th>
                  <th className="p-3 border-r border-border text-center font-bold">LARGE BRACKET<span className="block text-[9px] text-muted-foreground font-normal">50 - 90 LBS</span></th>
                  <th className="p-3 text-center font-bold">GIANT BRACKET<span className="block text-[9px] text-muted-foreground font-normal">&gt; 90 LBS</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {services.map((s) => (
                  <tr key={s.id} className="hover:bg-muted/30">
                    <td className="p-3 border-r border-border">
                      <div className="flex flex-col">
                        <span className="font-bold text-foreground text-xs uppercase">{s.name}</span>
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-1">
                          <span className="bg-muted/40 border border-border/20 px-1 text-[9px] font-bold text-foreground">{s.category}</span>
                          <span>• Duration: {s.dur}</span>
                        </div>
                      </div>
                    </td>
                    
                    {/* TOY */}
                    <td className="p-3 border-r border-border text-center">
                      {s.toy === '—' ? (
                        <span className="text-muted-foreground/70 font-bold">N/A</span>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-muted-foreground/70 text-[10px]">$</span>
                          <input 
                            type="text" 
                            value={s.toy} 
                            onChange={(e) => handlePriceChange(s.id, 'toy', e.target.value)}
                            className="w-14 border border-border/30 p-1 text-center font-bold tabular-nums focus:outline-none focus:border-border" 
                          />
                        </div>
                      )}
                    </td>

                    {/* SMALL */}
                    <td className="p-3 border-r border-border text-center">
                      {s.small === '—' ? (
                        <span className="text-muted-foreground/70 font-bold">N/A</span>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-muted-foreground/70 text-[10px]">$</span>
                          <input 
                            type="text" 
                            value={s.small} 
                            onChange={(e) => handlePriceChange(s.id, 'small', e.target.value)}
                            className="w-14 border border-border/30 p-1 text-center font-bold tabular-nums focus:outline-none focus:border-border" 
                          />
                        </div>
                      )}
                    </td>

                    {/* MEDIUM */}
                    <td className="p-3 border-r border-border text-center">
                      {s.medium === '—' ? (
                        <span className="text-muted-foreground/70 font-bold">N/A</span>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-muted-foreground/70 text-[10px]">$</span>
                          <input 
                            type="text" 
                            value={s.medium} 
                            onChange={(e) => handlePriceChange(s.id, 'medium', e.target.value)}
                            className="w-14 border border-border/30 p-1 text-center font-bold tabular-nums focus:outline-none focus:border-border" 
                          />
                        </div>
                      )}
                    </td>

                    {/* LARGE */}
                    <td className="p-3 border-r border-border text-center">
                      {s.large === '—' ? (
                        <span className="text-muted-foreground/70 font-bold">N/A</span>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-muted-foreground/70 text-[10px]">$</span>
                          <input 
                            type="text" 
                            value={s.large} 
                            onChange={(e) => handlePriceChange(s.id, 'large', e.target.value)}
                            className="w-14 border border-border/30 p-1 text-center font-bold tabular-nums focus:outline-none focus:border-border" 
                          />
                        </div>
                      )}
                    </td>

                    {/* GIANT */}
                    <td className="p-3 text-center">
                      {s.giant === '—' ? (
                        <span className="text-muted-foreground/70 font-bold">N/A</span>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-muted-foreground/70 text-[10px]">$</span>
                          <input 
                            type="text" 
                            value={s.giant} 
                            onChange={(e) => handlePriceChange(s.id, 'giant', e.target.value)}
                            className="w-14 border border-border/30 p-1 text-center font-bold tabular-nums focus:outline-none focus:border-border" 
                          />
                        </div>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-muted/40 border-t border-border flex flex-wrap items-center justify-between tabular-nums text-[11px] gap-2">
            <span>• TOY BRACKET: CHIHUAHUA, POMERANIAN // GIANT BRACKET: GREAT DANE, MASTIFF</span>
            <button onClick={() => showToast('MASS BRACKET MATRIX EDITOR OPENED')} className="border border-border bg-card px-2.5 py-1 text-xs hover:bg-muted/40 font-bold uppercase cursor-pointer">
              [EDIT MASS BRACKET ASSIGNMENTS]
            </button>
          </div>
        </div>

        {/* COLUMN 9-12: SALON ADD-ONS & RETAIL UPSELLS LIST */}
        <div className="xl:col-span-4 bg-card border-2 border-border flex flex-col shadow-[4px_4px_0px_#000000]">
          <div className="px-4 py-2.5  border-border bg-muted/40 flex items-center justify-between tabular-nums">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-foreground" />
              <span className="font-bold text-xs uppercase text-foreground">SEC:B // CO-BOOKING ADD-ONS CATALOG</span>
            </div>
            <button onClick={() => showToast('ADD-ON CREATOR INITIALIZED')} className="text-[10px] font-bold border border-border px-1.5 py-0.5 bg-card uppercase hover:bg-black hover:text-white cursor-pointer">+ ADD</button>
          </div>

          <div className="divide-y divide-border tabular-nums text-xs">
            {addons.map((a) => (
              <div key={a.id} className="p-3 bg-card flex flex-col justify-between hover:bg-muted/30">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="font-bold text-foreground uppercase text-xs">{a.name}</span>
                    <span className="block text-[10px] text-muted-foreground uppercase">{a.category} {"//"} {a.opt}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span className="text-muted-foreground/70 text-[11px]">$</span>
                    <input 
                      type="text" 
                      value={a.price} 
                      onChange={(e) => {
                        setAddons(prev => prev.map(item => item.id === a.id ? { ...item, price: e.target.value } : item));
                        showToast('ADD-ON PRICE UPDATED');
                      }}
                      className="w-14 border border-border/30 p-1 text-center font-bold text-foreground bg-muted/30 focus:outline-none focus:bg-card focus:border-border" 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-auto p-3 border-t border-border bg-muted/30 tabular-nums text-[11px]">
            <div className="flex items-center justify-between mb-1 text-[10px] text-muted-foreground font-bold uppercase">
              <span>SALON-OWNED APPOINTMENT EXTRAS</span>
              <span>COUNT: 5</span>
            </div>
            <p className="text-muted-foreground font-sans leading-tight">These addons populate the &apos;Add-ons&apos; stage of the Booking Wizard, increasing average ticket size by 24.8% blended.</p>
          </div>
        </div>

      </div>

      {/* SUPER ADMIN SECURITY LOCK FOOTER / HARDWARE ATTESTATION */}
      <div className="w-full bg-muted/30 border-t border-border border-b border-border p-4 flex flex-col md:flex-row items-center justify-between gap-4 select-none tabular-nums text-xs">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-primary text-primary-foreground flex items-center justify-center border border-border font-bold">
            <Lock className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-[10px] font-bold text-foreground uppercase">
              <span>SUPER_ADMIN LEVEL 0 // SERVICE CORE MATRIX ACCESS</span>
              <span className="border border-border px-1.5 bg-card text-[9px] font-bold">[YUBIKEY_FIDO2_ACTIVE]</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              Changes to core pricing metrics, commission distributions, or Stripe merchant catalog mappings require dual-signature multi-factor ratification.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-muted-foreground text-[10px] uppercase">AUDIT TRAIL:</span>
          <span className="border border-border bg-card px-2 py-0.5 text-foreground font-bold tabular-nums">PRICE_REF #TX-48210-2025</span>
          <button 
            onClick={() => showToast('SUPER_ADMIN ENCLAVE SESSION TERMINATED')}
            className="h-6 px-3 bg-primary text-primary-foreground text-[10px] uppercase font-bold hover:bg-muted transition-none cursor-pointer"
          >
            TERMINATE SESSION
          </button>
        </div>
      </div>

      {/* MONOCHROME TERMINAL STATUS LINE */}
      <div className="w-full bg-primary text-primary-foreground px-4 py-1.5 flex items-center justify-between tabular-nums text-[11px]">
        <div className="flex items-center gap-2">
          <span>&gt; CATALOG_DAEMON: ONLINE</span>
          <span className="inline-block w-[7px] h-[14px] bg-card animate-pulse"></span>
        </div>
        <div className="flex items-center gap-4 text-muted-foreground/70">
          <span>CATALOG_ID: CTL-4920</span>
          <span>CURRENCY: USD</span>
          <span>DAWG-OS CATALOG ENGINE v4.2</span>
        </div>
      </div>
    </div>
  );
};
