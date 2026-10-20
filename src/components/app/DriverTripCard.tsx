import Icon from "@/components/ui/icon";
import { Badge, Btn, tripTone } from "./ui";
import { TRIP_STATUS, TARIFF_NAME, money, whenText } from "@/lib/appApi";
import { etaMinutes, humanMinutes, useNow } from "./Countdown";
import { useState } from "react";

export interface DTrip {
  id: number; from_city: string | null; from_street: string | null; from_house: string | null; from_text: string | null;
  to_text: string; comment: string | null; price: number; tariff: string; region: string; distance_km: number | null;
  scheduled_at: string | null; status: string; commission: number | null; client_name?: string | null;
  from_lat: number | null; from_lng: number | null; last_msg_id?: number | null; last_msg_role?: string | null; pay_method?: string; eta_at?: string | null;
}

export function PickupBlock({ t }: { t: DTrip }) {
  return (
    <div className="space-y-1 rounded-2xl bg-neutral-100 p-3 text-sm">
      <div className="text-xs font-bold uppercase text-neutral-400">Точка подачи</div>
      <div className="text-base font-extrabold leading-tight">{t.from_city || "Город не указан"}</div>
      <div className="font-bold">{[t.from_street, t.from_house && `д. ${t.from_house}`].filter(Boolean).join(", ") || t.from_text}</div>
      <div className="pt-1 text-xs font-bold uppercase text-neutral-400">Куда</div>
      <div className="font-bold">{t.to_text}</div>
      {t.comment && <div className="pt-1 text-neutral-600">Комментарий: {t.comment}</div>}
      <div className="pt-1 text-neutral-600">Оплата водителю: <b>{t.pay_method === "transfer" ? "переводом" : "наличными"}</b>. Платные дороги отдельно.</div>
    </div>
  );
}

const FLOW: Record<string, { to: string; label: string }> = {
  assigned: { to: "enroute", label: "Выехал к клиенту" },
  enroute: { to: "arrived", label: "Я на месте" },
  arrived: { to: "in_progress", label: "Начать поездку" },
  in_progress: { to: "done", label: "Завершить поездку" },
};

export default function DriverTripCard({ t, unread, onChat, onStep, onCancel, onEta }: {
  t: DTrip; unread: boolean; onChat: () => void; onStep: (to: string) => void; onCancel: () => void; onEta: (m: number) => void;
}) {
  const now = useNow();
  const [custom, setCustom] = useState("");
  const [editEta, setEditEta] = useState(false);
  const left = etaMinutes(t.eta_at, now);
  const needEta = ["assigned", "enroute"].includes(t.status) && (!t.eta_at || editEta);
  const step = FLOW[t.status];
  const net = t.commission != null ? Number(t.price) - Number(t.commission) : null;
  return (
    <div className="space-y-3 rounded-3xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-bold uppercase text-neutral-400">{t.scheduled_at ? `Предзаказ · ${whenText(t.scheduled_at)}` : `Заказ №${t.id}`}</div>
          <h2 className="text-lg font-extrabold">{TRIP_STATUS[t.status]}</h2>
        </div>
        <Badge tone={tripTone(t.status)}>{TARIFF_NAME[t.tariff]}</Badge>
      </div>
      <PickupBlock t={t} />
      <div className="flex justify-between text-sm font-bold">
        <span>{t.distance_km ? `${t.distance_km} км` : ""}</span>
        <span>{money(t.price)}{net != null ? ` · вам ${money(net)}` : ""}</span>
      </div>
      {["assigned", "enroute"].includes(t.status) && (
        <div className="rounded-2xl bg-amber-50 p-3">
          {t.eta_at && !editEta ? (
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-amber-900">Клиенту обещано: через {humanMinutes(left ?? 0)}</span>
              <button onClick={() => setEditEta(true)} className="text-sm font-bold text-amber-700 underline">Изменить</button>
            </div>
          ) : (
            <>
              <div className="mb-2 font-extrabold text-amber-900">Через сколько приедете к клиенту?</div>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 30, 60].map((m) => (
                  <button key={m} onClick={() => { onEta(m); setEditEta(false); }} className="rounded-xl bg-white py-3 font-extrabold text-neutral-900 active:bg-[#fcd34d]">{m} мин</button>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Своё время, минут"
                  className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2.5 font-bold text-neutral-900 outline-none" />
                <button disabled={!custom} onClick={() => { onEta(Number(custom)); setCustom(""); setEditEta(false); }} className="rounded-xl bg-neutral-900 px-4 font-bold text-white disabled:opacity-40">OK</button>
              </div>
            </>
          )}
        </div>
      )}
      <button onClick={onChat} className="relative flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-3.5 font-bold text-white">
        <Icon name="MessageCircle" size={18} /> Чат с пассажиром
        {unread && <span className="absolute right-4 h-3 w-3 rounded-full bg-red-500" />}
      </button>
      {step && <Btn onClick={() => onStep(step.to)} disabled={needEta && t.status === "assigned" && !t.scheduled_at} className="w-full text-lg">{step.label}</Btn>}
      {["assigned", "enroute", "arrived"].includes(t.status) && (
        <button onClick={onCancel} className="w-full text-center text-sm font-semibold text-red-500">Отказаться от заказа</button>
      )}
    </div>
  );
}
