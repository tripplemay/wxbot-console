import { NextResponse } from 'next/server';

import { requireTenantSession } from 'lib/tenant-bff';

// GET /api/tenant/me — current tenant member + tenant from the session.
export async function GET() {
  const session = await requireTenantSession();
  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  return NextResponse.json({
    member: { id: session.sub, email: session.email, role: session.role },
    tenant: { id: session.tenantId, name: session.tenantName },
  });
}
