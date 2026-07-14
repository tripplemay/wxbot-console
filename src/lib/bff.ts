import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { platformFetch, PlatformUnavailableError } from 'lib/platform';
import { SESSION_COOKIE, verifySessionToken } from 'lib/session';

// Shared helpers for BFF (`/api/*`) route handlers. Middleware only guards
// page routes, so every data-proxy route must self-check the operator session
// before forwarding to the platform admin API.

export async function requireSession() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token);
}

/**
 * Guard on the operator session, then forward to the platform admin API and
 * pass the response through verbatim (status + body). The platform admin key
 * is attached server-side by platformFetch.
 */
export async function proxyToPlatform(
  path: string,
  init: RequestInit = {},
): Promise<NextResponse> {
  const session = await requireSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const res = await platformFetch(path, init);
    const text = await res.text();
    const contentType = res.headers.get('content-type') || 'application/json';
    return new NextResponse(text, {
      status: res.status,
      headers: { 'Content-Type': contentType },
    });
  } catch (err) {
    if (err instanceof PlatformUnavailableError) {
      return NextResponse.json({ error: '平台服务不可用' }, { status: 502 });
    }
    throw err;
  }
}

/** Read a JSON body defensively; returns {} on empty/invalid. */
export async function readJson(req: Request): Promise<Record<string, any>> {
  try {
    const body = await req.json();
    return body && typeof body === 'object' ? body : {};
  } catch {
    return {};
  }
}
