// Hosts institucionais da VorksPay — NUNCA servem checkout público.
// Qualquer outro host (compraseguraltda.site, domínio próprio do seller, etc.)
// é tratado como domínio de checkout válido e serve as rotas /$slug, /c/$code
// e /checkout/$id normalmente.
export const INSTITUTIONAL_HOSTS = new Set<string>([
  "vorkspay.site",
  "www.vorkspay.site",
  "vorkspay.lovable.app",
]);

// Fallback público padrão quando precisamos redirecionar para fora de um host
// institucional (ex.: alguém abrindo /c/XYZ direto no domínio da marca).
export const DEFAULT_CHECKOUT_HOST = "compraseguraltda.site";

/**
 * True quando o host atual pode servir checkout público.
 * - hosts de preview/dev (localhost, *.lovable.app, *.lovableproject.com) sempre podem;
 * - qualquer host que não seja institucional é considerado domínio de checkout válido.
 */
export function isCheckoutHost(host: string): boolean {
  if (!host) return false;
  if (host === "localhost" || host.startsWith("127.")) return true;
  if (host.endsWith(".lovableproject.com")) return true;
  // *.lovable.app pode ser tanto preview quanto o published institucional.
  if (host.endsWith(".lovable.app") && !INSTITUTIONAL_HOSTS.has(host)) return true;
  return !INSTITUTIONAL_HOSTS.has(host);
}
