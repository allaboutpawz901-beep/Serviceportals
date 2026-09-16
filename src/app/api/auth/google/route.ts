import { NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const SCOPES = ['openid', 'email', 'profile'].join(' ');

/**
 * Resolve the redirect URI base. Must EXACTLY match one of the authorized
 * redirect URIs in Google Cloud Console:
 *   - https://ais-dev-cb2aatci5phbtljv73uphk-62947767548.us-east1.run.app/api/auth/google/callback
 *   - https://ais-pre-cb2aatci5phbtljv73uphk-62947767548.us-east1.run.app/api/auth/google/callback
 *   - https://aapawz.com/api/auth/google/callback
 *
 * Priority: NEXT_PUBLIC_SITE_URL (env) > request origin (only if it's a known authorized host) > aapawz.com
 */
function getSiteUrl(req: Request): string {
  const env = (process.env.NEXT_PUBLIC_SITE_URL || '').replace(/\/$/, '');
  if (env) return env;
  // Fallback: aapawz.com (the production canonical)
  return 'https://aapawz.com';
}

/**
 * GET /api/auth/google
 * Initiates Google OAuth — single entry for all three personas (admin, groomer, customer).
 * The callback determines role from the DB and routes accordingly.
 */
export async function GET(req: Request) {
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: 'Google OAuth not configured (GOOGLE_CLIENT_ID missing)' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const portal = searchParams.get('portal') || 'admin'; // 'admin' | 'groomer' (informational only — DB is source of truth)
  const siteUrl = getSiteUrl(req);
  const redirectUri = `${siteUrl}/api/auth/google/callback`;

  const state = Buffer.from(JSON.stringify({ portal, ts: Date.now() })).toString('base64url');

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', SCOPES);
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'consent');
  googleAuthUrl.searchParams.set('state', state);

  return NextResponse.redirect(googleAuthUrl.toString());
}
