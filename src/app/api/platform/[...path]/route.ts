import { NextResponse } from 'next/server';

import { proxyToPlatform } from 'lib/bff';

// Read-only passthrough for platform admin GET endpoints used by the monitoring
// pages. Allowlisted + GET-only so it can never be used to reach a write route.
const READ_ALLOWLIST = new Set([
  'dashboard',
  'delivery-logs',
  'events',
  'usage',
  'billing-summary',
  'channel-health',
  'metrics',
]);

export async function GET(
  req: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const endpoint = (path ?? []).join('/');
  if (!READ_ALLOWLIST.has(endpoint)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }
  const search = new URL(req.url).search; // forward query string verbatim
  return proxyToPlatform(`/v1/admin/${endpoint}${search}`, { method: 'GET' });
}
