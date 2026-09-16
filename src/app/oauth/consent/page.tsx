'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import {
  ShieldCheck,
  PawPrint,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  Lock,
  UserCheck,
  Key,
  Info,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react';

function OAuthConsentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser, setUser } = useAppStore();

  const clientId = searchParams.get('client_id') || 'pawz-partner-connect-app';
  const redirectUri = searchParams.get('redirect_uri') || '';
  const scopeParam = searchParams.get('scope') || 'openid profile email pets:read appointments:write';
  const state = searchParams.get('state') || '';
  const responseType = searchParams.get('response_type') || 'code';
  const authorizationId = searchParams.get('authorization_id') || '';

  const isPreviewMode = !redirectUri;

  const [authorizing, setAuthorizing] = useState(false);
  const [authorizedSuccess, setAuthorizedSuccess] = useState(false);
  const [denied, setDenied] = useState(false);
  const [activeTab, setActiveTab] = useState<'consent' | 'preview_settings'>('consent');

  // Parse scopes into human-readable list
  const requestedScopes = scopeParam.split(' ').filter(Boolean).map((s) => {
    switch (s) {
      case 'openid':
      case 'profile':
        return {
          id: s,
          title: 'Account Profile Information',
          description: 'View your name, avatar, and contact details',
          critical: false,
        };
      case 'email':
        return {
          id: s,
          title: 'Email Address Access',
          description: 'Verify and contact you at your registered email address',
          critical: false,
        };
      case 'pets:read':
        return {
          id: s,
          title: 'Pet Records & Profiles',
          description: 'View registered pets, breeds, vaccination statuses, and coat notes',
          critical: false,
        };
      case 'appointments:write':
      case 'appointments':
        return {
          id: s,
          title: 'Appointment Management',
          description: 'Schedule, reschedule, or inspect grooming bookings on your behalf',
          critical: true,
        };
      default:
        return {
          id: s,
          title: `Scope: ${s}`,
          description: `Access resource data permitted by ${s}`,
          critical: false,
        };
    }
  });

  const handleAuthorize = async () => {
    setAuthorizing(true);

    try {
      if (redirectUri) {
        // Construct code and redirect to third-party callback
        const authCode = `pawz_auth_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
        const targetUrl = new URL(redirectUri);
        targetUrl.searchParams.set('code', authCode);
        if (state) {
          targetUrl.searchParams.set('state', state);
        }
        window.location.href = targetUrl.toString();
        return;
      }

      // Preview simulation
      await new Promise((r) => setTimeout(r, 600));
      setAuthorizedSuccess(true);
      setAuthorizing(false);
    } catch (err) {
      console.error('Authorization error:', err);
      setAuthorizing(false);
    }
  };

  const handleDeny = () => {
    setDenied(true);
    if (redirectUri) {
      const targetUrl = new URL(redirectUri);
      targetUrl.searchParams.set('error', 'access_denied');
      targetUrl.searchParams.set('error_description', 'The user denied the authorization request');
      if (state) targetUrl.searchParams.set('state', state);
      window.location.href = targetUrl.toString();
    }
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 md:p-6 antialiased font-sans text-foreground">
      {/* Top Identity Banner */}
      <div className="w-full max-w-lg mb-4 flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="size-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm">
            <PawPrint className="size-4" />
          </div>
          <div>
            <span className="text-sm font-bold tracking-tight text-foreground block">
              All About Pawz
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              OAuth 2.0 Identity Provider
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/60 px-2.5 py-1 rounded-full border border-border">
          <Lock className="size-3 text-emerald-500" />
          <span>Encrypted HTTPS Flow</span>
        </div>
      </div>

      {/* Main Consent Card */}
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card shadow-card overflow-hidden">
        {/* Banner */}
        <div className="bg-primary/5 border-b border-border p-5 text-center">
          <div className="mx-auto size-12 rounded-2xl bg-background border border-border shadow-sm flex items-center justify-center text-primary mb-3">
            <ShieldCheck className="size-6 text-primary" />
          </div>
          <h1 className="font-bar text-lg md:text-xl font-bold tracking-tight text-foreground">
            Authorize Application Access
          </h1>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            An external application is requesting authorization to connect with your All About Pawz account.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Client Application Details */}
          <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Requesting Client
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                OAuth 2.0 Client
              </span>
            </div>
            <div className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Key className="size-4 text-primary" />
              <span>{clientId}</span>
            </div>
            <div className="text-[11px] text-muted-foreground">
              Site URL: <span className="font-mono text-foreground">https://aapawz.com</span>
            </div>
            {redirectUri ? (
              <div className="text-[11px] text-muted-foreground truncate">
                Redirect URL: <span className="font-mono text-foreground">{redirectUri}</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                <Info className="size-3" />
                <span>Simulating preview from Supabase Authorization Path (`/oauth/consent`)</span>
              </div>
            )}
          </div>

          {/* User Account Info */}
          <div className="flex items-center justify-between rounded-xl border border-border p-3 bg-card">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs">
                {currentUser?.name ? currentUser.name.substring(0, 2).toUpperCase() : 'AP'}
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  {currentUser?.name || 'All About Pawz User'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {currentUser?.email || 'allaboutpawz901@gmail.com'}
                </p>
              </div>
            </div>
            <span className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium uppercase text-muted-foreground">
              {currentUser?.role || 'Customer'}
            </span>
          </div>

          {/* Requested Scopes */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">Permissions Requested</span>
              <span className="text-[11px] text-muted-foreground">{requestedScopes.length} scope(s)</span>
            </div>

            <div className="space-y-2">
              {requestedScopes.map((scope) => (
                <div
                  key={scope.id}
                  className="flex items-start gap-3 rounded-lg border border-border/80 bg-muted/20 p-3 text-left"
                >
                  <div className="mt-0.5 size-4 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="size-3.5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold text-foreground">{scope.title}</p>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {scope.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Authorization feedback */}
          {authorizedSuccess && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-center space-y-2">
              <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                Authorization Approved Successfully!
              </p>
              <p className="text-[11px] text-muted-foreground">
                The OAuth authorization code has been generated. In production, the user is redirected to the third-party client.
              </p>
            </div>
          )}

          {denied && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-center space-y-2">
              <XCircle className="size-6 text-destructive mx-auto" />
              <p className="text-xs font-bold text-destructive">
                Authorization Denied
              </p>
              <p className="text-[11px] text-muted-foreground">
                Access was refused. No token or profile permissions were granted to the client application.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          {!authorizedSuccess && !denied && (
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleDeny}
                className="w-full sm:w-1/3 rounded-xl border border-border bg-background py-2.5 px-4 text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer"
              >
                Deny
              </button>
              <button
                type="button"
                onClick={handleAuthorize}
                disabled={authorizing}
                className="w-full sm:w-2/3 rounded-xl bg-primary py-2.5 px-4 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50 transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                {authorizing ? (
                  <>Authorizing Access...</>
                ) : (
                  <>
                    <span>Authorize Application</span>
                    <ArrowRight className="size-3.5" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Navigation return if completed */}
          {(authorizedSuccess || denied) && (
            <button
              onClick={() => router.push('/')}
              className="w-full rounded-xl bg-primary py-2.5 px-4 text-xs font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Return to All About Pawz
            </button>
          )}

          {/* Security footnote */}
          <div className="border-t border-border pt-3 text-[11px] text-muted-foreground text-center space-y-1">
            <p>
              All About Pawz will never share your password. You can inspect or revoke third-party app access
              any time inside your Portal Settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OAuthConsentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
          <div className="flex flex-col items-center space-y-3">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-xs text-muted-foreground">Loading OAuth Authorization...</p>
          </div>
        </div>
      }
    >
      <OAuthConsentContent />
    </Suspense>
  );
}
