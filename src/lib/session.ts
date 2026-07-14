import { SignJWT, jwtVerify } from 'jose';

// Console session = a short-lived signed JWT stored in an httpOnly cookie.
// Signed/verified with CONSOLE_JWT_SECRET (HS256). jose is edge-compatible so
// this module is safe to import from middleware.

export const SESSION_COOKIE = 'console_session';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12h
const ALG = 'HS256';

export type SessionClaims = {
  sub: string; // operator id
  email: string;
  name?: string;
};

function secretKey(): Uint8Array {
  const secret = process.env.CONSOLE_JWT_SECRET;
  if (!secret) throw new Error('CONSOLE_JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(
  claims: SessionClaims,
  maxAgeSeconds: number = SESSION_MAX_AGE_SECONDS,
): Promise<string> {
  return new SignJWT({ email: claims.email, name: claims.name })
    .setProtectedHeader({ alg: ALG })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(secretKey());
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: [ALG] });
    if (!payload.sub) return null;
    return {
      sub: String(payload.sub),
      email: typeof payload.email === 'string' ? payload.email : '',
      name: typeof payload.name === 'string' ? payload.name : undefined,
    };
  } catch {
    return null;
  }
}
