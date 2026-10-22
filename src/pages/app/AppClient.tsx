import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { appCall, money, TARIFF_LIST, Tariff, TRIP_STATUS, TARIFF_NAME, whenText } from "@/lib/appApi";
import { useAppSession } from "@/lib/useAppSession";
import { usePoll } from "@/lib/usePoll";
import { useGeo } from "@/lib/useGeo";
import { useAppShell } from "@/lib/useAppShell";
import { useChatAlert } from "@/lib/useChatAlert";
import { useReadMap } from "@/lib/useReadMap";
import { reachGoal } from "@/lib/metrika";
import TariffPicker from "@/components/app/TariffPicker";
import DriverBanner from "@/components/app/DriverBanner";
import PushBanner from "@/components/app/PushBanner";
import { useSeen } from "@/lib/useSeen";
import { pushNotify } from "@/lib/notify";
import AppMap, { MapPoint } from "@/components/app/AppMap";
import { Place } from "@/components/app/AddressSearch";
import RoutePicker from "@/components/app/RoutePicker";
import ClientMenu, { MenuAction } from "@/components/app/ClientMenu";
import { HistoryPanel, PromoPanel, BonusPanel } from "@/components/app/ClientPanels";
import BonusBanner from "@/components/app/BonusBanner";
import WhenPicker, { whenError, whenLabel } from "@/components/app/WhenPicker";
import ClientTripCard, { ClientTrip } from "@/components/app/ClientTripCard";
import Onboarding from "@/components/app/Onboarding";
import InstallGate, { isMobile } from "@/components/app/InstallGate";
import InstallOffer from "@/components/app/InstallOffer";
import { reachHotQuote, trackStep } from "@/lib/funnel";
import { getAdSource } from "@/lib/adSource";
import QuickDestinations, { FirstScreenHead } from "@/components/app/QuickDestinations";
import { agoText, tone, waitText } from "@/components/app/KppQueue";
import WishPicker from "@/components/app/WishPicker";
import OffersList from "@/components/app/OffersList";
import { isStandalone } from "@/lib/pushClient";
import Tutorial, { CLIENT_SLIDES } from "@/components/app/Tutorial";
import TripChat from "@/components/app/TripChat";
import PhoneLogin from "@/components/app/PhoneLogin";
import { Badge, Btn, Field, Shell, tripTone } from "@/components/app/ui";
import { DIRECT_ADS_CONTACTS, SUPPORT_MAX, SUPPORT_TG } from "@/lib/contacts";
import { maxUrl, tgUrl } from "@/components/app/SupportLinks";
import Icon from "@/components/ui/icon";

const STATUS_VOICE: Record<string, string> = {
  assigned: "Водитель найден. Откройте приложение, чтобы увидеть машину",
  enroute: "Машина выехала",
  arrived: "Машина приехала",
  in_progress: "Поездка началась",
};

const DEFAULT_CENTER: [number, number] = [55.751, 37.618];

interface Quote {
  distance_km: number; kpp?: string | null; kpp_queue?: { minutes: number; ago: number } | null; kpp_id?: string | null; kpp_alts?: { id: string; kpp: string; km: number; min: number; queue?: number | null; prices: Record<Tariff, number> }[]; region: string; prices: Record<Tariff, number>; approx: boolean; min_price: number;
  from_geo: Place; bonus?: Record<string, { rub: number; km: number }>;
}
interface Poll {
  active: ClientTrip | null; upcoming: ClientTrip[]; history: (ClientTrip & { id: number })[];
  support_telegram: string; support_max: string; bonus_km?: number; me?: { name: string | null; phone: string };
}

export default function AppClient() {
  useAppShell("client");
  const chatAlert = useChatAlert("client", "Вам написал водитель");
  const { token, setToken } = useAppSession("client");
  const [ready, setReady] = useState(() => localStorage.getItem("app_onb_client") === "1");
  const [tutor, setTutor] = useState(() => localStorage.getItem("app_tut_client") !== "1");
  const { pos, error: gpsErr, locate } = useGeo(!token || ready);
  const [from, setFrom] = useState({ city: "", street: "", house: "" });
  const [toText, setToText] = useState("");
  const [toPlace, setToPlace] = useState<Place | null>(null);
  const [fromPos, setFromPos] = useState<[number, number] | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [tariff, setTariff] = useState<Tariff>("standard");
  const [bump, setBump] = useState(0);
  const [scheduled, setScheduled] = useState(false);
  const [when, setWhen] = useState("");
  const [comment, setComment] = useState("");
  const [pay, setPay] = useState<"cash" | "transfer">("cash");
  const [fromText, setFromText] = useState("");
  const [fly, setFly] = useState<{ lat: number; lng: number; n: number } | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<Poll | null>(null);
  const [chatId, setChatId] = useState<number | null>(null);
  const { read: readMap, mark: markRead } = useReadMap("client");
  const [stars, setStars] = useState(0);
  const [skipRate, setSkipRate] = useState<number[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const [menu, setMenu] = useState(false);
  const [startPos, setStartPos] = useState<[number, number] | null>(null);
  const [startText, setStartText] = useState("");
  const [startFrom, setStartFrom] = useState({ city: "", street: "", house: "" });
  const [panel, setPanel] = useState<null | "history" | "promo" | "bonus">(null);
  const [picker, setPicker] = useState<null | "from" | "to">(null);
  const [mapPick, setMapPick] = useState<null | "from" | "to">(null);
  const [useBonus, setUseBonus] = useState(true);
  const [bonusCfg, setBonusCfg] = useState({ earn: 5, max: 10, ref: 30 });
  const installed = isStandalone() || !isMobile();
  const [gate, setGate] = useState(false);
  const skipGate = () => setGate(false);
  const [offerHidden, setOfferHidden] = useState(() => sessionStorage.getItem("app_install_hide") === "1");
  const hideOffer = () => { sessionStorage.setItem("app_install_hide", "1"); setOfferHidden(true); };
  const [needLogin, setNeedLogin] = useState(false);
  const requireLogin = () => { trackStep("login_prompt"); setNeedLogin(true); };
  const seen = useSeen();
  const statusRef = useRef<string>("");
  const orderAfterLogin = useRef(false);
  const [support, setSupport] = useState({ tg: SUPPORT_TG, max: SUPPORT_MAX });
  useEffect(() => {
    appCall<{ support_telegram?: string; support_max?: string }>("config")
      .then((c) => setSupport({ tg: tgUrl(c.support_telegram || "") || SUPPORT_TG, max: maxUrl(c.support_max || "") || SUPPORT_MAX }))
      .catch(() => undefined);
  }, []);

  const applyGeo = useCallback(async (lat: number, lng: number) => {
    try {
      const r = await appCall<{ item: Place }>(token ? "client_reverse" : "guest_reverse", { lat, lng }, token);
      setFrom({ city: r.item.city || r.item.state || "", street: r.item.street || "", house: r.item.house || "" });
      setFromText(r.item.label || "");
    } catch {
      setFrom({ city: "", street: "", house: "" });
    }
  }, [token]);

  useEffect(() => {
    if (!pos) return;
    setFromPos(pos);
    setFly({ lat: pos[0], lng: pos[1], n: Date.now() });
    applyGeo(pos[0], pos[1]);
  }, [pos, token, applyGeo]);

  useEffect(() => { if (token) setNeedLogin(false); }, [token]);

  useEffect(() => { trackStep("open"); }, []);
  useEffect(() => { if (gate) trackStep("install_offer"); }, [gate]);
  useEffect(() => { if (token) trackStep("login"); }, [token]);
  useEffect(() => { if (toPlace) trackStep("route", { details: toPlace.label || "" }); }, [toPlace]);

  const quoteKey = toPlace && fromPos ? `${fromPos[0].toFixed(3)},${fromPos[1].toFixed(3)}>${toPlace.lat.toFixed(3)},${toPlace.lng.toFixed(3)}` : "";
  const [quoting, setQuoting] = useState(false);
  const [kppPick, setKppPick] = useState<string | null>(null);
  const [wish, setWish] = useState("");
  useEffect(() => { setKppPick(null); }, [quoteKey]);
  const hotQuote = !!quote && (quote.distance_km >= 300 || quote.region === "new");
  const hotParams = useCallback((why: string) => ({ why, km: quote?.distance_km || 0, region: quote?.region || "", order_price: quote?.prices.standard || 0, currency: "RUB" }), [quote]);
  useEffect(() => {
    if (!hotQuote) return;
    const t = window.setTimeout(() => reachHotQuote(hotParams("time")), 20000);
    return () => window.clearTimeout(t);
  }, [hotQuote, quoteKey, hotParams]);
  useEffect(() => {
    if (!quoteKey || !toPlace || !fromPos) { setQuote(null); setQuoting(false); return; }
    let stale = false;
    setQuoting(true);
    const t = window.setTimeout(() => {
      appCall<Quote>(token ? "client_quote" : "guest_quote", { from_lat: fromPos[0], from_lng: fromPos[1], to_lat: toPlace.lat, to_lng: toPlace.lng, ...(kppPick ? { kpp_id: kppPick } : {}) }, token)
        .then((q) => {
          if (stale) return;
          setQuote(q); if (!orderAfterLogin.current) setBump(0); setErr("");
          trackStep("quote", { details: `${from.city || fromText} → ${toPlace.label || ""} · ${q.distance_km} км · Стандарт ${q.prices.standard} ₽`.slice(0, 290) });
        })
        .catch((e) => { if (!stale) { setQuote(null); setErr(e.message); } })
        .finally(() => { if (!stale) setQuoting(false); });
    }, 350);
    return () => { stale = true; window.clearTimeout(t); };
  }, [quoteKey, token, kppPick]);

  const onCenter = useCallback((lat: number, lng: number) => {
    setFromPos([lat, lng]);
    applyGeo(lat, lng);
  }, [applyGeo, token]);

  const refresh = useCallback(async () => {
    const r = await appCall<Poll>("client_poll", {}, token);
    const a = r.active;
    if (a && statusRef.current && statusRef.current !== a.status) pushNotify(STATUS_VOICE[a.status]);
    statusRef.current = a ? a.status : "";
    chatAlert(a ? [a, ...r.upcoming] : r.upcoming);
    const fresh = seen("done", r.history.filter((h) => h.status === "done").map((h) => h.id));
    if (fresh.length) { pushNotify("Поездка завершена. Оцените, пожалуйста"); reachGoal("app_trip_done"); }
    const cancelledNow = seen("cancelled", r.history.filter((h) => h.status === "cancelled" && h.cancelled_by === "dispatcher").map((h) => h.id));
    if (cancelledNow.length) pushNotify("Заказ отменён диспетчером");
    setData(r);
  }, [token, seen]);

  usePoll(refresh, data?.active ? 5000 : 20000, !!token && ready, () => setToken(null));

  useEffect(() => {
    const openChat = () => { if (data?.active) setChatId(data.active.id); };
    const q = new URLSearchParams(window.location.search).get("chat");
    if (q && data?.active) { openChat(); window.history.replaceState(window.history.state, "", window.location.pathname); }
    window.addEventListener("app-open-chat", openChat);
    return () => window.removeEventListener("app-open-chat", openChat);
  }, [data?.active?.id]);

  useEffect(() => {
    if (!token || !ready) return;
    appCall<{ earn_pct: number; max_pct: number; ref_km: number }>("client_bonus", {}, token)
      .then((b) => setBonusCfg({ earn: b.earn_pct, max: b.max_pct, ref: b.ref_km })).catch(() => undefined);
  }, [token, ready]);

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("ref");
    if (ref) localStorage.setItem("app_ref", ref.toUpperCase().slice(0, 12));
  }, []);

  const toRate = useMemo(() => data?.history.find((h) => h.status === "done" && !h.rating && !skipRate.includes(h.id)) || null, [data, skipRate]);

  const basePrice = quote ? quote.prices[tariff] : 0;
  const price = basePrice + bump;
  const bonusOpt = installed ? quote?.bonus?.[tariff] : undefined;
  const payPrice = price - (useBonus && bonusOpt ? bonusOpt.rub : 0);

  const order = async () => {
    if (!quote || !toPlace || !fromPos) return;
    if (!orderAfterLogin.current) trackStep("order_click", { details: `${toText} · ${price} ₽` });
    if (hotQuote) reachHotQuote(hotParams("order_click"));
    if (!token) { orderAfterLogin.current = true; requireLogin(); return; }
    setBusy(true);
    setErr("");
    try {
      await appCall("client_create_trip", {
        from_lat: fromPos[0], from_lng: fromPos[1], from_city: from.city, from_street: from.street, from_house: from.house, from_label: fromText,
        to_text: toText, to_lat: toPlace.lat, to_lng: toPlace.lng, tariff, price, comment, pay_method: pay, wish: tariff === "choice" ? wish : undefined, kpp_id: quote?.kpp_id || undefined, use_bonus: installed && useBonus && !!bonusOpt && bump === 0, installed,
        scheduled_at: scheduled && when ? new Date(when).toISOString() : null,
      }, token);
      reachGoal(scheduled ? "app_preorder" : "app_order", { tariff, order_price: price, currency: "RUB" });
      reachGoal("app_order_any", { order_price: price, currency: "RUB" });
      reachGoal("app_lead", { channel: "order", order_price: price, currency: "RUB" });
      trackStep("order", { details: `${toText} · ${price} ₽`, once: false });
      setToText(""); setToPlace(null); setQuote(null); setComment(""); setWish(""); setScheduled(false); setWhen(""); setBump(0);
      await refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const onLogin = (t: string) => {
    if (orderAfterLogin.current) {
      localStorage.setItem("app_onb_client", "1");
      localStorage.setItem("app_tut_client", "1");
      setReady(true);
      setTutor(false);
    }
    setToken(t);
  };

  useEffect(() => {
    if (!token || !quote || !orderAfterLogin.current) return;
    orderAfterLogin.current = false;
    order();
  }, [token, quote]);

  const act = async (action: string, body: Record<string, unknown>) => {
    setErr("");
    try { await appCall(action, body, token); await refresh(); } catch (e) { setErr((e as Error).message); }
  };

  const logout = async () => {
    await appCall("logout", {}, token).catch(() => undefined);
    setToken(null);
  };

  if (gate) return <InstallGate who="Приложение для пассажиров" appName="Дальняк" onClose={skipGate} />;

  if (token && !ready) {
    return <Onboarding role="client" token={token} needLocation onDone={() => { localStorage.setItem("app_onb_client", "1"); setReady(true); }} />;
  }

  if (token && tutor) return <Tutorial slides={CLIENT_SLIDES} onClose={() => { localStorage.setItem("app_tut_client", "1"); setTutor(false); }} />;

  const active = data?.active || null;
  const points: MapPoint[] = [];
  if (fromPos && (active || toPlace)) points.push({ lat: fromPos[0], lng: fromPos[1], color: "#2563eb", label: "Подача" });
  if (toPlace && !active) points.push({ lat: toPlace.lat, lng: toPlace.lng, color: "#171717", label: "Куда" });
  if (active?.driver_lat && active?.driver_lng) points.push({ lat: active.driver_lat, lng: active.driver_lng, color: "#f59e0b", label: "Водитель" });
  const unread = (t: ClientTrip) => !!t.last_msg_id && t.last_msg_role === "driver" && (readMap[t.id] || 0) < t.last_msg_id;
  const fromOk = !!from.city;
  const fromAd = (() => { const s = getAdSource(); return Boolean(s.yclid || s.utmSource); })();

  return (
    <Shell title="Дальняк" right={!token ? <button onClick={requireLogin} className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-extrabold text-white">Войти</button> : undefined} left={<button onClick={() => (token ? setMenu(true) : requireLogin())} aria-label="Меню" className="-ml-1 flex h-10 w-10 items-center justify-center rounded-full active:bg-neutral-100"><Icon name="Menu" size={24} /></button>}>
      <div className="relative">
        <AppMap center={pos || DEFAULT_CENTER} points={points} className="h-[38vh] w-full" pin={!active && (!toPlace || mapPick !== null)} fly={fly} onCenterChange={onCenter} />
        {token && !active && !toPlace && !mapPick && installed && <BonusBanner km={data?.bonus_km ?? 0} earnPct={bonusCfg.earn} maxPct={bonusCfg.max} refKm={bonusCfg.ref} onMore={() => setPanel("bonus")} />}
        <button onClick={() => { locate(); if (pos) setFly({ lat: pos[0], lng: pos[1], n: Date.now() }); }} aria-label="Моё местоположение" className="absolute right-3 top-3 z-[500] flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg">
          <Icon name="Crosshair" size={20} />
        </button>
      </div>

      <div className="relative z-[600] -mt-6 min-h-[60vh] rounded-t-[28px] bg-white p-5 pb-24 shadow-[0_-8px_30px_rgba(0,0,0,0.1)]">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-neutral-200" />
        {!active && !toPlace && !mapPick && <FirstScreenHead />}
        {gpsErr && !fromOk && (
          <div className="mb-3 rounded-2xl bg-neutral-50 p-3 text-xs font-semibold text-neutral-500">
            Не видим ваше местоположение — укажите «Откуда» вручную. <button onClick={locate} className="ml-1 underline">Определить снова</button>
          </div>
        )}
        {token && <div className="mb-3"><PushBanner role="client" token={token} /></div>}
        {err && (/недоступен|Нет связи|занят/.test(err) ? (
          <div className="mb-3 rounded-2xl bg-red-50 p-3">
            <p className="text-sm font-semibold text-red-700">Не получается связаться с сервером. Закажите по телефону — диспетчер посчитает цену и примет заказ.</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <a href="tel:+79956455125" className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-extrabold text-white"><Icon name="Phone" size={16} /> Позвонить</a>
              <a href={support.max} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-violet-600 py-3 text-sm font-extrabold text-white"><Icon name="MessageCircle" size={16} /> Написать в MAX</a>
            </div>
          </div>
        ) : <p className="mb-3 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-600">{err}</p>)}

        {active ? (
          <ClientTripCard t={active} unread={unread(active)} onChat={() => setChatId(active.id)}
            onCancel={() => act("client_cancel_trip", { trip_id: active.id })}
            onRaise={(p) => act("client_raise_price", { trip_id: active.id, price: p })} token={token} onRefresh={() => { refresh().catch(() => undefined); }} />
        ) : (
          <div className="space-y-3">
            {mapPick ? (
              <div className="space-y-3">
                <div className="rounded-2xl bg-neutral-50 p-3">
                  <div className="text-xs font-bold text-neutral-400">{mapPick === "from" ? "Точка подачи" : "Куда едем"}</div>
                  <div className="text-[15px] font-extrabold">{fromText || "Определяем адрес..."}</div>
                </div>
                <p className="text-xs text-neutral-400">Двигайте карту, чтобы метка встала на нужное место.</p>
                <Btn className="w-full text-lg" disabled={!fromOk} onClick={() => {
                  if (mapPick === "to" && fromPos) {
                    setToPlace({ label: fromText, lat: fromPos[0], lng: fromPos[1], city: from.city, street: from.street, house: from.house });
                    setToText(fromText);
                    if (startPos) { setFromPos(startPos); setFromText(startText); setFrom(startFrom); }
                  }
                  setMapPick(null);
                }}>Готово</Btn>
                <button onClick={() => { if (startPos) { setFromPos(startPos); setFromText(startText); setFrom(startFrom); } setMapPick(null); }} className="w-full text-center text-sm font-semibold text-neutral-500">Отмена</button>
              </div>
            ) : (
              <>
                <div className="overflow-hidden rounded-3xl bg-neutral-100">
                  <button onClick={() => setPicker("from")} className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-neutral-200">
                    <span className="h-3 w-3 shrink-0 rounded-full bg-blue-600" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-neutral-400">Откуда</span>
                      <span className="block truncate text-[15px] font-extrabold">{fromText || (from.city ? `${from.city}${from.street ? ", " + from.street : ""}` : "Определяем точку...")}</span>
                    </span>
                  </button>
                  <div className="mx-4 border-t border-neutral-200" />
                  <button onClick={() => setPicker("to")} className="flex w-full items-center gap-3 px-4 py-3.5 text-left active:bg-neutral-200">
                    <span className="h-3 w-3 shrink-0 rounded-full bg-neutral-900" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold text-neutral-400">Куда</span>
                      <span className={`block truncate text-[15px] font-extrabold ${toText ? "" : "text-neutral-400"}`}>{toText || "Куда едем?"}</span>
                    </span>
                    {toPlace && <span onClick={(e) => { e.stopPropagation(); setToText(""); setToPlace(null); }} className="p-1"><Icon name="X" size={18} className="text-neutral-400" /></span>}
                  </button>
                </div>
                {!toPlace && !quoting && (
                  <QuickDestinations from={fromOk ? fromPos : null} onPick={(p) => { setToPlace(p); setToText(p.label); }} onOther={() => setPicker("to")} />
                )}
              </>
            )}

            {quoting && !quote && !mapPick && (
              <div className="flex items-center gap-3 rounded-2xl bg-neutral-50 p-4 text-sm font-bold text-neutral-600">
                <Icon name="Loader2" size={18} className="animate-spin" /> Считаем цену по маршруту...
              </div>
            )}
            {quote && (
              <>
                <div className="flex items-center justify-between text-sm text-neutral-500">
                  <span>{quote.distance_km} км{quote.approx ? " (примерно)" : ""}</span>
                  {quote.region === "new" && <Badge tone="blue">{quote.kpp ? `Через КПП ${quote.kpp.split(" (")[0]}` : "Есть участок по новым территориям"}</Badge>}
                </div>
                {quote.kpp_alts && quote.kpp_alts.length > 1 && (
                  <div className="rounded-2xl bg-neutral-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-neutral-400">Через какой КПП ехать</span>
                      <a href="/kpp-online" target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-sky-700">Очереди онлайн</a>
                    </div>
                    <div className="space-y-1.5">
                      {quote.kpp_alts.map((a) => {
                        const on = a.id === quote.kpp_id;
                        const hours = Math.floor(a.min / 60);
                        return (
                          <button key={a.id} onClick={() => { setKppPick(a.id); if (hotQuote) reachHotQuote(hotParams("kpp")); }} disabled={quoting}
                            className={`flex w-full items-center gap-2 rounded-xl border-2 px-3 py-2 text-left ${on ? "border-neutral-900 bg-white" : "border-transparent bg-white/60"}`}>
                            <span className={`h-4 w-4 shrink-0 rounded-full border-2 ${on ? "border-neutral-900 bg-neutral-900 ring-2 ring-inset ring-white" : "border-neutral-300"}`} />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-extrabold">{a.kpp.split(" (")[0]}</span>
                              <span className="block text-[11px] text-neutral-500">{a.km} км · ≈ {hours ? `${hours} ч ` : ""}{a.min % 60} мин{a.queue ? ` · очередь ${waitText(a.queue)}` : ""}</span>
                            </span>
                            <span className="text-sm font-extrabold">{money(a.prices[tariff] ?? a.prices.standard)}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                {quote.kpp && (
                  <a href="/kpp-online" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-2xl bg-neutral-900 p-3 text-white">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10"><Icon name="Timer" size={20} className="text-[#fcd34d]" /></span>
                    <span className="min-w-0 flex-1 text-sm">
                      <span className="block font-extrabold">Поедем через КПП {quote.kpp.split(" (")[0]}</span>
                      <span className="block text-xs text-neutral-300">
                        {quote.kpp_queue ? `Очередь сейчас ≈ ${waitText(quote.kpp_queue.minutes)} · водители отметили ${agoText(quote.kpp_queue.ago)}` : "Выбрали самый быстрый пункт пропуска. Очереди на всех КПП онлайн →"}
                      </span>
                    </span>
                    {quote.kpp_queue && <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-extrabold ${tone(quote.kpp_queue.minutes)}`}>{waitText(quote.kpp_queue.minutes)}</span>}
                  </a>
                )}
                <TariffPicker prices={quote.prices} value={tariff} onChange={(t) => { setTariff(t); setBump(0); if (hotQuote) reachHotQuote(hotParams("tariff")); }} />
                {tariff === "choice" && <WishPicker value={wish} onChange={setWish} />}

                {bonusOpt && bump === 0 && (
                  <label className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-3">
                    <input type="checkbox" checked={useBonus} onChange={(e) => setUseBonus(e.target.checked)} className="h-5 w-5 accent-emerald-600" />
                    <span className="flex-1 text-sm"><b className="text-emerald-800">Списать {bonusOpt.km} км</b><span className="block text-emerald-700">Скидка {money(bonusOpt.rub)} (до {bonusCfg.max}% стоимости)</span></span>
                  </label>
                )}
                <div className="flex items-center gap-2 rounded-2xl bg-neutral-100 p-2">
                  <button onClick={() => setBump(Math.max(0, bump - 100))} disabled={bump <= 0} className="h-11 w-11 rounded-xl bg-white text-xl font-bold disabled:opacity-30">−</button>
                  <div className="flex-1 text-center"><div className="text-xs text-neutral-500">Ваша цена</div><div className="text-lg font-extrabold">{money(price)}</div></div>
                  <button onClick={() => setBump(bump + 100)} className="h-11 w-11 rounded-xl bg-white text-xl font-bold">+</button>
                </div>

                <div className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-900">
                  <div className="font-extrabold">Что важно знать</div>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4">
                    <li>Подбор машины займёт от 10 минут: мы ищем водителя, готового к дальней дороге, а не ближайшее такси за углом. Хотите выехать точно в срок — оформите предзаказ.</li>
                    <li>Платные дороги, мосты и платные участки оплачиваются отдельно.</li>
                    <li>Водителю платите напрямую: переводом или наличными. Лучше оплатить в начале поездки.</li>
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {([["cash", "Наличными"], ["transfer", "Переводом"]] as const).map(([k, l]) => (
                    <button key={k} onClick={() => setPay(k)} className={`rounded-2xl border-2 py-3 text-sm font-extrabold ${pay === k ? "border-neutral-900 bg-neutral-50" : "border-transparent bg-neutral-100 text-neutral-500"}`}>{l}</button>
                  ))}
                </div>
                <WhenPicker enabled={scheduled} value={when} onToggle={setScheduled} onChange={setWhen} />
                <Field value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Комментарий: багаж, дети, подъезд" maxLength={300} />
                <Btn onClick={order} disabled={busy || quoting || !fromOk || (tariff === "choice" && wish.trim().length < 3) || (scheduled && !!whenError(when))} className="w-full text-lg">
                  {busy ? "Отправляем..." : quoting ? "Пересчитываем цену..." : scheduled ? `Оформить предзаказ на ${whenLabel(when)}` : tariff === "choice" ? (wish.trim().length < 3 ? "Напишите, какую машину хотите" : `Найти водителей за ${money(bump === 0 ? payPrice : price)}`) : `Заказать ${TARIFF_LIST.find((x) => x.id === tariff)?.name} за ${money(bump === 0 ? payPrice : price)}`}
                </Btn>
              </>
            )}
          </div>
        )}

        {data && data.upcoming.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-extrabold uppercase text-neutral-400">Предзаказы</h3>
            <div className="space-y-2">
              {data.upcoming.map((u) => (
                <div key={u.id} className="rounded-2xl bg-neutral-50 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <b>{whenText(u.scheduled_at)}</b><Badge tone={tripTone(u.status)}>{TRIP_STATUS[u.status]}</Badge>
                  </div>
                  <div className="mt-1 text-neutral-600">{u.to_text} · {TARIFF_NAME[u.tariff]} · {money(u.price)}</div>
                  {u.tariff === "choice" && u.status === "new" && token && (
                    <div className="mt-3"><OffersList tripId={u.id} wish={u.wish} offers={u.offers || []} token={token} onChosen={() => { refresh().catch(() => undefined); }} /></div>
                  )}
                  <div className="mt-2 flex gap-2">
                    {u.driver_name && <Btn kind="dark" onClick={() => setChatId(u.id)} className="!px-3 !py-2 !text-sm">Чат с водителем</Btn>}
                    <Btn kind="danger" onClick={() => act("client_cancel_trip", { trip_id: u.id })} className="!px-3 !py-2 !text-sm">Отменить</Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!installed && !active && !offerHidden && <div className="mt-4"><InstallOffer onOpen={() => setGate(true)} onClose={hideOffer} /></div>}
        {!active && !fromAd && <div className="mt-6"><DriverBanner /></div>}
      </div>

      {needLogin && !token && (
        <div className="fixed inset-0 z-[3000] flex items-end bg-black/50" onClick={() => { orderAfterLogin.current = false; setNeedLogin(false); }}>
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[28px] bg-white pb-8" onClick={(e) => e.stopPropagation()}>
            <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-neutral-200" />
            <div className="flex items-start justify-between px-5 pt-3">
              <div>
                <h2 className="text-xl font-extrabold text-neutral-900">{quote ? "Остался один шаг" : "Вход"}</h2>
                <p className="mt-0.5 text-sm text-neutral-500">{quote ? "Укажите телефон, чтобы водитель мог с вами связаться. Заказ отправится сразу." : "Укажите телефон: так водитель сможет с вами связаться."}</p>
              </div>
              <button onClick={() => { orderAfterLogin.current = false; setNeedLogin(false); }} aria-label="Закрыть" className="p-1 text-neutral-400"><Icon name="X" size={22} /></button>
            </div>
            <PhoneLogin action="client_login" hint="" bare onToken={onLogin} />
            <div className="mx-auto max-w-md px-5">
              <div className="mb-2 text-center text-xs font-bold uppercase text-neutral-400">или закажите без регистрации</div>
              <div className="grid grid-cols-3 gap-2">
                <a href={DIRECT_ADS_CONTACTS.PHONE_HREF} className="flex flex-col items-center gap-1 rounded-2xl bg-emerald-50 py-3 text-xs font-extrabold text-emerald-800"><Icon name="Phone" size={20} />Позвонить</a>
                <a href={support.max} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 rounded-2xl bg-violet-50 py-3 text-xs font-extrabold text-violet-800"><Icon name="MessageCircle" size={20} />Max</a>
                <a href={support.tg} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1 rounded-2xl bg-sky-50 py-3 text-xs font-extrabold text-sky-800"><Icon name="Send" size={20} />Telegram</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {token && chatId && <TripChat role="client" tripId={chatId} token={token} onClose={() => setChatId(null)} onUnauthorized={() => setToken(null)}
        onRead={(id) => markRead(chatId, id)} />}

      {toRate && (
        <div className="fixed inset-0 z-[2800] flex items-end bg-black/50">
          <div className="w-full rounded-t-[28px] bg-white p-6 pb-10">
            <h2 className="text-xl font-extrabold">Как прошла поездка?</h2>
            <p className="text-sm text-neutral-500">Оцените водителя {toRate.driver_name}</p>
            <div className="my-5 flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setStars(n)} aria-label={`${n}`}>
                  <Icon name="Star" size={40} className={n <= stars ? "fill-amber-400 text-amber-400" : "text-neutral-300"} />
                </button>
              ))}
            </div>
            <Btn disabled={!stars} onClick={() => { act("client_rate", { trip_id: toRate.id, rating: stars }); setStars(0); }} className="w-full">Отправить оценку</Btn>
            <button onClick={() => setSkipRate((l) => [...l, toRate.id])} className="mt-3 w-full text-center text-sm text-neutral-400">Позже</button>
          </div>
        </div>
      )}

      {menu && (
        <ClientMenu name={data?.me?.name || ""} phone={data?.me?.phone || ""} bonusKm={data?.bonus_km ?? 0} telegram={data?.support_telegram} max={data?.support_max}
          onClose={() => setMenu(false)} onLogout={() => { setMenu(false); logout(); }}
          onPick={(k: MenuAction) => { setMenu(false); if (k === "help") setShowHelp(true); else setPanel(k); }} />
      )}
      {token && panel === "history" && <HistoryPanel token={token} onClose={() => setPanel(null)} />}
      {token && panel === "promo" && <PromoPanel token={token} onClose={() => setPanel(null)} onDone={refresh} />}
      {token && panel === "bonus" && <BonusPanel token={token} onClose={() => setPanel(null)} />}
      {picker && (
        <RoutePicker token={token} start={picker} fromText={fromText} toText={toText} near={fromPos}
          onPickFrom={(p) => { setFromPos([p.lat, p.lng]); setFly({ lat: p.lat, lng: p.lng, n: Date.now() }); setFrom({ city: p.city || p.state || "", street: p.street || "", house: p.house || "" }); setFromText(p.label); }}
          onPickTo={(p) => { setToPlace(p); setToText(p.label); }}
          onMyLocation={() => { locate(); if (pos) { setFromPos(pos); setFly({ lat: pos[0], lng: pos[1], n: Date.now() }); applyGeo(pos[0], pos[1]); } }}
          onMap={(w) => { setStartPos(fromPos); setStartText(fromText); setStartFrom(from); setMapPick(w); if (w === "to" && toPlace) setFly({ lat: toPlace.lat, lng: toPlace.lng, n: Date.now() }); }}
          onClose={() => setPicker(null)} />
      )}
      {showHelp && <Tutorial slides={CLIENT_SLIDES} onClose={() => setShowHelp(false)} />}
    </Shell>
  );
}