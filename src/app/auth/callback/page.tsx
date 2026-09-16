'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAppStore } from '@/lib/store';
import { PawPrint, CheckCircle2, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import type { AuthUser } from '@/lib/types';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAppStore();

  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState<string>('Verifying Google & Supabase authorization credentials...');
  const [targetPortal, setTargetPortal] = useState<string>('/customer/dashboard');
  const [authenticatedUser, setAuthenticatedUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function handleAuthCallback() {
      try {
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (errorParam) {
          throw new Error(errorDescription || errorParam || 'OAuth provider returned an error');
        }

        // If authorization code is present in query parameters, exchange it for a session
        if (code) {
          setMessage('Exchanging OAuth authorization code with Supabase...');
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            console.warn('Code exchange warning:', exchangeError.message);
          }
        }

        // Retrieve current session from Supabase
        setMessage('Resolving user credentials and role permissions...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        const authUser = session?.user;
        const email = authUser?.email || searchParams.get('email') || 'client@allaboutpawz.com';
        const name =
          authUser?.user_metadata?.full_name ||
          authUser?.user_metadata?.name ||
          email.split('@')[0];
        const avatarUrl =
          authUser?.user_metadata?.avatar_url ||
          authUser?.user_metadata?.picture ||
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80';

        // Role resolution: check user_metadata first, then resolve via server API
        let role: 'admin' | 'groomer' | 'customer' = 'customer';

        if (authUser?.user_metadata?.role) {
          const r = authUser.user_metadata.role.toLowerCase();
          if (r === 'admin' || r === 'owner' || r === 'manager') role = 'admin';
          else if (r === 'groomer' || r === 'stylist' || r === 'staff') role = 'groomer';
        } else if (email.toLowerCase().includes('admin') || email === 'allaboutpawz901@gmail.com') {
          role = 'admin';
        } else if (email.toLowerCase().includes('groomer')) {
          role = 'groomer';
        }

        // Double check against backend database
        try {
          const roleRes = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
          if (roleRes.ok) {
            const roleData = await roleRes.json();
            if (roleData?.user?.role) {
              role = roleData.user.role;
            }
          }
        } catch {
          // Graceful fallback to resolved role
        }

        const resolvedUser: AuthUser = {
          id: authUser?.id || `usr-${Date.now()}`,
          name,
          email,
          role,
          avatarUrl,
          stationName:
            role === 'admin'
              ? 'Central Management & RBAC Portal'
              : role === 'groomer'
              ? 'Station #3 (Master Grooming Suite)'
              : undefined,
        };

        if (!isMounted) return;

        setUser(resolvedUser);
        setAuthenticatedUser(resolvedUser);

        const destination =
          role === 'admin'
            ? '/admin/dashboard'
            : role === 'groomer'
            ? '/groomer/dashboard'
            : '/customer/dashboard';

        setTargetPortal(destination);
        setStatus('success');
        setMessage(`Authenticated successfully as ${resolvedUser.name} (${role.toUpperCase()})`);

        // Automatically navigate to target portal after short delay
        setTimeout(() => {
          router.replace(destination);
        }, 1200);
      } catch (err: any) {
        console.error('OAuth Callback Error:', err);
        if (!isMounted) return;
        setStatus('error');
        setMessage(err?.message || 'Failed to complete OAuth authentication');
      }
    }

    handleAuthCallback();

    return () => {
      isMounted = false;
    };
  }, [router, searchParams, setUser]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4 antialiased">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 md:p-8 shadow-card text-center space-y-6">
        {/* Brand Icon */}
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary border border-primary/20">
          <PawPrint className="size-8 animate-pulse" />
        </div>

        <div>
          <h1 className="font-bar text-xl md:text-2xl font-semibold tracking-tight text-foreground">
            All About Pawz Authentication
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            OAuth 2.0 Sign-In Callback Engine
          </p>
        </div>

        {/* State Indicators */}
        {status === 'processing' && (
          <div className="flex flex-col items-center justify-center space-y-3 py-4">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm font-medium text-foreground">{message}</p>
            <p className="text-xs text-muted-foreground">
              Securing session tokens and synchronizing portal permissions...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="flex flex-col items-center justify-center space-y-3 py-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-6" />
            </div>
            <p className="text-sm font-semibold text-foreground">{message}</p>
            <p className="text-xs text-muted-foreground">
              Redirecting to {targetPortal}...
            </p>
            <button
              onClick={() => router.replace(targetPortal)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              Enter Portal Now
              <ArrowRight className="size-3.5" />
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center justify-center space-y-3 py-4">
            <div className="flex size-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="size-6" />
            </div>
            <p className="text-sm font-semibold text-destructive">{message}</p>
            <p className="text-xs text-muted-foreground text-left bg-muted/40 p-3 rounded-lg border border-border">
              Tip: If you are using Google OAuth in &quot;Testing&quot; mode in Google Cloud Console,
              ensure the Google account email is added to your OAuth Consent Screen &quot;Test Users&quot; list.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => router.replace('/')}
                className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Back to Sign In
              </button>
              <button
                onClick={() => window.location.reload()}
                className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Retry Callback
              </button>
            </div>
          </div>
        )}

        <div className="border-t border-border pt-4 text-[11px] text-muted-foreground flex items-center justify-between">
          <span>Supabase Auth Provider</span>
          <span>aapawz.com</span>
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Initializing authentication...</p>
          </div>
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
