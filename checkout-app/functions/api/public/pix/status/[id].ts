import { json, sbFetch, type Env } from "../../../../_lib";

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const id = String(params.id ?? "");
  const r = await sbFetch<any[]>(env, `/sales?select=id,status,amount_cents,gateway_payment_id&id=eq.${id}&limit=1`);
  const row = r.data?.[0];
  if (!row) return json({ error: "not_found" }, 404);

  // Fallback poll to Mercado Pago if still pending
  if (row.status === "pending" && row.gateway_payment_id && env.MERCADOPAGO_ACCESS_TOKEN) {
    try {
      const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${row.gateway_payment_id}`, {
        headers: { Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}` },
      });
      if (mpRes.ok) {
        const p: any = await mpRes.json();
        const status =
          p.status === "approved" ? "paid" :
          p.status === "rejected" || p.status === "cancelled" ? "refused" :
          p.status === "refunded" ? "refunded" : "pending";
        if (status !== "pending" && status !== row.status) {
          await sbFetch(env, `/sales?id=eq.${id}`, {
            method: "PATCH",
            body: JSON.stringify({ status }),
          });
          return json({ id: row.id, status, amount_cents: row.amount_cents });
        }
      }
    } catch {}
  }

  return json({ id: row.id, status: row.status, amount_cents: row.amount_cents });
};
