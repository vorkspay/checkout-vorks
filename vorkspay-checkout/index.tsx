import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Nav } from "@/components/vp/nav";
import { Footer } from "@/components/vp/footer";
import { Landing } from "@/components/vp/landing";
import { isCheckoutHost } from "@/lib/checkout-hosts";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VorksPay — A infraestrutura que impulsiona seus pagamentos" },
      {
        name: "description",
        content:
          "Gateway de pagamentos brasileira com PIX, assinaturas e split. API-first, checkout otimizado e taxas transparentes.",
      },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "VorksPay — Gateway de pagamentos" },
      {
        property: "og:description",
        content: "PIX, assinaturas e split em uma única API. Comece grátis.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "VorksPay — Gateway de pagamentos" },
      {
        name: "twitter:description",
        content: "PIX, assinaturas e split em uma única API.",
      },
    ],
  }),
  component: IndexPage,
});

function IndexPage() {
  const [isCheckout, setIsCheckout] = useState(false);
  useEffect(() => {
    try {
      const host = window.location.hostname;
      const isDevHost =
        host === "localhost" ||
        host.startsWith("127.") ||
        host.endsWith(".lovableproject.com") ||
        host.endsWith(".lovable.app");
      setIsCheckout(!isDevHost && isCheckoutHost(host));
    } catch {}
  }, []);

  if (isCheckout) {
    return (
      <div className="min-h-screen grid place-items-center bg-muted/30 px-4">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="text-xl font-semibold">Link de checkout incompleto</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Este domínio serve apenas páginas de checkout. Confirme o link enviado pelo vendedor —
            ele deve conter o código do produto (ex.: <span className="font-mono">/c/ABC123</span>).
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main>
        <Landing />
      </main>
      <Footer />
    </div>
  );
}
