import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { QrCode } from "lucide-react";
import { isValidPixEmv } from "./pix-emv";

/**
 * Gera o QR Code do Pix localmente a partir do BR Code (copia e cola) em SVG.
 * Só desenha o QR se o payload for um EMV Pix válido (CRC16 conferido),
 * garantindo que a imagem seja sempre escaneável e pagável.
 */
export function PixQr({ code, fallbackBase64, className }: { code: string; fallbackBase64?: string | null; className?: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setSvg(null);
    setFailed(false);
    if (!code || !isValidPixEmv(code)) { setFailed(true); return; }
    QRCode.toString(code, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 1,
      color: { dark: "#000000", light: "#FFFFFF" },
    })
      .then((out) => {
        if (!alive) return;
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
    <div className="mx-auto grid h-56 w-56 place-items-center rounded-lg border border-black/10 bg-white text-neutral-400">
      <QrCode className="h-16 w-16 animate-pulse" />
    </div>
  );
}
