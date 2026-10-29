import { useEffect, useRef, useState } from "react";
import { appCall } from "@/lib/appApi";
import Icon from "@/components/ui/icon";

export interface Place {
  label: string; lat: number; lng: number; city: string; street: string; house: string; state?: string; title?: string; subtitle?: string;
}

export default function AddressSearch({ token, value, onChange, onPick, placeholder, near, action = "client_suggest" }: {
  token: string; action?: string; value: string; onChange: (v: string) => void; onPick: (p: Place) => void; placeholder: string;
  near?: [number, number] | null;
}) {
  const [items, setItems] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const skip = useRef(false);

  useEffect(() => {
    if (skip.current) { skip.current = false; return; }
    clearTimeout(timer.current);
    if (value.trim().length < 3) { setItems([]); return; }
    timer.current = setTimeout(async () => {
      try {
        const r = await appCall<{ items: Place[] }>(action, { text: value, lat: near?.[0], lng: near?.[1] }, token);
        setItems(r.items);
        setOpen(true);
      } catch {
        setItems([]);
      }
    }, 350);
    return () => clearTimeout(timer.current);
  }, [value, token, near, action]);

  return (
    <div className="relative">
      <input value={value} onChange={(e) => onChange(e.target.value)} onFocus={() => items.length && setOpen(true)} placeholder={placeholder}
        className="w-full rounded-2xl bg-neutral-100 px-4 py-3.5 text-[15px] font-semibold outline-none focus:ring-2 focus:ring-[#fcd34d]" />
      {open && items.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-64 overflow-y-auto rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
          {items.map((p, i) => (
            <button key={i} type="button" onClick={() => { skip.current = true; onChange(p.label); onPick(p); setOpen(false); }}
              className="flex w-full items-start gap-2 px-4 py-3 text-left text-sm active:bg-neutral-100">
              <Icon name="MapPin" size={16} className="mt-0.5 shrink-0 text-neutral-400" />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}