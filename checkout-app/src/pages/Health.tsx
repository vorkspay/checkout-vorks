import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function HealthPage() {
  const [ok, setOk] = useState<boolean | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(api("/api/public/health"));
        setOk(r.ok);
      } catch {
        setOk(false);
      }
    })();
  }, []);


  if (ok === null) {
    return <div className="min-h-screen grid place-items-center bg-slate-50"><span className="text-sm text-slate-500">Verificando domínio...</span></div>;
  }

  return (
    <div className="min-h-screen grid place-items-center bg-slate-50 px-4">
      <div className="max-w-md w-full rounded-2xl border border-black/10 bg-white p-8 text-center shadow-sm">
        <h1 className={`text-xl font-semibold ${ok ? "text-emerald-600" : "text-red-600"}`}>
          {ok ? "Domínio ativo" : "Domínio pendente"}
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          {ok
            ? "O domínio está respondendo corretamente na VorksPay."
            : "O domínio ainda não está apontando corretamente para a VorksPay. Verifique o DNS e aguarde a propagação."}
        </p>
      </div>
    </div>
  );
}
