import { useEffect, useState } from "react";
import { money, TARIFF_NAME } from "@/lib/appApi";
import Icon from "@/components/ui/icon";
import type { DTrip } from "./DriverTripCard";

const WINDOW = 30;

export function orderSpeech(t: DTrip) {
  const from = t.from_city || t.from_text || "";
  const to = (t.to_text || "").split(",")[0];
  const km = t.distance_km ? `, ${Math.round(Number(t.distance_km))} километров` : "";
  return `Новый заказ. ${from} — ${to}${km}. ${Math.round(Number(t.price))} рублей.`;
}

export default function IncomingOrder({ t, more, onAccept, onSkip }: {
  t: DTrip; more: number; onAccept: (eta: number) => void; onSkip: () => void;
}) {
  const [left, setLeft] = useState(WINDOW);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setLeft(WINDOW);
    setBusy(false);
    const id = window.setInterval(() => setLeft((s) => s - 1), 1000);
    return () => window.clearInterval(id);
  }, [t.id]);

  useEffect(() => { if (left <= 0) onSkip(); }, [left <= 0]);

  const accept = (m: number) => { if (busy) return; setBusy(true); onAccept(m); };
  const street = [t.from_street, t.from_house && `д. ${t.from_house}`].filter(Boolean).join(", ");

  return (
    <div className="fixed inset-0 z-[4000] flex flex-col bg-neutral-950 text-white" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="h-2 bg-neutral-800"><div className="h-2 bg-[#fcd34d] transition-all duration-1000 ease-linear" style={{ width: `${(Math.max(left, 0) / WINDOW) * 100}%` }} /></div>
      <div className="flex items-center justify-between px-5 pt-5">
        <span className="flex items-center gap-2 text-lg font-extrabold text-[#fcd34d]"><Icon name="BellRing" size={22} className="animate-pulse" />Новый заказ{more > 0 ? ` (+${more})` : ""}</span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-sm font-extrabold">{Math.max(left, 0)} с</span>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-4">
        <div className="text-5xl font-extrabold">{money(t.price)}</div>
        <div className="mt-1 flex flex-wrap gap-2 text-sm text-neutral-400">
          <span>{TARIFF_NAME[t.tariff]}</span>
          {t.distance_km && <span>· {Math.round(Number(t.distance_km))} км</span>}
          <span>· {t.pay_method === "transfer" ? "переводом" : "наличными"}</span>
          {t.region === "new" && <span className="text-sky-400">· новые территории</span>}
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex gap-3">
            <span className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full bg-blue-500" />
            <div><div className="text-2xl font-extrabold leading-tight">{t.from_city || "Подача"}</div><div className="text-neutral-300">{street || t.from_text}</div></div>
          </div>
          <div className="flex gap-3">
            <span className="mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full bg-white" />
            <div className="text-2xl font-extrabold leading-tight">{t.to_text}</div>
          </div>
        </div>

        {(t.passengers || t.luggage || t.comment) && (
          <div className="mt-5 space-y-1 rounded-2xl bg-white/5 p-3 text-sm">
            {t.passengers ? <div>Пассажиров: <b>{t.passengers}</b></div> : null}
            {t.luggage && <div>Багаж: <b>{t.luggage}</b></div>}
            {t.comment && <div className="text-neutral-300">{t.comment}</div>}
          </div>
        )}
      </div>

      <div className="space-y-3 p-5 pb-[max(20px,env(safe-area-inset-bottom))]">
        <div className="text-center text-sm font-bold text-neutral-400">Принять — через сколько будете у клиента:</div>
        <div className="grid grid-cols-4 gap-2">
          {[10, 20, 30, 60].map((m) => (
            <button key={m} disabled={busy} onClick={() => accept(m)} className="rounded-2xl bg-emerald-500 py-5 text-lg font-extrabold text-white active:bg-emerald-600 disabled:opacity-50">{m}<span className="block text-xs font-bold">мин</span></button>
          ))}
        </div>
        <button onClick={onSkip} disabled={busy} className="w-full rounded-2xl bg-white/10 py-4 text-lg font-extrabold text-white active:bg-white/20">Пропустить</button>
      </div>
    </div>
  );
}
