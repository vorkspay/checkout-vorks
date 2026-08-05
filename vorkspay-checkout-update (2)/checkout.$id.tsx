import { createFileRoute, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, Download, ExternalLink } from "lucide-react";

import { CheckoutRenderer, type RendererProduct, type ShippingValues } from "@/components/vp/checkout-renderer";
import { normalizeConfig, type CheckoutConfig } from "@/lib/checkout-schema";
import { isCheckoutHost, DEFAULT_CHECKOUT_HOST } from "@/lib/checkout-hosts";
import { apiUrl } from "@/lib/api-base";

const BRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const Route = createFileRoute("/checkout/$id")({
  head: () => ({
    meta: [
      { title: "Checkout Seguro — VorksPay" },
      { name: "description", content: "Finalize sua compra com segurança via VorksPay: pagamento por Pix em segundos." },
      { property: "og:title", content: "Checkout Seguro — VorksPay" },
      { property: "og:description", content: "Pagamento por Pix protegido com criptografia end-to-end e antifraude." },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet, noimageindex" },
    ],
  }),
  component: CheckoutPage,
});

type Product = RendererProduct & {
  currency: string;
  checkout_color: string | null;
  require_document: boolean;
  require_phone: boolean;
  checkout_security_badge: string | null;
  checkout_config: unknown;
};

type Delivery = { type: "file" | "link" | "none"; url: string | null; instructions: string | null };

function CheckoutPage() {
  const { id } = useParams({ from: "/checkout/$id" });
  const [done, setDone] = useState<{ saleId: string; total: number } | null>(null);
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [config, setConfig] = useState<CheckoutConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pixData, setPixData] = useState<{ code: string; qrBase64: string | null; saleId: string; total: number } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Checkout público só abre no domínio de checkout — nunca no domínio institucional.
    try {
      const host = window.location.hostname;
      if (!isCheckoutHost(host)) {
        const target = `https://${DEFAULT_CHECKOUT_HOST}/checkout/${id}${window.location.search}${window.location.hash}`;
        window.location.replace(target);
        return;
      }
    } catch {}
  }, [id]);

  useEffect(() => {
    // Persist UTMs and click-ids on landing so late submits keep attribution.
    try {
      const KEYS = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","fbclid","gclid","ttclid","src","sck","xcod"];
      const qs = new URLSearchParams(window.location.search);
      const stored = JSON.parse(sessionStorage.getItem("vp_tracking") || "{}");
      let changed = false;
      for (const k of KEYS) {
        const v = qs.get(k);
        if (v && stored[k] !== v) { stored[k] = v; changed = true; }
      }
      if (changed) sessionStorage.setItem("vp_tracking", JSON.stringify(stored));
    } catch {}
  }, []);

  useEffect(() => {

    (async () => {
      setLoading(true);
      let data: unknown = null;
      try {
        const res = await fetch(apiUrl(`/api/public/product/${id}`));
        data = res.ok ? await res.json() : null;
      } catch {
        data = null;
      }
      if (!data || (data as { error?: string }).error) setNotFound(true);
      else {
        const p = data as Product;
        setProduct(p);
        setConfig(normalizeConfig(p.checkout_config, p.checkout_color || "#E10600"));
      }
      setLoading(false);
    })();
  }, [id]);

  async function handleSubmit({ values, includeBump, shipping }: { values: Record<string, string>; includeBump: boolean | string[]; shipping?: ShippingValues }) {
    if (!product) return;
    setSubmitting(true); setError(null);
    try {
      // Capture UTMs / click-ids from URL and sessionStorage (persisted on mount).
      const KEYS = ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","fbclid","gclid","ttclid","src","sck","xcod"] as const;
      const tracking: Record<string, string> = {};
      try {
        const stored = JSON.parse(sessionStorage.getItem("vp_tracking") || "{}");
        const qs = new URLSearchParams(window.location.search);
        for (const k of KEYS) {
          const v = qs.get(k) ?? stored[k];
          if (v) tracking[k] = String(v).slice(0, 255);
        }
      } catch {}
      const res = await fetch(apiUrl("/api/public/pix/create"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          customer: {
            name: values.name || "",
            email: values.email || "",
            document: values.document || "",
            phone: values.phone || "",
          },
          include_bump: includeBump,
          shipping: shipping ?? null,
          tracking,
        }),
      });

      const data = await res.json();
      if (res.ok && data.qr_code) {
        setPixData({ code: data.qr_code, qrBase64: data.qr_code_base64 ?? null, saleId: data.sale_id, total: data.amount_cents });
      } else if (res.status === 503 && data.error === "mercadopago_not_configured") {
        const payload = `00020126360014BR.GOV.BCB.PIX0114+55119${Math.floor(Math.random() * 1e8)}5204000053039865802BR5913VORKSPAY LTDA6009SAO PAULO62070503***6304`;
        setPixData({ code: payload, qrBase64: null, saleId: id, total: product.price_cents + (includeBump && product.bump_price_cents ? product.bump_price_cents : 0) });
      } else {
        setError(data?.details?.message || data?.error || "Falha ao gerar Pix");
      }
    } catch (err: any) {
      setError(err?.message ?? "Erro de rede");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (!pixData?.qrBase64 || done) return;
    const t = setInterval(async () => {
      const res = await fetch(apiUrl(`/api/public/pix/status/${pixData.saleId}`));
      const data = await res.json();
      if (data?.status === "paid") {
        setDone({ saleId: pixData.saleId, total: pixData.total });
        // Fetch delivery details for digital/saas products
        try {
          const d = await fetch(apiUrl(`/api/public/delivery/${pixData.saleId}`));
          if (d.ok) setDelivery(await d.json());
        } catch {}
        clearInterval(t);
      }
    }, 4000);
    return () => clearInterval(t);
  }, [pixData, done]);

  async function copyPix() {
    if (!pixData) return;
    await navigator.clipboard.writeText(pixData.code);
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  }

  if (loading) return <div className="min-h-screen grid place-items-center bg-muted/30"><Loader2 className="h-6 w-6 animate-spin text-brand" /></div>;

  if (notFound || !product || !config) {
    return (
      <div className="min-h-screen grid place-items-center bg-muted/30 px-4">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="text-xl font-semibold">Link de checkout inválido</h1>
          <p className="mt-2 text-sm text-muted-foreground">Este produto não existe ou foi desativado pelo vendedor.</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen grid place-items-center bg-muted/30 px-4 py-8">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold">Pagamento confirmado</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {product.kind === "physical"
              ? "Recebemos seu pedido! Você receberá o código de rastreio por e-mail assim que o vendedor postar."
              : "Enviamos os detalhes para o seu e-mail. Obrigado pela compra!"}
          </p>

          {delivery && delivery.type !== "none" && delivery.url && (
            <a
              href={delivery.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-3 text-sm font-semibold text-brand-foreground"
            >
              {delivery.type === "file" ? <><Download className="h-4 w-4" /> Baixar produto</> : <><ExternalLink className="h-4 w-4" /> Acessar produto</>}
            </a>
          )}
          {delivery?.instructions && (
            <p className="mt-3 text-xs text-muted-foreground whitespace-pre-line">{delivery.instructions}</p>
          )}

          <div className="mt-6 rounded-lg bg-muted/50 p-3 text-left text-xs">
            <div className="flex justify-between"><span className="text-muted-foreground">Pedido</span><span className="font-mono">{done.saleId.slice(0, 8)}</span></div>
            <div className="flex justify-between mt-1"><span className="text-muted-foreground">Total pago</span><span className="font-semibold">{BRL(done.total / 100)}</span></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <CheckoutRenderer
      config={config}
      product={product}
      onSubmit={handleSubmit}
      submitting={submitting}
      error={error}
      pix={pixData ? { code: pixData.code, qrBase64: pixData.qrBase64 } : null}
      copyPix={copyPix}
      copied={copied}
    />
  );
}
