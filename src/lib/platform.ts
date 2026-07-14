// Server-only helper to call the Bot Platform admin API. Holds the platform
// admin API key server-side (never shipped to the browser) — every console
// data path goes through a Next.js route handler / server component that uses
// this, so the operator's browser only ever talks to our own BFF.

export function platformBaseUrl(): string {
  return (process.env.PLATFORM_API_URL || 'http://localhost:8787').replace(/\/$/, '');
}

export class PlatformUnavailableError extends Error {}

export async function platformFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('Content-Type', 'application/json');
  const apiKey = process.env.PLATFORM_API_KEY;
  if (apiKey) headers.set('Authorization', `Bearer ${apiKey}`);
  try {
    return await fetch(`${platformBaseUrl()}${path}`, {
      ...init,
      headers,
      cache: 'no-store',
    });
  } catch (err) {
    throw new PlatformUnavailableError(
      `platform request failed: ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

/** platformFetch + JSON parse + throw on non-2xx. For read endpoints. */
export async function platformGetJson<T = unknown>(path: string): Promise<T> {
  const res = await platformFetch(path, { method: 'GET' });
  if (!res.ok) {
    throw new Error(`platform GET ${path} -> ${res.status}`);
  }
  return (await res.json()) as T;
}
