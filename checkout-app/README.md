# VorksPay Checkout — Standalone (Cloudflare Pages)

Aplicação **isolada** só com o checkout público. Usa o **mesmo banco Supabase** da VorksPay principal, mas roda numa infra própria (Cloudflare Pages + Pages Functions), livre das restrições da Lovable.

## Arquitetura

```
Comprador → checkout.dominio-do-seller.com  (CNAME → fallback.vorkspay.site)
                     ↓
     Cloudflare Worker (fallback.vorkspay.site)
                     ↓
     Cloudflare Pages (vorkspay-checkout)  ← ESTE PROJETO
                     ↓
     Supabase (banco compartilhado com a VorksPay principal)
     Mercado Pago (Pix)
```

## Estrutura

```
checkout-app/
├── src/                   # SPA React (Vite)
│   ├── pages/
│   │   ├── ShortLink.tsx  # /c/:code  → resolve e redireciona
│   │   └── Checkout.tsx   # /checkout/:id → renderiza + Pix
│   ├── checkout-renderer.tsx
│   └── checkout-schema.ts
└── functions/             # Cloudflare Pages Functions (serverless)
    └── api/public/
        ├── resolve-slug/[slug].ts
        ├── product/[id].ts
        ├── pix/create.ts
        ├── pix/status/[id].ts
        └── webhooks/mercadopago.ts
```

## Passo a passo de deploy

### 1) Instalar dependências (local)

```bash
cd checkout-app
npm install
```

### 2) Criar projeto na Cloudflare Pages

Duas opções:

**A) Via GitHub (recomendado):**
1. Suba a pasta `checkout-app/` para um repositório GitHub próprio.
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Selecione o repo. Config de build:
   - **Framework preset**: `None`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (ou `checkout-app` se colocar dentro do repo principal)

**B) Deploy direto via CLI:**
```bash
npm run build
npx wrangler pages deploy dist --project-name=vorkspay-checkout
```

### 3) Configurar os secrets no Pages

Dashboard → seu projeto Pages → **Settings** → **Environment variables** → **Production** — adicione:

| Variável | Valor |
|---|---|
| `SUPABASE_URL` | `https://kbbfpwyuyfhqukdjyljx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | *(pegue no Supabase Dashboard → Project Settings → API)* |
| `MERCADOPAGO_ACCESS_TOKEN` | *(o mesmo já usado na VorksPay)* |
| `MERCADOPAGO_WEBHOOK_SECRET` | *(o mesmo já usado)* |

**Marque todas como "Encrypted".** Faça um novo deploy depois de salvar (Deployments → Retry deployment).

### 4) Ajustar o Cloudflare Worker `fallback.vorkspay.site`

O Worker que hoje aponta para `vorkspay.lovable.app` precisa apontar para o **novo domínio Pages** (ex.: `vorkspay-checkout.pages.dev`).

Edite `docs/cloudflare-worker-checkout.js` (no projeto principal) trocando:

```js
const ORIGIN = "vorkspay.lovable.app";
```

por:

```js
const ORIGIN = "vorkspay-checkout.pages.dev";
```

Redeploye o Worker no Cloudflare Dashboard.

### 5) Testar

- Acesse `https://<seu-projeto>.pages.dev/c/AHKHK29` — deve resolver e mostrar o checkout.
- Acesse `https://checkout.semearamorcheckout.shop/c/AHKHK29` — deve funcionar via Worker.
- Configure o webhook do Mercado Pago para:
  ```
  https://<seu-projeto>.pages.dev/api/public/webhooks/mercadopago
  ```

## Notas importantes

- **RLS**: como usamos `SERVICE_ROLE_KEY` nas Pages Functions, o RLS é bypassado — cuide para que as validações de negócio (produto ativo, etc.) fiquem no código das functions.
- **Push notifications & UTMify**: continuam sendo disparadas pelo projeto principal (VorksPay Lovable) via reconciliação. Se quiser trazer para cá, replique `push.server.ts` e `utmify.server.ts`.
- **Roteamento SPA**: se `/checkout/:id` der 404 direto na URL, adicione um arquivo `checkout-app/public/_redirects` com:
  ```
  /*    /index.html   200
  ```

## Desenvolvimento local

```bash
npm run build
npm run pages:dev   # roda Vite + Pages Functions localmente
```

Crie `.dev.vars` (não commitado) com os secrets para dev:
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
MERCADOPAGO_ACCESS_TOKEN=...
MERCADOPAGO_WEBHOOK_SECRET=...
```
