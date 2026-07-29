import { z } from "zod";
import { json, sbFetch, type Env } from "../../../_lib";

const Body = z.object({
  product_id: z.string().uuid(),
  customer: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    document: z.string().optional().default(""),
    phone: z.string().optional().default(""),
  }),
  include_bump: z.boolean().optional().default(false),
  tracking: z.record(z.string().max(255)).optional(),
  shipping: z
    .object({
      zip: z.string().max(20).optional().default(""),
      street: z.string().max(200).optional().default(""),
      number: z.string().max(20).optional().default(""),
      complement: z.string().max(200).optional().default(""),
      neighborhood: z.string().max(120).optional().default(""),
      city: z.string().max(120).optional().default(""),
      state: z.string().max(4).optional().default(""),
      country: z.string().max(4).optional().default("BR"),
    })
    .nullable()
    .optional(),
});

export const onRequestOptions: PagesFunction<Env> = async () =>
  new Response(null, { status: 204, headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }});

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  if (!env.MERCADOPAGO_ACCESS_TOKEN) return json({ error: "mercadopago_not_configured" }, 503);

  let parsed: z.infer<typeof Body>;
  try { parsed = Body.parse(await request.json()); }
  catch (e) { return json({ error: "bad_request" }, 400); }

  // 1. Load product
  const pRes = await sbFetch<any[]>(
    env,
    `/products?select=id,name,price_cents,owner_id,status,bump_enabled,bump_name,bump_price_cents,kind&id=eq.${parsed.product_id}&limit=1`,
  );
  const product = pRes.data?.[0];
  if (!product || product.status !== "active") return json({ error: "product_not_found" }, 404);

  const isPhysical = product.kind === "physical";
  const ship = parsed.shipping ?? null;
  if (isPhysical) {
    if (!ship || !ship.zip || !ship.street || !ship.number || !ship.neighborhood || !ship.city || !ship.state) {
      return json({ error: "shipping_required" }, 400);
    }
  }

  let amount = product.price_cents;
  let description = product.name;
  if (parsed.include_bump && product.bump_enabled && product.bump_price_cents) {
    amount += product.bump_price_cents;
    description += " + " + (product.bump_name ?? "Order bump");
  }

  // 2. Ensure customer
  const existing = await sbFetch<any[]>(
    env,
    `/customers?select=id&owner_id=eq.${product.owner_id}&email=ilike.${encodeURIComponent(parsed.customer.email)}&limit=1`,
  );
  let customerId: string | undefined = existing.data?.[0]?.id;
  if (!customerId) {
    const created = await sbFetch<any[]>(env, `/customers`, {
      method: "POST",
      body: JSON.stringify({
        owner_id: product.owner_id,
        name: parsed.customer.name,
        email: parsed.customer.email,
        document: parsed.customer.document,
        phone: parsed.customer.phone,
      }),
    });
    if (!created.ok) return json({ error: "customer_failed" }, 500);
    customerId = created.data?.[0]?.id;
  }

  const ipHeader = request.headers.get("cf-connecting-ip") || request.headers.get("x-forwarded-for") || "";
  const customerIp = ipHeader.split(",")[0]?.trim() || null;
  const tk = parsed.tracking ?? {};

  // 3. Create pending sale
  const saleRes = await sbFetch<any[]>(env, `/sales`, {
    method: "POST",
    body: JSON.stringify({
      owner_id: product.owner_id,
      customer_id: customerId,
      product_id: product.id,
      customer_name: parsed.customer.name,
      product_name: description,
      amount_cents: amount,
      currency: "BRL",
      method: "pix",
      status: "pending",
      installments: 1,
      gateway: "mercadopago",
      customer_ip: customerIp,
      utm_source: tk.utm_source ?? null,
      utm_medium: tk.utm_medium ?? null,
      utm_campaign: tk.utm_campaign ?? null,
      utm_content: tk.utm_content ?? null,
      utm_term: tk.utm_term ?? null,
      fbclid: tk.fbclid ?? null,
      gclid: tk.gclid ?? null,
      ttclid: tk.ttclid ?? null,
      src: tk.src ?? null,
      sck: tk.sck ?? null,
      xcod: tk.xcod ?? null,
      ...(isPhysical && ship ? {
        shipping_zip: ship.zip,
        shipping_street: ship.street,
        shipping_number: ship.number,
        shipping_complement: ship.complement || null,
        shipping_neighborhood: ship.neighborhood,
        shipping_city: ship.city,
        shipping_state: ship.state,
        shipping_country: ship.country || "BR",
      } : {}),
    }),
  });
  if (!saleRes.ok) return json({ error: "sale_failed" }, 500);
  const sale = saleRes.data?.[0];

  // 4. Mercado Pago Pix
  const [firstName, ...rest] = parsed.customer.name.split(" ");
  const mpRes = await fetch("https://api.mercadopago.com/v1/payments", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.MERCADOPAGO_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": sale.id,
    },
    body: JSON.stringify({
      transaction_amount: Number((amount / 100).toFixed(2)),
      description,
      payment_method_id: "pix",
      external_reference: sale.id,
      payer: {
        email: parsed.customer.email,
        first_name: firstName || parsed.customer.name,
        last_name: rest.join(" ") || " ",
        identification: parsed.customer.document
          ? { type: "CPF", number: parsed.customer.document.replace(/\D/g, "") }
          : undefined,
      },
    }),
  });
  const mp: any = await mpRes.json();
  if (!mpRes.ok) return json({ error: "mercadopago_error" }, 502);

  const qr = mp?.point_of_interaction?.transaction_data;
  await sbFetch(env, `/sales?id=eq.${sale.id}`, {
    method: "PATCH",
    body: JSON.stringify({ gateway_payment_id: String(mp.id) }),
  });

  return json({
    sale_id: sale.id,
    payment_id: mp.id,
    amount_cents: amount,
    qr_code: qr?.qr_code ?? null,
    qr_code_base64: qr?.qr_code_base64 ?? null,
    ticket_url: qr?.ticket_url ?? null,
    expires_at: mp?.date_of_expiration ?? null,
  });
};
