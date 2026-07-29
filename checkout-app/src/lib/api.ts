// Base URL do backend VorksPay (que já tem service role + Mercado Pago configurados).
// Sobrescreva com VITE_API_BASE=... se quiser apontar para preview/staging.
const RAW = (import.meta.env.VITE_API_BASE as string | undefined) || "https://www.vorkspay.site";
export const API_BASE = RAW.replace(/\/+$/, "");
export const api = (path: string) => `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
