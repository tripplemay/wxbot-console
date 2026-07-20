import { requireTenantSession, tenantProxy, unauthorized } from 'lib/tenant-bff';

// GET /api/tenant/usage — my tenant's billing summary.
export async function GET() {
  const s = await requireTenantSession();
  if (!s) return unauthorized();
  return tenantProxy(`/v1/admin/billing-summary?tenantId=${encodeURIComponent(s.tenantId)}`, { method: 'GET' });
}
