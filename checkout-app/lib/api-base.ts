/**
 * Base de API para as páginas públicas de checkout.
 *
 * Domínios de checkout próprios (ex.: compraseguraltda.site) respondem 307
 * redirecionando para www.vorkspay.site. O navegador bloqueia um redirect
 * cross-origin de POST com JSON (o preflight não é reenviado), o que quebra a
 * geração do Pix. Por isso, quando estamos em um domínio que não é a origem
 * canônica, chamamos a API pela URL absoluta e evitamos o redirect.
 */
const CANONICAL = "https://www.vorkspay.site";

/** Hosts que servem a aplicação diretamente (sem redirect). */
function isCanonicalHost(host: string) {
  return (
    host === "www.vorkspay.site" ||
    host === "localhost" ||
    host.startsWith("localhost:") ||
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovableproject.com")
  );
}

/** Monta a URL de um endpoint público a partir de um caminho `/api/public/...`. */
export function apiUrl(path: string): string {
  if (typeof window === "undefined") return path;
  return isCanonicalHost(window.location.host) ? path : `${CANONICAL}${path}`;
}
