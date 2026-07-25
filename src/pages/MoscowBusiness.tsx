import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";

declare global { interface Window { ym?: (id: number, action: string, goal: string, params?: Record<string, string>) => void; } }

function ymGoal(goal: string) {
  if (typeof window.ym === "function") window.ym(108400932, "reachGoal", goal);
}

const LOGO      = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/3a499542-747a-49d2-808e-4c137548c76e.jpg";
const MAX_LOGO  = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/cf5e3e58-7d83-4d19-8c48-f91922395adf.png";
const ECLASS    = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/13086e99-0824-48d3-b5a1-0a5ad3f5d7a0.jpg";
const VIANO     = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/e5b058ff-ade7-469a-8bcc-784862384325.jpg";

const PHONE      = "+7 (931) 009-81-76";
const PHONE_HREF = "tel:+79310098176";
const VK_HREF    = "https://vk.com/dalnyack";
const TG_HREF    = "https://t.me/Mezhgorod1816";
const MAX_HREF   = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";

const GOLD  = "#c9a84c";
const GOLD2 = "#e8c96a";
const NAVY  = "#07080f";
const CARD  = "#0e1120";

const CARS = [
  {
    img: ECLASS,
    name: "Mercedes E-Class",
    year: "от 2015 г.",
    seats: "3 пассажира",
    desc: "Представительский седан. Кожаный салон, климат-контроль, тишина в дороге.",
  },
  {
    img: VIANO,
    name: "Mercedes Viano / V-Class",
    year: "от 2016 г.",
    seats: "до 7 пассажиров",
    desc: "Комфортный минивэн для группы или семьи. Просторно, тихо, вежливо.",
  },
];

const SERVICES = [
  { icon: "Shirt",        title: "Водитель в костюме",     desc: "Опрятный вид, вежливость, полная конфиденциальность поездки" },
  { icon: "DoorOpen",     title: "Открывает дверь",        desc: "Встречает у подъезда, помогает сесть — классический шофёрский сервис" },
  { icon: "Droplets",     title: "Вода в салоне",          desc: "Охлаждённая вода для каждого пассажира, всегда в наличии" },
  { icon: "Gauge",        title: "Спокойная езда",         desc: "Без резких манёвров, без торопливости — комфорт дороже минуты" },
  { icon: "Luggage",      title: "Помощь с багажом",       desc: "Водитель загружает и выгружает багаж самостоятельно" },
  { icon: "PlaneLanding", title: "Встреча в аэропорту",    desc: "С именной табличкой у выхода из зала прилёта" },
];

const ROUTES = [
  "Москва – Воронеж", "Москва – Белгород", "Москва – Курск",
  "Москва – Тула", "Москва – Рязань", "Москва – Тверь",
  "Москва – Нижний Новгород", "Москва – Ярославль", "Москва – Смоленск",
  "Москва – Калуга", "Москва – Орёл", "Москва – Брянск",
  "Подмосковье – Воронеж", "Подмосковье – Белгород", "Москва – Казань", "Москва – Липецк",
];

export default function MoscowBusiness() {
  const [scrolled, setScrolled]   = useState(false);
  const [pulse, setPulse]         = useState(true);
  const heroRef                   = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    const t = setInterval(() => setPulse(p => !p), 1200);
    return () => { window.removeEventListener("scroll", onScroll); clearInterval(t); };
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: NAVY, fontFamily: "Inter, sans-serif" }}>

      {/* ══ HERO ══ */}
      <div ref={heroRef} className="relative w-full overflow-hidden" style={{ minHeight: "100svh" }}>
        <img src={ECLASS} alt="Mercedes бизнес-класс из Москвы"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 40%", transform: "scale(1.05)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg,rgba(7,8,15,0.92) 0%,rgba(7,8,15,0.45) 40%,rgba(7,8,15,0.95) 100%)" }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom,rgba(7,8,15,0) 55%,${NAVY} 100%)` }} />

        {/* Хедер */}
        <div className="relative z-20">
          <div className={`transition-all duration-300 ${scrolled ? "py-2 shadow-2xl" : "py-4"}`}
            style={{ background: scrolled ? "rgba(7,8,15,0.95)" : "transparent", backdropFilter: scrolled ? "blur(12px)" : "none" }}>
            <div className="max-w-5xl mx-auto px-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={LOGO} alt="" className="w-10 h-10 rounded-xl object-cover"
                  style={{ border: `1.5px solid ${GOLD}`, boxShadow: `0 0 12px rgba(201,168,76,0.3)` }} />
                <div>
                  <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 15, color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Такси Дальняк
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full transition-opacity duration-700 ${pulse ? "opacity-100" : "opacity-20"}`}
                      style={{ background: "#4ade80" }} />
                    <span style={{ color: "#4ade80", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>Алексей на связи</span>
                  </div>
                </div>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Диспетчер Алексей</div>
                  <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 19, color: "#fff" }}>{PHONE}</div>
                </div>
                <a href={PHONE_HREF} onClick={() => ymGoal("mb_header_phone")}
                  className="flex items-center gap-2 rounded-xl px-5 py-3 transition-transform hover:scale-105"
                  style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                  <Icon name="Phone" size={15} style={{ color: NAVY }} />
                  <span style={{ fontFamily: "Oswald", fontSize: 14, color: NAVY, fontWeight: 800, textTransform: "uppercase" }}>Позвонить</span>
                </a>
              </div>
              <a href={PHONE_HREF} onClick={() => ymGoal("mb_header_phone")}
                className="md:hidden flex items-center gap-1.5 rounded-xl px-3 py-2"
                style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                <Icon name="Phone" size={13} style={{ color: NAVY }} />
                <span style={{ fontFamily: "Oswald", fontSize: 12, color: NAVY, fontWeight: 800, textTransform: "uppercase" }}>Звонок</span>
              </a>
            </div>
          </div>
        </div>

        {/* Hero контент */}
        <div className="relative z-10 max-w-5xl mx-auto px-5 flex flex-col" style={{ minHeight: "calc(100svh - 68px)", paddingTop: 24 }}>

          {/* Бейдж */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 self-start"
            style={{ background: "rgba(201,168,76,0.1)", border: `1px solid rgba(201,168,76,0.3)` }}>
            <Icon name="Star" size={13} style={{ color: GOLD }} />
            <span style={{ color: GOLD2, fontSize: 12, fontWeight: 700 }}>Бизнес-класс · Москва и МО</span>
          </div>

          {/* Заголовок */}
          <div className="flex-1 flex flex-col justify-center pb-16">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-px w-10" style={{ background: `linear-gradient(to right,${GOLD},transparent)` }} />
              <span style={{ color: GOLD, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em" }}>
                Межгород · С 2014 года
              </span>
            </div>

            <h1 style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: "clamp(30px,5vw,64px)", lineHeight: 0.95, color: "#fff", textTransform: "uppercase", letterSpacing: "-0.01em", marginBottom: 24 }}>
              Заказать бизнес-класс<br />
              с водителем из<br />
              Москвы<br />
              <span style={{ color: GOLD }}>и Подмосковья</span>
            </h1>

            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "clamp(14px,2vw,17px)", lineHeight: 1.65, maxWidth: 520, marginBottom: 32 }}>
              Межгородние поездки на представительских автомобилях не старше 10 лет.
              Водитель Алексей лично подберёт автомобиль под ваш запрос —
              от 100 ₽/км, цена фиксируется до выезда.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <a href={PHONE_HREF} onClick={() => ymGoal("mb_hero_phone")}
                className="flex items-center justify-center gap-3 rounded-2xl px-8 py-4 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow: `0 4px 28px rgba(201,168,76,0.45)` }}>
                <Icon name="Phone" size={20} style={{ color: NAVY }} />
                <div className="flex flex-col items-start leading-none">
                  <span style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 18, color: NAVY, textTransform: "uppercase" }}>Позвонить Алексею</span>
                  <span style={{ fontSize: 11, color: "rgba(7,8,15,0.55)", fontWeight: 700, marginTop: 2 }}>{PHONE}</span>
                </div>
              </a>
              <a href={TG_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("mb_hero_tg")}
                className="flex items-center justify-center gap-2 rounded-2xl px-6 py-4 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg,#0e6da8,#1a8fc2)", boxShadow: "0 4px 20px rgba(14,109,168,0.35)" }}>
                <Icon name="Send" size={18} className="text-white" />
                <span style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 16, color: "#fff", textTransform: "uppercase" }}>Написать в Telegram</span>
              </a>
            </div>

            {/* Преимущества в одну строку */}
            <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6">
              {["от 100 ₽/км", "Цена до выезда", "Авто не старше 10 лет", "Встреча с табличкой"].map(t => (
                <div key={t} className="flex items-center gap-1.5">
                  <Icon name="CheckCircle" size={13} style={{ color: GOLD }} />
                  <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: 600 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══ ДИСПЕТЧЕР АЛЕКСЕЙ ══ */}
      <div className="px-5 py-10 max-w-5xl mx-auto w-full">
        <div className="rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start"
          style={{ background: CARD, border: `1px solid rgba(201,168,76,0.2)`, boxShadow: `0 0 40px rgba(201,168,76,0.06)` }}>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
              <Icon name="UserCheck" size={28} style={{ color: NAVY }} />
            </div>
            <div>
              <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 20, color: "#fff", textTransform: "uppercase" }}>Алексей — диспетчер</div>
              <div style={{ color: GOLD, fontSize: 12, fontWeight: 700, marginTop: 2 }}>Лично помогает с подбором автомобиля</div>
            </div>
          </div>
          <div className="flex-1">
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, lineHeight: 1.75 }}>
              Алексей работает с клиентами лично. Расскажите сколько вас человек, есть ли багаж, нужна ли встреча в аэропорту — он подберёт автомобиль именно под вашу поездку и назовёт точную стоимость до рубля. Никаких сюрпризов в дороге.
            </p>
            <a href={PHONE_HREF} onClick={() => ymGoal("mb_alexey_phone")}
              className="inline-flex items-center gap-2 mt-4 rounded-xl px-5 py-3 transition-transform hover:scale-105"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
              <Icon name="Phone" size={15} style={{ color: NAVY }} />
              <span style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 14, color: NAVY, textTransform: "uppercase" }}>Позвонить Алексею</span>
            </a>
          </div>
        </div>
      </div>

      {/* ══ АВТОМОБИЛИ ══ */}
      <div className="px-5 pb-10 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
          <h2 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: "clamp(18px,3vw,24px)", color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Автомобиль под ваш запрос
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CARS.map(car => (
            <div key={car.name} className="rounded-3xl overflow-hidden"
              style={{ background: CARD, border: `1px solid rgba(201,168,76,0.15)` }}>
              <div className="relative overflow-hidden" style={{ height: 220 }}>
                <img src={car.img} alt={car.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(14,17,32,0.9) 0%,transparent 60%)" }} />
                <div className="absolute bottom-0 left-0 right-0 px-5 pb-4">
                  <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 20, color: "#fff", textTransform: "uppercase" }}>{car.name}</div>
                  <div className="flex gap-3 mt-1">
                    <span className="flex items-center gap-1" style={{ color: GOLD, fontSize: 11, fontWeight: 700 }}>
                      <Icon name="Calendar" size={11} style={{ color: GOLD }} /> {car.year}
                    </span>
                    <span className="flex items-center gap-1" style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, fontWeight: 600 }}>
                      <Icon name="Users" size={11} style={{ color: "rgba(255,255,255,0.5)" }} /> {car.seats}
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-5 py-4">
                <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.65 }}>{car.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-2xl px-5 py-4 flex items-start gap-3"
          style={{ background: "rgba(201,168,76,0.06)", border: `1px solid rgba(201,168,76,0.15)` }}>
          <Icon name="Info" size={16} style={{ color: GOLD, flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, lineHeight: 1.6 }}>
            Алексей подберёт автомобиль под ваши пожелания — нужен конкретный класс, цвет или количество мест. Просто скажите при звонке.
          </p>
        </div>
      </div>

      {/* ══ СЕРВИС ══ */}
      <div className="px-5 pb-10 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
          <h2 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: "clamp(18px,3vw,24px)", color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Что входит в поездку
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {SERVICES.map(s => (
            <div key={s.title} className="rounded-2xl p-5"
              style={{ background: CARD, border: `1px solid rgba(255,255,255,0.06)` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `rgba(201,168,76,0.12)` }}>
                <Icon name={s.icon as "Star"} size={18} style={{ color: GOLD }} />
              </div>
              <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 15, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                {s.title}
              </div>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ ЦЕНА ══ */}
      <div className="px-5 pb-10 max-w-5xl mx-auto w-full">
        <div className="rounded-3xl p-7 md:p-10 text-center"
          style={{ background: `linear-gradient(135deg,rgba(201,168,76,0.12),rgba(201,168,76,0.04))`, border: `1px solid rgba(201,168,76,0.25)` }}>
          <Icon name="BadgeRuble" size={36} style={{ color: GOLD, marginBottom: 12 }} />
          <h2 style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: "clamp(22px,4vw,36px)", color: "#fff", textTransform: "uppercase", marginBottom: 8 }}>
            Стоимость от 100 ₽/км
          </h2>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, lineHeight: 1.7, maxWidth: 500, margin: "0 auto 24px" }}>
            Точная цена рассчитывается заранее — до вашего отъезда. Никаких счётчиков, пробок и доплат в дороге. Вы знаете сумму до копейки ещё при бронировании.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8 max-w-sm mx-auto">
            {[{ v: "от 100 ₽", l: "за километр" }, { v: "0 ₽", l: "скрытых доплат" }, { v: "10 лет", l: "макс. возраст авто" }].map(s => (
              <div key={s.l}>
                <div style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: "clamp(18px,3vw,26px)", color: GOLD }}>{s.v}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
          <a href={PHONE_HREF} onClick={() => ymGoal("mb_price_phone")}
            className="inline-flex items-center gap-3 rounded-2xl px-8 py-4 transition-transform hover:scale-105 active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow: `0 4px 24px rgba(201,168,76,0.4)` }}>
            <Icon name="Phone" size={18} style={{ color: NAVY }} />
            <span style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 18, color: NAVY, textTransform: "uppercase" }}>Узнать стоимость</span>
          </a>
        </div>
      </div>

      {/* ══ МАРШРУТЫ ══ */}
      <div className="px-5 pb-10 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
          <h2 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: "clamp(18px,3vw,24px)", color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Популярные маршруты
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {ROUTES.map(r => (
            <a key={r} href={PHONE_HREF} onClick={() => ymGoal("mb_route_click")}
              className="flex items-center gap-2 rounded-xl px-3 py-3 transition-all hover:border-yellow-500/40 active:scale-95"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <Icon name="MapPin" size={12} style={{ color: GOLD, flexShrink: 0 }} />
              <span style={{ color: "rgba(255,255,255,0.65)", fontSize: 12, fontWeight: 600, lineHeight: 1.3 }}>{r}</span>
            </a>
          ))}
        </div>
      </div>

      {/* ══ ГАРАНТИИ ══ */}
      <div className="px-5 pb-12 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: "BadgeCheck", v: "С 2014",   l: "года на рынке" },
            { icon: "Star",       v: "4.9",       l: "рейтинг" },
            { icon: "Car",        v: "50 000+",   l: "поездок" },
            { icon: "Clock",      v: "24/7",      l: "диспетчер" },
          ].map(s => (
            <div key={s.l} className="rounded-2xl p-4 text-center"
              style={{ background: CARD, border: "1px solid rgba(255,255,255,0.06)" }}>
              <Icon name={s.icon as "Star"} size={22} style={{ color: GOLD, margin: "0 auto 8px" }} />
              <div style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 24, color: "#fff" }}>{s.v}</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══ STICKY CTA МОБИЛКА ══ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-3"
        style={{ background: `linear-gradient(to top,${NAVY} 65%,transparent)` }}>
        <a href={PHONE_HREF} onClick={() => ymGoal("mb_bottom_phone")}
          className="flex items-center justify-center gap-3 w-full rounded-2xl py-4 mb-2.5 active:scale-[0.97] transition-transform"
          style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow: "0 4px 24px rgba(201,168,76,0.5)" }}>
          <Icon name="Phone" size={18} style={{ color: NAVY }} />
          <div style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 18, color: NAVY, textTransform: "uppercase" }}>Позвонить Алексею</div>
        </a>
        <div className="grid grid-cols-3 gap-2">
          <a href={TG_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("mb_bottom_tg")}
            className="flex items-center justify-center gap-1.5 rounded-2xl py-3 active:scale-[0.97] transition-transform"
            style={{ background: "linear-gradient(135deg,#0e6da8,#1a8fc2)", border: "1px solid rgba(26,143,194,0.5)" }}>
            <Icon name="Send" size={15} className="text-white" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>TG</span>
          </a>
          <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("mb_bottom_max")}
            className="flex items-center justify-center gap-1.5 rounded-2xl py-3 active:scale-[0.97] transition-transform"
            style={{ background: "linear-gradient(135deg,#001a3d,#003080)", border: "1px solid rgba(0,80,200,0.4)" }}>
            <img src={MAX_LOGO} alt="MAX" className="h-5 object-contain" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>MAX</span>
          </a>
          <a href={VK_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("mb_bottom_vk")}
            className="flex items-center justify-center gap-1.5 rounded-2xl py-3 active:scale-[0.97] transition-transform"
            style={{ background: "linear-gradient(135deg,#1a3a6b,#2456a4)", border: "1px solid rgba(36,86,164,0.5)" }}>
            <Icon name="Users" size={15} className="text-white" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>ВК</span>
          </a>
        </div>
      </div>

      {/* ══ ФУТЕР ДЕСКТОП ══ */}
      <div className="hidden md:block pb-6" style={{ background: "#050810", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="" className="w-10 h-10 rounded-xl object-cover" style={{ border: `1.5px solid ${GOLD}` }} />
            <div>
              <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 15, color: "#fff", textTransform: "uppercase" }}>Такси Дальняк</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>Бизнес-класс из Москвы и МО · С 2014 года</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 20, color: "#fff" }}>{PHONE}</div>
            <a href={PHONE_HREF} onClick={() => ymGoal("mb_footer_phone")}
              className="flex items-center gap-2 rounded-xl px-5 py-3 transition-transform hover:scale-105"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
              <Icon name="Phone" size={15} style={{ color: NAVY }} />
              <span style={{ fontFamily: "Oswald", fontSize: 14, color: NAVY, fontWeight: 800, textTransform: "uppercase" }}>Позвонить</span>
            </a>
            <a href={TG_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("mb_footer_tg")}
              className="flex items-center gap-2 rounded-xl px-4 py-3 transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg,#0e6da8,#1a8fc2)" }}>
              <Icon name="Send" size={15} className="text-white" />
              <span style={{ fontFamily: "Oswald", fontSize: 14, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>Telegram</span>
            </a>
            <a href={VK_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("mb_footer_vk")}
              className="flex items-center gap-2 rounded-xl px-4 py-3 transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg,#1a3a6b,#2456a4)" }}>
              <Icon name="Users" size={15} className="text-white" />
              <span style={{ fontFamily: "Oswald", fontSize: 14, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>ВКонтакте</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
