import { NextResponse } from 'next/server';

import { TENANT_SESSION_COOKIE } from 'lib/tenant-session';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(TENANT_SESSION_COOKIE, '', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
