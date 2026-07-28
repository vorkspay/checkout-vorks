import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

export default function ShortLinkPage() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!code) {
      setNotFound(true);
      return;
    }

    (async () => {
      try {
        const r = await fetch(`/api/public/resolve-slug/${encodeURIComponent(code)}`);
        if (!r.ok) { setNotFound(true); return; }
        const { id } = (await r.json()) as { id: string };
        navigate(`/checkout/${id}${window.location.search}`, { replace: true });
      } catch {
        setNotFound(true);
      }
    })();
  }, [code, navigate]);

  if (notFound) {
    return (
      <div className="min-h-screen grid place-items-center bg-slate-50 px-4">
        <div className="max-w-md w-full rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-semibold">Link inválido ou expirado</h1>
          <p className="mt-2 text-sm text-black/60">Verifique o endereço com o vendedor.</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen grid place-items-center bg-slate-50">
      <Loader2 className="h-6 w-6 animate-spin text-red-600" />
    </div>
  );
}
