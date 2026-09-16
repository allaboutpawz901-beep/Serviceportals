import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { jwtSign } from '@/lib/auth/jwt';

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const SB_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '').replace(/\/$/, '');
const SB_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

interface GoogleUserInfo {
  sub: string;
  email: string;
  email_verified: boolean;
  name: string;
  picture: string;
  given_name?: string;
  family_name?: string;
}

/**
 * GET /api/auth/google/callback
 * Google redirects here after staff consents. We:
 *   1. Exchange the code for Google tokens
 *   2. Fetch the user profile from Google
 *   3. Look up the email in Supabase (staff table + tenant_memberships) to determine role
 *   4. REJECT if not a known staff member (customers don't use Google OAuth — they're
 *      created through the checkout/booking gate)
 *   5. Sign a session JWT and set it as an httpOnly cookie
 *   6. Redirect to the appropriate portal (/admin or /groomer)
 */
export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get('code');
  const stateRaw = searchParams.get('state');
  const error = searchParams.get('error');

  const loginBase = `${origin}/login`;
  if (error) {
    return NextResponse.redirect(`${loginBase}?error=${encodeURIComponent(error)}`);
  }
  if (!code) {
    return NextResponse.redirect(`${loginBase}?error=missing_code`);
  }

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    return NextResponse.redirect(`${loginBase}?error=oauth_not_configured`);
  }
  if (!SB_URL || !SB_SERVICE_KEY) {
    return NextResponse.redirect(`${loginBase}?error=supabase_not_configured`);
  }

  // Parse state for intended portal
  let portal: 'admin' | 'groomer' = 'admin';
  try {
    if (stateRaw) {
      const parsed = JSON.parse(Buffer.from(stateRaw, 'base64url').toString());
      if (parsed.portal === 'groomer') portal = 'groomer';
    }
  } catch {
    // ignore malformed state, default to admin
  }

  const redirectUri = `${origin}/api/auth/google/callback`;

  try {
    // 1. Exchange code for tokens
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error('[google/callback] token exchange failed:', errBody);
      return NextResponse.redirect(`${loginBase}?error=token_exchange_failed`);
    }
    const tokens = await tokenRes.json();

    // 2. Fetch user profile from Google
    const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    });
    if (!userInfoRes.ok) {
      return NextResponse.redirect(`${loginBase}?error=userinfo_failed`);
    }
    const gUser: GoogleUserInfo = await userInfoRes.json();

    if (!gUser.email_verified) {
      return NextResponse.redirect(`${loginBase}?error=email_not_verified`);
    }

    // 3. Look up the email in Supabase to determine if this is a staff member
    const adminClient = createClient(SB_URL, SB_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let detectedRole: 'admin' | 'groomer' | null = null;
    let staffName = gUser.name;
    let staffId: string | undefined;

    // Check tenant_memberships (staff linkage)
    const { data: memberships } = await adminClient
      .from('tenant_memberships')
      .select('role, user_id')
      .eq('user_id', gUser.sub) // may not match if no auth user yet
      .or(`user_id.eq.${gUser.sub}`);

    // Also find by email in staff table
    const { data: staffRow } = await adminClient
      .from('staff')
      .select('id, name, role, userid, tenant_id')
      .ilike('email', gUser.email);

    if (staffRow && staffRow.length > 0) {
      const s = staffRow[0];
      staffName = s.name || gUser.name;
      staffId = s.id;
      const r = (s.role || '').toLowerCase();
      if (r.includes('admin') || r.includes('owner') || r.includes('manager') || r.includes('front desk')) {
        detectedRole = 'admin';
      } else if (r.includes('groomer') || r.includes('stylist') || r.includes('staff')) {
        detectedRole = 'groomer';
      }
    } else if (memberships && memberships.length > 0) {
      const topRole = (memberships[0].role || '').toLowerCase();
      if (['owner', 'admin', 'manager', 'front desk'].includes(topRole)) {
        detectedRole = 'admin';
      } else if (['groomer', 'stylist', 'staff'].includes(topRole)) {
        detectedRole = 'groomer';
      }
    }

    // 4. REJECT customers — they don't use Google OAuth
    if (!detectedRole) {
      return NextResponse.redirect(
        `${loginBase}?error=not_staff&email=${encodeURIComponent(gUser.email)}`,
      );
    }

    // 5. Ensure an auth user exists in Supabase (link Google identity)
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    let authUser = existingUsers?.users?.find((u) => u.email?.toLowerCase() === gUser.email.toLowerCase());
    if (!authUser) {
      const { data: newUser, error: createErr } = await adminClient.auth.admin.createUser({
        email: gUser.email,
        email_confirm: true,
        user_metadata: {
          full_name: staffName,
          name: staffName,
          role: detectedRole,
          avatar_url: gUser.picture,
          provider: 'google',
          sub: gUser.sub,
        },
      });
      if (createErr) {
        console.error('[google/callback] create user failed:', createErr.message);
      } else {
        authUser = newUser.user;
      }
    }

    // 6. Sign session JWT + set httpOnly cookie + redirect
    const finalRole = portal === 'groomer' && detectedRole === 'groomer' ? 'groomer' : detectedRole;
    const sessionJwt = await jwtSign({
      sub: authUser?.id || staffId || gUser.sub,
      email: gUser.email,
      name: staffName,
      role: finalRole,
      picture: gUser.picture,
      provider: 'google',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8, // 8 hours
    });

    const dest = finalRole === 'groomer' ? '/groomer/dashboard' : '/admin/dashboard';
    const res = NextResponse.redirect(new URL(dest, origin));
    res.cookies.set('aapawz_session', sessionJwt, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    return res;
  } catch (err: any) {
    console.error('[google/callback] unexpected error:', err);
    return NextResponse.redirect(`${loginBase}?error=server_error`);
  }
}
