import { NextResponse } from 'next/server';

import { readJson, requireTenantSession, tenantOwnsApp, tenantProxy, unauthorized } from 'lib/tenant-bff';

// POST /api/tenant/apps/:id/status — enable/disable my app (ownership-checked).
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const s = await requireTenantSession();
  if (!s) return unauthorized();
  const { id } = await params;
  if (!(await tenantOwnsApp(s.tenantId, id))) {
    return NextResponse.json({ error: 'app 不属于当前租户' }, { status: 403 });
  }
  const body = await readJson(req);
  if (body.status !== 'active' && body.status !== 'disabled') {
    return NextResponse.json({ error: 'status 无效' }, { status: 400 });
  }
  return tenantProxy(`/v1/admin/apps/${encodeURIComponent(id)}/status`, {
    method: 'POST',
    body: JSON.stringify({ status: body.status }),
  });
}
