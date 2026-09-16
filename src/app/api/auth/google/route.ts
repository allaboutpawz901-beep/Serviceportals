import { NextResponse } from 'next/server';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const SCOPES = ['openid', 'email', 'profile'].join(' ');

/**
 * GET /api/auth/google
 * Initiates Google OAuth for STAFF ONLY (groomers + admins).
 * Customers do NOT use this — they're created through the checkout/booking gate.
 */
export async function GET(req: Request) {
  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: 'Google OAuth not configured (GOOGLE_CLIENT_ID missing)' }, { status: 500 });
  }

  const { searchParams, origin } = new URL(req.url);
  const portal = searchParams.get('portal') || 'admin'; // 'admin' | 'groomer'
  const redirectUri = `${origin}/api/auth/google/callback`;

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
