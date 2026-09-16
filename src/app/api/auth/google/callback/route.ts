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

    // 3. Look up the email across ALL persona tables to determine role.
    //    Admin/Groomer → staff/tenant_memberships. Customer → customers.
    //    Unknown emails are REJECTED — no auto-create (the salon gate).
    const adminClient = createClient(SB_URL, SB_SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    let detectedRole: 'admin' | 'groomer' | 'customer' | null = null;
    let userName = gUser.name;
    let recordId: string | undefined;

    // Check staff table first (admin + groomer)
    const { data: staffRow } = await adminClient
      .from('staff')
      .select('id, name, role, userid, tenant_id')
      .ilike('email', gUser.email);

    if (staffRow && staffRow.length > 0) {
      const s = staffRow[0];
      userName = s.name || gUser.name;
      recordId = s.id;
      const r = (s.role || '').toLowerCase();
      if (r.includes('admin') || r.includes('owner') || r.includes('manager') || r.includes('front desk')) {
        detectedRole = 'admin';
      } else if (r.includes('groomer') || r.includes('stylist') || r.includes('staff')) {
        detectedRole = 'groomer';
      }
    }

    // Fallback: check tenant_memberships if staff table didn't resolve
    if (!detectedRole) {
      const { data: memberships } = await adminClient
        .from('tenant_memberships')
        .select('role, user_id')
        .eq('user_id', gUser.sub)
        .or(`user_id.eq.${gUser.sub}`);
      if (memberships && memberships.length > 0) {
        const topRole = (memberships[0].role || '').toLowerCase();
        if (['owner', 'admin', 'manager', 'front desk'].includes(topRole)) {
          detectedRole = 'admin';
        } else if (['groomer', 'stylist', 'staff'].includes(topRole)) {
          detectedRole = 'groomer';
        }
      }
    }

    // Check customers table (existing clients created via checkout/booking/walk-in)
    if (!detectedRole) {
      const { data: custRow } = await adminClient
        .from('customers')
        .select('id, firstname, lastname, email, userid')
        .ilike('email', gUser.email);
      if (custRow && custRow.length > 0) {
        const c = custRow[0];
        const first = c.firstname || '';
        const last = c.lastname || '';
        if (first || last) {
          userName = `${first} ${last}`.trim();
        }
        recordId = c.id;
        detectedRole = 'customer';
      }
    }

    // 4. THE GATE: reject unknown emails. No public self-registration.
    //    The salon must create the record first (admin panel, checkout, booking,
    //    or walk-in intake). The user is told to contact the salon.
    if (!detectedRole) {
      return NextResponse.redirect(
        `${loginBase}?error=not_authorized&email=${encodeURIComponent(gUser.email)}`,
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
          full_name: userName,
          name: userName,
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

    // 6. Sign session JWT + set httpOnly cookie + redirect to the persona's portal
    const sessionJwt = await jwtSign({
      sub: authUser?.id || recordId || gUser.sub,
      email: gUser.email,
      name: userName,
      role: detectedRole,
      picture: gUser.picture,
      provider: 'google',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 8, // 8 hours
    });

    const dest =
      detectedRole === 'admin' ? '/admin/dashboard' :
      detectedRole === 'groomer' ? '/groomer/dashboard' :
      '/customer/dashboard';
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
