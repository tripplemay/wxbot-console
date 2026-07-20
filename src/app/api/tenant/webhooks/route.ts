import { NextResponse } from 'next/server';

import { readJson, requireTenantSession, tenantOwnsApp, tenantProxy, unauthorized } from 'lib/tenant-bff';

// GET  /api/tenant/webhooks?appId=          — webhook endpoints for my app
// POST /api/tenant/webhooks { appId, url, secretRef } — create one
export async function GET(req: Request) {
  const s = await requireTenantSession();
  if (!s) return unauthorized();
  const appId = new URL(req.url).searchParams.get('appId') || '';
  if (!appId || !(await tenantOwnsApp(s.tenantId, appId))) {
    return NextResponse.json({ error: 'app 不属于当前租户' }, { status: 403 });
  }
  return tenantProxy(`/v1/admin/webhook-endpoints?appId=${encodeURIComponent(appId)}`, { method: 'GET' });
}

export async function POST(req: Request) {
  const s = await requireTenantSession();
  if (!s) return unauthorized();
  const body = await readJson(req);
  const appId = typeof body.appId === 'string' ? body.appId : '';
  const url = typeof body.url === 'string' ? body.url.trim() : '';
  const secretRef = typeof body.secretRef === 'string' && body.secretRef.trim() ? body.secretRef.trim() : `app_${appId}`;
  if (!appId || !(await tenantOwnsApp(s.tenantId, appId))) {
    return NextResponse.json({ error: 'app 不属于当前租户' }, { status: 403 });
  }
  if (!/^https?:\/\//.test(url)) {
    return NextResponse.json({ error: 'webhook URL 必须以 http(s):// 开头' }, { status: 400 });
  }
  return tenantProxy('/v1/admin/webhook-endpoints', {
    method: 'POST',
    body: JSON.stringify({ appId, url, secretRef }),
  });
}
