import { useState } from "react";
import { appCall, formatPhone, money, TARIFF_LIST } from "@/lib/appApi";
import AddressSearch, { Place } from "./AddressSearch";
import { Btn, Field } from "./ui";
import Icon from "@/components/ui/icon";

interface DriverOpt { id: number; name: string; callsign: string | null; car_model: string; car_plate: string; online: boolean; busy: boolean; status: string }
interface Quote { distance_km: number; region: string; prices: Record<string, number> }

export default function DispatcherOrderForm({ token, drivers, onDone, onCancel }: {
  token: string; drivers: DriverOpt[]; onDone: (id: number) => void; onCancel: () => void;
}) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [fromText, setFromText] = useState("");
  const [toText, setToText] = useState("");
  const [from, setFrom] = useState<Place | null>(null);
  const [to, setTo] = useState<Place | null>(null);
  const [tariff, setTariff] = useState("standard");
  const [price, setPrice] = useState("");
  const [passengers, setPassengers] = useState("1");
  const [luggage, setLuggage] = useState("");
  const [comment, setComment] = useState("");
  const [pay, setPay] = useState<"cash" | "transfer">("cash");
  const [when, setWhen] = useState("");
  const [driverId, setDriverId] = useState<number | "">("");
  const [charge, setCharge] = useState(false);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const calc = async (a: Place | null, b: Place | null, t = tariff) => {
    if (!a || !b) return;
    try {
      const q = await appCall<Quote>("disp_quote", { from_lat: a.lat, from_lng: a.lng, to_lat: b.lat, to_lng: b.lng }, token);
      setQuote(q);
      if (!price && q.prices[t]) setPrice(String(q.prices[t]));
    } catch { setQuote(null); }
  };

  const submit = async () => {
    setBusy(true);
    setErr("");
    try {
      const r = await appCall<{ id: number }>("disp_create_order", {
        phone, name, from_text: fromText, to_text: toText, from_lat: from?.lat, from_lng: from?.lng, to_lat: to?.lat, to_lng: to?.lng,
        from_city: from?.city, tariff, price: Number(price), passengers: Number(passengers) || null, luggage, comment, pay_method: pay,
        scheduled_at: when ? new Date(when).toISOString() : null, distance_km: quote?.distance_km, region: quote?.region,
        driver_id: driverId || null, charge,
      }, token);
      onDone(r.id);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const ok = phone.replace(/\D/g, "").length === 11 && fromText.trim() && toText.trim() && Number(price) >= 100;
  const pool = drivers.filter((d) => d.status === "approved").sort((a, b) => Number(b.online && !b.busy) - Number(a.online && !a.busy));

  return (
    <div className="space-y-3 rounded-3xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-extrabold">Новый заказ</h3>
        <button onClick={onCancel} aria-label="Закрыть" className="p-1 text-neutral-400"><Icon name="X" size={22} /></button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Field label="Телефон клиента" type="tel" inputMode="tel" value={phone} onFocus={() => !phone && setPhone("+7")} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="+7 (___) ___-__-__" />
        <Field label="Имя" value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван" />
      </div>

      <div>
        <span className="mb-1 block text-xs font-semibold text-neutral-500">Откуда (адрес подачи)</span>
        <AddressSearch token={token} action="disp_suggest" value={fromText} onChange={(v) => { setFromText(v); setFrom(null); }} onPick={(p) => { setFrom(p); calc(p, to); }} placeholder="Город, улица, дом" />
      </div>
      <div>
        <span className="mb-1 block text-xs font-semibold text-neutral-500">Куда</span>
        <AddressSearch token={token} action="disp_suggest" value={toText} onChange={(v) => { setToText(v); setTo(null); }} onPick={(p) => { setTo(p); calc(from, p); }} placeholder="Город, адрес" />
      </div>
      {quote && (
        <div className="rounded-2xl bg-neutral-50 p-3 text-sm">
          <b>{quote.distance_km} км</b>{quote.region === "new" ? " · новые территории" : ""} · по тарифу:{" "}
          {TARIFF_LIST.filter((t) => quote.prices[t.id]).map((t) => (
            <button key={t.id} type="button" onClick={() => { setTariff(t.id); setPrice(String(quote.prices[t.id])); }} className="mr-2 font-bold text-sky-700 underline">{t.name} {money(quote.prices[t.id])}</button>
          ))}
        </div>
      )}

      <div>
        <span className="mb-1 block text-xs font-semibold text-neutral-500">Тариф</span>
        <div className="grid grid-cols-4 gap-1.5">
          {TARIFF_LIST.map((t) => (
            <button key={t.id} type="button" onClick={() => setTariff(t.id)}
              className={`rounded-xl py-2.5 text-xs font-extrabold ${tariff === t.id ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500"}`}>{t.name}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Field label="Сумма, ₽" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} placeholder="15000" />
        <Field label="Пассажиров" inputMode="numeric" value={passengers} onChange={(e) => setPassengers(e.target.value.replace(/\D/g, "").slice(0, 2))} />
        <Field label="Багаж" value={luggage} onChange={(e) => setLuggage(e.target.value)} placeholder="2 чемодана" maxLength={120} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {([["cash", "Наличными"], ["transfer", "Переводом"]] as const).map(([k, l]) => (
          <button key={k} type="button" onClick={() => setPay(k)} className={`rounded-2xl py-3 text-sm font-extrabold ${pay === k ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500"}`}>{l}</button>
        ))}
      </div>

      <Field label="Когда (пусто — сейчас)" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
      <Field label="Комментарий для водителя" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Дети, животные, подъезд, документы для КПП" maxLength={300} />

      <div>
        <span className="mb-1 block text-xs font-semibold text-neutral-500">Водитель</span>
        <select value={driverId} onChange={(e) => setDriverId(e.target.value ? Number(e.target.value) : "")}
          className="w-full rounded-2xl bg-neutral-100 px-4 py-3.5 text-[15px] font-semibold text-neutral-900 outline-none">
          <option value="">Отправить всем на линии (кто первый возьмёт)</option>
          {pool.map((d) => (
            <option key={d.id} value={d.id}>{d.callsign ? `[${d.callsign}] ` : ""}{d.name} · {d.car_model} {d.car_plate} · {d.busy ? "на заказе" : d.online ? "свободен" : "не на линии"}</option>
          ))}
        </select>
        {driverId !== "" && (
          <label className="mt-2 flex items-center gap-2 text-sm font-semibold text-neutral-600">
            <input type="checkbox" checked={charge} onChange={(e) => setCharge(e.target.checked)} className="h-4 w-4 accent-neutral-900" />Списать комиссию с баланса водителя
          </label>
        )}
      </div>

      {err && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-600">{err}</p>}
      <Btn onClick={submit} disabled={!ok || busy} className="w-full text-lg">{busy ? "Создаём..." : `Создать заказ${price ? ` на ${money(Number(price))}` : ""}`}</Btn>
    </div>
  );
}
