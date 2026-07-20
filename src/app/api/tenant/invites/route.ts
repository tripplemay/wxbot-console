import { NextResponse } from 'next/server';

import { platformGetJson } from 'lib/platform';
import { readJson, requireTenantSession, tenantOwnsApp, tenantProxy, unauthorized } from 'lib/tenant-bff';

// GET  /api/tenant/invites          — my invite codes
// POST /api/tenant/invites { appId, label?, maxUses? } — generate one (returns rawCode once)
export async function GET() {
  const s = await requireTenantSession();
  if (!s) return unauthorized();
  return tenantProxy(`/v1/admin/invite-codes?tenantId=${encodeURIComponent(s.tenantId)}`, { method: 'GET' });
}

export async function POST(req: Request) {
  const s = await requireTenantSession();
  if (!s) return unauthorized();
  const body = await readJson(req);
  const appId = typeof body.appId === 'string' ? body.appId : '';
  if (!appId || !(await tenantOwnsApp(s.tenantId, appId))) {
    return NextResponse.json({ error: 'app 不属于当前租户' }, { status: 403 });
  }
  // Resolve the app's workspaceId server-side.
  let workspaceId = '';
  try {
    const apps = await platformGetJson<Array<{ id: string; workspaceId: string }>>(
      `/v1/admin/apps?tenantId=${encodeURIComponent(s.tenantId)}`,
    );
    workspaceId = apps.find((a) => a.id === appId)?.workspaceId || '';
  } catch {
    return NextResponse.json({ error: '平台服务不可用' }, { status: 502 });
  }
  if (!workspaceId) return NextResponse.json({ error: 'app 缺少 workspace' }, { status: 400 });

  return tenantProxy('/v1/admin/invite-codes', {
    method: 'POST',
    body: JSON.stringify({
      tenantId: s.tenantId,
      workspaceId,
      appId,
      label: typeof body.label === 'string' ? body.label : undefined,
      maxUses: typeof body.maxUses === 'number' ? body.maxUses : undefined,
      createdBy: s.email,
    }),
  });
}
