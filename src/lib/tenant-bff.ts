import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { platformFetch, platformGetJson, PlatformUnavailableError } from 'lib/platform';
import { TENANT_SESSION_COOKIE, verifyTenantSessionToken } from 'lib/tenant-session';

// BFF helpers for the tenant self-service area (/api/tenant/*). Every route is
// scoped to the signed-in tenant: the session tenantId is injected server-side
// and app-targeted operations are ownership-checked, so a tenant can never
// read or mutate another tenant's data.

export async function requireTenantSession() {
  const token = (await cookies()).get(TENANT_SESSION_COOKIE)?.value;
  return verifyTenantSessionToken(token);
}

export function unauthorized() {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

/** Forward to the platform admin API and pass the response through verbatim. */
export async function tenantProxy(path: string, init: RequestInit = {}): Promise<NextResponse> {
  try {
    const res = await platformFetch(path, init);
    const text = await res.text();
    const contentType = res.headers.get('content-type') || 'application/json';
    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': contentType } });
  } catch (err) {
    if (err instanceof PlatformUnavailableError) {
      return NextResponse.json({ error: '平台服务不可用' }, { status: 502 });
    }
    throw err;
  }
}

/** True when appId belongs to tenantId (checked against the platform). */
export async function tenantOwnsApp(tenantId: string, appId: string): Promise<boolean> {
  try {
    const apps = await platformGetJson<Array<{ id: string }>>(
      `/v1/admin/apps?tenantId=${encodeURIComponent(tenantId)}`,
    );
    return apps.some((a) => a.id === appId);
  } catch {
    return false;
  }
}

export async function readJson(req: Request): Promise<Record<string, any>> {
  try {
    const body = await req.json();
    return body && typeof body === 'object' ? body : {};
  } catch {
    return {};
  }
}
