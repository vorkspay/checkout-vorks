// Shared schema between the Checkout Builder (app.checkout) and the public
// renderer (checkout.$id). Kept intentionally simple / JSON-serialisable so
// it can round-trip through the `products.checkout_config` JSONB column.

export type FieldKey =
  | "name"
  | "email"
  | "document"
  | "phone"
  | "address"
  | "birthdate";

export type FieldConfig = {
  key: FieldKey;
  label: string;
  enabled: boolean;
  required: boolean;
  placeholder?: string;
};

export type BlockType =
  | "header_bar"
  | "banner_image"
  | "rich_text"
  | "benefits"
  | "price_box"
  | "testimonials"
  | "trust_badges"
  | "countdown"
  | "security_seals"
  | "coupon"
  | "order_bumps"
  | "order_summary"   // required
  | "form"            // required
  | "cta_button";     // required

export type Block =
  | { id: string; type: "header_bar"; enabled: boolean; text: string; bg: string; fg: string }
  | { id: string; type: "banner_image"; enabled: boolean; url: string; alt?: string; rounded?: boolean }
  | { id: string; type: "rich_text"; enabled: boolean; html: string }
  | { id: string; type: "benefits"; enabled: boolean; title?: string; items: string[] }
  | { id: string; type: "price_box"; enabled: boolean; fromPrice?: string; label?: string; caption?: string; badge?: string }
  | { id: string; type: "testimonials"; enabled: boolean; title?: string; items: Array<{ name: string; text: string; stars?: number }> }
  | { id: string; type: "trust_badges"; enabled: boolean; items: Array<{ label: string; sub?: string }> }
  | { id: string; type: "countdown"; enabled: boolean; minutes: number; text?: string }
  | { id: string; type: "security_seals"; enabled: boolean; text?: string }
  | { id: string; type: "coupon"; enabled: boolean }
  | { id: string; type: "order_bumps"; enabled: boolean }
  | { id: string; type: "order_summary"; enabled: true }
  | { id: string; type: "form"; enabled: true }
  | { id: string; type: "cta_button"; enabled: true };

export type SummaryPosition = "top" | "side" | "bottom";

export type CheckoutMedia = {
  banner?: string;   // large banner image url
  logo?: string;     // brand logo url
  favicon?: string;  // favicon url
  cover?: string;    // product cover image url
};

export type CheckoutConfig = {
  version: 1;
  theme: {
    background: string;      // page bg
    surface: string;         // card bg
    text: string;
    primary: string;         // main brand
    ctaBg: string;           // final CTA button bg
    ctaFg: string;
    radius: "sm" | "md" | "lg" | "xl";
  };
  layout: "single" | "two-col";
  /** Where the order summary is rendered. `side` = column at right (two-col only). */
  summaryPosition?: SummaryPosition;
  media?: CheckoutMedia;
  fields: FieldConfig[];
  blocks: Block[];
};


export const DEFAULT_FIELDS: FieldConfig[] = [
  { key: "name", label: "Nome completo", enabled: true, required: true, placeholder: "Seu nome" },
  { key: "email", label: "E-mail", enabled: true, required: true, placeholder: "voce@email.com" },
  { key: "document", label: "CPF", enabled: true, required: true, placeholder: "000.000.000-00" },
  { key: "phone", label: "WhatsApp", enabled: true, required: false, placeholder: "(11) 90000-0000" },
  { key: "address", label: "Endereço", enabled: false, required: false },
  { key: "birthdate", label: "Data de nascimento", enabled: false, required: false },
];

const uid = () => Math.random().toString(36).slice(2, 10);

export function defaultConfig(brand = "#E10600"): CheckoutConfig {
  return {
    version: 1,
    theme: {
      background: "#f5f5f7",
      surface: "#ffffff",
      text: "#0a0a0a",
      primary: brand,
      ctaBg: "#16a34a",
      ctaFg: "#ffffff",
      radius: "xl",
    },
    layout: "two-col",
    summaryPosition: "side",
    media: {},
    fields: DEFAULT_FIELDS,

    blocks: [
      { id: uid(), type: "header_bar", enabled: true, text: "Compra Segura e Rápida", bg: brand, fg: "#ffffff" },
      { id: uid(), type: "banner_image", enabled: false, url: "", alt: "" },
      {
        id: uid(),
        type: "benefits",
        enabled: true,
        title: undefined,
        items: [
          "Acesso imediato após o pagamento",
          "Garantia incondicional de 7 dias",
          "Suporte humano por WhatsApp",
        ],
      },
      { id: uid(), type: "price_box", enabled: true, fromPrice: "R$ 297,00", label: "POR APENAS", caption: "ACESSO VITALÍCIO", badge: "CONDIÇÃO ESPECIAL POR TEMPO LIMITADO" },
      { id: uid(), type: "countdown", enabled: false, minutes: 15, text: "Oferta expira em" },
      { id: uid(), type: "form", enabled: true },
      { id: uid(), type: "coupon", enabled: false },
      { id: uid(), type: "order_bumps", enabled: true },
      { id: uid(), type: "order_summary", enabled: true },
      { id: uid(), type: "cta_button", enabled: true },
      { id: uid(), type: "security_seals", enabled: true, text: "Ambiente criptografado. Antifraude ativo." },
      {
        id: uid(),
        type: "trust_badges",
        enabled: true,
        items: [
          { label: "COMPRA 100%", sub: "SEGURA E DISCRETA" },
          { label: "+18.000 ALUNOS", sub: "TRANSFORMADOS" },
          { label: "4,9/5 DE AVALIAÇÃO", sub: "NA NOSSA PLATAFORMA" },
        ],
      },
      {
        id: uid(),
        type: "testimonials",
        enabled: true,
        title: "VEJA O QUE NOSSOS CLIENTES DIZEM",
        items: [
          { name: "Marcos, 38", text: "Melhor investimento que já fiz.", stars: 5 },
          { name: "Rafael, 41", text: "As técnicas são incríveis e o app é super prático.", stars: 5 },
          { name: "André, 35", text: "Minha esposa nunca esteve tão conectada comigo!", stars: 5 },
        ],
      },
    ],
  };
}

/** Merge stored (partial) config with defaults so old rows still render. */
export function normalizeConfig(raw: unknown, brand = "#E10600"): CheckoutConfig {
  const base = defaultConfig(brand);
  if (!raw || typeof raw !== "object") return base;
  const cfg = raw as Partial<CheckoutConfig>;
  if (!Array.isArray(cfg.blocks) || cfg.blocks.length === 0) return base;
  return {
    version: 1,
    theme: { ...base.theme, ...(cfg.theme ?? {}) },
    layout: cfg.layout ?? base.layout,
    summaryPosition: (cfg as any).summaryPosition ?? base.summaryPosition ?? "side",
    media: { ...(base.media ?? {}), ...((cfg as any).media ?? {}) },
    fields: Array.isArray(cfg.fields) && cfg.fields.length ? cfg.fields : base.fields,
    blocks: cfg.blocks as Block[],
  };
}


export const BLOCK_LABELS: Record<BlockType, string> = {
  header_bar: "Cabeçalho (faixa)",
  banner_image: "Banner / Imagem",
  rich_text: "Bloco de texto",
  benefits: "Lista de benefícios",
  price_box: "Bloco de preço",
  testimonials: "Depoimentos",
  trust_badges: "Selos de credibilidade",
  countdown: "Contador regressivo",
  security_seals: "Selo de segurança",
  coupon: "Campo de cupom",
  order_bumps: "Order bumps",
  order_summary: "Resumo do pedido",
  form: "Formulário",
  cta_button: "Botão de pagamento",
};

export const REQUIRED_BLOCKS: BlockType[] = ["form", "order_summary", "cta_button"];

export function makeBlock(type: BlockType): Block {
  const id = uid();
  switch (type) {
    case "header_bar": return { id, type, enabled: true, text: "Compra Segura e Rápida", bg: "#E10600", fg: "#ffffff" };
    case "banner_image": return { id, type, enabled: true, url: "", alt: "" };
    case "rich_text": return { id, type, enabled: true, html: "<p>Escreva algo aqui…</p>" };
    case "benefits": return { id, type, enabled: true, items: ["Benefício 1", "Benefício 2", "Benefício 3"] };
    case "price_box": return { id, type, enabled: true, fromPrice: "R$ 297,00", label: "POR APENAS", caption: "ACESSO VITALÍCIO" };
    case "testimonials": return { id, type, enabled: true, title: "Depoimentos", items: [{ name: "Cliente", text: "Excelente!", stars: 5 }] };
    case "trust_badges": return { id, type, enabled: true, items: [{ label: "COMPRA 100% SEGURA" }] };
    case "countdown": return { id, type, enabled: true, minutes: 15, text: "Oferta expira em" };
    case "security_seals": return { id, type, enabled: true, text: "Ambiente criptografado." };
    case "coupon": return { id, type, enabled: true };
    case "order_bumps": return { id, type, enabled: true };
    case "order_summary": return { id, type, enabled: true };
    case "form": return { id, type, enabled: true };
    case "cta_button": return { id, type, enabled: true };
  }
}
