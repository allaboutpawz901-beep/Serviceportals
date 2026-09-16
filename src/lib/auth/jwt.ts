import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

/**
 * Session JWT helpers for All About Pawz.
 * The session cookie 'aapawz_session' holds a signed JWT containing
 * { sub, email, name, role, picture, provider }.
 *
 * The secret is derived from SUPABASE_SERVICE_ROLE_KEY (or a fallback for dev).
 * In production, set AAPAWZ_JWT_SECRET explicitly.
 */

const enc = (s: string) => new TextEncoder().encode(s);

function getSecret(): string {
  return (
    process.env.AAPAWZ_JWT_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    'aapawz-dev-secret-do-not-use-in-prod'
  );
}

export interface AapawzSession extends JWTPayload {
  sub: string;
  email: string;
  name: string;
  role: 'admin' | 'groomer' | 'customer';
  picture?: string;
  provider?: string;
}

export async function jwtSign(payload: AapawzSession): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(payload.iat || Math.floor(Date.now() / 1000))
    .setIssuer('aapawz')
    .setAudience('aapawz-portal')
    .setExpirationTime(payload.exp || Math.floor(Date.now() / 1000) + 60 * 60 * 8)
    .sign(enc(getSecret()));
}

export async function jwtVerifySession(token: string): Promise<AapawzSession | null> {
  try {
    const { payload } = await jwtVerify(token, enc(getSecret()), {
      issuer: 'aapawz',
      audience: 'aapawz-portal',
    });
    return payload as unknown as AapawzSession;
  } catch {
    return null;
  }
}
