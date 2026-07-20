import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { SESSION_COOKIE, verifySessionToken } from 'lib/session';
import { TENANT_SESSION_COOKIE, verifyTenantSessionToken } from 'lib/tenant-session';

// Route guards for both consoles:
//   operator area /admin/*  ← console_session, sign-in at /auth/sign-in/default
//   tenant   area /tenant/* ← tenant_session,  sign-in at /tenant/sign-in
// Each area redirects to its own sign-in when unauthenticated, and bounces an
// already-signed-in user away from that sign-in page.
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // --- operator area ---
  if (pathname.startsWith('/admin') || pathname.startsWith('/auth/sign-in')) {
    const session = await verifySessionToken(req.cookies.get(SESSION_COOKIE)?.value);
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

  // --- tenant area ---
  if (pathname.startsWith('/tenant')) {
    const isAuthPage = pathname === '/tenant/sign-in' || pathname === '/tenant/sign-up';
    const session = await verifyTenantSessionToken(req.cookies.get(TENANT_SESSION_COOKIE)?.value);
    if (!isAuthPage && !session) {
      const url = req.nextUrl.clone();
      url.pathname = '/tenant/sign-in';
      url.search = pathname ? `?next=${encodeURIComponent(pathname)}` : '';
      return NextResponse.redirect(url);
    }
    if (isAuthPage && session) {
      const url = req.nextUrl.clone();
      url.pathname = '/tenant/dashboard';
      url.search = '';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/auth/sign-in/:path*', '/tenant/:path*'],
};
