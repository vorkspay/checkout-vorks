import { json, upstream, type Env } from "../../../_lib";

// Este endpoint NÃO implementa mais lógica de adquirente.
// Ele apenas repassa a requisição para o backend principal da VorksPay,
// que é a única fonte de verdade da cascata de adquirentes (ordem salva
// pelo lojista na aba "Adquirentes": 1ª → 2ª → 3ª...).
// Assim, qualquer troca feita pelo seller reflete imediatamente aqui,
// sem precisar republicar o checkout.

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  let body: string;
  try {
    body = await request.text();
  } catch {
    return json({ error: "bad_request" }, 400);
  }

  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for") ||
    "";

  try {
    const res = await fetch(`${upstream(env)}/api/public/pix/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(ip ? { "x-forwarded-for": ip } : {}),
      },
      body,
    });
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
