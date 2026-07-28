import { json, sbFetch, type Env } from "../../../_lib";

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const raw = String(params.slug ?? "").trim();
  if (!raw) return json({ error: "invalid" }, 400);

  const code = raw.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (code.length >= 6 && code.length <= 10) {
    const r = await sbFetch<any[]>(env, `/products?select=id,status&checkout_code=eq.${code}&limit=1`);
    const row = r.data?.[0];
    if (row && row.status === "active") return json({ id: row.id });
  }

  const slug = raw.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 80);
  if (slug) {
    const r = await sbFetch<any[]>(env, `/products?select=id,status&checkout_slug=eq.${slug}&limit=1`);
    const row = r.data?.[0];
    if (row && row.status === "active") return json({ id: row.id });
  }

  return json({ error: "not_found" }, 404);
};
