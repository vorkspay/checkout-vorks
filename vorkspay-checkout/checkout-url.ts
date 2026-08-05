import { supabase } from "@/integrations/supabase/client";

export type SellerDomain = { id: string; host: string; is_default: boolean };

/**
 * Domínio público interno — usado APENAS pela conta admin da VorksPay.
 * Sellers comuns precisam conectar um domínio próprio na aba Domínios.
 */
export const PUBLIC_CHECKOUT_HOST = "compraseguraltda.site";

/** Retorna true se o usuário autenticado tem role `admin`. */
async function currentUserIsAdmin(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

/**
 * Retorna os domínios ATIVOS do seller autenticado, com o padrão primeiro.
 * Cada seller vê apenas os próprios (RLS aplica).
 */
export async function getSellerDomains(): Promise<SellerDomain[]> {
  const { data } = await supabase
    .from("checkout_domains")
    .select("id, host, is_default, status, cf_hostname_id, cf_ssl_status")
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: true });
  return ((data ?? []) as any[])
    .filter((d) => d.status === "active" && (!d.cf_hostname_id || d.cf_ssl_status === "active"))
    .map((d) => ({ id: d.id, host: d.host, is_default: d.is_default }));
}

/**
 * Monta a URL curta multi-seller: https://<host>/c/<CODE>
 * - Sellers: usa o domínio próprio (padrão). Sem domínio → retorna string vazia.
 * - Admin: cai no domínio público interno quando não houver domínio próprio.
 */
export async function buildCheckoutUrl(productId: string, host?: string): Promise<string> {
  const { data: prod } = await supabase
    .from("products")
    .select("checkout_code, checkout_slug")
    .eq("id", productId)
    .maybeSingle();
  const code = (prod as any)?.checkout_code as string | null | undefined;
  const slug = (prod as any)?.checkout_slug as string | null | undefined;

  let base: string;
  if (host) {
    base = `https://${host.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  } else {
    const domains = await getSellerDomains();
    const preferred = domains.find((d) => d.is_default) ?? domains[0];
    if (preferred) {
      base = `https://${preferred.host}`;
    } else if (await currentUserIsAdmin()) {
      base = `https://${PUBLIC_CHECKOUT_HOST}`;
    } else {
      return "";
    }
  }

  if (code) return `${base}/c/${code}`;
  if (slug) return `${base}/${slug}`;
  return `${base}/checkout/${productId}`;
}
