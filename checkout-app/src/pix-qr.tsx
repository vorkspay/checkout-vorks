import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { QrCode } from "lucide-react";

/**
 * Gera o QR Code do Pix localmente a partir do BR Code (copia e cola) em SVG,
 * garantindo nitidez perfeita em qualquer tamanho/tela — independente
 * da imagem devolvida pela adquirente.
 */
export function PixQr({ code, fallbackBase64, className }: { code: string; fallbackBase64?: string | null; className?: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setSvg(null);
    setFailed(false);
    if (!code) return;
    QRCode.toString(code, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 1,
      color: { dark: "#000000", light: "#FFFFFF" },
    })
      .then((out) => {
        if (!alive) return;
        // remove largura/altura fixas para o SVG escalar 100% nítido
        setSvg(out.replace(/<svg([^>]*?)(width|height)="[^"]*"/g, "<svg$1"));
      })
      .catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [code]);

  const box = className ?? "mx-auto h-56 w-56 rounded-lg border border-black/10 bg-white p-2";

  if (svg) {
    return (
      <div
        className={box}
        aria-label="QR Code Pix"
        // SVG gerado localmente pela lib qrcode (conteúdo controlado, sem input externo em markup)
        dangerouslySetInnerHTML={{ __html: svg }}
        style={{ lineHeight: 0 }}
      />
    );
  }

  const fallbackSrc = failed && fallbackBase64
    ? (fallbackBase64.startsWith("data:") || fallbackBase64.startsWith("http")
      ? fallbackBase64
      : `data:image/png;base64,${fallbackBase64.replace(/\s/g, "")}`)
    : null;

  if (fallbackSrc) {
    return <img alt="QR Code Pix" src={fallbackSrc} className={box} />;
  }

  return (
    <div className="mx-auto grid h-56 w-56 place-items-center rounded-lg bg-black text-white">
      <QrCode className="h-24 w-24" />
    </div>
  );
}
