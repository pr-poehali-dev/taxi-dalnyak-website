import { useEffect, useRef, useState } from "react";
import { appCall } from "@/lib/appApi";
import Icon from "@/components/ui/icon";
import type { Place } from "./AddressSearch";
import { useBackClose } from "@/lib/useBackClose";

type Which = "from" | "to";

export default function RoutePicker({ token, fromText, toText, near, start, onPickFrom, onPickTo, onMyLocation, onMap, onClose }: {
  token: string; fromText: string; toText: string; near: [number, number] | null; start: Which;
  onPickFrom: (p: Place) => void; onPickTo: (p: Place) => void; onMyLocation: () => void; onMap: (w: Which) => void; onClose: () => void;
}) {
  useBackClose(onClose);
  const [which, setWhich] = useState<Which>(start);
  const [a, setA] = useState(fromText);
  const [b, setB] = useState(toText);
  const [dirty, setDirty] = useState(false);
  const [items, setItems] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const refA = useRef<HTMLInputElement>(null);
  const refB = useRef<HTMLInputElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const el = start === "to" ? refB.current : refA.current;
    el?.focus();
    el?.select();
  }, [start]);

  const q = which === "from" ? a : b;
  useEffect(() => {
    clearTimeout(timer.current);
    if (!dirty || q.trim().length < 3) { setItems([]); setLoading(false); return; }
    setLoading(true);
    timer.current = setTimeout(async () => {
      try {
        const r = await appCall<{ items: Place[] }>("client_suggest", { text: q, lat: near?.[0], lng: near?.[1] }, token);
        setItems(r.items);
      } catch { setItems([]); }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer.current);
  }, [q, dirty, token, near]);

  const pick = (p: Place) => {
    setItems([]);
    setDirty(false);
    if (which === "from") {
      onPickFrom(p);
      setA(p.label);
      setWhich("to");
      window.setTimeout(() => refB.current?.focus(), 30);
    } else {
      onPickTo(p);
      onClose();
    }
  };

  const row = (w: Which, value: string, set: (v: string) => void, ref: React.RefObject<HTMLInputElement>, dot: string, ph: string) => (
    <div className={`flex items-center gap-3 rounded-2xl px-3 ${which === w ? "bg-white ring-2 ring-[#fcd34d]" : "bg-neutral-100"}`}>
      <span className={`h-3 w-3 shrink-0 rounded-full ${dot}`} />
      <input ref={ref} value={value} placeholder={ph}
        onFocus={() => { setWhich(w); setDirty(false); setItems([]); }}
        onChange={(e) => { set(e.target.value); setWhich(w); setDirty(true); }}
        className="min-w-0 flex-1 bg-transparent py-3.5 text-[15px] font-bold text-neutral-900 outline-none placeholder:font-semibold placeholder:text-neutral-400" />
      {value && which === w && <button onClick={() => { set(""); setDirty(false); setItems([]); ref.current?.focus(); }} aria-label="Очистить"><Icon name="X" size={18} className="text-neutral-400" /></button>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-[3000] flex flex-col bg-white text-neutral-900" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="flex items-center gap-2 px-3 pb-2 pt-3">
        <button onClick={onClose} aria-label="Назад" className="flex h-10 w-10 items-center justify-center"><Icon name="ArrowLeft" size={22} /></button>
        <div className="text-lg font-extrabold">Маршрут</div>
      </div>
      <div className="space-y-2 px-4 pb-3">
        {row("from", a, setA, refA, "bg-blue-600", "Откуда")}
        {row("to", b, setB, refB, "bg-neutral-900", "Куда едем?")}
      </div>
      <div className="flex-1 overflow-y-auto border-t border-neutral-100">
        {which === "from" && (
          <button onClick={() => { onMyLocation(); onClose(); }} className="flex w-full items-center gap-3 px-5 py-3.5 text-left active:bg-neutral-50">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600"><Icon name="Crosshair" size={18} /></span>
            <span className="font-bold">Моё местоположение</span>
          </button>
        )}
        <button onClick={() => { onMap(which); onClose(); }} className="flex w-full items-center gap-3 px-5 py-3.5 text-left active:bg-neutral-50">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100"><Icon name="MapPin" size={18} /></span>
          <span className="font-bold">Указать на карте</span>
        </button>
        {loading && <p className="px-5 py-3 text-sm text-neutral-400">Ищем адреса...</p>}
        {items.map((p, i) => (
          <button key={i} onClick={() => pick(p)} className="flex w-full items-start gap-3 border-t border-neutral-50 px-5 py-3 text-left active:bg-neutral-50">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-neutral-100"><Icon name="MapPin" size={16} className="text-neutral-500" /></span>
            <span className="min-w-0 text-[15px] font-semibold leading-snug">{p.label}</span>
          </button>
        ))}
        {!loading && dirty && q.trim().length >= 3 && items.length === 0 && <p className="px-5 py-3 text-sm text-neutral-400">Ничего не нашли. Попробуйте написать город и улицу.</p>}
        {!dirty && which === "to" && <p className="px-5 py-4 text-sm text-neutral-400">Введите город или адрес, куда едете.</p>}
      </div>
    </div>
  );
}
