import { createFileRoute } from "@tanstack/react-router";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export const Route = createFileRoute("/api/public/product/$id")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async ({ params }) => {
        const id = String(params.id ?? "");
        if (!id) return new Response(JSON.stringify({ error: "invalid" }), { status: 400, headers: { "Content-Type": "application/json", ...CORS } });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: product } = await supabaseAdmin
          .from("products")
          .select("id,name,description,price_cents,image_url,bump_enabled,bump_name,bump_description,bump_price_cents,refund_policy,checkout_button_text,checkout_headline,kind,status,checkout_config,checkout_color")
          .eq("id", id)
          .eq("status", "active")
          .maybeSingle();


        if (!product || product.status !== "active") {
          return new Response(JSON.stringify({ error: "not_found" }), { status: 404, headers: { "Content-Type": "application/json", ...CORS } });
        }

        const { data: bumps } = await supabaseAdmin
          .from("order_bumps_v2")
          .select("*")
          .eq("product_id", id)
          .eq("active", true)
          .order("sort_order", { ascending: true });

        const payload = { ...product, order_bumps: bumps ?? [] };
        return new Response(JSON.stringify(payload), { headers: { "Content-Type": "application/json", ...CORS } });
      },
    },
  },
});
