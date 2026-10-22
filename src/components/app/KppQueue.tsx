import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { appCall } from "@/lib/appApi";

export interface KppItem { id: string; name: string; lat: number; lng: number; minutes: number | null; ago: number | null; reports: number }

export function waitText(m: number) {
  if (m < 60) return `${m} мин`;
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r ? `${h} ч ${r} мин` : `${h} ч`;
}

export function agoText(m: number | null) {
  if (m === null) return "";
  if (m < 2) return "только что";
  if (m < 60) return `${m} мин назад`;
  return `${Math.floor(m / 60)} ч назад`;
}

export function tone(m: number | null) {
  if (m === null) return "bg-neutral-100 text-neutral-500";
  if (m <= 45) return "bg-emerald-100 text-emerald-800";
  if (m <= 120) return "bg-amber-100 text-amber-800";
  return "bg-red-100 text-red-700";
}

const CHOICES = [15, 30, 60, 120, 180, 300];

export function useKpp(pollMs = 60000) {
  const [items, setItems] = useState<KppItem[] | null>(null);
  const load = useCallback(() => appCall<{ items: KppItem[] }>("kpp_status").then((r) => setItems(r.items)).catch(() => undefined), []);
  useEffect(() => {
    load();
    const id = window.setInterval(load, pollMs);
    return () => window.clearInterval(id);
  }, [load, pollMs]);
  return { items, setItems, reload: load };
}

export function KppList({ items, compact = false }: { items: KppItem[]; compact?: boolean }) {
  const sorted = [...items].sort((a, b) => (a.minutes === null ? 1 : 0) - (b.minutes === null ? 1 : 0) || (a.minutes ?? 0) - (b.minutes ?? 0));
  return (
    <div className="divide-y divide-neutral-100">
      {sorted.map((k) => (
        <div key={k.id} className={`flex items-center gap-3 ${compact ? "py-2" : "py-3"}`}>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-extrabold text-neutral-900">{k.name}</div>
            <div className="text-xs text-neutral-500">{k.minutes !== null ? `обновлено ${agoText(k.ago)}` : "нет свежих данных"}</div>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-sm font-extrabold ${tone(k.minutes)}`}>
            {k.minutes !== null ? `≈ ${waitText(k.minutes)}` : "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

export function DriverKppReport({ token }: { token: string }) {
  const { items, setItems } = useKpp();
  const [open, setOpen] = useState(false);
  const [kpp, setKpp] = useState<string>("");
  const [done, setDone] = useState("");
  const [err, setErr] = useState("");

  const send = async (minutes: number) => {
    setErr("");
    try {
      const r = await appCall<{ items: KppItem[] }>("driver_kpp_report", { kpp_id: kpp, minutes }, token);
      setItems(r.items);
      setDone("Спасибо! Пассажиры и водители уже видят вашу отметку");
      setKpp("");
      window.setTimeout(() => setDone(""), 4000);
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-neutral-100">
      <button onClick={() => setOpen(!open)} className="flex w-full items-center gap-3 text-left">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700"><Icon name="Timer" size={20} /></span>
        <span className="flex-1">
          <span className="block font-extrabold text-neutral-900">Очередь на КПП</span>
          <span className="block text-xs text-neutral-500">Стоите на КПП? Отметьте время — это видят все</span>
        </span>
        <Icon name={open ? "ChevronUp" : "ChevronDown"} size={20} className="text-neutral-400" />
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          {done && <p className="rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">{done}</p>}
          {err && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-600">{err}</p>}
          {!kpp ? (
            <>
              {items ? <KppList items={items} compact /> : <p className="text-sm text-neutral-500">Загрузка...</p>}
              <div className="text-xs font-bold uppercase text-neutral-400">Где вы стоите?</div>
              <div className="grid grid-cols-1 gap-1.5">
                {(items || []).map((k) => (
                  <button key={k.id} onClick={() => setKpp(k.id)} className="rounded-2xl bg-neutral-100 px-3 py-2.5 text-left text-sm font-bold text-neutral-900 active:bg-neutral-200">{k.name}</button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-extrabold">{items?.find((k) => k.id === kpp)?.name}: сколько ещё стоять?</div>
              <div className="grid grid-cols-3 gap-2">
                {CHOICES.map((m) => (
                  <button key={m} onClick={() => send(m)} className="rounded-2xl bg-[#fcd34d] py-3 text-sm font-extrabold text-neutral-900 active:brightness-95">
                    {m >= 300 ? "5+ ч" : waitText(m)}
                  </button>
                ))}
              </div>
              <button onClick={() => setKpp("")} className="w-full text-center text-sm font-semibold text-neutral-500">Назад</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
