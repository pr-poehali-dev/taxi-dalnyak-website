import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const PHONE_HREF = "tel:+79956455125";
const TG_HREF    = "https://t.me/Mezhgorod1816";

function ymGoal(goal: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).ym?.(98584604, "reachGoal", goal);
}

function calcPrice(km: number) {
  if (!km || km <= 0) return null;
  const rate = km <= 200 ? 30 : km <= 500 ? 27 : 26;
  return Math.round(km * rate * 1.15 / 100) * 100;
}

export default function Calc() {
  const navigate = useNavigate();
  const [km, setKm]   = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo]   = useState("");

  const price = useMemo(() => calcPrice(parseInt(km, 10)), [km]);

  const tgMsg = price
    ? encodeURIComponent(`Хочу заказать такси${from ? ` из ${from}` : ""}${to ? ` в ${to}` : ""}, ~${km} км. По расчёту от ${price.toLocaleString("ru")} ₽`)
    : encodeURIComponent("Хочу заказать межгородное такси");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f5f4f0" }}>
      <div className="max-w-sm mx-auto w-full px-4 pt-6 pb-10">

        {/* шапка */}
        <button onClick={() => navigate("/")} className="flex items-center gap-2 mb-6 text-gray-400 active:text-gray-600 transition-colors">
          <Icon name="ChevronLeft" size={18} />
          <span className="text-[13px] font-semibold">Назад</span>
        </button>

        <div className="flex items-center gap-2 mb-5">
          <Icon name="Calculator" size={18} className="text-amber-500" />
          <h1 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 22, color: "#1a1a1a", textTransform: "uppercase" }}>
            Калькулятор стоимости
          </h1>
        </div>

        <div className="rounded-2xl overflow-hidden mb-4 shadow-sm" style={{ background: "#fff", border: "1px solid #e8e6e0" }}>
          <div className="px-4 pt-4 pb-4 space-y-3">

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Откуда</label>
                <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Москва"
                  className="w-full rounded-xl px-3 py-2.5 text-gray-800 text-[14px] placeholder-gray-300 focus:outline-none"
                  style={{ background: "#f9f8f6", border: "1px solid #e8e6e0" }} />
              </div>
              <div>
                <label className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Куда</label>
                <input value={to} onChange={e => setTo(e.target.value)} placeholder="Краснодар"
                  className="w-full rounded-xl px-3 py-2.5 text-gray-800 text-[14px] placeholder-gray-300 focus:outline-none"
                  style={{ background: "#f9f8f6", border: "1px solid #e8e6e0" }} />
              </div>
            </div>

            <div>
              <label className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Расстояние (км)</label>
              <input value={km} onChange={e => setKm(e.target.value.replace(/\D/g, ""))} placeholder="Например, 350" inputMode="numeric"
                className="w-full rounded-xl px-3 py-2.5 text-gray-800 text-[14px] placeholder-gray-300 focus:outline-none"
                style={{ background: "#f9f8f6", border: "1px solid #e8e6e0" }} />
              <p className="text-gray-400 text-[10px] mt-1">Расстояние по трассе можно посмотреть в Яндекс.Картах</p>
            </div>

            {price ? (
              <div className="rounded-xl px-4 py-4" style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.28)" }}>
                <div className="text-gray-400 text-[10px] font-bold uppercase tracking-wider mb-1">Стоимость поездки</div>
                <div style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 32, color: "#f59e0b" }}>
                  от {price.toLocaleString("ru")} ₽
                </div>
                <div className="text-gray-400 text-[11px] mt-1">
                  {from && to ? `${from} → ${to} · ` : ""}{km} км · фиксированная цена
                </div>
              </div>
            ) : (
              <div className="rounded-xl px-4 py-4 text-center text-gray-400 text-[13px]" style={{ background: "#f9f8f6", border: "1px solid #e8e6e0" }}>
                Введите расстояние — цена появится сразу
              </div>
            )}

            {/* преимущества вместо формулы */}
            <div className="rounded-xl px-3 py-3 space-y-2" style={{ background: "#f9f8f6", border: "1px solid #e8e6e0" }}>
              {[
                { icon: "BadgeCheck", text: "Точную цену назовём заранее при заказе" },
                { icon: "Route",      text: "Подача в любую точку города" },
                { icon: "Clock",      text: "Работаем круглосуточно, без выходных" },
              ].map(a => (
                <div key={a.text} className="flex items-center gap-2.5">
                  <Icon name={a.icon as "BadgeCheck"} size={14} className="text-amber-500 shrink-0" />
                  <span className="text-gray-500 text-[12px]">{a.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {price && (
          <div className="grid grid-cols-2 gap-3">
            <a href={`${TG_HREF}?text=${tgMsg}`} target="_blank" rel="noopener noreferrer"
              onClick={() => ymGoal("calc_tg")}
              className="flex items-center justify-center gap-2 rounded-2xl py-4 text-white font-bold uppercase active:scale-[0.97] transition-transform"
              style={{ fontFamily: "Oswald", fontSize: 15, background: "#1a8abf" }}>
              <Icon name="Send" size={16} /> Telegram
            </a>
            <a href={PHONE_HREF} onClick={() => ymGoal("calc_phone")}
              className="flex items-center justify-center gap-2 rounded-2xl py-4 text-white font-bold uppercase active:scale-[0.97] transition-transform"
              style={{ fontFamily: "Oswald", fontSize: 15, background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
              <Icon name="Phone" size={16} /> Позвонить
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
