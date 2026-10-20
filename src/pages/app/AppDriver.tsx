import { useCallback, useEffect, useRef, useState } from "react";
import { appCall, DRIVER_STATUS, TRIP_STATUS, money } from "@/lib/appApi";
import { askNotifyPermission, pushNotify } from "@/lib/notify";
import { useAppSession } from "@/lib/useAppSession";
import { usePoll } from "@/lib/usePoll";
import PhoneLogin from "@/components/app/PhoneLogin";
import DriverRegister from "@/components/app/DriverRegister";
import AppMap, { MapPoint } from "@/components/app/AppMap";
import { Badge, Btn, Shell, tripTone } from "@/components/app/ui";
import Icon from "@/components/ui/icon";

interface Me { id: number; name: string; phone: string; car_model: string; car_plate: string; status: string; on_line: boolean; balance: number }
interface Avail { id: number; from_text: string; from_lat: number | null; from_lng: number | null; to_text: string; comment: string | null; price: number | null }
interface Active extends Avail { status: string; client_phone: string; client_name: string | null }
interface Poll { me: Me; active: Active | null; available: Avail[]; broadcasts: { id: number; text: string }[]; commission: number }

const NEXT: Record<string, { to: string; label: string }> = {
  assigned: { to: "arrived", label: "Я на месте" },
  arrived: { to: "in_progress", label: "Поехали" },
  in_progress: { to: "done", label: "Завершить поездку" },
};

export default function AppDriver() {
  const { token, setToken } = useAppSession("driver");
  const [reg, setReg] = useState(false);
  const [data, setData] = useState<Poll | null>(null);
  const [err, setErr] = useState("");
  const gps = useRef<{ lat: number; lng: number } | null>(null);
  const seenTrips = useRef<Set<number> | null>(null);
  const seenCast = useRef<number | null>(null);

  useEffect(() => {
    if (!token) return;
    askNotifyPermission();
    const id = navigator.geolocation?.watchPosition(
      (p) => { gps.current = { lat: p.coords.latitude, lng: p.coords.longitude }; },
      () => undefined,
      { enableHighAccuracy: true },
    );
    return () => { if (id !== undefined) navigator.geolocation.clearWatch(id); };
  }, [token]);

  const refresh = useCallback(async () => {
    const r = await appCall<Poll>("driver_poll", { ...(gps.current || {}) }, token);
    if (seenTrips.current === null) {
      seenTrips.current = new Set(r.available.map((t) => t.id));
    } else {
      const fresh = r.available.filter((t) => !seenTrips.current!.has(t.id));
      fresh.forEach((t) => seenTrips.current!.add(t.id));
      if (fresh.length) pushNotify("Новый заказ", `${fresh[0].from_text || "По GPS"} → ${fresh[0].to_text}`);
    }
    const topCast = r.broadcasts[0]?.id ?? 0;
    if (seenCast.current === null) seenCast.current = topCast;
    else if (topCast > seenCast.current) {
      seenCast.current = topCast;
      pushNotify("Сообщение диспетчера", r.broadcasts[0].text);
    }
    setData(r);
  }, [token]);

  usePoll(refresh, 4000, !!token, () => setToken(null));

  const act = async (action: string, body: Record<string, unknown> = {}) => {
    setErr("");
    try {
      await appCall(action, body, token);
      await refresh();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  if (!token) {
    if (reg) return <Shell title="Водитель"><DriverRegister onToken={setToken} onBack={() => setReg(false)} /></Shell>;
    return (
      <Shell title="Водитель">
        <PhoneLogin action="driver_login" hint="Войдите по номеру, указанному при регистрации." onToken={setToken}
          extra={<Btn kind="ghost" onClick={() => setReg(true)} className="w-full">Зарегистрироваться как водитель</Btn>} />
      </Shell>
    );
  }

  if (!data) return <Shell title="Водитель" onLogout={() => setToken(null)}><p className="p-6 text-neutral-500">Загрузка...</p></Shell>;

  const { me, active, available, broadcasts, commission } = data;
  const approved = me.status === "approved";
  const points: MapPoint[] = [];
  const target = active || available[0];
  if (target?.from_lat && target?.from_lng) points.push({ lat: target.from_lat, lng: target.from_lng, color: "#2563eb", label: "Клиент" });
  if (gps.current) points.push({ ...gps.current, color: "#f59e0b", label: "Я" });

  return (
    <Shell title="Водитель" onLogout={() => setToken(null)} right={<span className="text-sm font-extrabold">{money(me.balance)}</span>}>
      <div className="mx-auto max-w-md space-y-4 p-4">
        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-extrabold">{me.name}</div>
              <div className="text-sm text-neutral-500">{me.car_model} · {me.car_plate}</div>
            </div>
            <Badge tone={approved ? "green" : me.status === "rejected" ? "red" : "yellow"}>{DRIVER_STATUS[me.status]}</Badge>
          </div>
          {!approved && <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">
            {me.status === "rejected" ? "Анкета отклонена. Свяжитесь с диспетчером." : "Диспетчер проверяет ваши документы. Выйти на линию можно после одобрения."}</p>}
          <button onClick={() => act("driver_set_line", { on: !me.on_line })} disabled={!approved}
            className={`mt-3 w-full rounded-2xl py-4 text-lg font-extrabold transition disabled:opacity-40 ${me.on_line ? "bg-emerald-500 text-white" : "bg-neutral-900 text-white"}`}>
            {me.on_line ? "Вы на линии · выйти" : "Выйти на линию"}
          </button>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase text-neutral-400">Баланс</div>
              <div className="text-2xl font-extrabold">{money(me.balance)}</div>
            </div>
            <div className="text-right text-xs text-neutral-500">Взять заказ: {money(commission)}</div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[500, 1000, 3000].map((a) => (
              <Btn key={a} kind="ghost" onClick={() => act("driver_topup_test", { amount: a })}>+{a}</Btn>
            ))}
          </div>
          <p className="mt-2 text-xs text-neutral-400">Тестовое пополнение. Онлайн-оплату подключим позже.</p>
        </div>

        {err && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-600">{err}</p>}

        {broadcasts[0] && (
          <div className="flex gap-3 rounded-3xl bg-sky-50 p-4 text-sm">
            <Icon name="Megaphone" size={20} className="shrink-0 text-sky-600" />
            <div><div className="font-extrabold text-sky-800">Эфир диспетчера</div>{broadcasts[0].text}</div>
          </div>
        )}

        {points.length > 0 && <AppMap center={[55.75, 37.62]} points={points} className="h-48 w-full overflow-hidden rounded-3xl" />}

        {active ? (
          <div className="space-y-3 rounded-3xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Заказ №{active.id}</h2>
              <Badge tone={tripTone(active.status)}>{TRIP_STATUS[active.status]}</Badge>
            </div>
            <div className="rounded-2xl bg-neutral-100 p-3 text-sm">
              <div><b>Откуда:</b> {active.from_text || "по GPS на карте"}</div>
              <div><b>Куда:</b> {active.to_text}</div>
              {active.price ? <div><b>Цена:</b> {money(active.price)}</div> : null}
              {active.comment && <div><b>Комментарий:</b> {active.comment}</div>}
            </div>
            <a href={`tel:${active.client_phone}`} className="flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-3.5 font-bold text-white">
              <Icon name="Phone" size={18} /> {active.client_name || "Клиент"} · {active.client_phone}
            </a>
            {NEXT[active.status] && (
              <Btn onClick={() => act("driver_trip_status", { trip_id: active.id, status: NEXT[active.status].to })} className="w-full text-lg">
                {NEXT[active.status].label}
              </Btn>
            )}
          </div>
        ) : me.on_line ? (
          <div className="space-y-3">
            <h2 className="text-sm font-extrabold uppercase text-neutral-400">Новые заказы ({available.length})</h2>
            {available.length === 0 && <p className="rounded-3xl bg-white p-5 text-center text-sm text-neutral-500">Пока заказов нет. Мы подадим сигнал, когда появится новый.</p>}
            {available.map((t) => (
              <div key={t.id} className="rounded-3xl bg-white p-4 shadow-sm">
                <div className="font-extrabold">{t.from_text || "По GPS клиента"} → {t.to_text}</div>
                <div className="mt-1 text-sm text-neutral-500">{t.price ? `Цена клиента: ${money(t.price)}` : "Цена по договорённости"}{t.comment ? ` · ${t.comment}` : ""}</div>
                <Btn onClick={() => act("driver_take", { trip_id: t.id })} className="mt-3 w-full">Взять за {money(commission)}</Btn>
              </div>
            ))}
          </div>
        ) : approved ? (
          <p className="rounded-3xl bg-white p-5 text-center text-sm text-neutral-500">Выйдите на линию, чтобы видеть заказы.</p>
        ) : null}
      </div>
    </Shell>
  );
}
