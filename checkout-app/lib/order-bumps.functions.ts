import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const bumpSchema = z.object({
  id: z.string().uuid().optional(),
  product_id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  price_cents: z.number().int().min(0),
  image_url: z.string().nullable().optional(),
  active: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const getOrderBumps = createServerFn({ method: "GET" })
  .inputValidator((data) => z.object({ productId: z.string().uuid() }).parse(data))
  .handler(async ({ data }) => {
    const { data: bumps, error } = await supabaseAdmin
      .from("order_bumps_v2")
      .select("*")
      .eq("product_id", data.productId)
      .order("sort_order", { ascending: true });

    if (error) throw new Error(error.message);
    return bumps || [];
  });

export const saveOrderBump = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    sellerId: z.string().uuid(),
    bump: bumpSchema
  }).parse(data))
  .handler(async ({ data }) => {
    const { sellerId, bump } = data;
    const payload = { ...bump, seller_id: sellerId };
    
    if (bump.id) {
      const { data: updated, error } = await supabaseAdmin
        .from("order_bumps_v2")
        .update(payload)
        .eq("id", bump.id)
        .eq("seller_id", sellerId)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return updated;
    } else {
      const { data: created, error } = await supabaseAdmin
        .from("order_bumps_v2")
        .insert(payload)
        .select()
        .single();
      if (error) throw new Error(error.message);
      return created;
    }
  });

export const deleteOrderBump = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    id: z.string().uuid(),
    sellerId: z.string().uuid()
  }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("order_bumps_v2")
      .delete()
      .eq("id", data.id)
      .eq("seller_id", data.sellerId);
    
    if (error) throw new Error(error.message);
    return { success: true };
  });

export const toggleOrderBumpStatus = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({
    id: z.string().uuid(),
    sellerId: z.string().uuid(),
    active: z.boolean()
  }).parse(data))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("order_bumps_v2")
      .update({ active: data.active })
      .eq("id", data.id)
      .eq("seller_id", data.sellerId);
    
    if (error) throw new Error(error.message);
    return { success: true };
  });
