import { NextResponse } from 'next/server';

import { proxyToPlatform, readJson } from 'lib/bff';

// GET  /api/workspaces?tenantId=      -> list workspaces (optionally by tenant)
// POST /api/workspaces { tenantId, name } -> create workspace
export async function GET(req: Request) {
  const tenantId = new URL(req.url).searchParams.get('tenantId');
  const qs = tenantId ? `?tenantId=${encodeURIComponent(tenantId)}` : '';
  return proxyToPlatform(`/v1/admin/workspaces${qs}`, { method: 'GET' });
}

export async function POST(req: Request) {
  const body = await readJson(req);
  const tenantId = typeof body.tenantId === 'string' ? body.tenantId : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!tenantId || !name) {
    return NextResponse.json({ error: 'tenantId 与 name 必填' }, { status: 400 });
  }
  return proxyToPlatform('/v1/admin/workspaces', {
    method: 'POST',
    body: JSON.stringify({ tenantId, name }),
  });
}
