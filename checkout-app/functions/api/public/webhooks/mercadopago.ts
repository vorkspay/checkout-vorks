import { sbFetch, type Env } from "../../../_lib";

// Web Crypto HMAC-SHA256 → hex
async function hmacHex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return [...new Uint8Array(sig)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function timingSafeEq(a: string, b: string) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.MERCADOPAGO_ACCESS_TOKEN) return new Response("not configured", { status: 503 });
  if (!env.MERCADOPAGO_WEBHOOK_SECRET) return new Response("webhook secret not configured", { status: 503 });

  const rawBody = await request.text();
  let body: any = {};
  try { body = rawBody ? JSON.parse(rawBody) : {}; } catch {}
  const url = new URL(request.url);
  const type = body?.type ?? url.searchParams.get("type");
  const paymentId =
    body?.data?.id ?? body?.resource ?? url.searchParams.get("data.id") ?? url.searchParams.get("id");

  const sigHeader = request.headers.get("x-signature") ?? "";
  const requestId = request.headers.get("x-request-id") ?? "";
  const parts = Object.fromEntries(
    sigHeader.split(",").map((p) => {
      const [k, ...v] = p.trim().split("=");
      return [k, v.join("=")];
    }),
  );
  const ts = parts["ts"]; const v1 = parts["v1"];
  if (!ts || !v1 || !paymentId) return new Response("invalid signature", { status: 401 });

  const expected = await hmacHex(env.MERCADOPAGO_WEBHOOK_SECRET, `id:${paymentId};request-id:${requestId};ts:${ts};`);
  if (!timingSafeEq(v1, expected)) return new Response("invalid signature", { status: 401 });

  if (type !== "payment") return new Response("ignored", { status: 200 });

  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}` },
  });
  if (!mpRes.ok) return new Response("mp fetch failed", { status: 200 });
  const payment: any = await mpRes.json();
  const saleId = payment?.external_reference;
  if (!saleId) return new Response("no ref", { status: 200 });

  const status =
    payment.status === "approved" ? "paid" :
    payment.status === "rejected" || payment.status === "cancelled" ? "refused" :
    payment.status === "refunded" ? "refunded" : "pending";

  await sbFetch(env, `/sales?id=eq.${saleId}`, {
    method: "PATCH",
    body: JSON.stringify({ status, gateway_payment_id: String(payment.id) }),
  });

  return new Response("ok", { status: 200 });
};
