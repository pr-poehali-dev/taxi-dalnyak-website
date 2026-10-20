import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Badge, Btn, tripTone } from "./ui";
import { humanMinutes, etaMinutes, useNow } from "./Countdown";
import { TRIP_STATUS, TARIFF_NAME, money, whenText } from "@/lib/appApi";

export interface ClientTrip {
  id: number; from_text: string; to_text: string; status: string; price: number; base_price: number; tariff: string;
  scheduled_at: string | null; distance_km: number | null; driver_name: string | null; car_model: string | null;
  car_plate: string | null; car_color: string | null; driver_lat: number | null; driver_lng: number | null;
  driver_rating: number | null; rating: number | null; last_msg_id: number | null; last_msg_role?: string | null;
  pay_method?: string; eta_at?: string | null; share_token?: string | null; cancelled_by?: string | null;
  manual_driver?: boolean; driver_phone?: string | null; created_at?: string | null;
}

function SearchTimer({ since }: { since: string }) {
  const now = useNow(1000);
  const sec = Math.max(0, Math.floor((now - new Date(since).getTime()) / 1000));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return <span className="font-mono tabular-nums">{h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`}</span>;
}

const STEPS = [
  { key: "new", label: "Поиск" },
  { key: "assigned", label: "Назначен" },
  { key: "enroute", label: "Выехал" },
  { key: "arrived", label: "На месте" },
  { key: "in_progress", label: "В пути" },
];

export async function shareTrip(t: ClientTrip) {
  const url = `${window.location.origin}/track/${t.share_token}`;
  const text = `Слежу за поездкой: ${t.from_text} → ${t.to_text}. Машина на карте:`;
  if (navigator.share) {
    try { await navigator.share({ title: "Моя поездка", text, url }); return; } catch { return; }
  }
  try { await navigator.clipboard.writeText(`${text} ${url}`); window.alert("Ссылка скопирована. Отправьте её близким."); } catch { window.prompt("Скопируйте ссылку", url); }
}

export default function ClientTripCard({ t, unread, onChat, onCancel, onRaise }: {
  t: ClientTrip; unread: boolean; onChat: () => void; onCancel: () => void; onRaise: (p: number) => void;
}) {
  const [newPrice, setNewPrice] = useState<number>(t.price);
  const now = useNow();
  const idx = STEPS.findIndex((s) => s.key === t.status);
  const canCancel = ["new", "assigned", "enroute", "arrived"].includes(t.status);
  const eta = ["assigned", "enroute"].includes(t.status) ? etaMinutes(t.eta_at, now) : null;
  const car = [t.car_color, t.car_model].filter(Boolean).join(" ");

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-bold uppercase text-neutral-400">{t.scheduled_at ? `Предзаказ · ${whenText(t.scheduled_at)}` : `Заказ №${t.id}`}</div>
          <h2 className="text-xl font-extrabold">{TRIP_STATUS[t.status]}</h2>
        </div>
        <Badge tone={tripTone(t.status)}>{TARIFF_NAME[t.tariff]}</Badge>
      </div>

      {t.driver_name && (
        <div className="overflow-hidden rounded-3xl bg-neutral-900 text-white">
          <div className="p-4">
            <div className="text-xs font-bold uppercase text-neutral-400">Ваш автомобиль</div>
            <div className="mt-1 text-2xl font-extrabold leading-tight text-white">{car || "Автомобиль"}</div>
            <div className="mt-2 inline-block rounded-lg bg-white px-3 py-1.5 text-xl font-extrabold tracking-widest text-neutral-900">{t.car_plate}</div>
            {eta !== null && t.status !== "arrived" && (
              <div className="mt-3 flex items-center gap-2 rounded-2xl bg-[#fcd34d] px-3 py-2 font-extrabold text-neutral-900">
                <Icon name="Clock" size={18} /> Приедет через {humanMinutes(eta)}
              </div>
            )}
            {!t.eta_at && t.status === "assigned" && !t.scheduled_at && (
              <div className="mt-3 text-sm text-neutral-300">Водитель сейчас укажет время подачи</div>
            )}
          </div>
          <div className="flex items-center gap-3 border-t border-white/10 bg-neutral-800 p-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#fcd34d] text-lg font-extrabold text-neutral-900">{t.driver_name[0]}</span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 font-extrabold text-white">{t.driver_name}
                {t.driver_rating ? <span className="flex items-center text-sm text-amber-400"><Icon name="Star" size={13} />{Number(t.driver_rating).toFixed(1)}</span> : null}
              </div>
              <div className="text-xs text-neutral-400">Ваш водитель</div>
            </div>
            {t.driver_phone && (
              <a href={`tel:${t.driver_phone}`} aria-label="Позвонить водителю" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white"><Icon name="Phone" size={20} /></a>
            )}
            <button onClick={onChat} className="relative flex h-12 items-center gap-2 rounded-2xl bg-[#fcd34d] px-4 font-extrabold text-neutral-900">
              <Icon name="MessageCircle" size={20} /> Чат
              {unread && <span className="absolute -right-1 -top-1 h-4 w-4 animate-pulse rounded-full bg-red-500 ring-2 ring-neutral-800" />}
            </button>
          </div>
        </div>
      )}

      {unread && (
        <button onClick={onChat} className="flex w-full items-center gap-3 rounded-2xl bg-red-50 p-3 text-left ring-2 ring-red-200">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500 text-white"><Icon name="MessageCircle" size={20} /></span>
          <span className="flex-1"><span className="block font-extrabold text-red-700">Водитель написал вам</span><span className="text-sm text-red-600">Нажмите, чтобы прочитать и ответить</span></span>
        </button>
      )}
      {t.driver_name && !unread && (
        <button onClick={onChat} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-100 py-3 text-sm font-extrabold text-neutral-800">
          <Icon name="MessageCircle" size={18} /> Написать водителю
        </button>
      )}

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
        <div className="text-xs text-neutral-500">Оплата водителю: {t.pay_method === "transfer" ? "переводом" : "наличными"}. Платные дороги отдельно.</div>
      </div>

      {t.share_token && !["done", "cancelled"].includes(t.status) && (
        <button onClick={() => shareTrip(t)} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-50 py-3.5 font-extrabold text-sky-700">
          <Icon name="Share2" size={18} /> Поделиться поездкой с близкими
        </button>
      )}

      {t.status === "new" && (
        <>
          <div className="rounded-2xl bg-neutral-900 p-4 text-white">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold text-neutral-300">
                <Icon name="Loader" size={16} className="animate-spin text-[#fcd34d]" /> {t.scheduled_at ? "Подбираем водителя к нужному времени" : "Ищем водителя"}
              </span>
              {!t.scheduled_at && t.created_at && <span className="text-2xl font-extrabold text-[#fcd34d]"><SearchTimer since={t.created_at} /></span>}
            </div>
            {!t.scheduled_at && (
              <p className="mt-3 text-sm leading-snug text-neutral-300">
                Поиск водителя на межгород обычно занимает от 10 минут: подбираем машину, готовую к дальней дороге. Можно закрыть приложение, мы пришлём уведомление, как только водитель будет назначен.
              </p>
            )}
          </div>
          <div className="rounded-2xl bg-amber-50 p-3">
            <p className="mb-2 text-sm font-semibold text-amber-900">Хотите уехать быстрее? Предложите больше.</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setNewPrice(Math.max(t.price, newPrice - 100))} disabled={newPrice <= t.price}
                className="h-11 w-11 rounded-xl bg-white text-xl font-bold disabled:opacity-30">−</button>
              <div className="flex-1 text-center text-lg font-extrabold">{money(newPrice)}</div>
              <button onClick={() => setNewPrice(newPrice + 100)} className="h-11 w-11 rounded-xl bg-white text-xl font-bold">+</button>
              <Btn kind="dark" disabled={newPrice <= t.price} onClick={() => onRaise(newPrice)} className="!px-4 !py-3 !text-sm">Поднять</Btn>
            </div>
          </div>
        </>
      )}

      {canCancel && <Btn kind="danger" onClick={onCancel} className="w-full">Отменить заказ</Btn>}
    </div>
  );
}
