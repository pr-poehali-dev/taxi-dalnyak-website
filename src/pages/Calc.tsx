import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const PHONE_HREF = "tel:+79956455125";
const VK_HREF    = "https://vk.com/dalnyack";
const MAX_HREF   = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";
const MAX_LOGO   = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/cf5e3e58-7d83-4d19-8c48-f91922395adf.png";

const NAVY  = "#0a0f1e";
const CARD  = "#131b2e";
const GOLD  = "#c9a84c";
const GOLD2 = "#e8c96a";
const BORDER = "rgba(201,168,76,0.18)";

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
  const [km, setKm]     = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo]     = useState("");

  const price = useMemo(() => calcPrice(parseInt(km, 10)), [km]);

  const tgMsg = price
    ? encodeURIComponent(`Хочу заказать такси${from ? ` из ${from}` : ""}${to ? ` в ${to}` : ""}, ~${km} км. По расчёту от ${price.toLocaleString("ru")} ₽`)
    : encodeURIComponent("Хочу заказать межгородное такси");

  return (
    <div className="min-h-screen flex flex-col" style={{ background: NAVY, fontFamily: "Inter, sans-serif" }}>

      {/* ХЕДЕР */}
      <div className="max-w-sm mx-auto w-full px-4 pt-5 pb-28">
        <button onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-6 active:opacity-60 transition-opacity"
          style={{ color: "rgba(255,255,255,0.4)" }}>
          <Icon name="ChevronLeft" size={18} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Назад</span>
        </button>

        {/* заголовок */}
        <div className="mb-6">
          <div style={{ color: GOLD, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em" }} className="mb-2">
            Стоимость поездки
          </div>
          <h1 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 28, color: "#fff", textTransform: "uppercase" }}>
            Калькулятор
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>
            Введите маршрут — получите ориентировочную стоимость
          </p>
        </div>

        {/* форма */}
        <div className="rounded-2xl overflow-hidden mb-4" style={{ background: CARD, border: BORDER }}>
          <div className="px-4 pt-5 pb-5 space-y-4">

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Откуда", val: from, set: setFrom, ph: "Москва" },
                { label: "Куда",   val: to,   set: setTo,   ph: "Краснодар" },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}
                    className="block mb-1.5">{f.label}</label>
                  <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                    className="w-full rounded-xl px-3 py-3 focus:outline-none transition-colors"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 14 }}
                    onFocus={e => e.currentTarget.style.borderColor = GOLD}
                    onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
                </div>
              ))}
            </div>

            <div>
              <label style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}
                className="block mb-1.5">Расстояние по трассе (км)</label>
              <input value={km} onChange={e => setKm(e.target.value.replace(/\D/g, ""))}
                placeholder="Например, 450" inputMode="numeric"
                className="w-full rounded-xl px-3 py-3 focus:outline-none transition-colors"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: 14 }}
                onFocus={e => e.currentTarget.style.borderColor = GOLD}
                onBlur={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"} />
              <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, marginTop: 5 }}>
                Расстояние по трассе — в Яндекс.Картах или 2ГИС
              </p>
            </div>

            {/* результат */}
            {price ? (
              <div className="rounded-xl px-4 py-4" style={{ background: `linear-gradient(135deg, rgba(201,168,76,0.12), rgba(201,168,76,0.06))`, border: `1px solid rgba(201,168,76,0.35)` }}>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 6 }}>
                  Стоимость поездки от
                </div>
                <div style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 40, color: GOLD, lineHeight: 1 }}>
                  {price.toLocaleString("ru")} ₽
                </div>
                {(from || to) && (
                  <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 6 }}>
                    {from && to ? `${from} → ${to}` : from || to} · {km} км
                  </div>
                )}
                <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, marginTop: 3 }}>
                  Точную цену назовём при заказе
                </div>
              </div>
            ) : (
              <div className="rounded-xl px-4 py-5 text-center" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Icon name="Calculator" size={28} style={{ color: "rgba(255,255,255,0.12)", margin: "0 auto 8px" }} />
                <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
                  Введите расстояние — цена появится сразу
                </div>
              </div>
            )}

            {/* преимущества */}
            <div className="space-y-2 pt-1">
              {[
                { icon: "BadgeCheck", text: "Точную цену называем до поездки" },
                { icon: "Route",      text: "Подача в любую точку города" },
                { icon: "Clock",      text: "Работаем 24/7, без выходных" },
              ].map(a => (
                <div key={a.text} className="flex items-center gap-2.5">
                  <Icon name={a.icon as "BadgeCheck"} size={14} style={{ color: GOLD, flexShrink: 0 }} />
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>{a.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* кнопки заказа */}
        <div className="space-y-3">
          <a href={PHONE_HREF} onClick={() => ymGoal("calc_phone")}
            className="flex items-center justify-center gap-3 w-full rounded-2xl py-4 active:scale-[0.97] transition-transform"
            style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow: "0 4px 20px rgba(201,168,76,0.4)" }}>
            <Icon name="Phone" size={18} style={{ color: NAVY }} />
            <span style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 17, color: NAVY, textTransform: "uppercase" }}>
              {price ? `Заказать за ${price.toLocaleString("ru")} ₽` : "Позвонить диспетчеру"}
            </span>
          </a>
          <div className="grid grid-cols-2 gap-3">
            <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("calc_max")}
              className="flex items-center justify-center gap-2 rounded-2xl py-3 active:scale-[0.97] transition-transform"
              style={{ background: "linear-gradient(135deg,#001a3d,#003080)", border: "1px solid rgba(0,80,200,0.4)" }}>
              <img src={MAX_LOGO} alt="MAX" className="h-5 object-contain" />
              <span style={{ fontFamily: "Oswald", fontSize: 13, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>MAX</span>
            </a>
            <a href={VK_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("calc_vk")}
              className="flex items-center justify-center gap-2 rounded-2xl py-3 active:scale-[0.97] transition-transform"
              style={{ background: "linear-gradient(135deg,#1a3a6b,#2456a4)", border: "1px solid rgba(36,86,164,0.5)" }}>
              <Icon name="Users" size={15} className="text-white" />
              <span style={{ fontFamily: "Oswald", fontSize: 13, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>ВКонтакте</span>
            </a>
          </div>
        </div>
      </div>

      {/* нижняя панель */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-2"
        style={{ background: `linear-gradient(to top, ${NAVY} 65%, transparent)` }}>
        <div className="max-w-sm mx-auto">
          <a href={PHONE_HREF} onClick={() => ymGoal("calc_bottom_phone")}
            className="flex items-center justify-center gap-2 w-full rounded-2xl py-4 active:scale-[0.97] transition-transform"
            style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow: "0 4px 20px rgba(201,168,76,0.4)" }}>
            <Icon name="Phone" size={18} style={{ color: NAVY }} />
            <span style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 17, color: NAVY, textTransform: "uppercase" }}>Позвонить диспетчеру</span>
          </a>
        </div>
      </div>
    </div>
  );
}