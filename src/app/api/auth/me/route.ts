import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

import { SESSION_COOKIE, verifySessionToken } from 'lib/session';

// GET /api/auth/me — return the current operator from the session cookie.
export async function GET() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  const session = await verifySessionToken(token);
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return NextResponse.json({
    operator: { id: session.sub, email: session.email, name: session.name ?? null },
  });
}
