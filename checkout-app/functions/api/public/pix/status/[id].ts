import { json, upstream, type Env } from "../../../../_lib";

// Proxy para o backend principal: o status é resolvido lá, com o
// polling correto da adquirente que realmente gerou a cobrança
// (a55, Mercado Pago, etc.).

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const id = String(params.id ?? "");
  if (!/^[0-9a-fA-F-]{36}$/.test(id)) return json({ error: "bad_request" }, 400);

  try {
    const res = await fetch(`${upstream(env)}/api/public/pix/status/${id}`);
    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { error: "upstream_invalid_response" };
    }
    return json(data ?? { error: "upstream_empty" }, res.status);
  } catch (e: any) {
    return json({ error: "upstream_unreachable", details: String(e?.message ?? e).slice(0, 200) }, 502);
  }
};
