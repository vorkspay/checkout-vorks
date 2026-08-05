import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { isCheckoutHost, DEFAULT_CHECKOUT_HOST } from "@/lib/checkout-hosts";
import { apiUrl } from "@/lib/api-base";

export const Route = createFileRoute("/c/$code")({
  head: () => ({
    meta: [
      { title: "Checkout Seguro" },
      { name: "robots", content: "noindex, nofollow, noarchive, nosnippet, noimageindex" },
    ],
  }),
  component: ShortLinkResolver,
});

function ShortLinkResolver() {
  const { code } = useParams({ from: "/c/$code" });
  const navigate = useNavigate();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    try {
      const host = window.location.hostname;
      if (!isCheckoutHost(host)) {
        window.location.replace(`https://${DEFAULT_CHECKOUT_HOST}/c/${encodeURIComponent(code)}${window.location.search}`);
        return;
      }
    } catch {}
    (async () => {
      try {
        const r = await fetch(apiUrl(`/api/public/resolve-slug/${encodeURIComponent(code)}`));
        if (!r.ok) { setNotFound(true); return; }
        const { id } = await r.json();
        navigate({ to: "/checkout/$id", params: { id }, replace: true });
      } catch {
        setNotFound(true);
      }
    })();
  }, [code, navigate]);

  if (notFound) {
    return (
      <div className="min-h-screen grid place-items-center bg-muted/30 px-4">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="text-xl font-semibold">Link inválido ou expirado</h1>
          <p className="mt-2 text-sm text-muted-foreground">Verifique o endereço do checkout com o vendedor.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen grid place-items-center bg-muted/30">
      <Loader2 className="h-6 w-6 animate-spin text-brand" />
    </div>
  );
}
