import { requireTenantSession, tenantProxy, unauthorized } from 'lib/tenant-bff';

// GET /api/tenant/bindings — WeChat users bound to my apps.
export async function GET() {
  const s = await requireTenantSession();
  if (!s) return unauthorized();
  return tenantProxy(`/v1/admin/bindings?tenantId=${encodeURIComponent(s.tenantId)}`, { method: 'GET' });
}
