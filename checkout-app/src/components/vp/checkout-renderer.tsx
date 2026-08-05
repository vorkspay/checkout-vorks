import { useEffect, useMemo, useState } from "react";
import DOMPurify from "isomorphic-dompurify";
import type { CheckoutConfig, Block, FieldConfig } from "@/lib/checkout-schema";
import { Check, ShieldCheck, Star, Lock, Clock, Loader2, QrCode, Copy, Check as CheckIcon } from "lucide-react";
import { PixQr } from "@/components/vp/pix-qr";


/** Mídias enviadas no editor ficam em /api/public/media/... servido pelo backend
 *  VorksPay. Em domínios de checkout próprios (SPA separado) esse caminho
 *  relativo não existe, então prefixamos com a origem do backend. */
const MEDIA_BASE = "https://www.vorkspay.site";
const mediaSrc = (u?: string | null): string => {
  if (!u) return "";
  if (!u.startsWith("/api/")) return u;
  try {
    const h = window.location.hostname;
    const local = h === "localhost" || h.startsWith("127.") || h.endsWith(".lovable.app") || h.endsWith(".lovableproject.com") || h.endsWith("vorkspay.site");
    if (local) return u;
  } catch { /* SSR: usa base absoluta */ }
  return `${MEDIA_BASE}${u}`;
};

const BRL = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export type OrderBump = {
  id: string;
  title: string;
  description: string | null;
  price_cents: number;
  image_url?: string | null;
  active: boolean;
};

export type RendererProduct = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  image_url?: string | null;
  bump_enabled: boolean;
  bump_name: string | null;
  bump_description: string | null;
  bump_price_cents: number | null;
  order_bumps?: OrderBump[];
  refund_policy?: string | null;
  checkout_button_text?: string | null;
  checkout_headline?: string | null;
  kind?: "digital" | "physical" | "saas" | null;
};

export type ShippingValues = {
  zip: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
};

type Props = {
  config: CheckoutConfig;
  product: RendererProduct;
  /** When true, all inputs are inert (used inside the builder preview). */
  previewOnly?: boolean;
  /** Form submit handler for real checkout page. */
  onSubmit?: (data: {
    values: Record<string, string>;
    includeBump: boolean | string[]; // support legacy single bump or multi-bump IDs
    shipping?: ShippingValues;
  }) => Promise<void> | void;
  submitting?: boolean;
  error?: string | null;
  /** Optional pix result to render QR/copy inside the CTA area. */
  pix?: null | { code: string; qrBase64: string | null };
  copyPix?: () => void;
  copied?: boolean;
};

export function CheckoutRenderer({
  config, product, previewOnly, onSubmit, submitting, error, pix, copyPix, copied,
}: Props) {
  const { theme, layout, fields, blocks } = config;
  const [includeBump, setIncludeBump] = useState<boolean | string[]>(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [coupon, setCoupon] = useState("");
  const isPhysical = product.kind === "physical";
  const [shipping, setShipping] = useState<ShippingValues>({
    zip: "", street: "", number: "", complement: "", neighborhood: "", city: "", state: "",
  });

  const activeFields = useMemo(() => fields.filter((f) => f.enabled), [fields]);

  const total = useMemo(() => {
    let t = product.price_cents;
    if (Array.isArray(includeBump)) {
      product.order_bumps?.forEach(b => {
        if (includeBump.includes(b.id)) t += b.price_cents;
      });
    } else if (includeBump && product.bump_enabled && product.bump_price_cents) {
      t += product.bump_price_cents;
    }
    return t;
  }, [product, includeBump]);

  const radiusCls =
    theme.radius === "sm" ? "rounded-md" :
    theme.radius === "md" ? "rounded-lg" :
    theme.radius === "lg" ? "rounded-xl" : "rounded-2xl";

  const cardCls = `${radiusCls} border border-black/10 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_1px_1px_rgba(15,23,42,0.03)]`;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (previewOnly) return;
    onSubmit?.({ values, includeBump, shipping: isPhysical ? shipping : undefined });
  }

  const orderedBlocks = blocks.filter((b) => b.enabled);
  const headerBlocks = orderedBlocks.filter((b) => b.type === "header_bar");
  const bodyBlocks = orderedBlocks.filter((b) => b.type !== "header_bar" && b.type !== "order_summary");
  
  const summaryBlock = orderedBlocks.find((b) => b.type === "order_summary");

  const primary = theme.primary;
  const media = config.media ?? {};
  const summaryPos = config.summaryPosition ?? (layout === "two-col" ? "side" : "bottom");
  const effectiveSummaryPos: "top" | "side" | "bottom" =
    summaryPos === "side" && layout !== "two-col" ? "bottom" : summaryPos;

  // Inject favicon on the public checkout page (not in preview)
  useEffect(() => {
    if (previewOnly || !media.favicon) return;
    const link = document.querySelector<HTMLLinkElement>("link[rel~='icon']") ?? (() => {
      const l = document.createElement("link"); l.rel = "icon"; document.head.appendChild(l); return l;
    })();
    const prev = link.href;
    link.href = mediaSrc(media.favicon);
    return () => { link.href = prev; };
  }, [media.favicon, previewOnly]);

  const ctx = { config, product, includeBump, setIncludeBump, values, setValues, coupon, setCoupon, activeFields, total, cardCls, radiusCls, previewOnly, submitting, error, pix, copyPix, copied, handleSubmit } as Ctx;
  const productForSummary: RendererProduct = media.cover ? { ...product, image_url: media.cover } : product;
  const summaryCtx: Ctx = { ...ctx, product: productForSummary };

  const renderSummary = (extraCls = "") =>
    summaryBlock ? <div className={extraCls}>{renderBlock(summaryBlock, summaryCtx)}</div> : null;

  return (
    <div
      className="w-full min-h-full"
      style={{ background: theme.background === "#ffffff" || theme.background === "#fff" ? "#f8fafc" : theme.background, color: theme.text }}
    >
      {headerBlocks.map((b) => renderBlock(b, ctx))}

      {(media.logo || media.banner) && (
        <div className="mx-auto max-w-5xl px-4 pt-4">
          {media.logo && (
            <div className="flex justify-center pb-3">
              <img src={mediaSrc(media.logo)} alt="Logo" className="max-h-14 w-auto object-contain" />
            </div>
          )}
          {media.banner && (
            <img src={mediaSrc(media.banner)} alt="" className={`w-full ${radiusCls} object-cover`} />
          )}
        </div>
      )}

      <div className={`mx-auto max-w-5xl px-4 py-6 ${layout === "two-col" && effectiveSummaryPos === "side" ? "grid gap-6 lg:grid-cols-[1fr,360px]" : ""}`}>
        <div className="space-y-4 min-w-0">
          {effectiveSummaryPos === "top" && renderSummary()}
          <div className="space-y-4">
            {bodyBlocks.map((b) => (
              <div key={b.id} data-block-type={b.type}>
                {b.type === "cta_button" ? (
                  <form onSubmit={handleSubmit}>
                    {renderBlock(b, ctx)}
                  </form>
                ) : (
                  renderBlock(b, ctx)
                )}
                
                {b.type === "form" && isPhysical && (
                  <div className={`${cardCls} p-5 bg-white mt-4`}>
                    <div className="mb-3 text-sm font-semibold" style={{ color: primary }}>Endereço de entrega</div>
                    <div className="grid grid-cols-6 gap-3">
                      <ShipField required span={2} label="CEP" value={shipping.zip} onChange={(v) => setShipping({ ...shipping, zip: v })} previewOnly={previewOnly} />
                      <ShipField required span={4} label="Rua" value={shipping.street} onChange={(v) => setShipping({ ...shipping, street: v })} previewOnly={previewOnly} />
                      <ShipField required span={2} label="Número" value={shipping.number} onChange={(v) => setShipping({ ...shipping, number: v })} previewOnly={previewOnly} />
                      <ShipField span={4} label="Complemento" value={shipping.complement} onChange={(v) => setShipping({ ...shipping, complement: v })} previewOnly={previewOnly} />
                      <ShipField required span={3} label="Bairro" value={shipping.neighborhood} onChange={(v) => setShipping({ ...shipping, neighborhood: v })} previewOnly={previewOnly} />
                      <ShipField required span={2} label="Cidade" value={shipping.city} onChange={(v) => setShipping({ ...shipping, city: v })} previewOnly={previewOnly} />
                      <ShipField required span={1} label="UF" value={shipping.state} onChange={(v) => setShipping({ ...shipping, state: v.toUpperCase().slice(0, 2) })} previewOnly={previewOnly} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          {effectiveSummaryPos === "bottom" && renderSummary("mt-4")}
        </div>

        {effectiveSummaryPos === "side" && summaryBlock && (
          <aside className="space-y-4 h-fit lg:sticky lg:top-4">
            {renderBlock(summaryBlock, summaryCtx)}
          </aside>
        )}
      </div>
    </div>
  );
}


function ShipField({
  label, value, onChange, span, required, previewOnly,
}: { label: string; value: string; onChange: (v: string) => void; span: number; required?: boolean; previewOnly?: boolean }) {
  const spanCls =
    span === 1 ? "col-span-2 sm:col-span-1" :
    span === 2 ? "col-span-3 sm:col-span-2" :
    span === 3 ? "col-span-6 sm:col-span-3" :
    span === 4 ? "col-span-6 sm:col-span-4" : "col-span-6";
  return (
    <label className={`text-xs ${spanCls}`}>
      <span className="font-medium">{label}{required && <span className="text-red-600"> *</span>}</span>
      <input
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={previewOnly}
        className="mt-1 w-full rounded-md border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-black/30"
      />
    </label>
  );
}

type Ctx = {
  config: CheckoutConfig;
  product: RendererProduct;
  includeBump: boolean;
  setIncludeBump: (v: boolean | string[] | ((prev: boolean | string[]) => boolean | string[])) => void;
  values: Record<string, string>;
  setValues: (v: Record<string, string>) => void;
  coupon: string;
  setCoupon: (v: string) => void;
  activeFields: FieldConfig[];
  total: number;
  cardCls: string;
  radiusCls: string;
  previewOnly?: boolean;
  submitting?: boolean;
  error?: string | null;
  pix?: null | { code: string; qrBase64: string | null };
  copyPix?: () => void;
  copied?: boolean;
  handleSubmit: (e: React.FormEvent) => void;
};

function renderBlock(b: Block, ctx: Ctx) {
  const { config, product, cardCls, radiusCls } = ctx;
  const primary = config.theme.primary;

  switch (b.type) {
    case "header_bar":
      return (
        <div key={b.id} className="w-full border-b border-black/10 py-2.5 text-center text-xs font-medium tracking-wide" style={{ background: b.bg, color: b.fg }}>
          <Lock className="inline h-3 w-3 mr-1.5 -mt-0.5" /> {b.text}
        </div>
      );

    case "banner_image":
      return b.url ? (
        <img key={b.id} src={mediaSrc(b.url)} alt={b.alt ?? ""} className={`w-full ${b.rounded !== false ? radiusCls : ""}`} />
      ) : (
        <div key={b.id} className={`${cardCls} bg-black/5 aspect-[16/9] grid place-items-center text-xs text-black/40`}>
          Banner: cole a URL de uma imagem
        </div>
      );

    case "rich_text":
      return <div key={b.id} className={`${cardCls} p-5 bg-white`} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(b.html, { USE_PROFILES: { html: true }, FORBID_TAGS: ["style", "script", "iframe", "object", "embed", "form"], FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover", "onfocus", "onblur", "style"] }) }} />;

    case "benefits":
      return (
        <div key={b.id} className={`${cardCls} p-5 bg-white`}>
          {b.title && <div className="mb-3 text-sm font-semibold">{b.title}</div>}
          <ul className="space-y-2">
            {b.items.map((it, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: primary }} />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      );

    case "price_box":
      return (
        <div key={b.id} className={`${cardCls} p-6 text-center`}>
          {b.fromPrice && <div className="text-[11px] uppercase tracking-wider text-black/50">De <s>{b.fromPrice}</s></div>}
          {b.label && <div className="text-[11px] font-semibold uppercase tracking-wider text-black/60">{b.label}</div>}
          <div className="mt-1 text-3xl font-semibold tracking-tight text-black">{BRL(ctx.total / 100)}</div>
          {b.caption && <div className="mt-1 text-xs text-black/60">{b.caption}</div>}
          {b.badge && (
            <div className="mt-3 inline-flex items-center gap-1 rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-[11px] font-medium text-black/70">
              <Clock className="h-3 w-3" /> {b.badge}
            </div>
          )}
        </div>
      );

    case "testimonials":
      return (
        <div key={b.id} className={`${cardCls} p-5 bg-white`}>
          {b.title && <div className="mb-3 text-center text-sm font-semibold">{b.title}</div>}
          <div className="grid gap-3 sm:grid-cols-3">
            {b.items.map((t, i) => (
              <div key={i} className="rounded-lg border border-black/5 bg-black/[0.02] p-3 text-center">
                <div className="flex justify-center gap-0.5 mb-1" style={{ color: "#f5a524" }}>
                  {Array.from({ length: t.stars ?? 5 }).map((_, k) => <Star key={k} className="h-3.5 w-3.5 fill-current" />)}
                </div>
                <p className="text-xs italic">"{t.text}"</p>
                <div className="mt-1 text-[11px] font-medium text-black/60">— {t.name}</div>
              </div>
            ))}
          </div>
        </div>
      );

    case "trust_badges":
      return (
        <div key={b.id} className="grid gap-2 sm:grid-cols-3">
          {b.items.map((it, i) => (
            <div key={i} className={`${cardCls} bg-white p-3 text-center`}>
              <ShieldCheck className="mx-auto h-5 w-5" style={{ color: primary }} />
              <div className="mt-1 text-[11px] font-bold">{it.label}</div>
              {it.sub && <div className="text-[10px] text-black/60">{it.sub}</div>}
            </div>
          ))}
        </div>
      );

    case "countdown":
      return <CountdownBlock key={b.id} minutes={b.minutes} text={b.text} primary={primary} cardCls={cardCls} />;

    case "security_seals":
      return (
        <div key={b.id} className="flex items-center justify-center gap-2 text-[11px] text-black/60">
          <ShieldCheck className="h-3.5 w-3.5" /> {b.text ?? "Ambiente criptografado."}
        </div>
      );

    case "coupon":
      return (
        <div key={b.id} className={`${cardCls} p-4 bg-white flex gap-2`}>
          <input
            value={ctx.coupon}
            onChange={(e) => ctx.setCoupon(e.target.value)}
            placeholder="Código do cupom"
            className="flex-1 rounded-md border border-black/10 px-3 py-2 text-sm"
            disabled={ctx.previewOnly}
          />
          <button type="button" className="rounded-md border border-black/10 px-3 text-sm">Aplicar</button>
        </div>
      );

    case "order_summary":
      return (
        <div key={b.id} className={`${cardCls} p-5`}>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-black/50">Resumo do pedido</div>
          <div className="mt-3 flex gap-3">
            {product.image_url ? (
              <img src={mediaSrc(product.image_url)} alt="" className="h-14 w-14 rounded-lg object-cover" />
            ) : (
              <div className="h-14 w-14 rounded-lg grid place-items-center text-xs font-semibold text-white" style={{ background: primary }}>VP</div>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{product.name}</div>
              {product.description && <div className="text-xs text-black/60 line-clamp-2">{product.description}</div>}
            </div>
          </div>
          <div className="mt-4 space-y-1.5 text-sm">
            <Row label="Produto" value={BRL(product.price_cents / 100)} />
            {Array.isArray(ctx.includeBump) ? (
              product.order_bumps?.filter(b => (ctx.includeBump as any).includes(b.id)).map(b => (
                <Row key={b.id} label={b.title} value={BRL(b.price_cents / 100)} />
              ))
            ) : (
              ctx.includeBump && product.bump_enabled && product.bump_price_cents != null && (
                <Row label={product.bump_name || "Order bump"} value={BRL(product.bump_price_cents / 100)} />
              )
            )}
            <Row label="Taxas" value="Grátis" />
            <div className="border-t border-black/10 pt-2.5 mt-1 flex items-baseline justify-between">
              <span className="text-xs font-medium text-black/60">Total a pagar</span>
              <span className="text-lg font-semibold tracking-tight">{BRL(ctx.total / 100)}</span>
            </div>
          </div>
          {product.refund_policy && (
            <div className="mt-3 flex items-start gap-2 rounded-md border border-black/5 bg-black/[0.02] p-2.5 text-[11px] text-black/60">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{product.refund_policy}</span>
            </div>
          )}
        </div>
      );

    case "order_bumps":
      const rawBumps = product.order_bumps || [];
      const orderBumpVisibility = config.orderBumpVisibility || {};
      
      if (rawBumps.length === 0) {
        return null;
      }
      
      // Mapeamos os bumps para garantir que o array seja válido
      const visibleBumps = rawBumps.filter(bump => bump.active && orderBumpVisibility[bump.id] !== false);
      
      if (visibleBumps.length === 0) {
        // Fallback: Se o bloco existe mas não tem bumps, tentamos mostrar o bump legado do produto principal
        if (product.bump_enabled && product.bump_name) {
           const legacyBump = {
              id: 'legacy-bump',
              title: product.bump_name,
              description: product.bump_description,
              price_cents: product.bump_price_cents || 0,
              image_url: null,
              active: true
            };
           visibleBumps.push(legacyBump);
        } else {
          return null;
        }
      }
      
      return (
        <div key={b.id} className="space-y-3 my-4">
          {visibleBumps.map((bump) => {
            const isSelected = Array.isArray(ctx.includeBump) 
              ? ctx.includeBump.includes(bump.id) 
              : !!ctx.includeBump;
              
            const toggle = () => {
              if (ctx.previewOnly) return;
              if (Array.isArray(ctx.includeBump)) {
                if (isSelected) {
                  ctx.setIncludeBump((ctx.includeBump as string[]).filter(id => id !== bump.id));
                } else {
                  ctx.setIncludeBump([...(ctx.includeBump as string[]), bump.id]);
                }
              } else {
                if (isSelected) ctx.setIncludeBump([]);
                else ctx.setIncludeBump([bump.id]);
              }
            };

            return (
              <div
                key={bump.id}
                onClick={toggle}
                className={`${cardCls} p-4 bg-white flex gap-3 cursor-pointer transition-all hover:border-black/20 ${isSelected ? "ring-2" : ""}`}
                style={{ ...(isSelected ? { boxShadow: `0 0 0 2px ${primary}`, borderColor: primary } : {}) }}
              >
                <div className="mt-1">
                  <div className={`h-5 w-5 rounded border flex items-center justify-center transition ${isSelected ? "bg-brand border-brand" : "border-black/20"}`} style={isSelected ? { backgroundColor: primary, borderColor: primary } : {}}>
                    {isSelected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                  </div>
                </div>
                {bump.image_url && (
                  <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-black/5">
                    <img src={mediaSrc(bump.image_url)} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold truncate">{bump.title}</span>
                    <span className="text-sm font-bold shrink-0" style={{ color: primary }}>+ {BRL(bump.price_cents / 100)}</span>
                  </div>
                  {bump.description && <p className="mt-1 text-xs text-black/60 line-clamp-2">{bump.description}</p>}
                  <div className="mt-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: primary }}>OFERTA ESPECIAL · ADICIONE AO PEDIDO</div>
                </div>
              </div>
            );
          })}
        </div>
      );

      
      return (
        <div key={b.id} className="space-y-3">

          {visibleBumps.map((bump) => {
            const isSelected = Array.isArray(ctx.includeBump) 
              ? ctx.includeBump.includes(bump.id) 
              : !!ctx.includeBump;
              
            const toggle = () => {
              if (ctx.previewOnly) return;
              if (Array.isArray(ctx.includeBump)) {
                if (isSelected) {
                  ctx.setIncludeBump((ctx.includeBump as string[]).filter(id => id !== bump.id));
                } else {
                  ctx.setIncludeBump([...(ctx.includeBump as string[]), bump.id]);
                }
              } else {
                // Compatibility for legacy boolean state
                if (isSelected) {
                  ctx.setIncludeBump([]);
                } else {
                  ctx.setIncludeBump([bump.id]);
                }
              }
            };

            return (
              <label
                key={bump.id}
                className={`${cardCls} p-4 bg-white flex gap-3 cursor-pointer transition ${isSelected ? "ring-2" : ""}`}
                style={{ ...(isSelected ? { boxShadow: `0 0 0 2px ${primary}` } : {}) }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={toggle}
                  className="mt-1"
                  disabled={ctx.previewOnly}
                />
                {bump.image_url && (
                  <div className="h-16 w-16 shrink-0 rounded-lg overflow-hidden border border-black/5">
                    <img src={mediaSrc(bump.image_url)} alt="" className="h-full w-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold truncate">{bump.title}</span>
                    <span className="text-sm font-semibold shrink-0" style={{ color: primary }}>+ {BRL(bump.price_cents / 100)}</span>
                  </div>
                  {bump.description && <p className="mt-1 text-xs text-black/60 line-clamp-2">{bump.description}</p>}
                  <div className="mt-1 text-[11px] font-medium" style={{ color: primary }}>OFERTA ESPECIAL · Adicione ao pedido</div>
                </div>
              </label>
            );
          })}
        </div>
      );


    case "form":
      return (
        <div key={b.id} className={`${cardCls} p-5`}>
          <div className="mb-1 text-sm font-semibold">Seus dados</div>
          <div className="mb-4 text-[11px] text-black/50">Usaremos seus dados apenas para emitir a nota e enviar o comprovante.</div>
          <div className="grid grid-cols-2 gap-3">
            {ctx.activeFields.map((f) => (
              <label key={f.key} className={`text-xs ${f.key === "name" || f.key === "email" || f.key === "address" ? "col-span-2" : "col-span-2 sm:col-span-1"}`}>
                <span className="font-medium text-black/80">{f.label}{f.required && <span className="text-black/40"> *</span>}</span>
                <input
                  required={f.required}
                  placeholder={f.placeholder}
                  value={ctx.values[f.key] ?? ""}
                  onChange={(e) => ctx.setValues({ ...ctx.values, [f.key]: e.target.value })}
                  disabled={ctx.previewOnly}
                  className="mt-1 w-full rounded-md border border-black/15 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-black/40 focus:ring-2 focus:ring-black/5"
                />
              </label>
            ))}
          </div>
        </div>
      );


    case "cta_button":
      return (
        <div key={b.id} className="space-y-3">
          {ctx.error && (
            <div className={`${cardCls} p-3 text-xs border-red-200 text-red-700 bg-red-50`}>{ctx.error}</div>
          )}
          {ctx.pix ? (
            <div className={`${cardCls} p-5 text-center`}>
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-black/60">Pague com Pix</div>
              <PixQr code={ctx.pix.code} fallbackBase64={ctx.pix.qrBase64} />

              <p className="mt-3 text-xs text-black/60">Abra o app do seu banco e escaneie o QR Code, ou copie o código abaixo.</p>
              <div className="mt-3 flex gap-2">
                <input readOnly value={ctx.pix.code} className="flex-1 rounded-md border border-black/15 bg-white px-3 py-2 text-xs font-mono" />
                <button type="button" onClick={ctx.copyPix} className="inline-flex items-center gap-1 rounded-md border border-black/15 bg-white px-3 text-xs hover:bg-black/[0.03]">
                  {ctx.copied ? <><CheckIcon className="h-3.5 w-3.5" /> Copiado</> : <><Copy className="h-3.5 w-3.5" /> Copiar</>}
                </button>
              </div>
              <p className="mt-3 inline-flex items-center gap-1.5 text-[11px] text-black/50">
                <Loader2 className="h-3 w-3 animate-spin" /> Aguardando confirmação — atualiza automaticamente.
              </p>
            </div>
          ) : (
            <button
              type="submit"
              disabled={ctx.previewOnly || ctx.submitting}
              style={{ background: config.theme.ctaBg, color: config.theme.ctaFg }}
              className={`${radiusCls} w-full inline-flex items-center justify-center gap-2 py-3.5 text-sm font-semibold tracking-wide transition hover:brightness-105 disabled:opacity-60`}
            >
              {ctx.submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              {product.checkout_button_text || `Pagar ${BRL(ctx.total / 100)} com Pix`}
            </button>
          )}
          <p className="text-center text-[11px] text-black/50">
            <Lock className="inline h-3 w-3 mr-1 -mt-0.5" />
            Pagamento processado pela VorksPay · Ambiente criptografado
          </p>
        </div>
      );
  }
}

function Row({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between text-sm"><span className="text-black/60">{label}</span><span>{value}</span></div>;
}

function CountdownBlock({ minutes, text, primary, cardCls }: { minutes: number; text?: string; primary: string; cardCls: string }) {
  const [left, setLeft] = useState(minutes * 60);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(t);
  }, []);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return (
    <div className={`${cardCls} p-3 text-center text-sm font-semibold text-white`} style={{ background: primary }}>
      <Clock className="inline h-4 w-4 mr-1 -mt-0.5" /> {text ?? "Oferta expira em"} <span className="ml-2 font-mono text-lg">{mm}:{ss}</span>
    </div>
  );
}
