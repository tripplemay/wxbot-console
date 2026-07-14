import { NextResponse } from 'next/server';

import { proxyToPlatform, readJson } from 'lib/bff';

// POST /api/apps/:id/status { status } -> enable/disable an app
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await readJson(req);
  const status = body.status;
  if (status !== 'active' && status !== 'disabled') {
    return NextResponse.json({ error: 'status 必须为 active 或 disabled' }, { status: 400 });
  }
  return proxyToPlatform(`/v1/admin/apps/${encodeURIComponent(id)}/status`, {
    method: 'POST',
    body: JSON.stringify({ status }),
  });
}
