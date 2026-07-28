import { json, sbFetch, type Env } from "../../../_lib";

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const id = String(params.id ?? "");
  if (!id) return json({ error: "invalid" }, 400);

  const fields = [
    "id","name","description","price_cents","image_url",
    "bump_enabled","bump_name","bump_description","bump_price_cents",
    "refund_policy","checkout_button_text","checkout_headline","kind",
    "status","checkout_config",
  ].join(",");
  const r = await sbFetch<any[]>(env, `/products?select=${fields}&id=eq.${id}&limit=1`);
  const row = r.data?.[0];
  if (!row || row.status !== "active") return json({ error: "not_found" }, 404);
  return json(row);
};
