'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PawPrint, ShieldCheck, Scissors, AlertCircle, ArrowRight, Lock } from 'lucide-react';

function StaffLoginContent() {
  const router = useRouter();
  const search = useSearchParams();
  const error = search.get('error');
  const email = search.get('email');
  const [emailInput, setEmailInput] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const errorMessages: Record<string, string> = {
    not_authorized: email
      ? `${email} is not registered at this salon. Access is gated — you must be an existing client (created at checkout, booking, or walk-in) or staff (pre-created by an administrator) before you can sign in. Please contact the salon to be set up.`
      : 'Not registered at this salon. Contact the salon to be set up.',
    email_not_verified: 'Google email not verified.',
    token_exchange_failed: 'Google rejected the authorization code. Try again.',
    userinfo_failed: 'Could not fetch your Google profile.',
    oauth_not_configured: 'Google OAuth is not configured on the server.',
    supabase_not_configured: 'Supabase is not configured on the server.',
    missing_code: 'No authorization code returned from Google.',
    server_error: 'Unexpected server error. Check logs.',
  };
  const shownError = localError || (error ? errorMessages[error] || error : null);

  const handleGoogle = (portal: 'admin' | 'groomer') => {
    setLocalError(null);
    router.push(`/api/auth/google?portal=${portal}`);
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    if (!emailInput) {
      setLocalError('Enter your staff email.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setLocalError(data.error || 'Login failed.');
        setSubmitting(false);
        return;
      }
      // Staff-only: reject customers
      if (data.user?.role === 'customer') {
        setLocalError('This is a customer account. Customers sign in through the booking or shop portal, not here. If you are staff, use your staff email.');
        setSubmitting(false);
        return;
      }
      // Hand off to page.tsx onLogin flow by setting the store directly
      const { useAppStore } = await import('@/lib/store');
      useAppStore.getState().setUser(data.user);
      if (data.user.role === 'groomer') {
        router.push('/groomer/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setLocalError(err.message || 'Network error.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-sidebar px-4 py-12 antialiased">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20 mb-4">
            <PawPrint className="size-7" />
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-topbar-foreground">
            All About Pawz
          </h1>
          <p className="text-[13px] text-topbar-foreground/60 mt-1">
            Staff Portal Access
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card space-y-6">
          {/* Notice */}
          <div className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 p-3">
            <ShieldCheck className="size-4 text-primary shrink-0 mt-0.5" />
            <p className="text-[12px] text-muted-foreground leading-relaxed">
              This portal is for <span className="font-semibold text-foreground">staff only</span> (administrators, managers, front desk, groomers). Customers are <span className="font-semibold text-foreground">not</span> able to self-register — they are created through the booking wizard, shop checkout, or walk-in intake once a deposit is paid.
            </p>
          </div>

          {shownError && (
            <div className="flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
              <AlertCircle className="size-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-[12px] text-destructive leading-relaxed">{shownError}</p>
            </div>
          )}

          {/* Google OAuth */}
          <div className="space-y-3">
            <button
              onClick={() => handleGoogle('groomer')}
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2.5 h-11 rounded-lg border border-border bg-background text-foreground text-[13px] font-medium hover:bg-accent transition-colors cursor-pointer disabled:opacity-50"
            >
              <Scissors className="size-4 text-primary" />
              Continue with Google — Groomer
            </button>
            <button
              onClick={() => handleGoogle('admin')}
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2.5 h-11 rounded-lg border border-border bg-background text-foreground text-[13px] font-medium hover:bg-accent transition-colors cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="size-4 text-primary" />
              Continue with Google — Admin / Front Desk
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-[11px] text-muted-foreground uppercase tracking-wider">or staff email</span>
            </div>
          </div>

          {/* Password login */}
          <form onSubmit={handlePasswordLogin} className="space-y-3">
            <div>
              <label htmlFor="staff-email" className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Staff Email
              </label>
              <input
                id="staff-email"
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="you@allaboutpawz.com"
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="staff-password" className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                Password
              </label>
              <input
                id="staff-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-[13px] text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90 transition-colors cursor-pointer disabled:opacity-50"
            >
              <Lock className="size-4" />
              {submitting ? 'Verifying…' : 'Sign In'}
              {!submitting && <ArrowRight className="size-4" />}
            </button>
          </form>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-[12px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            ← Back to site
          </button>
        </div>

        <p className="text-center text-[11px] text-muted-foreground/60 mt-4">
          © {new Date().getFullYear()} All About Pawz · Staff access only
        </p>
      </div>
    </div>
  );
}

export default function StaffLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-sidebar">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <StaffLoginContent />
    </Suspense>
  );
}
