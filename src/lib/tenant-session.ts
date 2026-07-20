import { SignJWT, jwtVerify } from 'jose';

// Tenant session — separate audience/cookie from the operator session so the
// two consoles never share auth. Signed with the same CONSOLE_JWT_SECRET.

export const TENANT_SESSION_COOKIE = 'tenant_session';
export const TENANT_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12; // 12h
const ALG = 'HS256';

export type TenantSessionClaims = {
  sub: string; // team member id
  tenantId: string;
  tenantName: string;
  email: string;
  role: string;
};

function secretKey(): Uint8Array {
  const secret = process.env.CONSOLE_JWT_SECRET;
  if (!secret) throw new Error('CONSOLE_JWT_SECRET is not set');
  return new TextEncoder().encode(secret);
}

export async function createTenantSessionToken(
  claims: TenantSessionClaims,
  maxAgeSeconds: number = TENANT_SESSION_MAX_AGE_SECONDS,
): Promise<string> {
  return new SignJWT({
    tenantId: claims.tenantId,
    tenantName: claims.tenantName,
    email: claims.email,
    role: claims.role,
    aud: 'tenant',
  })
    .setProtectedHeader({ alg: ALG })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${maxAgeSeconds}s`)
    .sign(secretKey());
}

export async function verifyTenantSessionToken(
  token: string | undefined,
): Promise<TenantSessionClaims | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: [ALG] });
    if (!payload.sub || payload.aud !== 'tenant' || !payload.tenantId) return null;
    return {
      sub: String(payload.sub),
      tenantId: String(payload.tenantId),
      tenantName: typeof payload.tenantName === 'string' ? payload.tenantName : '',
      email: typeof payload.email === 'string' ? payload.email : '',
      role: typeof payload.role === 'string' ? payload.role : 'owner',
    };
  } catch {
    return null;
  }
}
