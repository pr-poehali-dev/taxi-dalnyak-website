import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";

declare global { interface Window { ym?: (id: number, action: string, goal: string, params?: Record<string, string>) => void; } }

function ymGoal(goal: string) {
  if (typeof window.ym === "function") window.ym(108400932, "reachGoal", goal);
}

const LOGO      = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/3a499542-747a-49d2-808e-4c137548c76e.jpg";
const ROAD_IMG  = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/4f5e5608-a69f-40a5-8422-38fd34df50fa.jpg";
const SOLDIER_IMG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/02d565ef-9c27-491d-a8b0-47b18f6c557a.jpg";
const MAX_LOGO  = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/cf5e3e58-7d83-4d19-8c48-f91922395adf.png";

const REVIEW_1  = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/b0eb5050-a05a-4647-8442-4b839d45161f.jpg";
const REVIEW_2  = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/fedc4281-a106-4024-9369-8a03712c92a3.jpg";
const REVIEW_3  = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/ac322d91-fd27-4c11-b86f-f28e85ec3df0.jpg";

const PHONE      = "+7 (931) 009-81-76";
const PHONE_HREF = "tel:+79310098176";
const VK_HREF    = "https://vk.com/dalnyack";
const MAX_HREF   = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";

const GOLD  = "#c9a84c";
const GOLD2 = "#e8c96a";

const TARIFF_IMGS = {
  standart:    "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/39d043f8-acde-4a27-a69c-ebe03e8bd403.jpg",
  comfort:     "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/238966ba-ee86-4f06-bc36-0872f043ebfb.jpg",
  comfortplus: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/38f8c2aa-ebc6-4a58-bedb-3322efbce272.jpg",
  minivan:     "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/92a14984-9eac-4b0c-aa50-8c49af1c12b7.jpg",
};

const TARIFFS = [
  { id: "standart",    name: "Стандарт",  desc: "Рио · Поло · Солярис",   seats: 4, luggage: "1–2 сумки",    img: TARIFF_IMGS.standart,    badge: "",           color: "#F5A800" },
  { id: "comfort",     name: "Комфорт",   desc: "Хавал Джулиан 2025",     seats: 4, luggage: "2–3 сумки",    img: TARIFF_IMGS.comfort,     badge: "Популярный", color: "#22D3EE" },
  { id: "comfortplus", name: "Комфорт+",  desc: "Toyota Camry 70 кузов",  seats: 4, luggage: "3–4 сумки",    img: TARIFF_IMGS.comfortplus, badge: "Бизнес",     color: "#A78BFA" },
  { id: "minivan",     name: "Минивэн",   desc: "Hyundai Staria 2022",    seats: 7, luggage: "Много багажа", img: TARIFF_IMGS.minivan,     badge: "Группа",     color: "#34D399" },
];

const REVIEWS = [
  {
    name: "Алексей",
    route: "Воронеж – КПП",
    text: "Опаздывал, позвонил — машина была через 40 минут. Доехали чётко, водитель не задавал лишних вопросов. Спал всю дорогу. Рекомендую.",
    img: REVIEW_2,
  },
  {
    name: "Сергей",
    route: "Москва – Ростов",
    text: "Ехал с семьёй, машину назначили заранее. Водитель прибыл вовремя, помог с вещами. Дети спали спокойно — тихая езда, удобно.",
    img: REVIEW_1,
  },
  {
    name: "Андрей",
    route: "Белгород – КПП Донецк",
    text: "Главное — машина приехала. Никаких отмен, никаких переносов. Цена фиксированная, заплатил как договорились. Буду ещё обращаться.",
    img: REVIEW_3,
  },
];

const ROUTES = [
  "Москва – КПП", "Воронеж – КПП", "Белгород – КПП",
  "Ростов – КПП", "Краснодар – КПП", "Курск – КПП",
  "Донецк – Москва", "ДНР – Воронеж", "Луганск – Питер",
  "Запорожье – Москва", "Мариуполь – Краснодар", "ЛНР – Екатеринбург",
];

function calcPrice(km: number): { min: number; max: number } | null {
  if (!km || km <= 0) return null;
  const rate = km <= 300 ? 30 : km <= 600 ? 27 : 26;
  const minP = Math.round(km * rate * 1.15 / 100) * 100;
  return { min: minP, max: Math.round(minP * 1.12 / 100) * 100 };
}

function PriceCalc() {
  const [km, setKm]     = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo]     = useState("");
  const price = useMemo(() => calcPrice(parseInt(km.replace(/\D/g, ""), 10)), [km]);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(201,168,76,0.2)` }}>
      <div className="px-5 pt-4 pb-3 flex items-center gap-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
          <Icon name="Calculator" size={15} style={{ color: "#0a0f1e" }} />
        </div>
        <div>
          <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Рассчитать стоимость</div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>фиксированная цена · без накруток</div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 4 }}>Откуда</label>
            <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Ваш город"
              className="w-full rounded-xl px-3 py-2.5 text-white text-[13px] placeholder-white/20 focus:outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
          </div>
          <div>
            <label style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 4 }}>Куда</label>
            <input value={to} onChange={e => setTo(e.target.value)} placeholder="Направление / КПП"
              className="w-full rounded-xl px-3 py-2.5 text-white text-[13px] placeholder-white/20 focus:outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
          </div>
        </div>
        <div>
          <label style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 4 }}>Расстояние (км)</label>
          <input value={km} onChange={e => setKm(e.target.value.replace(/\D/g, ""))} placeholder="Например, 600 км"
            inputMode="numeric"
            className="w-full rounded-xl px-3 py-2.5 text-white text-[13px] placeholder-white/20 focus:outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
        </div>
        {price ? (
          <div className="rounded-xl px-4 py-3.5" style={{ background: `linear-gradient(135deg,rgba(201,168,76,0.12),rgba(201,168,76,0.05))`, border: `1px solid rgba(201,168,76,0.3)` }}>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Стоимость поездки</div>
            <div style={{ fontFamily: "Oswald", color: GOLD2, fontSize: 30, fontWeight: 900, lineHeight: 1 }}>от {price.min.toLocaleString("ru")} ₽</div>
            <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, marginTop: 5 }}>
              {from && to ? `${from} → ${to} · ` : ""}{km} км · цена фиксирована при заказе
            </div>
          </div>
        ) : (
          <div className="rounded-xl px-4 py-3 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>Укажите расстояние — цена появится сразу</span>
          </div>
        )}
        {price && (
          <a href={PHONE_HREF} onClick={() => ymGoal("kpp_calc_phone")}
            className="flex items-center justify-center gap-2 w-full rounded-xl py-3 font-bold text-[13px] uppercase transition-transform active:scale-[0.97]"
            style={{ fontFamily: "Oswald", background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#0a0f1e", letterSpacing: "0.05em" }}>
            <Icon name="PhoneCall" size={16} /> Позвонить — подтвердить цену
          </a>
        )}
      </div>
    </div>
  );
}

export default function KPP() {
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    document.title = "Такси до КПП — дальние поездки | Такси Дальняк";
    const t = setTimeout(() => setSplash(false), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      {/* СПЛЭШ */}
      <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-500 ${splash ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ background: "#06080f" }}>
        <img src={LOGO} alt="" className="w-20 h-20 rounded-2xl object-cover mb-4" style={{ boxShadow: `0 0 40px rgba(201,168,76,0.35)` }} />
        <div style={{ fontFamily: "Oswald", color: GOLD, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.5em", fontWeight: 700, marginBottom: 2 }}>Такси</div>
        <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: 30, textTransform: "uppercase", fontWeight: 900, lineHeight: 1 }}>Дальняк</div>
        <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, marginTop: 6 }}>Довезём. Точно. В срок.</div>
        <div className="w-28 h-0.5 mt-5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="h-full rounded-full" style={{ background: `linear-gradient(to right,${GOLD},${GOLD2})`, animation: "kppBar 0.9s ease-out forwards" }} />
        </div>
        <style>{`@keyframes kppBar{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>
      </div>

      <div className="min-h-[100dvh] w-full text-white flex flex-col" style={{ background: "#06080f", fontFamily: "Inter, sans-serif" }}>
        <style>{`
          @keyframes ctaKpp{0%,100%{box-shadow:0 4px 28px rgba(201,168,76,0.5),0 0 0 0 rgba(201,168,76,0.2)}50%{box-shadow:0 4px 28px rgba(201,168,76,0.8),0 0 0 14px rgba(201,168,76,0)}}
          .cta-kpp{animation:ctaKpp 2.5s ease-out infinite}
          @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
          .fade-up{animation:fadeUp 0.65s ease-out both}
          .fade-up-2{animation:fadeUp 0.65s ease-out 0.1s both}
          .fade-up-3{animation:fadeUp 0.65s ease-out 0.2s both}
        `}</style>

        {/* ШАПКА */}
        <header style={{ background: "rgba(6,8,15,0.97)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(201,168,76,0.1)", position: "sticky", top: 0, zIndex: 50 }}>
          <div className="px-4 py-3 flex items-center justify-between max-w-lg mx-auto">
            <a href="/" className="flex items-center gap-3">
              <img src={LOGO} alt="Такси Дальняк" className="w-9 h-9 rounded-xl object-cover" style={{ border: `1.5px solid rgba(201,168,76,0.4)` }} />
              <div>
                <div style={{ fontFamily: "Oswald", color: GOLD, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.4em", fontWeight: 700, lineHeight: 1 }}>Такси</div>
                <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: 16, textTransform: "uppercase", fontWeight: 900, lineHeight: 1, marginTop: 1 }}>Дальняк</div>
              </div>
            </a>
            <div className="flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)" }}>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" style={{ boxShadow: "0 0 6px #4ade80" }} />
              <span style={{ color: "#4ade80", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>На связи 24/7</span>
            </div>
          </div>
        </header>

        {/* HERO — ФОТО ДОРОГИ */}
        <div className="relative overflow-hidden" style={{ minHeight: "55vw", maxHeight: "400px" }}>
          <img src={ROAD_IMG} alt="Дорога ночью" fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: "center 60%" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #06080f 0%, rgba(6,8,15,0.4) 50%, rgba(6,8,15,0.2) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(6,8,15,0.8) 0%, transparent 50%)" }} />

          {/* бейдж */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full px-3 py-1.5"
            style={{ background: "rgba(6,8,15,0.85)", backdropFilter: "blur(8px)", border: `1px solid rgba(201,168,76,0.25)` }}>
            <Icon name="Lock" size={11} style={{ color: GOLD }} />
            <span style={{ color: GOLD, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>Конфиденциально</span>
          </div>

          {/* статы поверх фото */}
          <div className="absolute bottom-4 right-4 flex gap-2">
            {[{ v: "10+", l: "лет" }, { v: "24/7", l: "подача" }].map(s => (
              <div key={s.v} className="text-center rounded-xl px-3 py-2" style={{ background: "rgba(6,8,15,0.8)", backdropFilter: "blur(6px)", border: `1px solid rgba(201,168,76,0.2)` }}>
                <div style={{ fontFamily: "Oswald", color: GOLD2, fontSize: 18, fontWeight: 900, lineHeight: 1 }}>{s.v}</div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 9 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ЗАГОЛОВОК */}
        <div className="px-4 pt-6 pb-2 max-w-lg mx-auto w-full">

          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-4 fade-up"
            style={{ background: "rgba(201,168,76,0.1)", border: `1px solid rgba(201,168,76,0.25)` }}>
            <Icon name="MapPin" size={11} style={{ color: GOLD }} />
            <span style={{ color: GOLD, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em" }}>Дальние поездки · КПП · Новые территории</span>
          </div>

          <h1 style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: "clamp(28px,8vw,48px)", lineHeight: 1.0, textTransform: "uppercase", color: "#fff", letterSpacing: "-0.01em" }} className="fade-up-2">
            Надо доехать{" "}
            <span style={{ color: GOLD }}>до КПП?</span>
            <br />
            <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.75em" }}>Машина точно приедет</span>
          </h1>

          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, lineHeight: 1.7, marginTop: 10, marginBottom: 20 }} className="fade-up-3">
            Без лишних вопросов. Оплата как удобно.
            Водитель прибудет вовремя — даже если срочно.
          </p>
        </div>

        {/* КЛЮЧЕВЫЕ ОБЕЩАНИЯ — 3 карточки */}
        <div className="px-4 pb-6 max-w-lg mx-auto w-full">
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: "Clock",       title: "Приедет",   sub: "Машина не отменится" },
              { icon: "BedDouble",   title: "Спите",     sub: "Тихая спокойная езда" },
              { icon: "Shield",      title: "Тихо",      sub: "Без лишних разговоров" },
            ].map(item => (
              <div key={item.title} className="flex flex-col items-center text-center rounded-2xl px-2 py-4 gap-2"
                style={{ background: "rgba(255,255,255,0.03)", border: `1px solid rgba(201,168,76,0.12)` }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `linear-gradient(135deg,rgba(201,168,76,0.18),rgba(201,168,76,0.06))` }}>
                  <Icon name={item.icon as "Clock"} size={17} style={{ color: GOLD }} />
                </div>
                <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: 14, fontWeight: 800, textTransform: "uppercase", lineHeight: 1 }}>{item.title}</div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 9.5, lineHeight: 1.3 }}>{item.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ФОТО + ТЕКСТ */}
        <div className="px-4 pb-6 max-w-lg mx-auto w-full">
          <div className="rounded-2xl overflow-hidden flex gap-0" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="relative w-[110px] shrink-0">
              <img src={SOLDIER_IMG} alt="Поездка до КПП" loading="lazy"
                className="absolute inset-0 w-full h-full object-cover object-top" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent, rgba(6,8,15,0.3))" }} />
            </div>
            <div className="p-4 flex flex-col justify-center">
              <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: 14, fontWeight: 800, textTransform: "uppercase", marginBottom: 6, letterSpacing: "0.03em" }}>
                Знаем, что важно
              </div>
              <div className="space-y-2">
                {[
                  "Машина приедет точно в назначенное время",
                  "Можно спать — водитель едет молча",
                  "Срочный выезд — найдём машину за час",
                  "Маршрут не разглашается",
                ].map(t => (
                  <div key={t} className="flex items-start gap-2">
                    <Icon name="Check" size={11} style={{ color: GOLD, flexShrink: 0, marginTop: 2 }} />
                    <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11.5, lineHeight: 1.4 }}>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ДЕТАЛИ */}
        <div className="px-4 pb-6 max-w-lg mx-auto w-full">
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: "Banknote",    text: "Наличные / карта",          sub: "Без чека и лишних вопросов" },
              { icon: "UserCheck",   text: "Трезвый водитель",           sub: "Проверенные, надёжные" },
              { icon: "Lock",        text: "Конфиденциально",            sub: "Маршрут только между нами" },
              { icon: "Navigation",  text: "КПП и новые территории",     sub: "Знаем дорогу" },
              { icon: "Zap",         text: "Срочный выезд",              sub: "Машина за 1–2 часа" },
              { icon: "Phone",       text: "Один звонок",                sub: "Диспетчер решит всё" },
            ].map(g => (
              <div key={g.text} className="flex flex-col gap-1.5 rounded-2xl p-3.5"
                style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `rgba(201,168,76,0.12)` }}>
                  <Icon name={g.icon as "Lock"} size={14} style={{ color: GOLD }} />
                </div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 12, lineHeight: 1.3 }}>{g.text}</div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>{g.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* КАЛЬКУЛЯТОР */}
        <div className="px-4 pb-6 max-w-lg mx-auto w-full">
          <PriceCalc />
        </div>

        {/* АВТОПАРК */}
        <div className="px-4 pb-6 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
            <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Выберите авто</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {TARIFFS.map(t => (
              <div key={t.id} className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "1/1.08" }}>
                <img src={t.img} alt={t.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(4,6,14,0.97) 0%,rgba(4,6,14,0.35) 52%,rgba(4,6,14,0.05) 100%)" }} />
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(to right,${t.color},transparent)` }} />
                {t.badge && (
                  <div className="absolute top-2.5 right-2.5">
                    <span style={{ background: `${t.color}20`, color: t.color, border: `1px solid ${t.color}40`, fontSize: 9, fontWeight: 900, textTransform: "uppercase", padding: "2px 7px", borderRadius: 6 }}>{t.badge}</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div style={{ fontFamily: "Oswald", color: t.color, fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1 }}>{t.name}</div>
                  <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, marginTop: 3 }}>{t.desc}</div>
                  <div className="flex items-center gap-3 mt-2">
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 9.5, display: "flex", alignItems: "center", gap: 3 }}>
                      <Icon name="Users" size={9} />{t.seats} пасс.
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 9.5, display: "flex", alignItems: "center", gap: 3 }}>
                      <Icon name="Briefcase" size={9} />{t.luggage}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl px-3 py-2.5 flex items-center gap-2" style={{ background: `rgba(201,168,76,0.07)`, border: `1px solid rgba(201,168,76,0.17)` }}>
            <Icon name="Tag" size={12} style={{ color: GOLD, flexShrink: 0 }} />
            <span style={{ color: GOLD2, fontSize: 11.5, fontWeight: 600 }}>Цена фиксирована при заказе — ничего лишнего</span>
          </div>
        </div>

        {/* МАРШРУТЫ */}
        <div className="px-4 pb-6 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
            <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Направления</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 10.5, marginBottom: 10, fontStyle: "italic" }}>Выезжаем из любого города. Едем в любую точку.</p>
          <div className="flex flex-wrap gap-2">
            {ROUTES.map(r => (
              <span key={r} className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{ background: "rgba(201,168,76,0.07)", border: `1px solid rgba(201,168,76,0.18)`, color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 600 }}>
                <Icon name="MapPin" size={9} style={{ color: GOLD, flexShrink: 0 }} />{r}
              </span>
            ))}
          </div>
        </div>

        {/* ОТЗЫВЫ */}
        <div className="px-4 pb-32 max-w-lg mx-auto w-full">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
            <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Отзывы</span>
          </div>
          <div className="space-y-3">
            {REVIEWS.map(r => (
              <div key={r.name} className="rounded-2xl overflow-hidden flex" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <img src={r.img} alt={r.name} loading="lazy" className="w-[76px] shrink-0 object-cover object-top" />
                <div className="flex flex-col justify-between p-3.5 min-w-0">
                  <div>
                    <div className="flex gap-0.5 mb-1.5">
                      {[1,2,3,4,5].map(i => <Icon key={i} name="Star" size={10} style={{ color: GOLD }} className="fill-[#c9a84c]" />)}
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 11.5, lineHeight: 1.6 }} className="line-clamp-4">{r.text}</p>
                  </div>
                  <div className="mt-2">
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{r.name}</div>
                    <div style={{ color: GOLD, fontSize: 10, marginTop: 1 }}>{r.route}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* STICKY CTA */}
        <div className="sticky bottom-0 px-4 py-3 z-40" style={{ background: "rgba(6,8,15,0.97)", backdropFilter: "blur(12px)", borderTop: `1px solid rgba(201,168,76,0.15)` }}>
          <div className="max-w-lg mx-auto">
            <a href={PHONE_HREF} onClick={() => ymGoal("kpp_phone_click")}
              className="cta-kpp flex items-center justify-center gap-3 w-full rounded-2xl py-4 transition-transform active:scale-[0.98] mb-2.5"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, fontFamily: "Oswald" }}>
              <Icon name="PhoneCall" size={22} style={{ color: "#06080f" }} />
              <div className="flex flex-col items-start leading-none">
                <span style={{ fontSize: "clamp(16px,5vw,20px)", textTransform: "uppercase", letterSpacing: "0.05em", color: "#06080f", fontWeight: 900 }}>Позвонить — назначить машину</span>
                <span style={{ fontSize: 11, color: "rgba(6,8,15,0.6)", fontWeight: 700, marginTop: 2 }}>{PHONE}</span>
              </div>
            </a>
            <div className="grid grid-cols-2 gap-2">
              <a href={VK_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("kpp_vk_click")}
                className="flex items-center justify-center gap-2 rounded-2xl py-3.5 active:scale-95 transition-transform"
                style={{ fontFamily: "Oswald", background: "linear-gradient(135deg,#1a3a6b,#2456a4)", color: "#fff", fontWeight: 800, fontSize: "clamp(12px,3.5vw,15px)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <Icon name="Users" size={17} /> ВКонтакте
              </a>
              <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("kpp_max_click")}
                className="flex items-center justify-center gap-2 rounded-2xl py-3.5 active:scale-95 transition-transform"
                style={{ fontFamily: "Oswald", background: "linear-gradient(135deg,#003a9e,#0055e5)", color: "#fff", fontWeight: 800, fontSize: "clamp(12px,3.5vw,15px)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                <img src={MAX_LOGO} alt="MAX" className="w-5 h-5 rounded-full object-cover" /> МАКС
              </a>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
