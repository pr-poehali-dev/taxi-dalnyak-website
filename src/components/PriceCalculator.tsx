import { useState, useMemo, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { searchCities, roadKmBetween } from "@/lib/cityRoute";
import { calcAllPrices, isNewTerritoriesRoute, MIN_PRICE, type TariffPrice } from "@/lib/pricing";
import { DEFAULT_CONTACTS, type Contacts } from "@/lib/contacts";

const GOLD = "#c9a84c";
const GOLD2 = "#e8c96a";

export interface CalcResult {
  from: string;
  to: string;
  km: number;
  tariffs: TariffPrice[];
}

interface Props {
  contacts?: Contacts;
  onLead?: (channel: string) => void;
  onResult?: (r: CalcResult | null) => void;
}

function CityInput({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  icon: string;
}) {
  const [open, setOpen] = useState(false);
  const [touched, setTouched] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const list = useMemo(() => (touched ? searchCities(value, 6) : []), [value, touched]);
  const exact = list.length === 1 && list[0] === value;

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={boxRef}>
      <label
        style={{
          color: "rgba(255,255,255,0.35)",
          fontSize: 10,
          fontWeight: 700,
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          display: "block",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
          <Icon name={icon} size={15} style={{ color: GOLD }} fallback="MapPin" />
        </div>
        <input
          value={value}
          onChange={e => {
            onChange(e.target.value);
            setTouched(true);
            setOpen(true);
          }}
          onFocus={() => { setTouched(true); setOpen(true); }}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-2xl pl-10 pr-9 py-3.5 outline-none transition-colors"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#fff",
            fontSize: 14.5,
            fontWeight: 600,
          }}
        />
        {value && (
          <button
            type="button"
            onClick={() => { onChange(""); setOpen(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
            aria-label="Очистить"
          >
            <Icon name="X" size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
          </button>
        )}
      </div>

      {open && list.length > 0 && !exact && (
        <div
          className="absolute z-30 left-0 right-0 mt-1.5 rounded-2xl overflow-hidden"
          style={{
            background: "#111726",
            border: "1px solid rgba(201,168,76,0.25)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
          }}
        >
          {list.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => { onChange(c); setOpen(false); }}
              className="w-full text-left px-4 py-2.5 flex items-center gap-2.5 transition-colors hover:bg-white/5"
              style={{ color: "rgba(255,255,255,0.8)", fontSize: 13.5, fontWeight: 600 }}
            >
              <Icon name="MapPin" size={12} style={{ color: GOLD, flexShrink: 0 }} />
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PriceCalculator({ contacts = DEFAULT_CONTACTS, onLead, onResult }: Props) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [shown, setShown] = useState(false);

  const result = useMemo(() => {
    const km = roadKmBetween(from, to);
    if (!km) return null;
    const nt = isNewTerritoriesRoute(from, to);
    return { km, nt, tariffs: calcAllPrices(km, nt, from, to) };
  }, [from, to]);

  useEffect(() => {
    if (!onResult) return;
    onResult(shown && result && from !== to ? { from, to, km: result.km, tariffs: result.tariffs } : null);
  }, [shown, result, from, to, onResult]);

  const sameCity = from && to && from === to;
  const tooShort = result && result.km < 200;

  const canCalc = Boolean(roadKmBetween(from, to)) && !sameCity;

  return (
    <div
      className="rounded-3xl p-5"
      style={{
        background: "linear-gradient(135deg,rgba(201,168,76,0.07),rgba(201,168,76,0.02))",
        border: "1px solid rgba(201,168,76,0.22)",
      }}
    >
      <div className="flex items-center gap-2.5 mb-1">
        <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
        <span
          style={{
            fontFamily: "Oswald",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Рассчитать стоимость
        </span>
      </div>
      <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11.5, marginBottom: 12, marginLeft: 14 }}>
        Укажите города — покажем примерную цену по всем классам авто
      </p>

      <div
        className="flex items-start gap-2 rounded-xl px-3.5 py-2.5 mb-4"
        style={{ background: "rgba(201,168,76,0.09)", border: "1px solid rgba(201,168,76,0.28)" }}
      >
        <Icon name="Info" size={13} style={{ color: GOLD, flexShrink: 0, marginTop: 1 }} />
        <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, lineHeight: 1.5 }}>
          Расчёт <span style={{ color: GOLD2, fontWeight: 700 }}>предварительный</span>. Платные дороги
          и мосты оплачиваются отдельно.
        </span>
      </div>

      <div className="space-y-3">
        <CityInput label="Откуда" value={from} onChange={setFrom} placeholder="Например, Москва" icon="Circle" />
        <CityInput label="Куда" value={to} onChange={setTo} placeholder="Например, Воронеж" icon="MapPin" />
      </div>

      {sameCity && (
        <div className="mt-3 rounded-xl px-4 py-3 flex items-center gap-2.5" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)" }}>
          <Icon name="AlertCircle" size={14} style={{ color: "#ef4444", flexShrink: 0 }} />
          <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>Города совпадают — выберите разные</span>
        </div>
      )}

      {!shown && (
        <button
          type="button"
          disabled={!canCalc}
          onClick={() => setShown(true)}
          className="w-full rounded-2xl py-4 mt-4 transition-transform active:scale-[0.98]"
          style={{
            background: canCalc ? `linear-gradient(135deg,${GOLD},${GOLD2})` : "rgba(255,255,255,0.06)",
            cursor: canCalc ? "pointer" : "not-allowed",
          }}
        >
          <span
            style={{
              fontFamily: "Oswald",
              fontSize: 16,
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              color: canCalc ? "#0a0f1e" : "rgba(255,255,255,0.25)",
            }}
          >
            Показать цены
          </span>
        </button>
      )}

      {shown && result && !sameCity && (
        <div className="mt-4">
          <div className="flex items-center justify-center gap-2 mb-3.5">
            <Icon name="Route" size={14} style={{ color: GOLD }} fallback="MapPin" />
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>
              ≈ {result.km.toLocaleString("ru")} км
            </span>
            {result.nt && (
              <span
                className="rounded-full px-2 py-0.5"
                style={{ background: "rgba(201,168,76,0.15)", border: `1px solid rgba(201,168,76,0.3)`, color: GOLD2, fontSize: 9.5, fontWeight: 700, textTransform: "uppercase" }}
              >
                Новые территории
              </span>
            )}
          </div>

          {tooShort && (
            <div className="mb-3 rounded-xl px-4 py-3 flex items-start gap-2.5" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Icon name="Info" size={13} style={{ color: GOLD, flexShrink: 0, marginTop: 1 }} />
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11.5, lineHeight: 1.5 }}>
                Маршрут короче 200 км — уточните возможность поездки у диспетчера.
              </span>
            </div>
          )}

          <div className="space-y-2">
            {result.tariffs.map(t => (
              <div
                key={t.id}
                className="flex items-center justify-between rounded-2xl px-4 py-3.5"
                style={{ background: "rgba(255,255,255,0.035)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-1 h-8 rounded-full" style={{ background: t.color }} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 14, fontWeight: 800, textTransform: "uppercase" }}>
                        {t.name}
                      </span>
                      {t.badge && (
                        <span className="rounded-full px-1.5 py-0.5" style={{ background: `${t.color}22`, color: t.color, fontSize: 8.5, fontWeight: 800, textTransform: "uppercase" }}>
                          {t.badge}
                        </span>
                      )}
                    </div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10.5, marginTop: 1 }}>
                      {t.seats} пасс. · {t.luggage} · {t.rate} ₽/км
                    </div>
                  </div>
                </div>
                <div style={{ fontFamily: "Oswald", color: GOLD2, fontSize: 17, fontWeight: 900, whiteSpace: "nowrap" }}>
                  {t.price.toLocaleString("ru")} ₽
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-3 rounded-2xl p-4"
            style={{ background: "rgba(201,168,76,0.1)", border: `1.5px solid rgba(201,168,76,0.45)` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon name="TriangleAlert" size={15} style={{ color: GOLD2, flexShrink: 0 }} fallback="AlertCircle" />
              <span
                style={{
                  fontFamily: "Oswald",
                  color: GOLD2,
                  fontSize: 13.5,
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                Цена примерная
              </span>
            </div>
            <ul className="space-y-1.5">
              {[
                "Платные дороги и мосты оплачиваются отдельно",
                `Минимальная стоимость поездки — ${MIN_PRICE.toLocaleString("ru")} ₽`,
                "Для точной цены напишите или позвоните диспетчеру",
              ].map(t => (
                <li key={t} className="flex items-start gap-2">
                  <span style={{ color: GOLD, fontSize: 12, lineHeight: 1.5 }}>•</span>
                  <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 12, lineHeight: 1.5, fontWeight: 600 }}>{t}</span>
                </li>
              ))}
            </ul>
          </div>

          <a
            href={contacts.PHONE_HREF}
            onClick={() => onLead?.("phone")}
            className="flex items-center justify-center gap-3 w-full rounded-2xl py-4 mt-3 transition-transform active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}
          >
            <Icon name="PhoneCall" size={19} style={{ color: "#0a0f1e" }} />
            <div className="flex flex-col items-start leading-none">
              <span style={{ fontFamily: "Oswald", fontSize: 15, fontWeight: 900, textTransform: "uppercase", color: "#0a0f1e" }}>
                Уточнить и заказать
              </span>
              <span style={{ fontSize: 10.5, color: "rgba(10,15,30,0.6)", fontWeight: 700, marginTop: 2 }}>
                {contacts.PHONE}
              </span>
            </div>
          </a>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <a
              href={contacts.TG_HREF}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onLead?.("tg")}
              className="flex items-center justify-center gap-2 rounded-2xl py-3 active:scale-95 transition-transform"
              style={{ background: "linear-gradient(135deg,#0e6da8,#1a8fc2)" }}
            >
              <Icon name="Send" size={15} className="text-white" />
              <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 13, fontWeight: 800, textTransform: "uppercase" }}>
                Telegram
              </span>
            </a>
            <a
              href={contacts.MAX_HREF}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onLead?.("max")}
              className="flex items-center justify-center gap-2 rounded-2xl py-3 active:scale-95 transition-transform"
              style={{ background: "linear-gradient(135deg,#003a9e,#0055e5)" }}
            >
              <Icon name="MessageCircle" size={15} className="text-white" />
              <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 13, fontWeight: 800, textTransform: "uppercase" }}>
                MAX
              </span>
            </a>
          </div>

          <button
            type="button"
            onClick={() => { setShown(false); setFrom(""); setTo(""); }}
            className="w-full mt-2 py-2"
            style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, fontWeight: 600 }}
          >
            Рассчитать другой маршрут
          </button>
        </div>
      )}
    </div>
  );
}