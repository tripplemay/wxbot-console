import { NextResponse } from 'next/server';

import { platformFetch, platformGetJson } from 'lib/platform';
import { readJson, requireTenantSession, tenantProxy, unauthorized } from 'lib/tenant-bff';

const RUNTIME_TYPES = ['webhook', 'sdk', 'openclaw-agent'];

// GET  /api/tenant/apps  — my apps
// POST /api/tenant/apps  — create an app (auto-provisions a default workspace)
export async function GET() {
  const s = await requireTenantSession();
  if (!s) return unauthorized();
  return tenantProxy(`/v1/admin/apps?tenantId=${encodeURIComponent(s.tenantId)}`, { method: 'GET' });
}

export async function POST(req: Request) {
  const s = await requireTenantSession();
  if (!s) return unauthorized();
  const body = await readJson(req);
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const runtimeType = RUNTIME_TYPES.includes(body.runtimeType) ? body.runtimeType : 'webhook';
  if (!name) return NextResponse.json({ error: 'app 名称必填' }, { status: 400 });

  // Ensure the tenant has a workspace (hidden from the tenant UI).
  let workspaceId: string;
  try {
    const workspaces = await platformGetJson<Array<{ id: string }>>(
      `/v1/admin/workspaces?tenantId=${encodeURIComponent(s.tenantId)}`,
    );
    if (workspaces.length > 0) {
      workspaceId = workspaces[0].id;
    } else {
      const created = await (await platformFetch('/v1/admin/workspaces', {
        method: 'POST',
        body: JSON.stringify({ tenantId: s.tenantId, name: 'Default' }),
      })).json();
      workspaceId = created.id;
    }
  } catch {
    return NextResponse.json({ error: '平台服务不可用' }, { status: 502 });
  }

  return tenantProxy('/v1/admin/apps', {
    method: 'POST',
    body: JSON.stringify({ tenantId: s.tenantId, workspaceId, name, runtimeType }),
  });
}
