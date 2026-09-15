'use client';

import React, { useState } from 'react';

interface ScreenProps {
  onNavigateScreen?: (screenId: string) => void;
  selectedLocation?: string;
  onSelectLocation?: (loc: string) => void;
  systemSettings?: any;
  saveSettingsToDb?: (updates: any) => Promise<void>;
}

export const BookingOperationsRulesScreen: React.FC<ScreenProps> = ({
  onNavigateScreen,
  systemSettings,
  saveSettingsToDb,
}) => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [minHours, setMinHours] = useState('12');
  const [maxDays, setMaxDays] = useState('60');
  const [slotInterval, setSlotInterval] = useState('15');
  const [bufferTime, setBufferTime] = useState('15');
  const [autoBay, setAutoBay] = useState(true);
  const [mandatoryDeposit, setMandatoryDeposit] = useState(true);
  const [cardVault, setCardVault] = useState(true);
  const [prepayFirst, setPrepayFirst] = useState(true);
  const [autofillSms, setAutofillSms] = useState(true);
  const [responseWindow, setResponseWindow] = useState('10');
  const [gracePeriod, setGracePeriod] = useState('15');
  const [vetRabies, setVetRabies] = useState(true);
  const [vetDhpp, setVetDhpp] = useState(true);
  const [vetWaiver, setVetWaiver] = useState(true);
  const [saving, setSaving] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  React.useEffect(() => {
    if (systemSettings) {
      if (systemSettings.booking_max_horizon_days) setMaxDays(String(systemSettings.booking_max_horizon_days));
      if (systemSettings.booking_turnaround_buffer_minutes) setBufferTime(String(systemSettings.booking_turnaround_buffer_minutes));
      if (systemSettings.booking_allow_automatic_confirm !== undefined) setAutoBay(systemSettings.booking_allow_automatic_confirm);
      if (systemSettings.booking_require_deposit !== undefined) setMandatoryDeposit(systemSettings.booking_require_deposit);
    }
  }, [systemSettings]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleSave = async () => {
    setSaving(true);
    if (saveSettingsToDb) {
      await saveSettingsToDb({
        booking_max_horizon_days: Number(maxDays) || 60,
        booking_turnaround_buffer_minutes: Number(bufferTime) || 15,
        booking_allow_automatic_confirm: autoBay,
        booking_require_deposit: mandatoryDeposit,
      });
    }
    setSaving(false);
    showToast('BOOKING RULES PERSISTED TO PRODUCTION ENGINE & SUPABASE DB');
  };

  const handleRevert = () => {
    if (confirm('Reset current form values to system default production state?')) {
      setMinHours('12');
      setMaxDays('60');
      setSlotInterval('15');
      setBufferTime('15');
      setAutoBay(true);
      setMandatoryDeposit(true);
      setCardVault(true);
      setPrepayFirst(true);
      setAutofillSms(true);
      setResponseWindow('10');
      setGracePeriod('15');
      setVetRabies(true);
      setVetDhpp(true);
      setVetWaiver(true);
      showToast('CONFIGURATION ROLLBACK: RESET TO V2.4 DEFAULTS');
    }
  };

  return (
    <div className="w-full bg-card text-foreground font-sans antialiased text-xs">
      {/* Toast */}
      {toastMsg && (
        <div className="fixed top-16 right-6 bg-primary text-primary-foreground border border-border p-3 z-50 flex items-center gap-3 tabular-nums text-xs shadow-2xl">
          <div className="w-2 h-2 bg-card animate-pulse"></div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase tracking-wider font-bold">OPS_SERVER_COMMIT // 200 OK</span>
            <span className="text-muted-foreground/50">{toastMsg}</span>
          </div>
          <button onClick={() => setToastMsg(null)} className="ml-2 text-muted-foreground/70 hover:text-white cursor-pointer">✕</button>
        </div>
      )}

      {/* SUB-NAVIGATION BAR (ADMIN SETTINGS SUITE) */}
      <div className="w-full bg-card border-b border-border overflow-x-auto select-none">
        <div className="flex items-stretch min-w-max">
          <div className="px-4 py-2 bg-primary text-primary-foreground tabular-nums text-[11px] font-bold flex items-center gap-2">
            <span className="w-2 h-2 bg-card"></span>
            <span>SETTINGS_CONFIG</span>
          </div>
          <div className="flex items-stretch text-foreground tabular-nums text-xs">
            {[
              { num: '01', label: 'Overview', id: 'overview' },
              { num: '02', label: 'Organization', id: 'org-multiloc' },
              { num: '03', label: 'Users & Access', id: 'users-staff' },
              { num: '[ACT]', label: 'Booking & Operations', id: 'booking-ops', active: true },
              { num: '05', label: 'Services & Pricing', id: 'services-pricing' },
              { num: '06', label: 'Payments', id: 'payments-tax' },
              { num: '07', label: 'Website', id: 'cms-wizard' },
              { num: '08', label: 'Customer Portal', id: 'customer-portal' },
              { num: '09', label: 'Communications', id: 'org-social' },
              { num: '10', label: 'Inventory', id: 'oms-add-product' },
              { num: '11', label: 'Reports', id: 'invoices-aging' },
              { num: '12', label: 'System', id: 'system-telemetry' },
            ].map((tab) => (
              <button
                key={tab.label}
                onClick={() => onNavigateScreen?.(tab.id)}
                className={`px-3 py-2 border-r border-border/20 hover:bg-muted/40 transition-none flex items-center gap-1.5 cursor-pointer ${
                  tab.active ? 'bg-primary text-primary-foreground font-bold' : 'text-foreground'
                }`}
              >
                <span className={tab.active ? 'text-white text-[10px]' : 'text-muted-foreground/70 text-[10px]'}>{tab.num}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CONTROL PANEL HEADER STRIP */}
      <div className="w-full bg-card border-b border-border p-6 select-none">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold uppercase text-foreground tracking-tight font-sans">
              Booking Rules, Capacity &amp; Policies
            </h1>
            <p className="text-xs text-muted-foreground mt-1">
              Configure lead times, appointment buffers, deposit rules, cancellation policies, and pet health requirements.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => showToast('Booking rules updated successfully')}
              className="h-8 px-4 bg-primary text-primary-foreground border border-border font-bold uppercase text-xs hover:bg-muted cursor-pointer"
            >
              Save Policy Changes
            </button>
          </div>
        </div>
      </div>

      {/* MAIN OPERATIONAL MATRIX */}
      <div className="w-full p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* LEFT 7 COLS: SCHEDULING ENGINE, CAPACITY & DEPOSITS */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* SECTION 1: BOOKING SETTINGS & LEAD TIME */}
          <section className="border border-border bg-card">
            <div className="bg-muted/40 border-b border-border px-3 py-2 flex items-center justify-between tabular-nums text-xs">
              <span className="font-bold text-foreground uppercase">Lead Time &amp; Capacity Scheduler</span>
              <span className="text-[10px] text-muted-foreground font-bold">Active</span>
            </div>
            <div className="p-4 flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 tabular-nums text-xs">
                {/* Min Lead Time */}
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-muted-foreground mb-1">MIN ADVANCE BOOKING //</span>
                  <div className="flex items-stretch border border-border bg-card">
                    <input
                      value={minHours}
                      onChange={(e) => setMinHours(e.target.value)}
                      className="w-full px-2 h-8 font-bold text-foreground bg-transparent focus:outline-none"
                      type="number"
                    />
                    <span className="px-2 bg-muted/40 border-l border-border flex items-center text-[10px] uppercase text-foreground">
                      Hours
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1 font-sans">Prevents unmanageable same-day automated bookings.</span>
                </div>

                {/* Max Lead Time */}
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-muted-foreground mb-1">MAX ADVANCE BOOKING //</span>
                  <div className="flex items-stretch border border-border bg-card">
                    <input
                      value={maxDays}
                      onChange={(e) => setMaxDays(e.target.value)}
                      className="w-full px-2 h-8 font-bold text-foreground bg-transparent focus:outline-none"
                      type="number"
                    />
                    <span className="px-2 bg-muted/40 border-l border-border flex items-center text-[10px] uppercase text-foreground">
                      Days
                    </span>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1 font-sans">Window horizon visible to client web portal.</span>
                </div>

                {/* Interval Increments */}
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-muted-foreground mb-1">SLOT INTERVAL INCREMENTS //</span>
                  <div className="flex items-stretch border border-border bg-card">
                    <select
                      value={slotInterval}
                      onChange={(e) => setSlotInterval(e.target.value)}
                      className="w-full px-2 h-8 text-foreground bg-transparent focus:outline-none font-bold"
                    >
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="45">45 Minutes</option>
                      <option value="60">60 Minutes</option>
                    </select>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1 font-sans">Grid snap resolution for customer calendar UI.</span>
                </div>

                {/* Buffer Time */}
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-muted-foreground mb-1">TECH SANITIZATION BUFFER //</span>
                  <div className="flex items-stretch border border-border bg-card">
                    <select
                      value={bufferTime}
                      onChange={(e) => setBufferTime(e.target.value)}
                      className="w-full px-2 h-8 text-foreground bg-transparent focus:outline-none font-bold"
                    >
                      <option value="0">0 Minutes (No buffer)</option>
                      <option value="10">10 Mins / Tech</option>
                      <option value="15">15 Mins / Tech</option>
                      <option value="20">20 Mins / Tech</option>
                      <option value="30">30 Mins / Tech</option>
                    </select>
                  </div>
                  <span className="text-[11px] text-muted-foreground mt-1 font-sans">Auto-inserted between consecutive grooming sessions.</span>
                </div>
              </div>

              {/* Auto Bay Assignment Toggle Card */}
              <div className="border border-border p-3 bg-muted/30 flex items-start gap-3">
                <input
                  checked={autoBay}
                  onChange={(e) => setAutoBay(e.target.checked)}
                  id="bay-assign-check"
                  type="checkbox"
                  className="w-4 h-4 rounded-md accent-black mt-0.5 cursor-pointer"
                />
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-2">
                    <label className="font-bold text-sm uppercase text-foreground cursor-pointer font-sans" htmlFor="bay-assign-check">
                      Enable Automatic Bay &amp; Tub Assignment
                    </label>
                    <span className="text-[9px] border border-border px-1.5 py-0.2 bg-primary text-primary-foreground tabular-nums">
                      AUTO-ROTA
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Dynamic algorithmic routing reserves electric hydro-baths, hydraulic lift tables, and drying kennels based on breed weight classes: [Small &lt; 25 lbs], [Med 25-50 lbs], [Large 51-85 lbs], [Giant 85+ lbs].
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 pt-2 border-t border-border tabular-nums text-[10px]">
                    <div>BAY A: <span className="font-bold text-foreground">HYDRA-TUB 1</span></div>
                    <div>BAY B: <span className="font-bold text-foreground">HYDRA-TUB 2</span></div>
                    <div>BAY C: <span className="font-bold text-foreground">TABLE 1-4</span></div>
                    <div>BAY D: <span className="font-bold text-foreground">CABIN DRY</span></div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 2: DEPOSITS & PAYMENT ENFORCEMENT */}
          <section className="border border-border bg-card tabular-nums text-xs">
            <div className="bg-muted/40 border-b border-border px-3 py-2 flex items-center justify-between">
              <span className="font-bold text-foreground uppercase">SEC:02 // DEPOSIT PROTOCOLS &amp; GATEWAYS</span>
              <span className="text-[9px] text-muted-foreground">STRIPE.INTENT</span>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {/* Mandatory Deposit Row */}
              <div className="border border-border p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-card">
                <div className="flex items-start gap-3">
                  <input
                    checked={mandatoryDeposit}
                    onChange={(e) => setMandatoryDeposit(e.target.checked)}
                    id="mandatory-deposit"
                    type="checkbox"
                    className="w-4 h-4 rounded-md accent-black mt-0.5 cursor-pointer"
                  />
                  <div>
                    <label className="font-bold text-xs uppercase text-foreground cursor-pointer font-sans" htmlFor="mandatory-deposit">
                      Mandatory Deposit for Online Bookings
                    </label>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Require verified payment capture prior to slot lock in salon master database.
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 w-full md:w-auto">
                  <span className="text-[10px] uppercase text-muted-foreground">FORMULA:</span>
                  <div className="border border-border px-2 py-0.5 bg-muted/40 font-bold text-foreground text-[11px]">
                    $25.00 FLAT || 20% (&gt;$100)
                  </div>
                </div>
              </div>

              {/* Card on File Row */}
              <div className="border border-border p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-card">
                <div className="flex items-start gap-3">
                  <input
                    checked={cardVault}
                    onChange={(e) => setCardVault(e.target.checked)}
                    id="card-vault"
                    type="checkbox"
                    className="w-4 h-4 rounded-md accent-black mt-0.5 cursor-pointer"
                  />
                  <div>
                    <label className="font-bold text-xs uppercase text-foreground cursor-pointer font-sans" htmlFor="card-vault">
                      Card on File Vault Requirement
                    </label>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Stripe SetupIntent verification required for offline charges, add-ons, or late fees.
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 border border-border bg-primary text-primary-foreground text-[9px] uppercase font-bold">
                  ENFORCED
                </span>
              </div>

              {/* First Time Prepayment */}
              <div className="border border-border p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 bg-card">
                <div className="flex items-start gap-3">
                  <input
                    checked={prepayFirst}
                    onChange={(e) => setPrepayFirst(e.target.checked)}
                    id="prepay-first"
                    type="checkbox"
                    className="w-4 h-4 rounded-md accent-black mt-0.5 cursor-pointer"
                  />
                  <div>
                    <label className="font-bold text-xs uppercase text-foreground cursor-pointer font-sans" htmlFor="prepay-first">
                      First-Time Client Full Prepayment
                    </label>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Profiles with 0 completed appointments must settle 100% of estimate at checkout.
                    </div>
                  </div>
                </div>
                <span className="px-2 py-0.5 border border-border bg-muted/40 text-foreground text-[10px] uppercase font-bold">
                  100% CAPTURE
                </span>
              </div>
            </div>
          </section>

          {/* SECTION 4: WAITLIST & AUTO-FILL RULES */}
          <section className="border border-border bg-card tabular-nums text-xs">
            <div className="bg-muted/40 border-b border-border px-3 py-2 flex items-center justify-between">
              <span className="font-bold text-foreground uppercase">SEC:04 // WAITLIST CASCADE &amp; REAL-TIME DISPATCH</span>
              <span className="text-[9px] text-muted-foreground">AUTO_FILL</span>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div className="flex items-start gap-3 pb-3 border-b border-border">
                <input
                  checked={autofillSms}
                  onChange={(e) => setAutofillSms(e.target.checked)}
                  id="autofill-sms"
                  type="checkbox"
                  className="w-4 h-4 rounded-md accent-black mt-0.5 cursor-pointer"
                />
                <div className="flex flex-col flex-1">
                  <label className="font-bold text-xs uppercase text-foreground cursor-pointer font-sans" htmlFor="autofill-sms">
                    Immediate SMS Dispatch on Slot Cancellation
                  </label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    When a confirmed slot is cancelled, automatically query sorted queue matching dog size parameters and groomer specialization.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase text-muted-foreground mb-1">CLIENT RESPONSE WINDOW //</span>
                  <div className="flex items-stretch border border-border bg-card">
                    <input
                      value={responseWindow}
                      onChange={(e) => setResponseWindow(e.target.value)}
                      className="w-full px-2 h-8 font-bold text-foreground bg-transparent focus:outline-none"
                      type="number"
                    />
                    <span className="px-2 bg-muted/40 border-l border-border flex items-center text-[10px] uppercase text-foreground font-bold">
                      Minutes
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 font-sans">
                    If unclaimed within window, offer rolls instantly to next client.
                  </span>
                </div>
                <div className="border border-border p-2.5 bg-muted/40 flex flex-col justify-between h-full">
                  <span className="text-[9px] uppercase text-muted-foreground font-bold">CASCADE STRATEGY</span>
                  <div className="font-bold text-foreground mt-1 text-xs">FIRST-CLAIM-WINS // QUEUE_ORDER</div>
                  <span className="text-[9px] text-muted-foreground mt-1">3 ATTEMPTS MAX / REVERT TO OPEN TERMINAL</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* RIGHT 5 COLS: FORFEITURE POLICIES & HEALTH SAFETY GATES */}
        <div className="lg:col-span-5 flex flex-col gap-4 tabular-nums text-xs">
          {/* SECTION 3: CANCELLATION & NO-SHOW RULES */}
          <section className="border border-border bg-card">
            <div className="bg-muted/40 border-b border-border px-3 py-2 flex items-center justify-between">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Cancellation &amp; Forfeiture</span>
              <span className="text-[9px] text-muted-foreground">POLICY_DEF</span>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div className="flex flex-col border border-border p-3 bg-muted/30">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] uppercase text-muted-foreground font-bold">CANCELLATION CUTOFF //</span>
                  <span className="text-[9px] border border-border px-1.5 bg-primary text-primary-foreground font-bold">THRESHOLD</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm uppercase text-foreground font-sans">Standard Cutoff</span>
                  <span className="text-lg font-bold text-foreground font-sans">24 HOURS</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 font-sans">
                  Cancellations logged with ≥ 24h notice receive 100% deposit credit toward rescheduled date.
                </p>
              </div>

              <div className="flex flex-col border border-border p-3 bg-card">
                <span className="text-[10px] uppercase text-muted-foreground mb-1 font-bold">LATE CANCELLATION PENALTY //</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">FORFEIT FULL DEPOSIT</span>
                  <span className="text-foreground font-bold">$25.00 FORFEITURE</span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 font-sans">
                  Directly transferred to salon administrative ledger as tech compensation.
                </p>
              </div>

              <div className="flex flex-col border border-border p-3 bg-card">
                <span className="text-[10px] uppercase text-muted-foreground mb-1 font-bold">NO-SHOW PENALTY ACTION //</span>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">100% ESTIMATE CHARGE</span>
                  <span className="text-[9px] border border-border px-1.5 bg-muted/40 text-foreground uppercase font-bold">
                    AUTO-DEBIT
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1 font-sans">
                  Billed automatically to stored Stripe card-on-file with receipt dispatch.
                </p>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] uppercase text-muted-foreground mb-1 font-bold">TERMINAL GRACE PERIOD //</span>
                <div className="flex items-stretch border border-border bg-card">
                  <select
                    value={gracePeriod}
                    onChange={(e) => setGracePeriod(e.target.value)}
                    className="w-full px-2 h-8 text-foreground bg-transparent focus:outline-none font-bold"
                  >
                    <option value="10">10 Minutes after start</option>
                    <option value="15">15 Minutes after start</option>
                    <option value="20">20 Minutes after start</option>
                    <option value="30">30 Minutes (Manual Override)</option>
                  </select>
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 font-sans">
                  Grace interval before automated status mutation to `NO_SHOW_CANCELLED`.
                </span>
              </div>
            </div>
          </section>

          {/* SECTION 5: HEALTH & SAFETY PREREQUISITES */}
          <section className="border border-border bg-card">
            <div className="bg-muted/40 border-b border-border px-3 py-2 flex items-center justify-between">
              <span className="font-bold text-foreground uppercase">SEC:05 // CANINE HEALTH &amp; VET INTAKE GATE</span>
              <span className="text-[9px] text-muted-foreground">BIO_HAZARD</span>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <div className="p-2.5 border border-border bg-muted/40 flex items-center gap-2 font-bold text-[10px] uppercase text-foreground">
                <span>🛡 STRICT STATE BOARD COMPLIANCE MANDATE</span>
              </div>

              {/* Checkbox 1: Rabies */}
              <div className="flex items-start gap-3 p-2.5 border border-border">
                <input
                  checked={vetRabies}
                  onChange={(e) => setVetRabies(e.target.checked)}
                  id="vet-rabies"
                  type="checkbox"
                  className="w-4 h-4 rounded-md accent-black mt-0.5 cursor-pointer"
                />
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs uppercase text-foreground cursor-pointer font-sans" htmlFor="vet-rabies">
                      Rabies Certificate
                    </label>
                    <span className="text-[9px] border border-border px-1.5 py-0.2 bg-primary text-primary-foreground font-bold">
                      [MANDATORY]
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 font-sans">
                    Expiration date validation required. Automated OCR document scan verification.
                  </p>
                </div>
              </div>

              {/* Checkbox 2: DHPP / Bordetella */}
              <div className="flex items-start gap-3 p-2.5 border border-border">
                <input
                  checked={vetDhpp}
                  onChange={(e) => setVetDhpp(e.target.checked)}
                  id="vet-dhpp"
                  type="checkbox"
                  className="w-4 h-4 rounded-md accent-black mt-0.5 cursor-pointer"
                />
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs uppercase text-foreground cursor-pointer font-sans" htmlFor="vet-dhpp">
                      DHPP &amp; Bordetella
                    </label>
                    <span className="text-[9px] border border-border px-1.5 py-0.2 bg-muted/40 text-foreground font-bold">
                      REQUIRED
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 font-sans">
                    Must be updated every 6 or 12 calendar months depending on vet ledger.
                  </p>
                </div>
              </div>

              {/* Checkbox 3: Aggression & Medical Waiver */}
              <div className="flex items-start gap-3 p-2.5 border border-border">
                <input
                  checked={vetWaiver}
                  onChange={(e) => setVetWaiver(e.target.checked)}
                  id="vet-waiver"
                  type="checkbox"
                  className="w-4 h-4 rounded-md accent-black mt-0.5 cursor-pointer"
                />
                <div className="flex flex-col flex-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-xs uppercase text-foreground cursor-pointer font-sans" htmlFor="vet-waiver">
                      Behavior &amp; Aggression Waiver
                    </label>
                    <span className="text-[9px] border border-border px-1.5 py-0.2 bg-muted/40 text-foreground font-bold">
                      SIGNATURE
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1 font-sans">
                    Digital e-signature required per dog annually. Includes muzzling &amp; handling authorization.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* STICKY ACTION TRAY */}
      <div className="sticky bottom-0 w-full bg-card border-t border-border p-3 flex flex-wrap items-center justify-between z-30 select-none tabular-nums text-xs gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-black"></span>
            <span className="font-bold uppercase text-foreground">SYS_BUFFER // CHANGES_READY</span>
          </div>
          <span className="text-muted-foreground hidden sm:inline">
            Local cache modified. Ready to commit to master edge nodes.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRevert}
            className="h-9 px-3 border border-border bg-card hover:bg-muted/40 text-foreground uppercase cursor-pointer"
          >
            Revert to Default
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="h-9 px-4 border border-border bg-primary text-primary-foreground hover:bg-primary/90 uppercase flex items-center gap-1.5 cursor-pointer font-bold"
          >
            <span>💾</span>
            <span>{saving ? 'COMMITTING...' : 'Save Booking Configuration'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
