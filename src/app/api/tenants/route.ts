import { NextResponse } from 'next/server';

import { proxyToPlatform, readJson } from 'lib/bff';

// GET  /api/tenants          -> list tenants
// POST /api/tenants { name } -> create tenant
export async function GET() {
  return proxyToPlatform('/v1/admin/tenants', { method: 'GET' });
}

export async function POST(req: Request) {
  const body = await readJson(req);
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  if (!name) {
    return NextResponse.json({ error: '租户名称必填' }, { status: 400 });
  }
  return proxyToPlatform('/v1/admin/tenants', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}
