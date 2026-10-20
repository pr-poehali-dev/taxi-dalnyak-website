import { useCallback, useState } from "react";
import { appCall, DRIVER_STATUS, TARIFF_NAME, money, whenText } from "@/lib/appApi";
import { pushNotify } from "@/lib/notify";
import { useAppSession } from "@/lib/useAppSession";
import { usePoll } from "@/lib/usePoll";
import { useGeo } from "@/lib/useGeo";
import { useSeen } from "@/lib/useSeen";
import { useAppManifest } from "@/lib/useAppManifest";
import PhoneLogin from "@/components/app/PhoneLogin";
import DriverRegister from "@/components/app/DriverRegister";
import DriverTripCard, { DTrip, PickupBlock } from "@/components/app/DriverTripCard";
import Onboarding from "@/components/app/Onboarding";
import Tutorial, { DRIVER_SLIDES } from "@/components/app/Tutorial";
import TripChat from "@/components/app/TripChat";
import AppMap, { MapPoint } from "@/components/app/AppMap";
import { Badge, Btn, Shell } from "@/components/app/ui";
import Icon from "@/components/ui/icon";

interface Me {
  id: number; name: string; car_model: string; car_plate: string; status: string; on_line: boolean; balance: number;
  tariffs: string[]; block_reason: string | null; priority_until: string | null; has_priority: boolean;
  rating: number | null; done_count: number;
}
interface Poll {
  me: Me; active: DTrip | null; upcoming: DTrip[]; available: DTrip[]; broadcasts: { id: number; text: string }[];
  commission_pct: number; priority_price: number; priority_days: number; payment_info: string;
  topups: { id: number; amount: number; status: string }[]; support_telegram: string; support_max: string;
}

export default function AppDriver() {
  useAppManifest();
  const { token, setToken } = useAppSession("driver");
  const [reg, setReg] = useState(false);
  const [ready, setReady] = useState(() => localStorage.getItem("app_onb_driver") === "1");
  const [tutor, setTutor] = useState(() => localStorage.getItem("app_tut_driver") !== "1");
  const [showHelp, setShowHelp] = useState(false);
  const [data, setData] = useState<Poll | null>(null);
  const [err, setErr] = useState("");
  const [amount, setAmount] = useState("");
  const [chatId, setChatId] = useState<number | null>(null);
  const [readMap, setReadMap] = useState<Record<number, number>>({});
  const { ref: gps } = useGeo(!!token && ready, true);
  const seen = useSeen();

  const refresh = useCallback(async () => {
    const g = gps.current;
    const r = await appCall<Poll>("driver_poll", g ? { lat: g[0], lng: g[1] } : {}, token);
    if (seen("trips", r.available.map((t) => t.id)).length) pushNotify();
    if (seen("cast", r.broadcasts.map((b) => b.id)).length) pushNotify();
    setData(r);
  }, [token, gps, seen]);

  usePoll(refresh, 4000, !!token && ready, () => setToken(null));

  const act = async (action: string, body: Record<string, unknown> = {}) => {
    setErr("");
    try {
      const r = await appCall<{ blocked?: boolean }>(action, body, token);
      if (r.blocked) setErr("Аккаунт заблокирован из-за частых отмен");
      await refresh();
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const logout = async () => {
    await appCall("logout", {}, token).catch(() => undefined);
    setToken(null);
  };

  if (!token) {
    if (reg) return <Shell title="Водитель"><DriverRegister onToken={setToken} onBack={() => setReg(false)} /></Shell>;
    return (
      <Shell title="Водитель">
        <PhoneLogin action="driver_login" withPassword hint="Войдите по номеру и паролю, указанным при регистрации." onToken={setToken}
          extra={<Btn kind="ghost" onClick={() => setReg(true)} className="w-full">Зарегистрироваться как водитель</Btn>} />
      </Shell>
    );
  }

  if (!ready) return <Onboarding role="driver" token={token} needLocation onDone={() => { localStorage.setItem("app_onb_driver", "1"); setReady(true); }} />;
  if (tutor) return <Tutorial slides={DRIVER_SLIDES} onClose={() => { localStorage.setItem("app_tut_driver", "1"); setTutor(false); }} />;

  if (!data) return <Shell title="Водитель" onLogout={logout}><p className="p-6 text-neutral-500">Загрузка...</p></Shell>;

  const { me, active, upcoming, available, broadcasts, commission_pct, priority_price, priority_days } = data;
  const approved = me.status === "approved";
  const unread = (t: DTrip) => !!t.last_msg_id && (readMap[t.id] || 0) < t.last_msg_id;
  const points: MapPoint[] = [];
  const target = active || available[0];
  if (target?.from_lat && target?.from_lng) points.push({ lat: target.from_lat, lng: target.from_lng, color: "#2563eb", label: "Подача" });
  if (gps.current) points.push({ lat: gps.current[0], lng: gps.current[1], color: "#f59e0b", label: "Я" });

  return (
    <Shell title="Водитель" onLogout={logout}
      right={<><span className="text-sm font-extrabold">{money(me.balance)}</span><button onClick={() => setShowHelp(true)} aria-label="Помощь"><Icon name="CircleHelp" size={22} /></button></>}>
      <div className="mx-auto max-w-md space-y-4 p-4 pb-24">
        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-extrabold">{me.name}</div>
              <div className="text-sm text-neutral-500">{me.car_model} · {me.car_plate}</div>
              <div className="mt-1 flex items-center gap-1 text-sm font-bold text-amber-600">
                <Icon name="Star" size={14} /> {me.rating ? Number(me.rating).toFixed(1) : "нет оценок"} <span className="font-normal text-neutral-400">· поездок: {me.done_count}</span>
              </div>
            </div>
            <Badge tone={approved ? "green" : me.status === "pending" ? "yellow" : "red"}>{DRIVER_STATUS[me.status]}</Badge>
          </div>
          {me.status === "blocked" && <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">Аккаунт заблокирован: {me.block_reason}. Свяжитесь с диспетчером.</p>}
          {me.status === "pending" && <p className="mt-3 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">Диспетчер проверяет документы. Мы пришлём уведомление, когда анкета будет одобрена.</p>}
          {me.status === "rejected" && <p className="mt-3 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">Анкета отклонена. Свяжитесь с диспетчером.</p>}
          {approved && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {me.tariffs.length ? me.tariffs.map((t) => <Badge key={t} tone="gray">{TARIFF_NAME[t]}</Badge>) : <span className="text-sm text-amber-700">Диспетчер ещё не назначил тариф</span>}
              {me.has_priority && <Badge tone="yellow">Приоритет до {new Date(me.priority_until!).toLocaleDateString("ru-RU")}</Badge>}
            </div>
          )}
          <button onClick={() => act("driver_set_line", { on: !me.on_line })} disabled={!approved || !me.tariffs.length}
            className={`mt-3 w-full rounded-2xl py-4 text-lg font-extrabold transition disabled:opacity-40 ${me.on_line ? "bg-emerald-500 text-white" : "bg-neutral-900 text-white"}`}>
            {me.on_line ? "Вы на линии · выйти" : "Выйти на линию"}
          </button>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="flex items-end justify-between">
            <div><div className="text-xs font-bold uppercase text-neutral-400">Баланс</div><div className="text-2xl font-extrabold">{money(me.balance)}</div></div>
            <div className="text-right text-xs text-neutral-500">Комиссия сервиса {commission_pct}% с заказа</div>
          </div>
          {data.payment_info && <p className="mt-3 whitespace-pre-wrap rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-700">{data.payment_info}</p>}
          <div className="mt-3 flex gap-2">
            <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} placeholder="Сумма, ₽" inputMode="numeric"
              className="min-w-0 flex-1 rounded-2xl bg-neutral-100 px-4 py-3 font-bold outline-none focus:ring-2 focus:ring-[#fcd34d]" />
            <Btn disabled={!amount} onClick={() => { act("driver_request_topup", { amount: Number(amount) }); setAmount(""); }}>Я оплатил</Btn>
          </div>
          <p className="mt-2 text-xs text-neutral-400">Переведите сумму по реквизитам и отправьте заявку. Диспетчер зачислит деньги на баланс. Онлайн-оплату подключим позже.</p>
          {data.topups.filter((t) => t.status === "pending").map((t) => <p key={t.id} className="mt-2 text-sm font-semibold text-amber-700">Заявка на {money(t.amount)} ждёт подтверждения</p>)}
        </div>

        {approved && (
          <div className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-sm">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fcd34d]"><Icon name="Zap" size={22} /></span>
            <div className="flex-1 text-sm">
              <div className="font-extrabold">Приоритет заказов</div>
              <div className="text-neutral-500">Видите новые заказы раньше всех. {money(priority_price)} за {priority_days} дн.</div>
            </div>
            <Btn kind="dark" onClick={() => act("driver_buy_priority")} className="!px-4 !py-2.5 !text-sm">{me.has_priority ? "Продлить" : "Купить"}</Btn>
          </div>
        )}

        {err && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-600">{err}</p>}

        {broadcasts[0] && (
          <div className="flex gap-3 rounded-3xl bg-sky-50 p-4 text-sm">
            <Icon name="Megaphone" size={20} className="shrink-0 text-sky-600" />
            <div><div className="font-extrabold text-sky-800">Эфир диспетчера</div>{broadcasts[0].text}</div>
          </div>
        )}

        {points.length > 0 && <AppMap center={[55.75, 37.62]} points={points} className="h-44 w-full overflow-hidden rounded-3xl" />}

        {active && <DriverTripCard t={active} unread={unread(active)} onChat={() => setChatId(active.id)}
          onStep={(to) => act("driver_trip_status", { trip_id: active.id, status: to })}
          onCancel={() => window.confirm("Отказ от заказа учитывается. При частых отказах аккаунт блокируется. Отказаться?") && act("driver_cancel", { trip_id: active.id })} />}

        {upcoming.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-extrabold uppercase text-neutral-400">Мои предзаказы</h2>
            {upcoming.map((t) => (
              <DriverTripCard key={t.id} t={t} unread={unread(t)} onChat={() => setChatId(t.id)}
                onStep={(to) => act("driver_trip_status", { trip_id: t.id, status: to })}
                onCancel={() => window.confirm("Отказ от заказа учитывается. При частых отказах аккаунт блокируется. Отказаться?") && act("driver_cancel", { trip_id: t.id })} />
            ))}
          </div>
        )}

        {!active && me.on_line && (
          <div className="space-y-3">
            <h2 className="text-sm font-extrabold uppercase text-neutral-400">Новые заказы ({available.length})</h2>
            {available.length === 0 && <p className="rounded-3xl bg-white p-5 text-center text-sm text-neutral-500">Пока заказов нет. Вы получите уведомление, когда появится новый.</p>}
            {available.map((t) => (
              <div key={t.id} className="space-y-3 rounded-3xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <Badge tone={t.scheduled_at ? "blue" : "yellow"}>{t.scheduled_at ? `Предзаказ · ${whenText(t.scheduled_at)}` : "Сейчас"}</Badge>
                  <Badge tone="gray">{TARIFF_NAME[t.tariff]}</Badge>
                </div>
                <PickupBlock t={t} />
                <div className="flex justify-between text-sm font-bold">
                  <span>{t.distance_km ? `${t.distance_km} км` : ""}</span>
                  <span>{money(t.price)} · комиссия {money(Math.round(Number(t.price) * commission_pct / 100))}</span>
                </div>
                <Btn onClick={() => act("driver_take", { trip_id: t.id })} className="w-full">Взять заказ</Btn>
              </div>
            ))}
          </div>
        )}
        {!active && approved && !me.on_line && <p className="rounded-3xl bg-white p-5 text-center text-sm text-neutral-500">Выйдите на линию, чтобы видеть заказы.</p>}

        {(data.support_telegram || data.support_max) && (
          <div className="flex gap-2">
            {data.support_telegram && <a href={data.support_telegram} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-2xl bg-sky-50 py-3 text-center text-sm font-bold text-sky-700">Поддержка в Telegram</a>}
            {data.support_max && <a href={data.support_max} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-2xl bg-violet-50 py-3 text-center text-sm font-bold text-violet-700">Поддержка в Max</a>}
          </div>
        )}
      </div>

      {chatId && <TripChat role="driver" tripId={chatId} token={token} onClose={() => setChatId(null)} onUnauthorized={() => setToken(null)}
        onRead={(id) => setReadMap((m) => ({ ...m, [chatId]: id }))} />}
      {showHelp && <Tutorial slides={DRIVER_SLIDES} onClose={() => setShowHelp(false)} />}
    </Shell>
  );
}
