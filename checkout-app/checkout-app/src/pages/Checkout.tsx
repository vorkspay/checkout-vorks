import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { CheckoutRenderer, type RendererProduct, type ShippingValues } from "../checkout-renderer";
import { normalizeConfig, type CheckoutConfig } from "../checkout-schema";

type ProductRow = RendererProduct & { checkout_config: unknown };

export default function CheckoutPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<ProductRow | null>(null);
  const [config, setConfig] = useState<CheckoutConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pix, setPix] = useState<{ code: string; qrBase64: string | null; saleId: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<number | null>(null);

  useEffect(() => {
    if (!id) {
      setNotFound(true);
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const r = await fetch(`/api/public/product/${id}`);
        if (!r.ok) { setNotFound(true); setLoading(false); return; }
        const data = (await r.json()) as ProductRow;
        setProduct(data);
        setConfig(normalizeConfig(data.checkout_config));
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // Poll status while pix is displayed
  useEffect(() => {
    if (!pix) return;
    pollRef.current = window.setInterval(async () => {
      try {
        const r = await fetch(`/api/public/pix/status/${pix.saleId}`);
        if (!r.ok) return;
        const d = (await r.json()) as { status?: string };
        if (d.status === "paid") {
          window.location.href = `/obrigado?s=${pix.saleId}`;
        }
      } catch {}
    }, 4000);
    return () => { if (pollRef.current) window.clearInterval(pollRef.current); };
  }, [pix]);

  const copyPix = () => {
    if (!pix) return;
    navigator.clipboard.writeText(pix.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tracking = useMemo(() => {
    const p = new URLSearchParams(window.location.search);
    const out: Record<string, string> = {};
    ["utm_source","utm_medium","utm_campaign","utm_content","utm_term","fbclid","gclid","ttclid","src","sck","xcod"]
      .forEach(k => { const v = p.get(k); if (v) out[k] = v; });
    return out;
  }, []);

  async function handleSubmit(data: { values: Record<string, string>; includeBump: boolean; shipping?: ShippingValues }) {
    if (!product) return;
    setError(null); setSubmitting(true);
    try {
      const r = await fetch(`/api/public/pix/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          customer: {
            name: data.values.name ?? "",
            email: data.values.email ?? "",
            document: data.values.document ?? "",
            phone: data.values.phone ?? "",
          },
          include_bump: data.includeBump,
          tracking,
          shipping: data.shipping ?? null,
        }),
      });
      const d = (await r.json()) as { error?: string; qr_code?: string; qr_code_base64?: string | null; sale_id?: string };
      if (!r.ok) { setError(d?.error ?? "Falha ao gerar Pix."); return; }
      if (!d.qr_code || !d.sale_id) {
        setError("Resposta inválida ao gerar Pix.");
        return;
      }
      setPix({ code: d.qr_code, qrBase64: d.qr_code_base64 ?? null, saleId: d.sale_id });
    } catch (e: any) {
      setError(e?.message ?? "Erro inesperado.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="min-h-screen grid place-items-center bg-slate-50"><Loader2 className="h-6 w-6 animate-spin text-red-600" /></div>;
  }
  if (notFound || !product || !config) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 px-4">
        <div className="max-w-md w-full rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Produto não encontrado</h1>
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
      pix={pix ? { code: pix.code, qrBase64: pix.qrBase64 } : null}
      copyPix={copyPix}
      copied={copied}
    />
  );
}
