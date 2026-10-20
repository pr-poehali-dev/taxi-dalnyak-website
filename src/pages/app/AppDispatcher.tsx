import { useCallback, useRef, useState } from "react";
import { appCall, DRIVER_STATUS, TRIP_STATUS, money } from "@/lib/appApi";
import { askNotifyPermission, pushNotify } from "@/lib/notify";
import { useAppSession } from "@/lib/useAppSession";
import { usePoll } from "@/lib/usePoll";
import { Badge, Btn, Field, Shell, tripTone } from "@/components/app/ui";
import Icon from "@/components/ui/icon";

interface Trip {
  id: number; from_text: string | null; to_text: string; comment: string | null; price: number | null; status: string;
  created_at: string; driver_id: number | null; assigned_by: string | null;
  client_phone: string; client_name: string | null; driver_name: string | null; driver_phone: string | null;
  car_model: string | null; car_plate: string | null;
}
interface Driver {
  id: number; name: string; phone: string; car_model: string; car_plate: string; car_color: string; status: string;
  balance: number; online: boolean; busy: boolean;
  photo_license: string; photo_sts: string; photo_car_front: string; photo_car_back: string; photo_car_left: string; photo_car_right: string;
}
interface Poll { trips: Trip[]; drivers: Driver[]; broadcasts: { id: number; text: string; created_at: string }[] }

const TABS = ["Заказы", "Водители", "Эфир"] as const;
type Tab = (typeof TABS)[number];

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

function DriverCard({ d, onAct }: { d: Driver; onAct: (a: string, b: Record<string, unknown>) => void }) {
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const photos = [
    ["Права", d.photo_license], ["СТС", d.photo_sts], ["Спереди", d.photo_car_front],
    ["Сзади", d.photo_car_back], ["Слева", d.photo_car_left], ["Справа", d.photo_car_right],
  ];
  return (
    <div className="rounded-3xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="font-extrabold">{d.name}</div>
          <div className="text-sm text-neutral-500">{d.car_color} {d.car_model} · {d.car_plate}</div>
          <a href={`tel:${d.phone}`} className="text-sm font-semibold text-sky-700">{d.phone}</a>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Badge tone={d.status === "approved" ? "green" : d.status === "rejected" ? "red" : "yellow"}>{DRIVER_STATUS[d.status]}</Badge>
          {d.status === "approved" && <Badge tone={d.online ? (d.busy ? "blue" : "green") : "gray"}>{d.online ? (d.busy ? "На заказе" : "На линии") : "Не на линии"}</Badge>}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-2xl bg-neutral-100 p-3">
        <span className="text-lg font-extrabold">{money(d.balance)}</span>
        <div className="flex items-center gap-2">
          <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d-]/g, ""))} placeholder="±сумма"
            className="w-24 rounded-xl bg-white px-3 py-2 text-sm font-bold outline-none" />
          <Btn kind="dark" disabled={!amount || amount === "-"} onClick={() => { onAct("disp_balance", { driver_id: d.id, amount: Number(amount) }); setAmount(""); }} className="!px-3 !py-2 !text-sm">OK</Btn>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        {d.status !== "approved" && <Btn onClick={() => onAct("disp_driver_status", { driver_id: d.id, status: "approved" })} className="flex-1 !py-2.5">Одобрить</Btn>}
        {d.status !== "rejected" && <Btn kind="danger" onClick={() => onAct("disp_driver_status", { driver_id: d.id, status: "rejected" })} className="flex-1 !py-2.5">Отклонить</Btn>}
        <Btn kind="ghost" onClick={() => setOpen(!open)} className="flex-1 !py-2.5">{open ? "Скрыть фото" : "Документы"}</Btn>
      </div>
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

function TripCard({ t, drivers, onAct }: { t: Trip; drivers: Driver[]; onAct: (a: string, b: Record<string, unknown>) => void }) {
  const [pick, setPick] = useState(false);
  const free = drivers.filter((d) => d.status === "approved" && d.online && !d.busy);
  const finished = t.status === "done" || t.status === "cancelled";
  return (
    <div className={`rounded-3xl bg-white p-4 shadow-sm ${finished ? "opacity-70" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="font-extrabold">№{t.id} · {new Date(t.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</span>
        <Badge tone={tripTone(t.status)}>{TRIP_STATUS[t.status]}</Badge>
      </div>
      <div className="mt-2 text-sm">
        <div><b>{t.from_text || "По GPS"}</b> → <b>{t.to_text}</b></div>
        <div className="text-neutral-500">{t.price ? `${money(t.price)} · ` : ""}{t.comment || ""}</div>
        <a href={`tel:${t.client_phone}`} className="font-semibold text-sky-700">{t.client_name || "Клиент"} · {t.client_phone}</a>
        {t.driver_name && <div className="mt-1 rounded-xl bg-neutral-100 p-2">Водитель: <b>{t.driver_name}</b>, {t.car_model} {t.car_plate} {t.assigned_by === "dispatcher" ? "(назначен вами)" : "(взял сам)"}</div>}
      </div>
      {!finished && (
        <div className="mt-3 flex flex-wrap gap-2">
          {(t.status === "new" || t.status === "assigned") && <Btn onClick={() => setPick(!pick)} className="!py-2.5 !text-sm">{t.driver_id ? "Переназначить" : "Назначить водителя"}</Btn>}
          {t.status !== "in_progress" && <Btn kind="ghost" onClick={() => onAct("disp_trip_status", { trip_id: t.id, status: "in_progress" })} className="!py-2.5 !text-sm">В пути</Btn>}
          <Btn kind="ghost" onClick={() => onAct("disp_trip_status", { trip_id: t.id, status: "done" })} className="!py-2.5 !text-sm">Завершить</Btn>
          <Btn kind="danger" onClick={() => onAct("disp_trip_status", { trip_id: t.id, status: "cancelled" })} className="!py-2.5 !text-sm">Отменить</Btn>
        </div>
      )}
      {pick && (
        <div className="mt-3 space-y-2">
          {free.length === 0 && <p className="text-sm text-neutral-500">Свободных водителей на линии нет.</p>}
          {free.map((d) => (
            <button key={d.id} onClick={() => { onAct("disp_assign", { trip_id: t.id, driver_id: d.id }); setPick(false); }}
              className="flex w-full items-center justify-between rounded-2xl bg-neutral-100 p-3 text-left text-sm active:bg-[#fcd34d]">
              <span><b>{d.name}</b> · {d.car_model} {d.car_plate}</span>
              <span className="text-neutral-500">{money(d.balance)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AppDispatcher() {
  const { token, setToken } = useAppSession("dispatcher");
  const [tab, setTab] = useState<Tab>("Заказы");
  const [data, setData] = useState<Poll | null>(null);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const seen = useRef<Set<number> | null>(null);
  const seenDrivers = useRef<Set<number> | null>(null);

  const refresh = useCallback(async () => {
    const r = await appCall<Poll>("disp_poll", {}, token);
    if (seen.current === null) {
      seen.current = new Set(r.trips.map((t) => t.id));
      askNotifyPermission();
    } else {
      const fresh = r.trips.filter((t) => !seen.current!.has(t.id));
      fresh.forEach((t) => seen.current!.add(t.id));
      if (fresh.length) pushNotify("Новый заказ", `${fresh[0].from_text || "По GPS"} → ${fresh[0].to_text}`);
    }
    const pending = r.drivers.filter((d) => d.status === "pending").map((d) => d.id);
    if (seenDrivers.current === null) seenDrivers.current = new Set(pending);
    else {
      const fresh = pending.filter((id) => !seenDrivers.current!.has(id));
      fresh.forEach((id) => seenDrivers.current!.add(id));
      if (fresh.length) pushNotify("Новый водитель", "Анкета ждёт проверки");
    }
    setData(r);
  }, [token]);

  usePoll(refresh, 4000, !!token, () => setToken(null));

  const act = async (action: string, body: Record<string, unknown>) => {
    setErr("");
    try {
      await appCall(action, body, token);
      await refresh();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  if (!token) return <Shell title="Диспетчер"><Login onToken={setToken} /></Shell>;

  const newCount = data?.trips.filter((t) => t.status === "new").length || 0;
  const pendingCount = data?.drivers.filter((d) => d.status === "pending").length || 0;
  const onlineCount = data?.drivers.filter((d) => d.online).length || 0;

  return (
    <Shell title="Диспетчер" onLogout={() => setToken(null)} right={<span className="text-xs font-bold text-neutral-500">на линии: {onlineCount}</span>}>
      <div className="mx-auto max-w-2xl p-4">
        <div className="mb-4 grid grid-cols-3 gap-2 rounded-2xl bg-white p-1.5 shadow-sm">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`relative rounded-xl py-2.5 text-sm font-extrabold ${tab === t ? "bg-[#fcd34d]" : "text-neutral-500"}`}>
              {t}
              {t === "Заказы" && newCount > 0 && <span className="ml-1.5 rounded-full bg-red-500 px-1.5 text-[11px] text-white">{newCount}</span>}
              {t === "Водители" && pendingCount > 0 && <span className="ml-1.5 rounded-full bg-red-500 px-1.5 text-[11px] text-white">{pendingCount}</span>}
            </button>
          ))}
        </div>

        {err && <p className="mb-3 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-600">{err}</p>}
        {!data && <p className="text-neutral-500">Загрузка...</p>}

        {data && tab === "Заказы" && (
          <div className="space-y-3">
            {data.trips.length === 0 && <p className="rounded-3xl bg-white p-6 text-center text-neutral-500">Заказов пока нет.</p>}
            {data.trips.map((t) => <TripCard key={t.id} t={t} drivers={data.drivers} onAct={act} />)}
          </div>
        )}

        {data && tab === "Водители" && (
          <div className="space-y-3">
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
              <Btn disabled={!text.trim()} onClick={() => { act("disp_broadcast", { text }); setText(""); }} className="mt-2 w-full">Пустить в эфир</Btn>
            </div>
            {data.broadcasts.map((b) => (
              <div key={b.id} className="rounded-2xl bg-white p-3 text-sm shadow-sm">
                <div className="text-xs text-neutral-400">{new Date(b.created_at).toLocaleString("ru-RU")}</div>
                {b.text}
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
