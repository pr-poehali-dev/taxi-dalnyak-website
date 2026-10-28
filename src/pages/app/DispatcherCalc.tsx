import { useEffect, useMemo, useState } from "react";
import { appCall, formatPhone, money } from "@/lib/appApi";
import { useAppSession } from "@/lib/useAppSession";
import AddressSearch, { type Place } from "@/components/app/AddressSearch";
import { Btn, Field } from "@/components/app/ui";
import Icon from "@/components/ui/icon";

type T = "standard" | "comfort" | "minivan";
const TARIFFS: { id: T; name: string }[] = [
  { id: "standard", name: "Стандарт" },
  { id: "comfort", name: "Комфорт" },
  { id: "minivan", name: "Минивэн" },
];

interface Quote {
  distance_km: number; duration_min?: number; region: string; new_km: number; reg_km: number; approx: boolean;
  prices: Record<string, number>; driver_pay: Record<string, number>;
  toll?: { km: number; rub: number; roads: string[] } | null; toll_known?: boolean;
  kpp?: string | null; kpp_id?: string | null;
  kpp_alts?: { id: string; kpp: string; km: number; min: number; prices: Record<string, number>; driver_pay?: Record<string, number> }[];
  stops?: { label: string }[]; stop_price?: number;
}

function hm(min?: number) {
  if (!min) return "—";
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  return h ? `${h} ч${m ? ` ${m} мин` : ""}` : `${m} мин`;
}

function Login({ onToken }: { onToken: (t: string) => void }) {
  const [pwd, setPwd] = useState("");
  const [err, setErr] = useState("");
  return (
    <form className="mx-auto max-w-sm space-y-3 p-5 pt-16" onSubmit={async (e) => {
      e.preventDefault();
      try { onToken((await appCall<{ token: string }>("dispatcher_login", { password: pwd })).token); } catch (e2) { setErr((e2 as Error).message); }
    }}>
      <h1 className="text-2xl font-extrabold">Калькулятор диспетчера</h1>
      <Field label="Пароль диспетчера" type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} autoFocus />
      {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
      <Btn type="submit" disabled={!pwd} className="w-full">Войти</Btn>
    </form>
  );
}

export default function DispatcherCalc() {
  const { token, setToken } = useAppSession("dispatcher");
  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");
  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);
  const [stops, setStops] = useState<Place[]>([]);
  const [stopText, setStopText] = useState("");
  const [addStop, setAddStop] = useState(false);
  const [kpp, setKpp] = useState<string | null>(null);
  const [q, setQ] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [tariff, setTariff] = useState<T>("standard");
  const [price, setPrice] = useState("");
  const [pay, setPay] = useState("");
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [when, setWhen] = useState("");
  const [comment, setComment] = useState("");
  const [payMethod, setPayMethod] = useState<"cash" | "transfer">("cash");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const m = document.createElement("meta");
    m.name = "robots"; m.content = "noindex, nofollow";
    document.head.appendChild(m);
    document.title = "Калькулятор";
    return () => { m.remove(); };
  }, []);

  const key = from && to ? `${from.lat},${from.lng}>${stops.map((s) => `${s.lat},${s.lng}`).join(">")}>${to.lat},${to.lng}>${kpp || ""}` : "";
  useEffect(() => {
    if (!key || !from || !to || !token) { setQ(null); return; }
    let stale = false;
    setLoading(true); setErr("");
    appCall<Quote>("disp_quote", {
      from_lat: from.lat, from_lng: from.lng, to_lat: to.lat, to_lng: to.lng,
      ...(kpp ? { kpp_id: kpp } : {}),
      ...(stops.length ? { stops: stops.map((s) => ({ lat: s.lat, lng: s.lng, label: s.label })) } : {}),
    }, token)
      .then((r) => { if (!stale) setQ(r); })
      .catch((e) => { if (!stale) { setQ(null); setErr(e.message); if (/авториз|токен|войд/i.test(e.message)) setToken(null); } })
      .finally(() => { if (!stale) setLoading(false); });
    return () => { stale = true; };
  }, [key, token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!q) return;
    setPrice(String(q.prices[tariff] ?? ""));
    setPay(String(q.driver_pay?.[tariff] ?? ""));
  }, [q, tariff]);

  const priceN = Number(price) || 0;
  const payN = Number(pay) || 0;
  const commission = priceN - payN;
  const route = useMemo(() => [from?.label || fromText, ...stops.map((s) => s.label), to?.label || toText].filter(Boolean).join(" → "), [from, to, stops, fromText, toText]);

  const reset = () => {
    setFromText(""); setToText(""); setFrom(null); setTo(null); setStops([]); setKpp(null); setQ(null);
    setPhone(""); setName(""); setWhen(""); setComment(""); setDone(null); setErr(""); setTariff("standard");
  };

  const clientText = q ? `${route}\n${q.distance_km} км, в пути ≈ ${hm(q.duration_min)}\n${TARIFFS.find((t) => t.id === tariff)?.name}: ${money(priceN)}${q.toll ? `\nПлатные дороги ≈ ${money(q.toll.rub)} (оплачиваются отдельно)` : ""}` : "";
  const copy = async () => { try { await navigator.clipboard.writeText(clientText); setCopied(true); setTimeout(() => setCopied(false), 2500); } catch { /* ignore */ } };

  const submit = async () => {
    if (!from || !to || !q) return;
    setBusy(true); setErr("");
    try {
      const stopNote = stops.length ? `Остановки: ${stops.map((s) => s.label).join(" → ")}. ` : "";
      const r = await appCall<{ id: number }>("disp_create_order", {
        phone, name, from_text: from.label, to_text: to.label, from_lat: from.lat, from_lng: from.lng, to_lat: to.lat, to_lng: to.lng,
        from_city: from.city, tariff, price: priceN, driver_pay: payN, comment: (stopNote + comment).slice(0, 300), pay_method: payMethod,
        scheduled_at: when ? new Date(when).toISOString() : null, distance_km: q.distance_km, region: q.region,
      }, token);
      setDone(r.id);
    } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };

  if (!token) return <div className="min-h-screen bg-neutral-50"><Login onToken={setToken} /></div>;

  const canOrder = !!q && phone.replace(/\D/g, "").length === 11 && priceN >= 100 && payN > 0 && payN <= priceN;

  return (
    <div className="min-h-screen bg-neutral-50 pb-16 text-neutral-900" style={{ fontFamily: "Manrope, sans-serif" }}>
      <header className="sticky top-0 z-40 flex items-center justify-between bg-neutral-900 px-4 py-3 text-white">
        <span className="flex items-center gap-2 font-extrabold"><Icon name="Calculator" size={20} />Калькулятор</span>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="rounded-xl bg-white/10 px-3 py-1.5 text-sm font-bold">Новый расчёт</button>
          <a href="/app/office-k7x2" className="rounded-xl bg-white/10 px-3 py-1.5 text-sm font-bold">Заказы</a>
        </div>
      </header>

      <div className="mx-auto max-w-2xl space-y-3 p-4">
        <div className="space-y-2 rounded-3xl bg-white p-4 shadow-sm">
          <AddressSearch token={token} action="disp_suggest" value={fromText} onChange={(v) => { setFromText(v); setFrom(null); }} onPick={(p) => { setFrom(p); setKpp(null); }} placeholder="Откуда: город, адрес" />
          {stops.map((s, i) => (
            <div key={i} className="flex items-center gap-2 rounded-2xl bg-neutral-100 px-4 py-3 text-sm font-semibold">
              <Icon name="CircleDot" size={16} className="shrink-0 text-neutral-400" />
              <span className="flex-1 truncate">{s.label}</span>
              <button onClick={() => setStops(stops.filter((_, j) => j !== i))} aria-label="Убрать"><Icon name="X" size={16} className="text-neutral-400" /></button>
            </div>
          ))}
          {addStop && (
            <AddressSearch token={token} action="disp_suggest" value={stopText} onChange={setStopText}
              onPick={(p) => { setStops([...stops, p]); setStopText(""); setAddStop(false); }} placeholder="Промежуточная остановка" />
          )}
          <AddressSearch token={token} action="disp_suggest" value={toText} onChange={(v) => { setToText(v); setTo(null); }} onPick={(p) => { setTo(p); setKpp(null); }} placeholder="Куда: город, адрес" />
          {!addStop && stops.length < 3 && (
            <button onClick={() => setAddStop(true)} className="flex items-center gap-1.5 text-sm font-bold text-sky-700">
              <Icon name="Plus" size={16} />Остановка (+{q?.stop_price ?? 400} ₽ и км)
            </button>
          )}
        </div>

        {loading && <div className="flex items-center gap-2 rounded-2xl bg-white p-4 text-sm font-bold text-neutral-500"><Icon name="Loader2" size={18} className="animate-spin" />Считаем маршрут...</div>}
        {err && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-600">{err}</p>}

        {q && !loading && (
          <>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-amber-400 p-3"><div className="text-[11px] font-bold uppercase opacity-70">Расстояние</div><div className="text-xl font-black">{q.approx ? "≈" : ""}{q.distance_km} км</div></div>
              <div className="rounded-2xl bg-amber-400 p-3"><div className="text-[11px] font-bold uppercase opacity-70">В пути</div><div className="text-xl font-black">≈ {hm(q.duration_min)}</div></div>
              <div className="rounded-2xl bg-amber-400 p-3"><div className="text-[11px] font-bold uppercase opacity-70">Платные дороги</div><div className="text-xl font-black">{q.toll ? `≈ ${money(q.toll.rub)}` : q.toll_known ? "нет" : "—"}</div></div>
            </div>
            {(q.region === "new" || q.toll) && (
              <div className="rounded-2xl bg-white px-4 py-2 text-xs font-semibold text-neutral-600">
                {q.region === "new" && <>Новые территории: {q.new_km} км, по России: {q.reg_km} км{q.kpp ? ` · через КПП ${q.kpp.split(" (")[0]}` : ""}. </>}
                {q.toll && <>Платные: {q.toll.roads.join(", ") || "участки"} ({q.toll.km} км), оплачиваются отдельно.</>}
              </div>
            )}
            {q.kpp_alts && q.kpp_alts.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {q.kpp_alts.map((a) => (
                  <button key={a.id} onClick={() => setKpp(a.id)} className={`rounded-xl px-3 py-2 text-xs font-bold ${a.id === q.kpp_id ? "bg-neutral-900 text-white" : "bg-white text-neutral-600"}`}>
                    {a.kpp.split(" (")[0]} · {a.km} км · {money(a.prices[tariff])}
                  </button>
                ))}
              </div>
            )}

            <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
              <div className="grid grid-cols-4 bg-neutral-100 px-4 py-2 text-[11px] font-bold uppercase text-neutral-500">
                <span>Тариф</span><span className="text-right">Клиенту</span><span className="text-right">Водителю</span><span className="text-right">Нам</span>
              </div>
              {TARIFFS.map((t) => {
                const c = q.prices[t.id]; const d = q.driver_pay?.[t.id] ?? 0; const on = tariff === t.id;
                return (
                  <button key={t.id} onClick={() => setTariff(t.id)} className={`grid w-full grid-cols-4 items-center px-4 py-3.5 text-left ${on ? "bg-amber-50 ring-2 ring-inset ring-amber-400" : "border-t border-neutral-100"}`}>
                    <span className="font-extrabold">{t.name}</span>
                    <span className="text-right text-lg font-black">{money(c)}</span>
                    <span className="text-right font-bold text-emerald-700">{money(d)}</span>
                    <span className="text-right font-bold text-neutral-500">{money(c - d)}</span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Field label="Цена клиенту, ₽" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} />
              <Field label="Водителю на руки, ₽" inputMode="numeric" value={pay} onChange={(e) => setPay(e.target.value.replace(/\D/g, ""))} />
            </div>
            <div className={`rounded-2xl p-3 text-sm font-extrabold ${commission < 0 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-800"}`}>
              Комиссия нам: {money(commission)}{priceN ? ` (${Math.round(commission * 100 / priceN)}%)` : ""}
            </div>
            <button onClick={copy} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-bold text-neutral-700 shadow-sm">
              <Icon name={copied ? "Check" : "Copy"} size={16} />{copied ? "Скопировано" : "Скопировать расчёт для клиента"}
            </button>

            {done ? (
              <div className="space-y-2 rounded-3xl bg-emerald-600 p-4 text-white">
                <div className="text-lg font-extrabold">Заказ №{done} создан и отправлен водителям</div>
                <div className="text-sm opacity-90">Водители видят: {money(priceN)}, на руки {money(payN)}.</div>
                <button onClick={reset} className="w-full rounded-2xl bg-white py-3 font-extrabold text-emerald-700">Новый расчёт</button>
              </div>
            ) : (
              <div className="space-y-2 rounded-3xl bg-white p-4 shadow-sm">
                <div className="font-extrabold">Оформить заказ</div>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Телефон клиента" type="tel" inputMode="tel" value={phone} onFocus={() => !phone && setPhone("+7")} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="+7 (___) ___-__-__" />
                  <Field label="Имя" value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван" />
                </div>
                <Field label="Когда (пусто — сейчас)" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
                <Field label="Комментарий водителю" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Багаж, дети, точный адрес подачи" maxLength={250} />
                <div className="grid grid-cols-2 gap-2">
                  {([["cash", "Наличными"], ["transfer", "Переводом"]] as const).map(([k, l]) => (
                    <button key={k} onClick={() => setPayMethod(k)} className={`rounded-2xl py-3 text-sm font-extrabold ${payMethod === k ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500"}`}>{l}</button>
                  ))}
                </div>
                <Btn onClick={submit} disabled={!canOrder || busy} className="w-full text-lg">
                  {busy ? "Создаём..." : `Создать заказ · ${money(priceN)}`}
                </Btn>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
