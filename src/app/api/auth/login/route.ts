import { NextResponse } from 'next/server';

import { platformFetch, PlatformUnavailableError } from 'lib/platform';
import {
  createSessionToken,
  SESSION_COOKIE,
  SESSION_MAX_AGE_SECONDS,
} from 'lib/session';

// POST /api/auth/login — verify operator credentials against the platform and,
// on success, set an httpOnly session cookie. The browser never sees the
// platform admin key or talks to the platform directly.
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid request body' }, { status: 400 });
  }
  const email = typeof body?.email === 'string' ? body.email.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!email || !password) {
    return NextResponse.json({ error: 'email and password are required' }, { status: 400 });
  }

  let platformRes: Response;
  try {
    platformRes = await platformFetch('/v1/admin/operators/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  } catch (err) {
    if (err instanceof PlatformUnavailableError) {
      return NextResponse.json({ error: '平台服务不可用,请稍后再试' }, { status: 502 });
    }
    throw err;
  }

  if (!platformRes.ok) {
    return NextResponse.json({ error: '邮箱或密码错误' }, { status: 401 });
  }

  const data = await platformRes.json();
  const operator = data?.operator;
  if (!operator?.id) {
    return NextResponse.json({ error: '登录响应异常' }, { status: 502 });
  }

  const token = await createSessionToken({
    sub: operator.id,
    email: operator.email,
    name: operator.name,
  });
  const response = NextResponse.json({
    ok: true,
    operator: { id: operator.id, email: operator.email, name: operator.name ?? null },
  });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
  return response;
}
