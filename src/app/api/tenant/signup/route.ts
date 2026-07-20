import { NextResponse } from 'next/server';

import { platformFetch, PlatformUnavailableError } from 'lib/platform';
import { readJson } from 'lib/tenant-bff';
import {
  createTenantSessionToken,
  TENANT_SESSION_COOKIE,
  TENANT_SESSION_MAX_AGE_SECONDS,
} from 'lib/tenant-session';

// POST /api/tenant/signup — self-service: create tenant + owner, then sign in.
export async function POST(req: Request) {
  if (process.env.TENANT_SIGNUP_ENABLED === 'false') {
    return NextResponse.json({ error: '租户自助注册已关闭' }, { status: 403 });
  }
  const body = await readJson(req);
  const tenantName = typeof body.tenantName === 'string' ? body.tenantName.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!tenantName || !email || password.length < 8) {
    return NextResponse.json({ error: '请填写租户名称、邮箱,密码至少 8 位' }, { status: 400 });
  }

  let res: Response;
  try {
    res = await platformFetch('/v1/tenant/signup', {
      method: 'POST',
      body: JSON.stringify({ tenantName, email, password }),
    });
  } catch (err) {
    if (err instanceof PlatformUnavailableError) {
      return NextResponse.json({ error: '平台服务不可用' }, { status: 502 });
    }
    throw err;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return NextResponse.json({ error: data?.message || '注册失败(邮箱可能已被使用)' }, { status: res.status === 400 ? 409 : res.status });
  }

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
