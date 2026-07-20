import { NextResponse } from 'next/server';

import { platformFetch, PlatformUnavailableError } from 'lib/platform';
import { readJson } from 'lib/tenant-bff';
import {
  createTenantSessionToken,
  TENANT_SESSION_COOKIE,
  TENANT_SESSION_MAX_AGE_SECONDS,
} from 'lib/tenant-session';

// POST /api/tenant/login — verify tenant credentials and set the tenant cookie.
export async function POST(req: Request) {
  const body = await readJson(req);
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password) {
    return NextResponse.json({ error: '请填写邮箱与密码' }, { status: 400 });
  }

  let res: Response;
  try {
    res = await platformFetch('/v1/tenant/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    if (err instanceof PlatformUnavailableError) {
      return NextResponse.json({ error: '平台服务不可用' }, { status: 502 });
    }
    throw err;
  }
  if (!res.ok) {
    return NextResponse.json({ error: '邮箱或密码错误,或租户已停用' }, { status: 401 });
  }
  const data = await res.json();

  const token = await createTenantSessionToken({
    sub: data.member.id,
    tenantId: data.tenant.id,
    tenantName: data.tenant.name,
    email: data.member.email,
    role: data.member.role,
  });
  const response = NextResponse.json({ ok: true, tenant: data.tenant, member: data.member });
  response.cookies.set(TENANT_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: TENANT_SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
