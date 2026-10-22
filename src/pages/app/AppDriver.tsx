import { useCallback, useEffect, useRef, useState } from "react";
import { appCall, DRIVER_STATUS, TARIFF_NAME, money, whenText } from "@/lib/appApi";
import { pushNotify, startRing, stopRing, unlockAudio } from "@/lib/notify";
import { useAppSession } from "@/lib/useAppSession";
import { usePoll } from "@/lib/usePoll";
import { useGeo } from "@/lib/useGeo";
import { useSeen } from "@/lib/useSeen";
import { useAppShell } from "@/lib/useAppShell";
import { useChatAlert } from "@/lib/useChatAlert";
import { useReadMap } from "@/lib/useReadMap";
import PushBanner from "@/components/app/PushBanner";
import SupportLinks from "@/components/app/SupportLinks";
import DocsRecheck from "@/components/app/DocsRecheck";
import DriverConsentGate from "@/components/app/DriverConsent";
import PhoneLogin from "@/components/app/PhoneLogin";
import DriverRegister from "@/components/app/DriverRegister";
import DriverTripCard, { DTrip, PickupBlock } from "@/components/app/DriverTripCard";
import Onboarding from "@/components/app/Onboarding";
import InstallGate, { needsInstall } from "@/components/app/InstallGate";
import Tutorial, { DRIVER_SLIDES } from "@/components/app/Tutorial";
import TripChat from "@/components/app/TripChat";
import AppMap, { MapPoint } from "@/components/app/AppMap";
import { Badge, Btn, Shell } from "@/components/app/ui";
import TakeOrder from "@/components/app/TakeOrder";
import IncomingOrder, { orderSpeech } from "@/components/app/IncomingOrder";
import { DriverKppReport } from "@/components/app/KppQueue";
import DriverOffer, { CarFeaturesEditor, DriverWish } from "@/components/app/DriverOffer";
import Icon from "@/components/ui/icon";

interface Me {
  id: number; name: string; callsign?: string | null; car_model: string; car_plate: string; status: string; on_line: boolean; balance: number; car_features?: string[]; car_year?: number | null;
  tariffs: string[]; pd_consent?: boolean; recheck_fields: string[]; recheck_note: string | null; block_reason: string | null; priority_until: string | null; has_priority: boolean;
  rating: number | null; done_count: number;
}
interface Poll {
  me: Me; active: DTrip | null; upcoming: DTrip[]; available: DTrip[]; broadcasts: { id: number; text: string }[];
  commission_pct: number; priority_price: number; priority_days: number; payment_info: string;
  cancelled: { id: number }[]; topups: { id: number; amount: number; status: string }[]; support_telegram: string; support_max: string;
}

export default function AppDriver() {
  useAppShell("driver");
  const chatAlert = useChatAlert("driver", "Вам написал пассажир");
  const [tab, setTab] = useState<"orders" | "profile" | "money">("orders");
  const { token, setToken } = useAppSession("driver");
  const [reg, setReg] = useState(false);
  const [ready, setReady] = useState(() => localStorage.getItem("app_onb_driver") === "1");
  const [tutor, setTutor] = useState(() => localStorage.getItem("app_tut_driver") !== "1");
  const [showHelp, setShowHelp] = useState(false);
  const [data, setData] = useState<Poll | null>(null);
  const [err, setErr] = useState("");
  const [amount, setAmount] = useState("");
  const [chatId, setChatId] = useState<number | null>(null);
  const { read: readMap, mark: markRead } = useReadMap("driver");
  const { ref: gps } = useGeo(!!token && ready, true);
  const seen = useSeen();

  const refresh = useCallback(async () => {
    const g = gps.current;
    const r = await appCall<Poll>("driver_poll", g ? { lat: g[0], lng: g[1] } : {}, token);
    chatAlert(r.active ? [r.active, ...r.upcoming] : r.upcoming);
    if (seen("trips", r.available.map((t) => t.id)).length) pushNotify("Новый заказ");
    if (seen("cast", r.broadcasts.map((b) => b.id)).length) pushNotify("Сообщение от диспетчера");
    if (seen("cancelled", (r.cancelled || []).map((c) => c.id)).length) pushNotify("Заказ отменён");
    if (seen("mine", [...(r.active ? [r.active.id] : []), ...r.upcoming.map((t) => t.id)]).length) pushNotify("Вам назначен заказ");
    setData(r);
  }, [token, gps, seen]);

  usePoll(refresh, data?.active || data?.me?.on_line ? 5000 : 30000, !!token && ready, () => setToken(null), !!data?.me?.on_line);

  const [skipped, setSkipped] = useState<number[]>([]);
  const incomingList = data?.me?.on_line && !data.active ? data.available.filter((t) => t.can_take !== false && t.tariff !== "choice" && !skipped.includes(t.id)) : [];
  const incoming = incomingList[0] || null;
  useEffect(() => {
    if (incoming) { stopRing(); startRing(orderSpeech(incoming)); }
    else stopRing();
  }, [incoming?.id]);
  const skipOrder = (id: number) => {
    setSkipped((s) => [...s, id]);
    stopRing();
    appCall("driver_skip", { trip_id: id }, token).catch(() => undefined);
  };
  const acceptOrder = async (id: number, eta: number): Promise<string | null> => {
    stopRing();
    try {
      await appCall("driver_take", { trip_id: id, ...(eta ? { eta_minutes: eta } : {}) }, token);
      setSkipped((s) => [...s, id]);
      await refresh().catch(() => undefined);
      return null;
    } catch (e) {
      const msg = (e as Error).message;
      if (/забрал другой|уже/.test(msg)) { setSkipped((s) => [...s, id]); setErr(msg); return null; }
      return msg;
    }
  };
  useEffect(() => () => stopRing(), []);

  const wake = useRef<{ release: () => Promise<void> } | null>(null);
  useEffect(() => {
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
    if (!data?.me?.on_line || !nav.wakeLock) { wake.current?.release().catch(() => undefined); wake.current = null; return; }
    const lock = () => { if (!document.hidden && !wake.current) nav.wakeLock!.request("screen").then((l) => { wake.current = l; }).catch(() => undefined); };
    lock();
    const onVis = () => { if (document.hidden) wake.current = null; else lock(); };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [data?.me?.on_line]);

  useEffect(() => {
    const openChat = () => { if (data?.active) setChatId(data.active.id); };
    const q = new URLSearchParams(window.location.search).get("chat");
    if (q && data?.active) { openChat(); window.history.replaceState(window.history.state, "", window.location.pathname); }
    window.addEventListener("app-open-chat", openChat);
    return () => window.removeEventListener("app-open-chat", openChat);
  }, [data?.active?.id]);

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

  if (needsInstall()) return <InstallGate who="Приложение для водителей" appName="Водитель" other={{ href: "/app/client", text: "Если вы ещё и ездите как пассажир, приложение для пассажиров устанавливается отдельно, на странице /app/client." }} />;

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

  if (!data) return <Shell title="Водитель"><p className="p-6 text-neutral-500">Загрузка...</p></Shell>;

  const { me, active, upcoming, available, broadcasts, commission_pct, priority_price, priority_days } = data;
  const approved = me.status === "approved";
  const unread = (t: DTrip) => !!t.last_msg_id && t.last_msg_role === "client" && (readMap[t.id] || 0) < t.last_msg_id;
  const points: MapPoint[] = [];
  const target = active || available[0];
  if (target?.from_lat && target?.from_lng) points.push({ lat: target.from_lat, lng: target.from_lng, color: "#2563eb", label: "Подача" });
  if (gps.current) points.push({ lat: gps.current[0], lng: gps.current[1], color: "#f59e0b", label: "Я" });

  const chatBtnNav = (
    <nav className="fixed inset-x-0 bottom-0 z-[1500] grid grid-cols-3 border-t border-neutral-200 bg-white pb-[env(safe-area-inset-bottom)]">
      {([["orders", "ListChecks", "Заказы", available.length + upcoming.length + (active ? 1 : 0)], ["money", "Wallet", "Деньги", 0], ["profile", "User", "Профиль", 0]] as const).map(([k, ic, l, n]) => (
        <button key={k} onClick={() => setTab(k)} className={`relative flex flex-col items-center gap-0.5 py-2.5 text-xs font-extrabold ${tab === k ? "text-neutral-900" : "text-neutral-400"}`}>
          <span className={`flex h-8 w-14 items-center justify-center rounded-full ${tab === k ? "bg-[#fcd34d]" : ""}`}><Icon name={ic} size={22} /></span>
          {l}
          {n > 0 && <span className="absolute right-[22%] top-1 rounded-full bg-red-500 px-1.5 text-[10px] text-white">{n}</span>}
        </button>
      ))}
    </nav>
  );

  const lineBar = (
    <div className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-sm">
      <div>
        <div className="text-lg font-extrabold">{me.on_line ? "Вы на линии" : "Вы не на линии"}{me.callsign && <span className="ml-2 rounded-lg bg-neutral-900 px-2 py-0.5 text-sm text-[#fcd34d]">№{me.callsign}</span>}</div>
        <div className="text-sm text-neutral-500">{me.on_line ? "Заказ будет звенеть, пока не откроете. Держите приложение открытым" : approved ? "Включите, чтобы видеть заказы" : "Ждём одобрения диспетчера"}</div>
      </div>
      <button onClick={() => { unlockAudio(); act("driver_set_line", { on: !me.on_line }); }} disabled={!approved} aria-label="Линия"
        className={`relative h-9 w-16 rounded-full transition disabled:opacity-40 ${me.on_line ? "bg-emerald-500" : "bg-neutral-300"}`}>
        <span className={`absolute top-1 h-7 w-7 rounded-full bg-white shadow transition-all ${me.on_line ? "left-8" : "left-1"}`} />
      </button>
    </div>
  );

  const errBox = err && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-600">{err}</p>;

  return (
    <Shell title={tab === "orders" ? "Заказы" : tab === "money" ? "Деньги" : "Профиль"} onLogout={tab === "profile" ? logout : undefined}
      right={<><span className="rounded-full bg-neutral-100 px-3 py-1 text-sm font-extrabold">{money(me.balance)}</span><button onClick={() => setShowHelp(true)} aria-label="Помощь"><Icon name="CircleHelp" size={22} /></button></>}>
      <div className="mx-auto max-w-md space-y-4 p-4 pb-28">
        {incoming && <IncomingOrder t={incoming} more={incomingList.length - 1} onSkip={() => skipOrder(incoming.id)} onAccept={(m) => acceptOrder(incoming.id, m)} />}
        {errBox}
        <PushBanner role="driver" token={token} />
        {me.pd_consent === false && <DriverConsentGate onAgree={async () => { await appCall("driver_pd_consent", { agree: true }, token); await refresh(); }} />}
        {me.recheck_fields?.length > 0 && <DocsRecheck fields={me.recheck_fields} note={me.recheck_note} onSend={async (photos) => { await appCall("driver_upload_docs", { photos }, token); await refresh(); }} />}

        {tab === "orders" && (
          <>
            {lineBar}
            {approved && <DriverKppReport token={token} />}
            {approved && me.on_line && !me.tariffs.length && <p className="rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">Тариф вашего автомобиля пока не указан, брать заказы нельзя. Диспетчер скоро назначит.</p>}
            {me.status === "pending" && <p className="rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">Диспетчер проверяет документы. Мы пришлём уведомление, когда анкета будет одобрена.</p>}
            {me.status === "blocked" && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">Аккаунт заблокирован: {me.block_reason}. Свяжитесь с диспетчером.</p>}
            {me.status === "rejected" && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">Анкета отклонена. Свяжитесь с диспетчером.</p>}
            {broadcasts[0] && (
              <div className="flex gap-3 rounded-3xl bg-sky-50 p-4 text-sm">
                <Icon name="Megaphone" size={20} className="shrink-0 text-sky-600" />
                <div><div className="font-extrabold text-sky-800">Сообщение диспетчера</div>{broadcasts[0].text}</div>
              </div>
            )}
            {points.length > 0 && (active || available[0]) && <AppMap center={[55.75, 37.62]} points={points} className="h-44 w-full overflow-hidden rounded-3xl" />}

            {active && <DriverTripCard t={active} unread={unread(active)} onChat={() => setChatId(active.id)}
              onEta={(m) => act("driver_set_eta", { trip_id: active.id, minutes: m })}
              onStep={(to) => act("driver_trip_status", { trip_id: active.id, status: to })}
              onCancel={() => window.confirm("Отказ от заказа учитывается. При частых отказах аккаунт блокируется. Отказаться?") && act("driver_cancel", { trip_id: active.id })} />}

            {upcoming.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-sm font-extrabold uppercase text-neutral-400">Мои предзаказы</h2>
                {upcoming.map((t) => (
                  <DriverTripCard key={t.id} t={t} unread={unread(t)} onChat={() => setChatId(t.id)}
                    onEta={(m) => act("driver_set_eta", { trip_id: t.id, minutes: m })}
                    onStep={(to) => act("driver_trip_status", { trip_id: t.id, status: to })}
                    onCancel={() => window.confirm("Отказ от заказа учитывается. При частых отказах аккаунт блокируется. Отказаться?") && act("driver_cancel", { trip_id: t.id })} />
                ))}
              </div>
            )}

            {!active && me.on_line && (
              <div className="space-y-3">
                <h2 className="text-sm font-extrabold uppercase text-neutral-400">Свободные заказы ({available.length})</h2>
                {available.length === 0 && <p className="rounded-3xl bg-white p-5 text-center text-sm text-neutral-500">Пока заказов нет. Вы услышите сигнал и получите уведомление, когда появится новый.</p>}
                {available.map((t) => (
                  <div key={t.id} className="space-y-3 rounded-3xl bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <Badge tone={t.scheduled_at ? "blue" : "yellow"}>{t.scheduled_at ? `Предзаказ · ${whenText(t.scheduled_at)}` : "Сейчас"}</Badge>
                      <Badge tone="gray">{TARIFF_NAME[t.tariff]}</Badge>
                    </div>
                    <PickupBlock t={t} />
                    {t.tariff === "choice" && t.wish && <DriverWish wish={t.wish} />}
                    <div className="flex justify-between text-sm font-bold">
                      <span>{t.distance_km ? `${t.distance_km} км` : ""}</span>
                      <span>{money(t.price)} · комиссия {money(Math.round(Number(t.price) * commission_pct / 100))}</span>
                    </div>
                    {t.tariff === "choice"
                      ? <DriverOffer tripId={t.id} preorder={!!t.scheduled_at} myOffer={t.my_offer} offersCount={t.offers_count} token={token!} onDone={() => { refresh().catch(() => undefined); }} />
                      : t.can_take === false
                      ? <Btn disabled className="w-full">{`Нужен тариф «${TARIFF_NAME[t.tariff]}»`}</Btn>
                      : <TakeOrder preorder={!!t.scheduled_at} onTake={(eta) => act("driver_take", { trip_id: t.id, ...(eta ? { eta_minutes: eta } : {}) })} />}
                  </div>
                ))}
              </div>
            )}
            {!active && approved && !me.on_line && <p className="rounded-3xl bg-white p-5 text-center text-sm text-neutral-500">Включите «Вы на линии», чтобы видеть заказы.</p>}
          </>
        )}

        {tab === "money" && (
          <>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="text-xs font-bold uppercase text-neutral-400">Ваш баланс</div>
              <div className="text-3xl font-extrabold">{money(me.balance)}</div>
              <div className="mt-1 text-sm text-neutral-500">Комиссия сервиса списывается, когда вы берёте заказ. Если заказ отменён, деньги возвращаются.</div>
            </div>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <h3 className="font-extrabold">Пополнить баланс</h3>
              {data.payment_info && <p className="mt-2 whitespace-pre-wrap rounded-2xl bg-neutral-50 p-3 text-sm text-neutral-700">{data.payment_info}</p>}
              <p className="mt-2 text-sm text-neutral-500">1. Переведите деньги по реквизитам. 2. Введите сумму и нажмите «Я оплатил». 3. Диспетчер подтвердит, и баланс пополнится.</p>
              <div className="mt-3 flex gap-2">
                <input value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} placeholder="Сумма, ₽" inputMode="numeric"
                  className="min-w-0 flex-1 rounded-2xl bg-neutral-100 px-4 py-3 font-bold text-neutral-900 outline-none focus:ring-2 focus:ring-[#fcd34d]" />
                <Btn disabled={!amount} onClick={() => { act("driver_request_topup", { amount: Number(amount) }); setAmount(""); }}>Я оплатил</Btn>
              </div>
              {data.topups.filter((t) => t.status === "pending").map((t) => <p key={t.id} className="mt-2 text-sm font-semibold text-amber-700">Заявка на {money(t.amount)} ждёт подтверждения</p>)}
            </div>
            {approved && (
              <div className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fcd34d]"><Icon name="Zap" size={24} /></span>
                  <div><h3 className="font-extrabold">Приоритет заказов</h3><p className="text-sm text-neutral-500">Видите новые заказы раньше других водителей.</p></div>
                </div>
                {me.has_priority && <p className="mt-2 text-sm font-bold text-emerald-700">Активен до {new Date(me.priority_until!).toLocaleDateString("ru-RU")}</p>}
                <Btn kind="dark" onClick={() => act("driver_buy_priority")} className="mt-3 w-full">{me.has_priority ? "Продлить" : "Подключить"} · {money(priority_price)} за {priority_days} дн.</Btn>
              </div>
            )}
          </>
        )}

        {tab === "profile" && (
          <>
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fcd34d] text-xl font-extrabold">{me.name[0]}</span>
                <div className="flex-1">
                  <div className="text-lg font-extrabold">{me.name}</div>
                  <div className="text-sm text-neutral-500">{me.car_model} · {me.car_plate}</div>
                </div>
                <Badge tone={approved ? "green" : me.status === "pending" ? "yellow" : "red"}>{DRIVER_STATUS[me.status]}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                <div className="rounded-2xl bg-neutral-50 p-3"><div className="text-xl font-extrabold text-amber-600">{me.rating ? Number(me.rating).toFixed(1) : "—"}</div><div className="text-xs text-neutral-500">Рейтинг</div></div>
                <div className="rounded-2xl bg-neutral-50 p-3"><div className="text-xl font-extrabold">{me.done_count}</div><div className="text-xs text-neutral-500">Поездок</div></div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5">
                <span className="text-sm text-neutral-500">Тарифы:</span>
                {me.tariffs.length ? me.tariffs.map((t) => <Badge key={t} tone="gray">{TARIFF_NAME[t]}</Badge>) : <span className="text-sm text-amber-700">назначит диспетчер</span>}
              </div>
            </div>
            {approved && <CarFeaturesEditor initial={me.car_features || []} year={me.car_year ?? null} token={token!} onSaved={() => { refresh().catch(() => undefined); }} />}
            <Btn kind="ghost" onClick={() => setShowHelp(true)} className="w-full">Как работать в приложении</Btn>
            <SupportLinks telegram={data.support_telegram} max={data.support_max} />
            <a href="/app/client" className="block rounded-2xl bg-neutral-100 py-3.5 text-center text-sm font-bold text-neutral-800">Нужно такси? Приложение для пассажиров</a>
            <Btn kind="danger" onClick={logout} className="w-full">Выйти из аккаунта</Btn>
          </>
        )}
      </div>

      {chatBtnNav}
      {chatId && <TripChat role="driver" tripId={chatId} token={token} onClose={() => setChatId(null)} onUnauthorized={() => setToken(null)}
        onRead={(id) => markRead(chatId, id)} />}
      {showHelp && <Tutorial slides={DRIVER_SLIDES} onClose={() => setShowHelp(false)} />}
    </Shell>
  );
}
