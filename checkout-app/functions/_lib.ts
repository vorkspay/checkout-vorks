// Cloudflare Pages Function env bindings.
// Set via `wrangler pages secret put NAME` or the Cloudflare dashboard.
export interface Env {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  MERCADOPAGO_ACCESS_TOKEN: string;
  MERCADOPAGO_WEBHOOK_SECRET: string;
  /** Backend principal da VorksPay (fonte única da cascata de adquirentes). */
  VORKSPAY_API_BASE?: string;
}

/** URL base do backend principal, sem barra final. */
export function upstream(env: Env) {
  return (env.VORKSPAY_API_BASE || "https://www.vorkspay.site").replace(/\/+$/, "");
}


export function json(data: unknown, status = 200, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      ...extra,
    },
  });
}

export async function sbFetch<T = any>(
  env: Env,
  path: string,
  init: RequestInit = {},
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1${path}`, {
    ...init,
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...(init.headers ?? {}),
    },
  });
  const text = await res.text();
  let data: any = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  return { ok: res.ok, status: res.status, data, error: res.ok ? undefined : (typeof data === "string" ? data : JSON.stringify(data)) };
}
