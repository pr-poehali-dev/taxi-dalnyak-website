import { useState } from "react";
import Icon from "@/components/ui/icon";
import { appCall } from "@/lib/appApi";

const cache: Record<string, string> = {};

export default function SecureDocPhoto({ driverId, field, label, token }: { driverId: number; field: string; label: string; token: string }) {
  const k = `${driverId}:${field}`;
  const [src, setSrc] = useState<string | null>(cache[k] || null);
  const [busy, setBusy] = useState(false);
  const [big, setBig] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    if (src) { setBig(true); return; }
    setBusy(true); setErr("");
    try {
      const r = await appCall<{ image: string }>("disp_doc", { driver_id: driverId, field }, token);
      cache[k] = r.image;
      setSrc(r.image);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <button type="button" onClick={load} className="relative block aspect-[4/3] w-full overflow-hidden rounded-lg bg-neutral-200">
        {src ? <img src={src} alt={label} className="h-full w-full object-cover" /> : (
          <span className="flex h-full flex-col items-center justify-center gap-1 text-xs font-bold text-neutral-500">
            <Icon name={busy ? "Loader2" : "Lock"} size={18} className={busy ? "animate-spin" : ""} />
            {err || (busy ? "Расшифровка..." : "Показать")}
          </span>
        )}
      </button>
      {big && src && (
        <div className="fixed inset-0 z-[5000] flex items-center justify-center bg-black/90 p-3" onClick={() => setBig(false)}>
          <img src={src} alt={label} className="max-h-full max-w-full rounded-lg" />
        </div>
      )}
    </>
  );
}
