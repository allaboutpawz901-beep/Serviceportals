'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import {
  PawPrint,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  User,
  Scissors,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  ExternalLink,
  KeyRound,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import type { AuthUser, DawgNavSection } from '@/lib/types';
import { DEMO_AUTH_USERS } from '@/lib/dawg-mock-data';

interface SingleLoginViewProps {
  onLogin: (user: AuthUser, initialSection?: string) => void;
}

export const SingleLoginView: React.FC<SingleLoginViewProps> = ({ onLogin }) => {
  const router = useRouter();
  const { currentUser, setUser, setActiveSection } = useAppStore();

  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'customer' | 'groomer' | 'admin'>('customer');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sign in with Google (Supabase OAuth)
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const redirectUrl =
        typeof window !== 'undefined'
          ? `${window.location.origin}/auth/callback`
          : 'https://aapawz.com/auth/callback';

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        throw error;
      }

      // If Supabase returned a direct provider URL
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      console.warn('Google OAuth initiation note:', err?.message);
      // If running inside sandbox iframe where popup/redirect might be constrained
      setErrorMessage(
        `Google OAuth Redirect: ${err?.message || 'Initiating Google authentication...'}. In preview mode, you can also use Instant Passports below.`
      );
      setLoading(false);
    }
  };

  // Sign in with Email / Password
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage('Please enter an email address');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'register') {
        // Call registration API
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: password || 'Password123!',
            name: fullName || cleanEmail.split('@')[0],
            role: selectedRole,
            phone,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'Registration failed');
        }

        setSuccessMessage(`Account created for ${cleanEmail}! Logging you in...`);
        const registeredUser: AuthUser = {
          id: data.user.id,
          email: cleanEmail,
          name: fullName || cleanEmail.split('@')[0],
          role: selectedRole,
          avatarUrl:
            selectedRole === 'admin'
              ? DEMO_AUTH_USERS[0].avatarUrl
              : selectedRole === 'groomer'
              ? DEMO_AUTH_USERS[1].avatarUrl
              : DEMO_AUTH_USERS[2].avatarUrl,
        };

        setTimeout(() => {
          onLogin(registeredUser);
        }, 800);
        return;
      }

      // Mode === 'signin'
      // Try backend authentication and role resolution
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: password || 'demo-auth',
        }),
      });

      const data = await res.json();

      let detectedRole: 'admin' | 'groomer' | 'customer' = 'customer';
      let resolvedName = cleanEmail.split('@')[0];

      if (res.ok && data?.user) {
        detectedRole = data.user.role;
        resolvedName = data.user.name || resolvedName;
      } else {
        // Client fallback role heuristic
        if (cleanEmail.includes('admin') || cleanEmail.includes('owner') || cleanEmail === 'allaboutpawz901@gmail.com') {
          detectedRole = 'admin';
        } else if (cleanEmail.includes('groomer') || cleanEmail.includes('staff')) {
          detectedRole = 'groomer';
        }
      }

      const userToLogin: AuthUser = {
        id: data?.user?.id || `usr-${Date.now()}`,
        name: resolvedName,
        email: cleanEmail,
        role: detectedRole,
        avatarUrl:
          detectedRole === 'admin'
            ? DEMO_AUTH_USERS[0].avatarUrl
            : detectedRole === 'groomer'
            ? DEMO_AUTH_USERS[1].avatarUrl
            : DEMO_AUTH_USERS[2].avatarUrl,
        stationName:
          detectedRole === 'admin'
            ? 'Central Management & RBAC Portal'
            : detectedRole === 'groomer'
            ? 'Station #3 (Master Grooming Suite)'
            : undefined,
      };

      onLogin(userToLogin);
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err?.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Instant demo passport login
  const handleQuickPassport = (role: 'customer' | 'groomer' | 'admin') => {
    setLoading(true);
    let demoUser: AuthUser;

    if (role === 'admin') {
      demoUser = {
        id: 'usr-admin-1',
        name: 'Sunny Avington',
        email: 'allaboutpawz901@gmail.com',
        role: 'admin',
        avatarUrl: DEMO_AUTH_USERS[0].avatarUrl,
        stationName: 'Central Management & RBAC Portal',
      };
    } else if (role === 'groomer') {
      demoUser = {
        id: 'usr-groomer-1',
        name: 'Sarah Miller',
        email: 'sarah.groomer@allaboutpawz.com',
        role: 'groomer',
        avatarUrl: DEMO_AUTH_USERS[1].avatarUrl,
        stationName: 'Station #3 (Master Grooming Suite)',
      };
    } else {
      demoUser = {
        id: 'usr-cust-1',
        name: 'Marcus Johnson',
        email: 'managekube@gmail.com',
        role: 'customer',
        avatarUrl: DEMO_AUTH_USERS[2].avatarUrl,
      };
    }

    setTimeout(() => {
      onLogin(demoUser);
      setLoading(false);
    }, 250);
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 md:p-6 antialiased font-sans text-foreground">
      {/* Background Decorative Accents */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 size-96 rounded-full bg-primary/15 blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-5">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-card">
            <PawPrint className="size-7" />
          </div>
          <div>
            <h1 className="font-bar text-2xl md:text-3xl font-bold tracking-tight text-foreground">
              All About Pawz
            </h1>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5">
              Luxury Pet Grooming & Spa Service Portal
            </p>
          </div>
        </div>

        {/* Existing Active Session Notice (If already signed in, prevent redirect lock) */}
        {currentUser && (
          <div className="rounded-2xl border border-primary/30 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                Active Session Detected
              </span>
              <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase">
                {currentUser.role}
              </span>
            </div>
            <p className="text-xs text-foreground font-medium">
              Signed in as <span className="font-semibold">{currentUser.name}</span> ({currentUser.email})
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  const target =
                    currentUser.role === 'admin'
                      ? '/admin/dashboard'
                      : currentUser.role === 'groomer'
                      ? '/groomer/dashboard'
                      : '/customer/dashboard';
                  router.push(target);
                }}
                className="flex-1 rounded-xl bg-primary py-2 px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Enter {currentUser.role.toUpperCase()} Portal</span>
                <ArrowRight className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setUser(null);
                  setSuccessMessage('Signed out successfully.');
                }}
                className="rounded-xl border border-border bg-card py-2 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center gap-1 cursor-pointer"
              >
                <LogOut className="size-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Authentication Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card space-y-5">
          {/* Mode Switcher Tabs */}
          <div className="flex items-center rounded-xl bg-muted/60 p-1 border border-border">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMessage(null);
              }}
              className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all cursor-pointer ${
                mode === 'register'
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback alerts */}
          {errorMessage && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 flex items-start gap-2">
              <CheckCircle2 className="size-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* 1. Google OAuth Button */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 rounded-xl border border-border bg-background py-2.5 px-4 text-xs font-semibold text-foreground hover:bg-muted/80 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <svg className="size-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
            <p className="text-[10px] text-muted-foreground text-center mt-1.5">
              Production & Test users supported via Supabase Google OAuth
            </p>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-border" />
            <span className="bg-card px-2 text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
              or with email
            </span>
          </div>

          {/* 2. Email & Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    Account Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'customer', label: 'Pet Parent' },
                      { id: 'groomer', label: 'Groomer' },
                      { id: 'admin', label: 'Admin' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedRole(t.id as any)}
                        className={`rounded-lg py-1.5 px-2 text-[11px] font-semibold border transition-all cursor-pointer ${
                          selectedRole === t.id
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border bg-background text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Password
                </label>
                {mode === 'signin' && (
                  <span className="text-[11px] text-primary hover:underline cursor-pointer">
                    Forgot?
                  </span>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required={mode === 'register'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? '••••••••••••' : '•••••••• (or leave blank for demo)'}
                  className="w-full rounded-xl border border-border bg-background py-2 pl-9 pr-9 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-primary py-2.5 px-4 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{mode === 'signin' ? 'Sign In to Portal' : 'Create Account in Supabase'}</span>
              <ArrowRight className="size-3.5" />
            </button>
          </form>

          {/* 3. Instant Testing Passports / Role Switcher */}
          <div className="border-t border-border pt-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Instant Demo Passports
              </span>
              <span className="text-[10px] text-primary font-medium">1-Click Portal Entry</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickPassport('customer')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border bg-background hover:bg-primary/5 hover:border-primary/40 transition-all text-center cursor-pointer group"
              >
                <div className="size-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <User className="size-4" />
                </div>
                <span className="text-[11px] font-bold text-foreground">Customer</span>
                <span className="text-[9px] text-muted-foreground">Parent Portal</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPassport('groomer')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border bg-background hover:bg-primary/5 hover:border-primary/40 transition-all text-center cursor-pointer group"
              >
                <div className="size-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <Scissors className="size-4" />
                </div>
                <span className="text-[11px] font-bold text-foreground">Groomer</span>
                <span className="text-[9px] text-muted-foreground">Staff Station</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPassport('admin')}
                className="flex flex-col items-center justify-center p-2.5 rounded-xl border border-border bg-background hover:bg-primary/5 hover:border-primary/40 transition-all text-center cursor-pointer group"
              >
                <div className="size-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="size-4" />
                </div>
                <span className="text-[11px] font-bold text-foreground">Admin</span>
                <span className="text-[9px] text-muted-foreground">Full Salon Ops</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Supabase OAuth Server Identity Provider Preview Callout */}
        <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 text-center space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-foreground">
            <div className="flex items-center gap-1.5">
              <KeyRound className="size-4 text-primary" />
              <span>Supabase OAuth Server</span>
            </div>
            <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
              Identity Provider
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed text-left">
            Configure third-party apps to authenticate via All About Pawz. Preview and test your custom OAuth Authorization Consent Screen:
          </p>
          <Link
            href="/oauth/consent"
            className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-card hover:bg-muted py-2 px-3 text-xs font-semibold text-foreground transition-colors cursor-pointer"
          >
            <span>Preview Authorization URL (/oauth/consent)</span>
            <ExternalLink className="size-3 text-muted-foreground" />
          </Link>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground px-2">
          <span>Supabase Auth & PostgreSQL</span>
          <span>https://aapawz.com</span>
        </div>
      </div>
    </div>
  );
};
