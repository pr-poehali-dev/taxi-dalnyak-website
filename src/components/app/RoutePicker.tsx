import { useEffect, useRef, useState } from "react";
import { appCall } from "@/lib/appApi";
import Icon from "@/components/ui/icon";
import type { Place } from "./AddressSearch";
import { useBackClose } from "@/lib/useBackClose";

type Which = "from" | "to";

const RECENT_KEY = "app_recent_places";

function loadRecent(): Place[] {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]"); } catch { return []; }
}

function saveRecent(p: Place) {
  const list = [p, ...loadRecent().filter((x) => x.label !== p.label)].slice(0, 6);
  localStorage.setItem(RECENT_KEY, JSON.stringify(list));
}

function parts(p: Place): { title: string; sub: string } {
  if (p.title) return { title: p.title, sub: p.subtitle || "" };
  const [first, ...rest] = (p.label || "").split(", ");
  return { title: first, sub: rest.join(", ") };
}

export default function RoutePicker({ token, fromText, toText, near, start, onPickFrom, onPickTo, onMyLocation, onMap, onClose }: {
  token: string | null; fromText: string; toText: string; near: [number, number] | null; start: Which;
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
        const r = await appCall<{ items: Place[] }>(token ? "client_suggest" : "guest_suggest", { text: q, lat: near?.[0], lng: near?.[1] }, token);
        setItems(r.items);
      } catch { setItems([]); }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer.current);
  }, [q, dirty, token, near]);

  const recent = loadRecent();

  const pick = (p: Place) => {
    saveRecent(p);
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
      <label className="min-w-0 flex-1 py-2">
        <span className="block text-xs font-bold text-neutral-500">{w === "from" ? "Откуда" : "Куда"}</span>
        <input ref={ref} value={value} placeholder={ph}
          onFocus={() => { setWhich(w); setDirty(false); setItems([]); }}
          onChange={(e) => { set(e.target.value); setWhich(w); setDirty(true); }}
          className="block w-full bg-transparent text-[15px] font-bold text-neutral-900 outline-none placeholder:font-semibold placeholder:text-neutral-400" />
      </label>
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
        {row("from", a, setA, refA, "bg-blue-600", "Город, улица, дом")}
        {row("to", b, setB, refB, "bg-neutral-900", "Город или адрес")}
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
        {loading && items.length === 0 && <p className="px-5 py-3 text-sm text-neutral-400">Ищем адреса...</p>}
        {(dirty && items.length > 0 ? items : !dirty ? recent : []).map((p, i) => {
          const { title, sub } = parts(p);
          return (
            <button key={i} onClick={() => pick(p)} className="flex w-full items-center gap-3 px-5 py-2.5 text-left active:bg-neutral-50">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-100">
                <Icon name={!dirty ? "Clock" : "MapPin"} size={18} className="text-neutral-500" />
              </span>
              <span className="min-w-0 flex-1 border-b border-neutral-100 py-1.5">
                <span className="block truncate text-[16px] font-bold leading-tight text-neutral-900">{title}</span>
                {sub && <span className="block truncate text-[13px] leading-tight text-neutral-400">{sub}</span>}
              </span>
            </button>
          );
        })}
        {!loading && dirty && q.trim().length >= 3 && items.length === 0 && <p className="px-5 py-3 text-sm text-neutral-400">Ничего не нашли. Попробуйте написать город и улицу.</p>}
        {!dirty && recent.length === 0 && <p className="px-5 py-4 text-sm text-neutral-400">{which === "to" ? "Введите город или адрес, куда едете." : "Введите адрес подачи или выберите на карте."}</p>}
      </div>
    </div>
  );
}
