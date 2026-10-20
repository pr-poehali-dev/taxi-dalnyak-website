import { useCallback, useState } from "react";
import { appCall, DRIVER_STATUS, TRIP_STATUS, TARIFF_LIST, TARIFF_NAME, money, whenText } from "@/lib/appApi";
import { pushNotify } from "@/lib/notify";
import { useAppSession } from "@/lib/useAppSession";
import { usePoll } from "@/lib/usePoll";
import { useSeen } from "@/lib/useSeen";
import { useAppShell } from "@/lib/useAppShell";
import { useChatAlert } from "@/lib/useChatAlert";
import Onboarding from "@/components/app/Onboarding";
import TripChat from "@/components/app/TripChat";
import DispatcherSettings from "@/components/app/DispatcherSettings";
import { Badge, Btn, Field, Shell, tripTone } from "@/components/app/ui";
import Icon from "@/components/ui/icon";

interface Trip {
  id: number; tariff: string; region: string; distance_km: number | null; scheduled_at: string | null; base_price: number | null;
  commission: number | null; rating: number | null; rating_comment: string | null; cancelled_by: string | null; last_msg_id: number | null;
  from_text: string | null; to_text: string; comment: string | null; price: number | null; status: string;
  created_at: string; driver_id: number | null; assigned_by: string | null;
  client_phone: string; client_name: string | null; driver_name: string | null; driver_phone: string | null;
  last_msg_role?: string | null; car_model: string | null; car_plate: string | null; pay_method: string; from_city: string | null; from_street: string | null; from_house: string | null;
}
interface Driver {
  id: number; name: string; phone: string; car_model: string; car_plate: string; car_color: string; status: string;
  balance: number; online: boolean; busy: boolean; tariffs: string[]; block_reason: string | null; has_priority: boolean;
  priority_until: string | null; rating: number | null; cancels_7d: number;
  photo_license: string; photo_sts: string; photo_car_front: string; photo_car_back: string; photo_car_left: string; photo_car_right: string;
}
interface Topup { id: number; driver_id: number; amount: number; name: string; phone: string }
interface Poll {
  trips: Trip[]; drivers: Driver[]; broadcasts: { id: number; text: string; created_at: string; expires_at: string | null }[];
  topups: Topup[]; config: any;
}

const TABS = ["Заказы", "Водители", "Эфир", "Настройки"] as const;
type Tab = (typeof TABS)[number];
type Act = (a: string, b: Record<string, unknown>) => void;

function Login({ onToken }: { onToken: (t: string) => void }) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const r = await appCall<{ token: string }>("dispatcher_login", { password: pwd });
      onToken(r.token);
    } catch (e2) {
      setErr((e2 as Error).message);
    }
  };
  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-3 p-5 pt-10">
      <h1 className="text-2xl font-extrabold">Вход диспетчера</h1>
      <Field label="Пароль" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} />
      {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
      <Btn type="submit" disabled={!pwd} className="w-full">Войти</Btn>
    </form>
  );
}

function DriverCard({ d, onAct }: { d: Driver; onAct: Act }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const photos = [
    ["Права", d.photo_license], ["СТС", d.photo_sts], ["Спереди", d.photo_car_front],
    ["Сзади", d.photo_car_back], ["Слева", d.photo_car_left], ["Справа", d.photo_car_right],
  ];
  const toggleTariff = (id: string) => {
    const next = d.tariffs.includes(id) ? d.tariffs.filter((x) => x !== id) : [...d.tariffs, id];
    onAct("disp_driver_tariffs", { driver_id: d.id, tariffs: next });
  };
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-extrabold">{d.name}</div>
          <div className="text-sm text-neutral-500">{d.car_color} {d.car_model} · {d.car_plate}</div>
          <a href={`tel:${d.phone}`} className="text-sm font-semibold text-sky-700">{d.phone}</a>
          <div className="mt-1 text-sm font-bold text-amber-600">★ {d.rating ? Number(d.rating).toFixed(1) : "—"} <span className="font-normal text-neutral-400">· отказов за неделю: {d.cancels_7d}</span></div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge tone={d.status === "approved" ? "green" : d.status === "pending" ? "yellow" : "red"}>{DRIVER_STATUS[d.status]}</Badge>
          {d.status === "approved" && <Badge tone={d.online ? (d.busy ? "blue" : "green") : "gray"}>{d.online ? (d.busy ? "На заказе" : "На линии") : "Не на линии"}</Badge>}
          {d.has_priority && <Badge tone="yellow">Приоритет</Badge>}
        </div>
      </div>
      {d.block_reason && d.status === "blocked" && <p className="mt-2 text-sm text-red-600">Причина: {d.block_reason}</p>}

      <div className="mt-3">
        <div className="mb-1 text-xs font-bold uppercase text-neutral-400">Тарифы (по документам)</div>
        <div className="flex gap-2">
          {TARIFF_LIST.map((t) => (
            <button key={t.id} onClick={() => toggleTariff(t.id)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold ${d.tariffs.includes(t.id) ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500"}`}>
              {d.tariffs.includes(t.id) ? "✓ " : ""}{t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between rounded-2xl bg-neutral-100 p-3">
        <span className="text-lg font-extrabold">{money(d.balance)}</span>
        <div className="flex items-center gap-2">
          <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d-]/g, ""))} placeholder="±сумма" className="w-24 rounded-xl bg-white px-3 py-2 text-sm font-bold outline-none" />
          <Btn kind="dark" disabled={!amount || amount === "-"} onClick={() => { onAct("disp_balance", { driver_id: d.id, amount: Number(amount) }); setAmount(""); }} className="!px-3 !py-2 !text-sm">OK</Btn>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {d.status !== "approved" && <Btn onClick={() => onAct("disp_driver_status", { driver_id: d.id, status: "approved" })} className="flex-1 !py-2.5">Одобрить</Btn>}
        {d.status === "approved" && <Btn kind="danger" onClick={() => { const r = window.prompt("Причина блокировки"); if (r) onAct("disp_driver_status", { driver_id: d.id, status: "blocked", reason: r }); }} className="flex-1 !py-2.5">Заблокировать</Btn>}
        {d.status === "pending" && <Btn kind="danger" onClick={() => onAct("disp_driver_status", { driver_id: d.id, status: "rejected" })} className="flex-1 !py-2.5">Отклонить</Btn>}
        <Btn kind="ghost" onClick={() => setOpen(!open)} className="flex-1 !py-2.5">{open ? "Скрыть" : "Документы"}</Btn>
      </div>
      {d.status === "approved" && (
        <div className="mt-2 flex gap-2">
          <Btn kind="ghost" onClick={() => onAct("disp_driver_priority", { driver_id: d.id, days: 30 })} className="flex-1 !py-2 !text-sm">+30 дн. приоритета</Btn>
          {d.has_priority && <Btn kind="ghost" onClick={() => onAct("disp_driver_priority", { driver_id: d.id, days: 0 })} className="flex-1 !py-2 !text-sm">Снять приоритет</Btn>}
        </div>
      )}
      {open && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          {photos.map(([l, u]) => (
            <a key={l} href={u} target="_blank" rel="noopener noreferrer" className="block">
              <img src={u} alt={l} className="aspect-square w-full rounded-xl object-cover" />
              <span className="text-[11px] font-bold text-neutral-500">{l}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function TripCard({ t, drivers, onAct, onChat }: { t: Trip; drivers: Driver[]; onAct: Act; onChat: () => void }) {
  const [pick, setPick] = useState(false);
  const free = drivers.filter((d) => d.status === "approved" && d.tariffs.includes(t.tariff) && d.online && !d.busy);
  const finished = t.status === "done" || t.status === "cancelled";
  return (
    <div className={`rounded-3xl bg-white p-4 shadow-sm ${finished ? "opacity-75" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="font-extrabold">№{t.id} · {new Date(t.created_at).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
        <Badge tone={tripTone(t.status)}>{TRIP_STATUS[t.status]}</Badge>
      </div>
      <div className="mt-1 flex flex-wrap gap-1.5">
        <Badge tone="gray">{TARIFF_NAME[t.tariff]}</Badge>
        {t.region === "new" && <Badge tone="blue">Новые территории</Badge>}
        {t.scheduled_at && <Badge tone="yellow">Предзаказ: {whenText(t.scheduled_at)}</Badge>}
      </div>
      <div className="mt-2 text-sm">
        <div className="rounded-xl bg-neutral-100 p-2">
          <div className="text-xs font-bold uppercase text-neutral-400">Отправление</div>
          <div className="font-extrabold">{t.from_city || "Город не указан"}</div>
          <div className="font-semibold">{[t.from_street, t.from_house && `д. ${t.from_house}`].filter(Boolean).join(", ") || t.from_text || "По GPS"}</div>
          <div className="mt-1 text-xs font-bold uppercase text-neutral-400">Назначение</div>
          <div className="font-semibold">{t.to_text}</div>
        </div>
        <div className="text-neutral-500">Оплата: {t.pay_method === "transfer" ? "переводом" : "наличными"}</div>
        <div className="text-neutral-500">{t.distance_km ? `${t.distance_km} км · ` : ""}{t.price ? money(t.price) : ""}{t.base_price && t.price && Number(t.price) > Number(t.base_price) ? ` (повышена с ${money(t.base_price)})` : ""}{t.commission ? ` · комиссия ${money(t.commission)}` : ""}</div>
        {t.comment && <div className="text-neutral-500">Комментарий: {t.comment}</div>}
        <a href={`tel:${t.client_phone}`} className="font-semibold text-sky-700">{t.client_name || "Клиент"} · {t.client_phone}</a>
        {t.driver_name && <div className="mt-1 rounded-xl bg-neutral-100 p-2">Водитель: <b>{t.driver_name}</b>, {t.car_model} {t.car_plate}{t.driver_phone ? ` · ${t.driver_phone}` : ""} {t.assigned_by === "dispatcher" ? "(назначен вами)" : "(взял сам)"}</div>}
        {t.rating && <div className="mt-1 font-bold text-amber-600">Оценка пассажира: {"★".repeat(t.rating)}{t.rating_comment ? ` · ${t.rating_comment}` : ""}</div>}
        {t.cancelled_by && <div className="text-red-600">Отменил: {{ client: "пассажир", dispatcher: "диспетчер" }[t.cancelled_by] || t.cancelled_by}</div>}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {t.driver_id && <Btn kind="dark" onClick={onChat} className="!py-2.5 !text-sm"><Icon name="MessageCircle" size={14} className="mr-1 inline" />Переписка{t.last_msg_id ? "" : " (пусто)"}</Btn>}
        {!finished && (t.status === "new" || t.status === "assigned") && <Btn onClick={() => setPick(!pick)} className="!py-2.5 !text-sm">{t.driver_id ? "Переназначить" : "Назначить водителя"}</Btn>}
        {!finished && t.driver_id && t.status !== "in_progress" && <Btn kind="ghost" onClick={() => onAct("disp_trip_status", { trip_id: t.id, status: "in_progress" })} className="!py-2.5 !text-sm">В пути</Btn>}
        {!finished && t.driver_id && <Btn kind="ghost" onClick={() => onAct("disp_trip_status", { trip_id: t.id, status: "done" })} className="!py-2.5 !text-sm">Завершить</Btn>}
        {!finished && <Btn kind="danger" onClick={() => window.confirm("Отменить заказ?") && onAct("disp_trip_status", { trip_id: t.id, status: "cancelled" })} className="!py-2.5 !text-sm">Отменить</Btn>}
      </div>
      {pick && (
        <div className="mt-3 space-y-2">
          {free.length === 0 && <p className="text-sm text-neutral-500">Нет свободных водителей на линии с тарифом «{TARIFF_NAME[t.tariff]}».</p>}
          {free.map((d) => (
            <button key={d.id} onClick={() => { onAct("disp_assign", { trip_id: t.id, driver_id: d.id }); setPick(false); }}
              className="flex w-full items-center justify-between rounded-2xl bg-neutral-100 p-3 text-left text-sm active:bg-[#fcd34d]">
              <span><b>{d.name}</b> · {d.car_model} {d.car_plate}{d.rating ? ` · ★${Number(d.rating).toFixed(1)}` : ""}</span>
              <span className="text-neutral-500">{money(d.balance)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AppDispatcher() {
  useAppShell("office");
  const chatAlert = useChatAlert("dispatcher", "Новое сообщение в чате заказа");
  const { token, setToken } = useAppSession("dispatcher");
  const [ready, setReady] = useState(() => localStorage.getItem("app_onb_dispatcher") === "1");
  const [tab, setTab] = useState<Tab>("Заказы");
  const [data, setData] = useState<Poll | null>(null);
  const [text, setText] = useState("");
  const [minutes, setMinutes] = useState("60");
  const [err, setErr] = useState("");
  const [chatId, setChatId] = useState<number | null>(null);
  const seen = useSeen();

  const refresh = useCallback(async () => {
    const r = await appCall<Poll>("disp_poll", {}, token);
    chatAlert(r.trips.filter((t) => ["assigned", "enroute", "arrived", "in_progress"].includes(t.status)));
    if (seen("trips", r.trips.map((t) => t.id)).length) pushNotify("Новый заказ");
    if (seen("drv", r.drivers.filter((d) => d.status === "pending").map((d) => d.id)).length) pushNotify("Новый водитель на проверку");
    if (seen("topup", r.topups.map((t) => t.id)).length) pushNotify("Заявка на пополнение");
    setData(r);
  }, [token, seen]);

  usePoll(refresh, 4000, !!token && ready, () => setToken(null));

  const act: Act = async (action, body) => {
    setErr("");
    try {
      await appCall(action, body, token);
      await refresh();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const logout = async () => {
    await appCall("logout", {}, token).catch(() => undefined);
    setToken(null);
  };

  if (!token) return <Shell title="Диспетчер"><Login onToken={setToken} /></Shell>;
  if (!ready) return <Onboarding role="dispatcher" token={token} needLocation={false} onDone={() => { localStorage.setItem("app_onb_dispatcher", "1"); setReady(true); }} />;

  const newCount = data?.trips.filter((t) => t.status === "new").length || 0;
  const pendingCount = (data?.drivers.filter((d) => d.status === "pending").length || 0) + (data?.topups.length || 0);
  const onlineCount = data?.drivers.filter((d) => d.online).length || 0;

  return (
    <Shell title="Диспетчер" onLogout={logout} right={<span className="text-xs font-bold text-neutral-500">на линии: {onlineCount}</span>}>
      <div className="mx-auto max-w-2xl p-4 pb-20">
        <div className="mb-4 grid grid-cols-4 gap-1 rounded-2xl bg-white p-1.5 shadow-sm">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`rounded-xl py-2.5 text-[13px] font-extrabold ${tab === t ? "bg-[#fcd34d]" : "text-neutral-500"}`}>
              {t}
              {t === "Заказы" && newCount > 0 && <span className="ml-1 rounded-full bg-red-500 px-1.5 text-[11px] text-white">{newCount}</span>}
              {t === "Водители" && pendingCount > 0 && <span className="ml-1 rounded-full bg-red-500 px-1.5 text-[11px] text-white">{pendingCount}</span>}
            </button>
          ))}
        </div>

        {err && <p className="mb-3 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-600">{err}</p>}
        {!data && <p className="text-neutral-500">Загрузка...</p>}

        {data && tab === "Заказы" && (
          <div className="space-y-3">
            {data.trips.length === 0 && <p className="rounded-3xl bg-white p-6 text-center text-neutral-500">Заказов пока нет.</p>}
            {data.trips.map((t) => <TripCard key={t.id} t={t} drivers={data.drivers} onAct={act} onChat={() => setChatId(t.id)} />)}
          </div>
        )}

        {data && tab === "Водители" && (
          <div className="space-y-3">
            {data.topups.map((p) => (
              <div key={p.id} className="rounded-3xl bg-amber-50 p-4">
                <div className="font-extrabold">Заявка на пополнение: {money(p.amount)}</div>
                <div className="text-sm text-neutral-600">{p.name} · {p.phone}</div>
                <div className="mt-2 flex gap-2">
                  <Btn onClick={() => act("disp_topup_resolve", { id: p.id, approve: true })} className="flex-1 !py-2.5">Деньги получены</Btn>
                  <Btn kind="danger" onClick={() => act("disp_topup_resolve", { id: p.id, approve: false })} className="flex-1 !py-2.5">Отклонить</Btn>
                </div>
              </div>
            ))}
            {data.drivers.length === 0 && <p className="rounded-3xl bg-white p-6 text-center text-neutral-500">Водителей пока нет.</p>}
            {data.drivers.map((d) => <DriverCard key={d.id} d={d} onAct={act} />)}
          </div>
        )}

        {data && tab === "Эфир" && (
          <div className="space-y-3">
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <p className="mb-2 flex items-center gap-2 text-sm font-bold"><Icon name="Megaphone" size={18} /> Сообщение всем водителям</p>
              <textarea value={text} onChange={(e) => setText(e.target.value)} rows={3} maxLength={500} placeholder="Например: на Москву сейчас много заказов"
                className="w-full rounded-2xl bg-neutral-100 p-3 text-[15px] font-semibold outline-none focus:ring-2 focus:ring-[#fcd34d]" />
              <div className="mt-2 flex items-center gap-2">
                <span className="text-sm text-neutral-500">Показывать</span>
                <select value={minutes} onChange={(e) => setMinutes(e.target.value)} className="rounded-xl bg-neutral-100 px-3 py-2 text-sm font-bold">
                  <option value="15">15 минут</option><option value="60">1 час</option><option value="240">4 часа</option>
                  <option value="1440">сутки</option><option value="10080">неделю</option>
                </select>
              </div>
              <Btn disabled={!text.trim()} onClick={() => { act("disp_broadcast", { text, minutes: Number(minutes) }); setText(""); }} className="mt-2 w-full">Пустить в эфир</Btn>
            </div>
            {data.broadcasts.map((b) => {
              const live = !b.expires_at || new Date(b.expires_at) > new Date();
              return (
                <div key={b.id} className="rounded-2xl bg-white p-3 text-sm shadow-sm">
                  <div className="flex items-center justify-between text-xs text-neutral-400">
                    <span>{new Date(b.created_at).toLocaleString("ru-RU")} · {live ? "в эфире" : "завершено"}</span>
                    <button onClick={() => act("disp_broadcast_remove", { id: b.id })} className="font-bold text-red-500">Убрать</button>
                  </div>
                  {b.text}
                </div>
              );
            })}
          </div>
        )}

        {data && tab === "Настройки" && <DispatcherSettings cfg={data.config} onSave={(c) => act("disp_save_config", { config: c })} />}
      </div>

      {chatId && token && <TripChat role="dispatcher" tripId={chatId} token={token} onClose={() => setChatId(null)} onUnauthorized={() => setToken(null)} />}
    </Shell>
  );
}
