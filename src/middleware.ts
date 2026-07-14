import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { SESSION_COOKIE, verifySessionToken } from 'lib/session';

// Route guard for the operator console:
//   - /admin/*  requires a valid session, else redirect to sign-in
//   - already-signed-in users hitting the sign-in page bounce to the console
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);

  if (pathname.startsWith('/admin') && !session) {
    const url = req.nextUrl.clone();
    url.pathname = '/auth/sign-in/default';
    url.search = pathname ? `?next=${encodeURIComponent(pathname)}` : '';
    return NextResponse.redirect(url);
  }

  if (pathname.startsWith('/auth/sign-in') && session) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/default';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/auth/sign-in/:path*'],
};
