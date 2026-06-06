import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";

const LOGO     = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/3a499542-747a-49d2-808e-4c137548c76e.jpg";
const MAX_LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/cf5e3e58-7d83-4d19-8c48-f91922395adf.png";
const CAR_IMG  = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/091d3d1c-1649-4d9e-8958-1a624bf8f371.jpg";
const REVIEW_1 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/b0eb5050-a05a-4647-8442-4b839d45161f.jpg";
const REVIEW_2 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/fedc4281-a106-4024-9369-8a03712c92a3.jpg";
const REVIEW_3 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/ac322d91-fd27-4c11-b86f-f28e85ec3df0.jpg";

const PHONE      = "8 (995) 645-51-25";
const PHONE_HREF = "tel:+79956455125";
const TG_HREF    = "https://t.me/Mezhgorod1816";
const MAX_HREF   = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";

// Цвета бренда
const NAVY   = "#0a0f1e";
const NAVY2  = "#111827";
const CARD   = "#131b2e";
const BORDER = "rgba(201,168,76,0.18)";
const GOLD   = "#c9a84c";
const GOLD2  = "#e8c96a";

const CITIES = [
  "Москва","Санкт-Петербург","Белгород","Брянск","Владимир",
  "Воронеж","Калуга","Кострома","Курск","Липецк",
  "Рязань","Тамбов","Тверь","Тула","Ярославль",
  "Вологда","Нижний Новгород","Ижевск","Новосибирск",
  "Омск","Екатеринбург","Тюмень","Челябинск",
  "Богучарский р-н","Тоцкий р-н","Новые территории",
];

const REVIEWS = [
  { name: "Валерия", route: "Москва – Новомичуринск", img: REVIEW_1 },
  { name: "Ирина",   route: "Лен. область – СПб",     img: REVIEW_3 },
  { name: "Евгений", route: "Межгород по России",      img: REVIEW_2 },
];

const STATS = [
  { value: "12+",  label: "лет на рынке" },
  { value: "50k+", label: "поездок" },
  { value: "30+",  label: "городов" },
  { value: "4.9",  label: "рейтинг" },
];

function getStartCount() {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return 847 + (seed % 60);
}

function ymGoal(goal: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).ym?.(98584604, "reachGoal", goal);
}

export default function Quick() {
  const [pulse, setPulse]         = useState(false);
  const [count, setCount]         = useState(getStartCount());
  const [mins, setMins]           = useState(7);
  const [scrolled, setScrolled]   = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showIosHint, setShowIosHint]     = useState(false);
  const [isInstalled, setIsInstalled]     = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Такси Дальняк — Межгород по России";

    const p = setInterval(() => setPulse(v => !v), 1800);
    const c = setInterval(() => {
      setCount(n => n + 1);
      setMins(Math.floor(Math.random() * 9) + 2);
    }, (Math.random() * 4 + 3) * 60000);
    const m = setInterval(() => setMins(v => v >= 40 ? 4 : v + 1), 60000);

    const standalone = window.matchMedia("(display-mode: standalone)").matches
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      || (window.navigator as any).standalone === true;
    if (standalone) setIsInstalled(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onPrompt = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);

    return () => {
      clearInterval(p); clearInterval(c); clearInterval(m);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  async function handleInstall() {
    ymGoal("install_click");
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
      return;
    }
    setShowIosHint(true);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: NAVY, fontFamily: "Inter, sans-serif" }}>

      {/* ══ ФОНОВЫЙ HERO ══ */}
      <div ref={heroRef} className="relative w-full overflow-hidden" style={{ minHeight: "100svh" }}>
        <img src={CAR_IMG} alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 45%", transform: "scale(1.05)" }} />
        {/* многослойное затемнение */}
        <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, rgba(10,15,30,0.82) 0%, rgba(10,15,30,0.55) 40%, rgba(10,15,30,0.92) 100%)` }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, rgba(10,15,30,0) 50%, ${NAVY} 100%)` }} />

        {/* ── ХЕДЕР ── */}
        <div className="relative z-20">
          <div className={`transition-all duration-300 ${scrolled ? "py-2 shadow-2xl" : "py-4"}`}
            style={{ background: scrolled ? "rgba(10,15,30,0.95)" : "transparent", backdropFilter: scrolled ? "blur(12px)" : "none" }}>
            <div className="max-w-sm mx-auto px-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={LOGO} alt="" className="w-9 h-9 rounded-xl object-cover"
                  style={{ border: `1.5px solid ${GOLD}`, boxShadow: `0 0 12px rgba(201,168,76,0.3)` }} />
                <div>
                  <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 15, color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Дальняк
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full transition-opacity duration-700 ${pulse ? "opacity-100" : "opacity-20"}`}
                      style={{ background: "#4ade80" }} />
                    <span style={{ color: "#4ade80", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>На связи 24/7</span>
                  </div>
                </div>
              </div>
              <a href={PHONE_HREF} onClick={() => ymGoal("header_phone")}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 active:scale-95 transition-transform"
                style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD2})`, boxShadow: "0 2px 12px rgba(201,168,76,0.4)" }}>
                <Icon name="Phone" size={13} className="text-[#0a0f1e]" />
                <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#0a0f1e", fontWeight: 800, textTransform: "uppercase" }}>Звонок</span>
              </a>
            </div>
          </div>
        </div>

        {/* ── HERO КОНТЕНТ ── */}
        <div className="relative z-10 max-w-sm mx-auto px-4 flex flex-col" style={{ minHeight: "calc(100svh - 64px)", paddingTop: 24 }}>

          {/* живой счётчик — компактный */}
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 self-start"
            style={{ background: "rgba(201,168,76,0.12)", border: `1px solid rgba(201,168,76,0.3)` }}>
            <div className="flex -space-x-1.5">
              {[REVIEW_1, REVIEW_2, REVIEW_3].map((img, i) => (
                <img key={i} src={img} alt="" className="w-5 h-5 rounded-full object-cover" style={{ border: `1.5px solid ${NAVY}` }} />
              ))}
            </div>
            <span style={{ color: GOLD2, fontSize: 11, fontWeight: 700 }}>
              {count.toLocaleString("ru")} поездок сегодня
            </span>
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>· последняя {mins} мин назад</span>
          </div>

          {/* ЗАГОЛОВОК */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1" style={{ background: `linear-gradient(to right, ${GOLD}, transparent)` }} />
              <span style={{ color: GOLD, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em" }}>
                Межгород · Россия
              </span>
            </div>
            <h1 style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: "clamp(34px,10vw,52px)", lineHeight: 0.95, color: "#fff", textTransform: "uppercase", letterSpacing: "-0.01em" }}>
              Заказать такси<br />
              <span style={{ color: GOLD }}>из города в город</span>
            </h1>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 14, marginTop: 14, lineHeight: 1.6, maxWidth: 280 }}>
              Межгородные поездки от 200 км по всей России.<br />
              Фиксированная цена. Новые авто. С 2014 года.
            </p>
          </div>

          {/* СТАТИСТИКА */}
          <div className="grid grid-cols-4 gap-2 mb-7">
            {STATS.map(s => (
              <div key={s.value} className="flex flex-col items-center rounded-2xl py-3 px-1"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 18, color: GOLD, lineHeight: 1 }}>{s.value}</span>
                <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, textAlign: "center", marginTop: 2, lineHeight: 1.2 }}>{s.label}</span>
              </div>
            ))}
          </div>

          {/* CTA КНОПКИ */}
          <div className="space-y-3 mb-6">
            <a href={PHONE_HREF} onClick={() => ymGoal("hero_phone")}
              className="flex items-center justify-center gap-3 w-full rounded-2xl py-5 active:scale-[0.97] transition-transform"
              style={{ background: `linear-gradient(135deg, ${GOLD} 0%, ${GOLD2} 100%)`, boxShadow: `0 8px 32px rgba(201,168,76,0.45)` }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(10,15,30,0.2)" }}>
                <Icon name="PhoneCall" size={18} className="text-[#0a0f1e]" />
              </div>
              <div className="text-left">
                <div style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 20, color: "#0a0f1e", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  Позвонить сейчас
                </div>
                <div style={{ fontSize: 11, color: "rgba(10,15,30,0.6)", fontWeight: 600 }}>{PHONE}</div>
              </div>
            </a>

            <div className="grid grid-cols-2 gap-3">
              <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("hero_max")}
                className="relative flex flex-col items-center justify-center rounded-2xl py-4 gap-1.5 active:scale-[0.97] transition-transform overflow-hidden"
                style={{ background: "linear-gradient(135deg,#001a3d,#003080)", border: "1px solid rgba(0,90,210,0.4)" }}>
                <div className="absolute top-1.5 right-1.5 rounded-full px-1.5 py-0.5"
                  style={{ background: GOLD, fontSize: 8, color: "#0a0f1e", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  популярно
                </div>
                <img src={MAX_LOGO} alt="MAX" className="h-6 object-contain" />
                <span style={{ fontFamily: "Oswald", fontSize: 13, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>Написать в MAX</span>
              </a>
              <a href={`${TG_HREF}`} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("hero_tg")}
                className="flex flex-col items-center justify-center rounded-2xl py-4 gap-1.5 active:scale-[0.97] transition-transform"
                style={{ background: "linear-gradient(135deg,#005f8e,#0088cc)", border: "1px solid rgba(0,136,204,0.35)" }}>
                <Icon name="Send" size={22} className="text-white" />
                <span style={{ fontFamily: "Oswald", fontSize: 13, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>Telegram</span>
              </a>
            </div>
          </div>

          {/* PWA */}
          {!isInstalled && (
            <button onClick={handleInstall}
              className="flex items-center gap-3 w-full rounded-2xl px-4 py-3 active:scale-[0.97] transition-transform mb-2"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                <Icon name="Download" size={15} style={{ color: "#0a0f1e" }} />
              </div>
              <div className="flex-1 text-left">
                <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>Добавить на главный экран</div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>Как приложение — в один тап</div>
              </div>
              <Icon name="ChevronRight" size={14} style={{ color: GOLD }} />
            </button>
          )}

          {/* стрелка вниз */}
          <div className="flex justify-center mt-auto pb-6">
            <div className="flex flex-col items-center gap-1 animate-bounce">
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em" }}>листай</span>
              <Icon name="ChevronDown" size={16} style={{ color: GOLD, opacity: 0.6 }} />
            </div>
          </div>
        </div>
      </div>

      {/* ══ СЕКЦИЯ: 3 ФАКТА ══ */}
      <div style={{ background: NAVY }}>
        <div className="max-w-sm mx-auto px-4 py-10">
          <div className="text-center mb-6">
            <div style={{ color: GOLD, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em" }} className="mb-2">
              Почему выбирают нас
            </div>
            <h2 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 26, color: "#fff", textTransform: "uppercase" }}>
              Честно и надёжно
            </h2>
          </div>

          <div className="space-y-3">
            {[
              { icon: "BadgeCheck", title: "Фиксированная цена", desc: "Называем стоимость до поездки — никаких счётчиков и сюрпризов в дороге" },
              { icon: "Car",        title: "Авто не старше 10 лет", desc: "Комфортные автомобили, проверенные перед каждым рейсом" },
              { icon: "Shield",     title: "Работаем с 2014 года", desc: "10+ лет на рынке межгородных перевозок — тысячи довольных клиентов" },
              { icon: "Clock",      title: "Круглосуточно", desc: "Диспетчер отвечает 24/7, принимаем заказы в любое время" },
              { icon: "MapPin",     title: "30+ городов", desc: "Выезды из Москвы, СПб, Воронежа, Екатеринбурга и других регионов" },
            ].map((f, idx) => (
              <div key={f.title} className="flex gap-4 rounded-2xl p-4"
                style={{ background: CARD, border: BORDER.replace("0.18", idx === 0 ? "0.35" : "0.12") }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05))`, border: BORDER }}>
                  <Icon name={f.icon as "Car"} size={18} style={{ color: GOLD }} />
                </div>
                <div>
                  <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 15, color: "#fff" }}>{f.title}</div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2, lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ СЕКЦИЯ: ГОРОДА ══ */}
      <div style={{ background: `linear-gradient(180deg, ${NAVY} 0%, #080d1a 100%)` }}>
        <div className="max-w-sm mx-auto px-4 py-8">
          <div className="text-center mb-5">
            <div style={{ color: GOLD, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em" }} className="mb-2">
              Geography
            </div>
            <h2 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 26, color: "#fff", textTransform: "uppercase" }}>
              Города присутствия
            </h2>
          </div>
          <div className="rounded-2xl p-4" style={{ background: CARD, border: BORDER }}>
            <div className="flex flex-wrap gap-2">
              {CITIES.map(city => (
                <span key={city}
                  className="rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={city === "Новые территории"
                    ? { background: `rgba(201,168,76,0.15)`, border: `1px solid rgba(201,168,76,0.4)`, color: GOLD2 }
                    : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }
                  }>
                  {city}
                </span>
              ))}
            </div>
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>
                Не нашли свой город? Уточните у диспетчера — выезжаем откуда угодно
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ СЕКЦИЯ: ССЫЛКИ ══ */}
      <div style={{ background: "#080d1a" }}>
        <div className="max-w-sm mx-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Калькулятор", icon: "Calculator", href: "/calc",    sub: "Узнай цену" },
              { label: "Тарифы",      icon: "Car",        href: "/tariffs",  sub: "Наши авто" },
              { label: "Отзывы",      icon: "Star",       href: "/reviews",  sub: "11+ отзывов" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="flex flex-col items-center gap-1.5 rounded-2xl py-4 active:scale-[0.97] transition-transform"
                style={{ background: CARD, border: BORDER }}>
                <Icon name={l.icon as "Car"} size={20} style={{ color: GOLD }} />
                <span style={{ fontFamily: "Oswald", fontSize: 13, color: "#fff", fontWeight: 700, textTransform: "uppercase" }}>{l.label}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>{l.sub}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ══ СЕКЦИЯ: ОТЗЫВЫ ══ */}
      <div style={{ background: "#080d1a" }}>
        <div className="max-w-sm mx-auto px-4 pb-36">
          <div className="flex items-center justify-between mb-5">
            <div>
              <div style={{ color: GOLD, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em" }} className="mb-1">Reviews</div>
              <h2 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 22, color: "#fff", textTransform: "uppercase" }}>Отзывы</h2>
            </div>
            <a href="/reviews" className="flex items-center gap-1 rounded-xl px-3 py-1.5 active:scale-95 transition-transform"
              style={{ background: "rgba(201,168,76,0.1)", border: BORDER }}>
              <span style={{ color: GOLD, fontSize: 11, fontWeight: 700 }}>Все отзывы</span>
              <Icon name="ChevronRight" size={12} style={{ color: GOLD }} />
            </a>
          </div>

          <div className="space-y-4">
            {REVIEWS.map(r => (
              <div key={r.name} className="rounded-2xl overflow-hidden" style={{ background: CARD, border: BORDER }}>
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
                  <div>
                    <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 15, color: "#fff" }}>{r.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{r.route}</div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => <Icon key={i} name="Star" size={12} style={{ color: GOLD }} />)}
                  </div>
                </div>
                <img src={r.img} alt={`Отзыв ${r.name}`} className="w-full h-auto block" style={{ background: "#0d1220" }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ НИЖНЯЯ ПАНЕЛЬ ══ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-3"
        style={{ background: `linear-gradient(to top, ${NAVY} 65%, transparent)` }}>
        <div className="max-w-sm mx-auto">
          {/* большая кнопка */}
          <a href={PHONE_HREF} onClick={() => ymGoal("bottom_phone")}
            className="flex items-center justify-center gap-3 w-full rounded-2xl py-4 mb-2.5 active:scale-[0.97] transition-transform"
            style={{ background: `linear-gradient(135deg, ${GOLD}, ${GOLD2})`, boxShadow: "0 4px 24px rgba(201,168,76,0.5)" }}>
            <Icon name="Phone" size={18} style={{ color: NAVY }} />
            <div style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 18, color: NAVY, textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Позвонить диспетчеру
            </div>
          </a>
          <div className="grid grid-cols-2 gap-2">
            <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("bottom_max")}
              className="flex items-center justify-center gap-2 rounded-2xl py-3 active:scale-[0.97] transition-transform"
              style={{ background: "linear-gradient(135deg,#001a3d,#003080)", border: "1px solid rgba(0,80,200,0.4)" }}>
              <img src={MAX_LOGO} alt="MAX" className="h-5 object-contain" />
              <span style={{ fontFamily: "Oswald", fontSize: 13, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>MAX</span>
            </a>
            <a href={TG_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("bottom_tg")}
              className="flex items-center justify-center gap-2 rounded-2xl py-3 active:scale-[0.97] transition-transform"
              style={{ background: "linear-gradient(135deg,#005f8e,#0088cc)", border: "1px solid rgba(0,136,204,0.35)" }}>
              <Icon name="Send" size={16} className="text-white" />
              <span style={{ fontFamily: "Oswald", fontSize: 13, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>Telegram</span>
            </a>
          </div>
        </div>
      </div>

      {/* ══ МОДАЛКА iOS ══ */}
      {showIosHint && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-6"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowIosHint(false)}>
          <div className="max-w-sm w-full rounded-3xl p-5"
            style={{ background: CARD, border: `1px solid rgba(201,168,76,0.3)` }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 16, color: "#fff", textTransform: "uppercase" }}>
                Установка на iPhone
              </div>
              <button onClick={() => setShowIosHint(false)} style={{ color: "rgba(255,255,255,0.4)" }}>
                <Icon name="X" size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {[
                { n: "1", text: "Нажмите кнопку «Поделиться»", icon: "Share" },
                { n: "2", text: "Выберите «На экран Домой»",   icon: "SquarePlus" },
                { n: "3", text: "Нажмите «Добавить» — готово!", icon: "Check" },
              ].map(s => (
                <div key={s.n} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                    <span style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 13, color: NAVY }}>{s.n}</span>
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>{s.text}</span>
                  <Icon name={s.icon as "Share"} size={15} style={{ color: GOLD, marginLeft: "auto", flexShrink: 0 }} />
                </div>
              ))}
            </div>
            <button onClick={() => setShowIosHint(false)}
              className="w-full mt-4 rounded-2xl py-3 active:scale-[0.98] transition-transform"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, fontFamily: "Oswald", fontWeight: 800, fontSize: 15, color: NAVY, textTransform: "uppercase" }}>
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
}