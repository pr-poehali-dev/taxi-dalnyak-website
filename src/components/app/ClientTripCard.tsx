import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Badge, Btn, tripTone } from "./ui";
import { TRIP_STATUS, TARIFF_NAME, money, whenText } from "@/lib/appApi";

export interface ClientTrip {
  id: number; from_text: string; to_text: string; status: string; price: number; base_price: number; tariff: string;
  scheduled_at: string | null; distance_km: number | null; driver_name: string | null; car_model: string | null;
  car_plate: string | null; car_color: string | null; driver_lat: number | null; driver_lng: number | null;
  driver_rating: number | null; rating: number | null; last_msg_id: number | null; last_msg_role?: string | null; pay_method?: string;
}

const STEPS = [
  { key: "new", label: "Поиск" },
  { key: "assigned", label: "Назначен" },
  { key: "enroute", label: "Выехал" },
  { key: "arrived", label: "На месте" },
  { key: "in_progress", label: "В пути" },
];

export default function ClientTripCard({ t, unread, onChat, onCancel, onRaise }: {
  t: ClientTrip; unread: boolean; onChat: () => void; onCancel: () => void; onRaise: (p: number) => void;
}) {
  const [newPrice, setNewPrice] = useState<number>(t.price);
  const idx = STEPS.findIndex((s) => s.key === t.status);
  const canCancel = ["new", "assigned", "enroute", "arrived"].includes(t.status);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold uppercase text-neutral-400">{t.scheduled_at ? `Предзаказ · ${whenText(t.scheduled_at)}` : `Заказ №${t.id}`}</div>
          <h2 className="text-xl font-extrabold">{TRIP_STATUS[t.status]}</h2>
        </div>
        <Badge tone={tripTone(t.status)}>{TARIFF_NAME[t.tariff]}</Badge>
      </div>

      <div className="flex items-center">
        {STEPS.map((s, i) => (
          <div key={s.key} className="flex flex-1 items-center">
            <div className="flex flex-col items-center">
              <span className={`h-3 w-3 rounded-full ${i <= idx ? "bg-neutral-900" : "bg-neutral-200"}`} />
              <span className={`mt-1 text-[10px] font-bold ${i <= idx ? "text-neutral-900" : "text-neutral-300"}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && <span className={`mb-4 h-0.5 flex-1 ${i < idx ? "bg-neutral-900" : "bg-neutral-200"}`} />}
          </div>
        ))}
      </div>

      <div className="space-y-2 rounded-2xl bg-neutral-50 p-3 text-sm">
        <div className="flex gap-2"><span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" /><span>{t.from_text}</span></div>
        <div className="flex gap-2"><span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-neutral-900" /><span>{t.to_text}</span></div>
        <div className="flex justify-between border-t border-neutral-200 pt-2 font-bold">
          <span>{t.distance_km ? `${t.distance_km} км` : ""}</span><span>{money(t.price)}</span>
        </div>
      </div>

      {t.driver_name && (
        <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 p-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fcd34d] text-lg font-extrabold">{t.driver_name[0]}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 font-extrabold">{t.driver_name}
              {t.driver_rating ? <span className="flex items-center text-sm text-amber-600"><Icon name="Star" size={13} />{Number(t.driver_rating).toFixed(1)}</span> : null}
            </div>
            <div className="truncate text-sm text-neutral-500">{[t.car_color, t.car_model].filter(Boolean).join(" ")}</div>
            <div className="mt-1 inline-block rounded-md border border-neutral-300 px-2 py-0.5 text-sm font-extrabold tracking-wider">{t.car_plate}</div>
          </div>
          <button onClick={onChat} className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-white">
            <Icon name="MessageCircle" size={22} />
            {unread && <span className="absolute right-1 top-1 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />}
          </button>
        </div>
      )}

      {t.status === "new" && (
        <div className="rounded-2xl bg-amber-50 p-3">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-amber-900">
            <Icon name="Loader" size={16} className="animate-spin" /> Ищем водителя. Можно предложить больше, чтобы найти быстрее.
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => setNewPrice(Math.max(t.price, newPrice - 100))} disabled={newPrice <= t.price}
              className="h-11 w-11 rounded-xl bg-white text-xl font-bold disabled:opacity-30">−</button>
            <div className="flex-1 text-center text-lg font-extrabold">{money(newPrice)}</div>
            <button onClick={() => setNewPrice(newPrice + 100)} className="h-11 w-11 rounded-xl bg-white text-xl font-bold">+</button>
            <Btn kind="dark" disabled={newPrice <= t.price} onClick={() => onRaise(newPrice)} className="!px-4 !py-3 !text-sm">Поднять</Btn>
          </div>
        </div>
      )}

      {canCancel && <Btn kind="danger" onClick={onCancel} className="w-full">Отменить заказ</Btn>}
    </div>
  );
}
