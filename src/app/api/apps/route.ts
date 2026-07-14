import { NextResponse } from 'next/server';

import { proxyToPlatform, readJson } from 'lib/bff';

const RUNTIME_TYPES = ['webhook', 'sdk', 'openclaw-agent'];

// GET  /api/apps?tenantId=&workspaceId=  -> list apps
// POST /api/apps { tenantId, workspaceId, name, runtimeType } -> create app
export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const qs = new URLSearchParams();
  if (sp.get('tenantId')) qs.set('tenantId', sp.get('tenantId') as string);
  if (sp.get('workspaceId')) qs.set('workspaceId', sp.get('workspaceId') as string);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  return proxyToPlatform(`/v1/admin/apps${suffix}`, { method: 'GET' });
}

export async function POST(req: Request) {
  const body = await readJson(req);
  const tenantId = typeof body.tenantId === 'string' ? body.tenantId : '';
  const workspaceId = typeof body.workspaceId === 'string' ? body.workspaceId : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const runtimeType = body.runtimeType;
  if (!tenantId || !workspaceId || !name) {
    return NextResponse.json({ error: 'tenantId、workspaceId、name 必填' }, { status: 400 });
  }
  if (!RUNTIME_TYPES.includes(runtimeType)) {
    return NextResponse.json({ error: 'runtimeType 无效' }, { status: 400 });
  }
  return proxyToPlatform('/v1/admin/apps', {
    method: 'POST',
    body: JSON.stringify({ tenantId, workspaceId, name, runtimeType }),
  });
}
