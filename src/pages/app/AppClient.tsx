import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { appCall, money, TARIFF_LIST, Tariff, TRIP_STATUS, TARIFF_NAME, whenText } from "@/lib/appApi";
import { useAppSession } from "@/lib/useAppSession";
import { usePoll } from "@/lib/usePoll";
import { useGeo } from "@/lib/useGeo";
import { useAppManifest } from "@/lib/useAppManifest";
import { useSeen } from "@/lib/useSeen";
import { pushNotify } from "@/lib/notify";
import AppMap, { MapPoint } from "@/components/app/AppMap";
import AddressSearch, { Place } from "@/components/app/AddressSearch";
import ClientTripCard, { ClientTrip } from "@/components/app/ClientTripCard";
import Onboarding from "@/components/app/Onboarding";
import InstallGate, { needsInstall } from "@/components/app/InstallGate";
import Tutorial, { CLIENT_SLIDES } from "@/components/app/Tutorial";
import TripChat from "@/components/app/TripChat";
import PhoneLogin from "@/components/app/PhoneLogin";
import { Badge, Btn, Field, Shell, tripTone } from "@/components/app/ui";
import Icon from "@/components/ui/icon";

const DEFAULT_CENTER: [number, number] = [55.751, 37.618];

interface Quote {
  distance_km: number; region: string; prices: Record<Tariff, number>; approx: boolean; min_price: number;
  from_geo: Place;
}
interface Poll {
  active: ClientTrip | null; upcoming: ClientTrip[]; history: (ClientTrip & { id: number })[];
  support_telegram: string; support_max: string;
}

function minLocal() {
  const d = new Date(Date.now() + 40 * 60000);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export default function AppClient() {
  useAppManifest();
  const { token, setToken } = useAppSession("client");
  const [ready, setReady] = useState(() => localStorage.getItem("app_onb_client") === "1");
  const [tutor, setTutor] = useState(() => localStorage.getItem("app_tut_client") !== "1");
  const { pos, error: gpsErr, locate } = useGeo(!!token && ready);
  const [from, setFrom] = useState({ city: "", street: "", house: "" });
  const [editFrom, setEditFrom] = useState(false);
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
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [data, setData] = useState<Poll | null>(null);
  const [chatId, setChatId] = useState<number | null>(null);
  const [readMap, setReadMap] = useState<Record<number, number>>({});
  const [stars, setStars] = useState(0);
  const [skipRate, setSkipRate] = useState<number[]>([]);
  const [showHelp, setShowHelp] = useState(false);
  const seen = useSeen();
  const statusRef = useRef<string>("");

  useEffect(() => {
    if (!pos || !token) return;
    setFromPos(pos);
    appCall<{ item: Place }>("client_reverse", { lat: pos[0], lng: pos[1] }, token)
      .then((r) => setFrom((f) => (f.city || f.street ? f : { city: r.item.city || "", street: r.item.street || "", house: r.item.house || "" })))
      .catch(() => undefined);
  }, [pos, token]);

  useEffect(() => {
    setQuote(null);
    if (!toPlace || !fromPos || !token) return;
    appCall<Quote>("client_quote", { from_lat: fromPos[0], from_lng: fromPos[1], to_lat: toPlace.lat, to_lng: toPlace.lng }, token)
      .then((q) => { setQuote(q); setBump(0); setErr(""); })
      .catch((e) => setErr(e.message));
  }, [toPlace, fromPos, token]);

  const pickFrom = useCallback(async (lat: number, lng: number) => {
    setFromPos([lat, lng]);
    setEditFrom(true);
    try {
      const r = await appCall<{ item: Place }>("client_reverse", { lat, lng }, token);
      setFrom({ city: r.item.city || "", street: r.item.street || "", house: r.item.house || "" });
      setFromText(r.item.label || "");
    } catch {
      setFrom({ city: "", street: "", house: "" });
    }
  }, [token]);

  const refresh = useCallback(async () => {
    const r = await appCall<Poll>("client_poll", {}, token);
    const a = r.active;
    if (a && statusRef.current && statusRef.current !== a.status) pushNotify();
    statusRef.current = a ? a.status : "";
    const fresh = seen("done", r.history.filter((h) => h.status === "done").map((h) => h.id));
    if (fresh.length) pushNotify();
    setData(r);
  }, [token, seen]);

  usePoll(refresh, 4000, !!token && ready, () => setToken(null));

  const toRate = useMemo(() => data?.history.find((h) => h.status === "done" && !h.rating && !skipRate.includes(h.id)) || null, [data, skipRate]);

  const basePrice = quote ? quote.prices[tariff] : 0;
  const price = basePrice + bump;

  const order = async () => {
    if (!quote || !toPlace || !fromPos) return;
    setBusy(true);
    setErr("");
    try {
      await appCall("client_create_trip", {
        from_lat: fromPos[0], from_lng: fromPos[1], from_city: from.city, from_street: from.street, from_house: from.house,
        to_text: toText, to_lat: toPlace.lat, to_lng: toPlace.lng, tariff, price, comment, pay_method: pay,
        scheduled_at: scheduled && when ? new Date(when).toISOString() : null,
      }, token);
      setToText(""); setToPlace(null); setQuote(null); setComment(""); setScheduled(false); setWhen(""); setBump(0);
      await refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const act = async (action: string, body: Record<string, unknown>) => {
    setErr("");
    try { await appCall(action, body, token); await refresh(); } catch (e) { setErr((e as Error).message); }
  };

  const logout = async () => {
    await appCall("logout", {}, token).catch(() => undefined);
    setToken(null);
  };

  if (needsInstall()) return <InstallGate who="Приложение для пассажиров" />;

  if (!token) {
    return (
      <Shell title="Дальняк">
        <PhoneLogin action="client_login" withName hint="Междугороднее такси по фиксированной цене. Введите имя и номер телефона." onToken={setToken} />
      </Shell>
    );
  }

  if (!ready) {
    return <Onboarding role="client" token={token} needLocation onDone={() => { localStorage.setItem("app_onb_client", "1"); setReady(true); }} />;
  }

  if (tutor) return <Tutorial slides={CLIENT_SLIDES} onClose={() => { localStorage.setItem("app_tut_client", "1"); setTutor(false); }} />;

  const active = data?.active || null;
  const points: MapPoint[] = [];
  if (fromPos) points.push({ lat: fromPos[0], lng: fromPos[1], color: "#2563eb", label: "Вы" });
  if (toPlace && !active) points.push({ lat: toPlace.lat, lng: toPlace.lng, color: "#171717", label: "Куда" });
  if (active?.driver_lat && active?.driver_lng) points.push({ lat: active.driver_lat, lng: active.driver_lng, color: "#f59e0b", label: "Водитель" });
  const unread = (t: ClientTrip) => !!t.last_msg_id && (readMap[t.id] || 0) < t.last_msg_id;
  const fromOk = from.city && from.street && from.house;

  return (
    <Shell title="Дальняк" onLogout={logout}
      right={<button onClick={() => setShowHelp(true)} aria-label="Помощь"><Icon name="CircleHelp" size={22} /></button>}>
      <div className="relative">
        <AppMap center={pos || DEFAULT_CENTER} points={points} className="h-[42vh] w-full" onPick={active ? undefined : pickFrom} />
        {!active && <div className="pointer-events-none absolute bottom-8 left-3 right-16 z-[500] rounded-xl bg-white/90 px-3 py-1.5 text-xs font-bold text-neutral-700 shadow">Нажмите на карту, чтобы поставить точку подачи</div>}
        <button onClick={locate} aria-label="Моё местоположение" className="absolute right-3 top-3 z-[500] flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg">
          <Icon name="Crosshair" size={20} />
        </button>
      </div>

      <div className="relative z-[600] -mt-6 min-h-[60vh] rounded-t-[28px] bg-white p-5 pb-24 shadow-[0_-8px_30px_rgba(0,0,0,0.1)]">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-neutral-200" />
        {gpsErr && (
          <div className="mb-3 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">
            {gpsErr} <button onClick={locate} className="ml-1 underline">Повторить</button>
          </div>
        )}
        {err && <p className="mb-3 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-600">{err}</p>}

        {active ? (
          <ClientTripCard t={active} unread={unread(active)} onChat={() => setChatId(active.id)}
            onCancel={() => act("client_cancel_trip", { trip_id: active.id })}
            onRaise={(p) => act("client_raise_price", { trip_id: active.id, price: p })} />
        ) : (
          <div className="space-y-3">
            <h2 className="text-xl font-extrabold">Куда поедем?</h2>
            <div className="rounded-2xl bg-neutral-50 p-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 shrink-0 rounded-full bg-blue-600" />
                <div className="min-w-0 flex-1 text-sm">
                  <div className="text-xs font-bold text-neutral-400">Откуда</div>
                  <div className="truncate font-bold">{fromOk ? `${from.city}, ${from.street}, ${from.house}` : "Определяем адрес по GPS..."}</div>
                </div>
                <button onClick={() => setEditFrom(!editFrom)} className="text-sm font-bold text-sky-700">{editFrom ? "Готово" : "Изменить"}</button>
              </div>
              {(editFrom || (pos && !fromOk)) && (
                <div className="mt-3 space-y-2">
                  <AddressSearch token={token} value={fromText} onChange={setFromText} placeholder="Найти адрес подачи"
                    onPick={(p) => { setFromPos([p.lat, p.lng]); setFrom({ city: p.city || "", street: p.street || "", house: p.house || "" }); }} near={fromPos} />
                  <p className="text-xs text-neutral-400">Или поставьте точку на карте. Проверьте город, улицу и дом ниже.</p>
                  <div className="grid grid-cols-6 gap-2">
                    <div className="col-span-6"><Field label="Город" value={from.city} onChange={(e) => setFrom({ ...from, city: e.target.value })} /></div>
                    <div className="col-span-4"><Field label="Улица" value={from.street} onChange={(e) => setFrom({ ...from, street: e.target.value })} /></div>
                    <div className="col-span-2"><Field label="Дом" value={from.house} onChange={(e) => setFrom({ ...from, house: e.target.value })} /></div>
                  </div>
                </div>
              )}
            </div>

            <AddressSearch token={token} value={toText} onChange={(v) => { setToText(v); setToPlace(null); }} onPick={setToPlace}
              placeholder="Город или адрес назначения" near={fromPos} />

            {quote && (
              <>
                <div className="flex items-center justify-between text-sm text-neutral-500">
                  <span>{quote.distance_km} км{quote.approx ? " (примерно)" : ""}</span>
                  {quote.region === "new" && <Badge tone="blue">Новые территории</Badge>}
                </div>
                <div className="space-y-2">
                  {TARIFF_LIST.map((t) => (
                    <button key={t.id} onClick={() => { setTariff(t.id); setBump(0); }}
                      className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${tariff === t.id ? "border-neutral-900 bg-neutral-50" : "border-transparent bg-neutral-100"}`}>
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white"><Icon name={t.icon} fallback="Car" size={22} /></span>
                      <span className="flex-1"><span className="block font-extrabold">{t.name}</span><span className="text-xs text-neutral-500">{t.car}</span></span>
                      <span className="text-lg font-extrabold">{money(quote.prices[t.id])}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 rounded-2xl bg-neutral-100 p-2">
                  <button onClick={() => setBump(Math.max(0, bump - 100))} disabled={bump <= 0} className="h-11 w-11 rounded-xl bg-white text-xl font-bold disabled:opacity-30">−</button>
                  <div className="flex-1 text-center"><div className="text-xs text-neutral-500">Ваша цена</div><div className="text-lg font-extrabold">{money(price)}</div></div>
                  <button onClick={() => setBump(bump + 100)} className="h-11 w-11 rounded-xl bg-white text-xl font-bold">+</button>
                </div>

                <div className="rounded-2xl bg-amber-50 p-3 text-sm text-amber-900">
                  <div className="font-extrabold">Что важно знать</div>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4">
                    <li>Платные дороги, мосты и платные участки оплачиваются отдельно.</li>
                    <li>Водителю платите напрямую: переводом или наличными. Лучше оплатить в начале поездки.</li>
                  </ul>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {([["cash", "Наличными"], ["transfer", "Переводом"]] as const).map(([k, l]) => (
                    <button key={k} onClick={() => setPay(k)} className={`rounded-2xl border-2 py-3 text-sm font-extrabold ${pay === k ? "border-neutral-900 bg-neutral-50" : "border-transparent bg-neutral-100 text-neutral-500"}`}>{l}</button>
                  ))}
                </div>
                <label className="flex items-center gap-3 rounded-2xl bg-neutral-100 p-3">
                  <input type="checkbox" checked={scheduled} onChange={(e) => setScheduled(e.target.checked)} className="h-5 w-5 accent-neutral-900" />
                  <span className="font-bold">Предзаказ на дату и время</span>
                </label>
                {scheduled && <Field type="datetime-local" min={minLocal()} value={when} onChange={(e) => setWhen(e.target.value)} />}
                <Field value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Комментарий: багаж, дети, подъезд" maxLength={300} />
                <Btn onClick={order} disabled={busy || !fromOk || (scheduled && !when)} className="w-full text-lg">
                  {busy ? "Отправляем..." : scheduled ? "Оформить предзаказ" : `Заказать за ${money(price)}`}
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
                  <div className="mt-2 flex gap-2">
                    {u.driver_name && <Btn kind="dark" onClick={() => setChatId(u.id)} className="!px-3 !py-2 !text-sm">Чат с водителем</Btn>}
                    <Btn kind="danger" onClick={() => act("client_cancel_trip", { trip_id: u.id })} className="!px-3 !py-2 !text-sm">Отменить</Btn>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data && data.history.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-extrabold uppercase text-neutral-400">История</h3>
            <div className="space-y-2">
              {data.history.map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded-2xl bg-neutral-50 p-3 text-sm">
                  <span className="mr-2 truncate font-semibold">{h.to_text}</span>
                  <Badge tone={tripTone(h.status)}>{TRIP_STATUS[h.status]}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <a href="/app/driver" className="mt-6 flex items-center gap-3 rounded-3xl bg-neutral-900 p-4 text-white">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#fcd34d] text-neutral-900"><Icon name="Car" size={24} /></span>
          <span className="flex-1">
            <span className="block font-extrabold text-white">Приглашаем водителей в команду</span>
            <span className="text-sm text-neutral-300">Есть свой автомобиль? Зарегистрируйтесь и принимайте заказы на междугородние поездки.</span>
          </span>
          <Icon name="ChevronRight" size={20} />
        </a>

        {data && (data.support_telegram || data.support_max) && (
          <div className="mt-6 flex gap-2">
            {data.support_telegram && <a href={data.support_telegram} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-2xl bg-sky-50 py-3 text-center text-sm font-bold text-sky-700">Поддержка в Telegram</a>}
            {data.support_max && <a href={data.support_max} target="_blank" rel="noopener noreferrer" className="flex-1 rounded-2xl bg-violet-50 py-3 text-center text-sm font-bold text-violet-700">Поддержка в Max</a>}
          </div>
        )}
      </div>

      {chatId && <TripChat role="client" tripId={chatId} token={token} onClose={() => setChatId(null)} onUnauthorized={() => setToken(null)}
        onRead={(id) => setReadMap((m) => ({ ...m, [chatId]: id }))} />}

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

      {showHelp && <Tutorial slides={CLIENT_SLIDES} onClose={() => setShowHelp(false)} />}
    </Shell>
  );
}
