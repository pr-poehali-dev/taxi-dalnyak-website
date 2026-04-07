import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

function MaxIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="24" height="24" rx="6" fill="#005FF9"/>
      <path d="M4 17V7l4.5 5L13 7v10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M14.5 12l2.5-5 2.5 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M13.8 14h6.4" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Константы ────────────────────────────────────────────────────────────────
const HERO_BG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/9f1988fa-044e-4fe0-9ed6-d8c75200c13b.jpg";
const CAR_IMG  = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/d777a0ac-bb72-4451-9248-4a96fb44db9f.jpg";
const LOGO     = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/eed871f1-fcfc-4342-ba10-6d3337b98fe4.jpg";

const PHONE    = "8 (995) 645-51-25";
const PHONE_HREF = "tel:+79956455125";
const TG_HREF  = "https://t.me/Mezhgorod1816";
const WA_HREF  = "https://wa.me/79956455125?text=" + encodeURIComponent("Здравствуйте! Хочу узнать стоимость поездки.");
const VK_HREF  = "https://vk.ru/dalnyack";
const MAX_HREF = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";

const NAV = [
  { id: "hero",     label: "Главная"  },
  { id: "tariffs",  label: "Тарифы"   },
  { id: "why",      label: "Почему мы"},
  { id: "contacts", label: "Контакты" },
];

const TARIFFS = [
  {
    icon: "Car",
    name: "СТАНДАРТ",
    price: "30",
    desc: "Комфортная поездка на проверенном седане",
    features: ["Седан / Хэтчбек", "До 3 пассажиров", "Кондиционер", "Оплата картой / наличными"],
    featured: false,
  },
  {
    icon: "Star",
    name: "КОМФОРТ",
    price: "40",
    desc: "Бизнес-класс для тех, кто ценит качество",
    features: ["Бизнес-авто", "До 4 пассажиров", "USB / USB-C зарядка", "Вода в дорогу"],
    featured: true,
  },
  {
    icon: "Users",
    name: "МИНИВЭН",
    price: "50",
    desc: "Большой автомобиль для компании или груза",
    features: ["Минивэн / Внедорожник", "До 6 пассажиров", "Детское кресло", "Большой багажник"],
    featured: false,
  },
];

const WHY = [
  { icon: "ShieldCheck", title: "Фиксированная цена", text: "Цена за поездку известна заранее. Никаких надбавок за ночь, пробки или погоду." },
  { icon: "Route",       title: "Только от 200 км",   text: "Специализируемся исключительно на дальних маршрутах — знаем их как никто." },
  { icon: "Clock",       title: "24 часа, 7 дней",    text: "Принимаем заказы круглосуточно. Выезд в любое время суток." },
  { icon: "MapPin",      title: "Вся Россия + новые территории", text: "Межгород, аэропорты, трансферы — любое направление. Работаем в ДНР, ЛНР, Запорожской и Херсонской областях." },
  { icon: "Banknote",    title: "Выгоднее такси",      text: "На дальних маршрутах дешевле агрегаторов на 20–40%. Считаем за км, не за мин." },
  { icon: "ThumbsUp",    title: "5 лет на рынке",      text: "Более 50 000 выполненных поездок. Опытные водители, чистые авто." },
];

const REVIEWS = [
  { name: "Алексей М.", city: "Москва → Казань", text: "Ехали с семьёй 800 км — водитель пунктуальный, машина чистая, цена как договорились. Однозначно рекомендую!", stars: 5 },
  { name: "Светлана К.", city: "Нижний Новгород → Самара", text: "Заказывала несколько раз для командировок. Всегда в срок, цена честная, никаких сюрпризов. Теперь только Дальняк.", stars: 5 },
  { name: "Дмитрий Р.", city: "Ижевск → Чайковский", text: "Быстро ответили в Telegram, сразу назвали цену. Поездка прошла отлично, приеду ещё.", stars: 5 },
];

// ─── Хелперы ─────────────────────────────────────────────────────────────────
function useVisible(th = 0.1) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold: th });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { ref, v };
}

function cls(...args: (string | false | undefined)[]) {
  return args.filter(Boolean).join(" ");
}

// ─── Компонент кнопки CTA ─────────────────────────────────────────────────────
function CTABlock({ text = "Узнать стоимость" }: { text?: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2.5 bg-sky-500 hover:bg-sky-400 active:scale-[0.97] text-white font-bold text-base px-7 py-4 rounded-2xl transition shadow-lg shadow-sky-500/20 whitespace-nowrap"
        style={{ fontFamily: "Oswald" }}>
        <Icon name="Send" size={20} />{text} в Telegram
      </a>
      <a href={WA_HREF} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-500 active:scale-[0.97] text-white font-bold text-base px-7 py-4 rounded-2xl transition shadow-lg shadow-green-600/20 whitespace-nowrap"
        style={{ fontFamily: "Oswald" }}>
        <Icon name="MessageCircle" size={20} />WhatsApp
      </a>
      <a href={PHONE_HREF}
        className="flex items-center justify-center gap-2.5 bg-amber hover:bg-amber/90 active:scale-[0.97] text-coal font-bold text-base px-7 py-4 rounded-2xl transition shadow-lg shadow-amber/20 whitespace-nowrap"
        style={{ fontFamily: "Oswald" }}>
        <Icon name="Phone" size={20} />{PHONE}
      </a>
    </div>
  );
}

// ─── Главный компонент ────────────────────────────────────────────────────────
export default function Index() {
  const [section, setSection] = useState("hero");
  const [menuOpen, setMenuOpen] = useState(false);
  const [pwaEvt, setPwaEvt] = useState<Event | null>(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [calcDist, setCalcDist] = useState("");
  const [calcTariff, setCalcTariff] = useState<"30" | "40" | "50">("30");

  const secTariffs  = useVisible();
  const secWhy      = useVisible();
  const secReviews  = useVisible();
  const secContacts = useVisible();

  // PWA install prompt
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setPwaEvt(e); };
    window.addEventListener("beforeinstallprompt", h);
    window.addEventListener("appinstalled", () => setPwaInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  // Активная секция при скролле
  useEffect(() => {
    const fn = () => {
      for (const n of [...NAV].reverse()) {
        const el = document.getElementById(n.id);
        if (el && window.scrollY >= el.offsetTop - 140) { setSection(n.id); break; }
      }
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setSection(id);
    setMenuOpen(false);
  };

  const doInstall = async () => {
    if (!pwaEvt) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pwaEvt as any).prompt();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { outcome } = await (pwaEvt as any).userChoice;
    if (outcome === "accepted") setPwaInstalled(true);
    setPwaEvt(null);
  };

  const doShare = () => {
    if (navigator.share) {
      navigator.share({ title: "Такси Дальняк", text: "Межгородное такси от 200 км. Фиксированная цена.", url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => alert("Ссылка скопирована!"));
    }
  };

  const calcPrice = () => {
    const km = parseInt(calcDist.replace(/\D/g, ""), 10);
    if (!km || km < 200) return null;
    return km * parseInt(calcTariff, 10);
  };

  const price = calcPrice();

  // ─── Разметка ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" style={{ fontFamily: "'Golos Text', sans-serif" }}>

      {/* ── Баннер «Добавить на экран» ── */}
      {pwaEvt && !pwaInstalled && (
        <div className="fixed bottom-20 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-sm bg-[#1a1a1a] border border-amber/40 rounded-2xl shadow-2xl flex items-center gap-3 px-4 py-3.5">
            <img src={LOGO} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-white" style={{ fontFamily: "Oswald" }}>Добавить на главный экран</p>
              <p className="text-xs text-white/50 mt-0.5">Быстрый доступ без браузера</p>
            </div>
            <button onClick={doInstall} className="bg-amber text-coal font-bold text-xs px-4 py-2 rounded-xl shrink-0 hover:bg-amber/90 transition" style={{ fontFamily: "Oswald" }}>
              Добавить
            </button>
            <button onClick={() => setPwaEvt(null)} className="text-white/30 hover:text-white p-1 shrink-0"><Icon name="X" size={14} /></button>
          </div>
        </div>
      )}

      {/* ── Фиксированная нижняя панель CTA (мобиль) ── */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl px-3 py-2.5 flex gap-2">
        <a href={PHONE_HREF} className="flex-1 flex items-center justify-center gap-1.5 bg-amber text-coal font-bold text-sm py-3 rounded-xl active:scale-[0.97] transition" style={{ fontFamily: "Oswald" }}>
          <Icon name="Phone" size={16} />Звонок
        </a>
        <a href={TG_HREF} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 bg-sky-500 text-white font-bold text-sm py-3 rounded-xl active:scale-[0.97] transition" style={{ fontFamily: "Oswald" }}>
          <Icon name="Send" size={16} />Telegram
        </a>
        <a href={WA_HREF} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white font-bold text-sm py-3 rounded-xl active:scale-[0.97] transition" style={{ fontFamily: "Oswald" }}>
          <Icon name="MessageCircle" size={16} />WhatsApp
        </a>
      </div>

      {/* ── Навигация ── */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <button onClick={() => go("hero")} className="flex items-center gap-2 shrink-0">
            <img src={LOGO} alt="" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-black text-base tracking-widest text-white uppercase hidden sm:block" style={{ fontFamily: "Oswald" }}>Дальняк</span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(n => (
              <button key={n.id} onClick={() => go(n.id)}
                className={cls("px-3 py-1.5 rounded-lg text-sm transition-colors", section === n.id ? "text-amber bg-amber/10" : "text-white/50 hover:text-white hover:bg-white/5")}>
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <a href={TG_HREF} target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs px-3 py-2 rounded-xl transition" style={{ fontFamily: "Oswald" }}>
              <Icon name="Send" size={13} />Telegram
            </a>
            <a href={PHONE_HREF} className="hidden sm:flex items-center gap-1.5 bg-amber text-coal font-bold text-xs px-3 py-2 rounded-xl transition hover:bg-amber/90" style={{ fontFamily: "Oswald" }}>
              <Icon name="Phone" size={13} />{PHONE}
            </a>
            <button onClick={() => setMenuOpen(v => !v)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-white/60 hover:text-white">
              <Icon name={menuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0a0a0a]/98 backdrop-blur-xl">
            <div className="px-4 py-3 space-y-1">
              {NAV.map(n => (
                <button key={n.id} onClick={() => go(n.id)}
                  className={cls("w-full text-left px-4 py-3 rounded-xl text-sm transition", section === n.id ? "text-amber bg-amber/10" : "text-white/60 hover:text-white hover:bg-white/5")}>
                  {n.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ══════════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${HERO_BG})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-16 pb-24">
          {/* Бейдж */}
          <div className="inline-flex items-center gap-2 border border-amber/40 bg-amber/5 rounded-full px-5 py-2 mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-amber text-xs font-bold tracking-widest uppercase">Вся Россия · Новые территории · 24/7</span>
          </div>

          {/* Заголовок */}
          <h1 className="font-black leading-none tracking-tight text-white opacity-0 animate-fade-up"
            style={{ fontFamily: "Oswald", fontSize: "clamp(56px,12vw,120px)", animationDelay: "0.15s", animationFillMode: "forwards" }}>
            ТАКСИ<br /><span className="text-amber">ДАЛЬНЯК</span>
          </h1>

          {/* Подзаголовок */}
          <p className="mt-5 text-lg sm:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-up"
            style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
            Межгородное такси от 200 км.<br />
            <span className="text-white font-semibold">Фиксированная цена — знаешь сумму до посадки.</span>
          </p>

          {/* Цены быстро */}
          <div className="mt-6 flex flex-wrap gap-3 justify-center opacity-0 animate-fade-up" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
            {[{ l: "Стандарт", p: "30₽/км" }, { l: "Комфорт", p: "40₽/км" }, { l: "Минивэн", p: "50₽/км" }].map(t => (
              <div key={t.l} className="bg-white/8 border border-white/10 rounded-xl px-4 py-2 text-sm">
                <span className="text-white/50">{t.l} </span>
                <span className="font-bold text-amber" style={{ fontFamily: "Oswald" }}>{t.p}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center opacity-0 animate-fade-up" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
            <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-0.5 bg-sky-500 hover:bg-sky-400 active:scale-[0.97] text-white px-8 py-3.5 rounded-2xl transition shadow-xl shadow-sky-500/25"
              style={{ fontFamily: "Oswald" }}>
              <span className="flex items-center gap-2 font-black text-lg"><Icon name="Send" size={22} />Узнать стоимость</span>
              <span className="text-xs font-normal opacity-75 tracking-normal" style={{ fontFamily: "'Golos Text', sans-serif" }}>откроется Telegram</span>
            </a>
            <a href={PHONE_HREF}
              className="flex items-center justify-center gap-2.5 border-2 border-amber/60 text-amber hover:bg-amber hover:text-coal font-black text-lg px-8 py-4 rounded-2xl transition"
              style={{ fontFamily: "Oswald" }}>
              <Icon name="Phone" size={22} />{PHONE}
            </a>
          </div>

          {/* Мессенджеры */}
          <div className="mt-4 flex gap-3 justify-center opacity-0 animate-fade-in" style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}>
            <a href={WA_HREF} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-bold text-green-400 border border-green-600/30 bg-green-600/10 hover:bg-green-600/20 px-4 py-2 rounded-xl transition">
              <Icon name="MessageCircle" size={15} />WhatsApp
            </a>
            <a href={VK_HREF} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-bold text-blue-400 border border-blue-600/30 bg-blue-600/10 hover:bg-blue-600/20 px-4 py-2 rounded-xl transition">
              <Icon name="Users" size={15} />ВКонтакте
            </a>
            <a href={MAX_HREF} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-bold text-white border border-[#005FF9]/40 bg-[#005FF9]/15 hover:bg-[#005FF9]/25 px-4 py-2 rounded-xl transition">
              <MaxIcon size={16} />MAX
            </a>
          </div>

          {/* Скролл-подсказка */}
          <div className="mt-12 flex flex-col items-center gap-2 opacity-0 animate-fade-in" style={{ animationDelay: "1.2s", animationFillMode: "forwards" }}>
            <span className="text-white/20 text-xs tracking-[0.3em] uppercase">Листать вниз</span>
            <div className="w-px h-10 bg-gradient-to-b from-amber/50 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── Полоса статистики ── */}
      <div className="border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { v: "50 000+", l: "Выполненных поездок" },
            { v: "5+ лет",  l: "Работаем на рынке"   },
            { v: "24 / 7",  l: "Принимаем заказы"    },
            { v: "≥ 200 км",l: "Минимальный маршрут" },
          ].map(s => (
            <div key={s.v} className="text-center">
              <div className="font-black text-2xl sm:text-3xl text-amber" style={{ fontFamily: "Oswald" }}>{s.v}</div>
              <div className="text-xs text-white/40 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ТАРИФЫ
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="tariffs" ref={secTariffs.ref} className="py-20 sm:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className={cls("mb-10 transition-all duration-700", secTariffs.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
            <p className="text-amber text-xs font-bold tracking-[0.3em] uppercase mb-2">тарифы</p>
            <h2 className="font-black text-4xl sm:text-5xl text-white" style={{ fontFamily: "Oswald" }}>
              ВЫБЕРИ ТАРИФ
            </h2>
            <p className="mt-2 text-white/50 text-sm max-w-md">Цена фиксированная — рассчитывается по счётчику километров.</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-5">
            {TARIFFS.map((t, i) => (
              <div key={t.name}
                className={cls(
                  "relative flex flex-col rounded-2xl border p-6 transition-all duration-700",
                  secTariffs.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10",
                  t.featured
                    ? "border-amber/50 bg-gradient-to-b from-amber/10 to-amber/5 shadow-xl shadow-amber/10"
                    : "border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]"
                )}
                style={{ transitionDelay: `${i * 80}ms` }}>
                {t.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber text-coal font-black text-xs px-5 py-1.5 rounded-full tracking-wider uppercase shadow-lg" style={{ fontFamily: "Oswald" }}>
                    Популярный
                  </div>
                )}
                <div className={cls("w-11 h-11 rounded-xl flex items-center justify-center mb-4", t.featured ? "bg-amber/20" : "bg-white/8")}>
                  <Icon name={t.icon} fallback="Car" size={22} className={t.featured ? "text-amber" : "text-white/50"} />
                </div>
                <h3 className="font-black text-xl text-white mb-1" style={{ fontFamily: "Oswald" }}>{t.name}</h3>
                <p className="text-xs text-white/40 mb-5">{t.desc}</p>
                <div className="flex items-end gap-1 mb-6">
                  <span className="font-black text-5xl leading-none text-amber" style={{ fontFamily: "Oswald" }}>{t.price}₽</span>
                  <span className="text-white/40 text-sm mb-1">/ км</span>
                </div>
                <ul className="space-y-2.5 flex-1 mb-6">
                  {t.features.map(f => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-white/70">
                      <div className="w-4 h-4 rounded-full bg-amber/20 flex items-center justify-center shrink-0">
                        <Icon name="Check" size={10} className="text-amber" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
                  className={cls(
                    "w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition active:scale-[0.98] text-center block",
                    t.featured ? "bg-amber text-coal hover:bg-amber/90 shadow-lg shadow-amber/20" : "border border-white/15 text-white hover:border-amber/50 hover:text-amber"
                  )}
                  style={{ fontFamily: "Oswald" }}>
                  Узнать стоимость
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Разделитель с авто ── */}
      <div className="relative h-40 sm:h-56 overflow-hidden">
        <img src={CAR_IMG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-black text-2xl sm:text-5xl text-white/70 tracking-[0.1em] uppercase" style={{ fontFamily: "Oswald" }}>
            Везём дальше всех
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          КАЛЬКУЛЯТОР
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="py-16 px-4 bg-amber/[0.04] border-y border-amber/10">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-amber text-xs font-bold tracking-[0.3em] uppercase mb-2">калькулятор</p>
          <h2 className="font-black text-3xl sm:text-4xl text-white mb-6" style={{ fontFamily: "Oswald" }}>ПОСЧИТАЙ СТОИМОСТЬ</h2>
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <input
              value={calcDist}
              onChange={e => setCalcDist(e.target.value)}
              placeholder="Расстояние в км (напр: 500)"
              inputMode="numeric"
              className="flex-1 bg-white/5 border border-white/10 focus:border-amber/50 rounded-xl px-5 py-3.5 text-white placeholder:text-white/30 outline-none transition text-sm"
            />
            <select
              value={calcTariff}
              onChange={e => setCalcTariff(e.target.value as "30" | "40" | "50")}
              className="bg-white/5 border border-white/10 focus:border-amber/50 rounded-xl px-5 py-3.5 text-white outline-none transition text-sm cursor-pointer"
            >
              <option value="30">Стандарт — 30₽/км</option>
              <option value="40">Комфорт — 40₽/км</option>
              <option value="50">Минивэн — 50₽/км</option>
            </select>
          </div>

          {price !== null ? (
            <div className="bg-amber/10 border border-amber/30 rounded-2xl p-5 mb-5">
              <p className="text-white/60 text-sm mb-1">Примерная стоимость поездки</p>
              <p className="font-black text-4xl text-amber" style={{ fontFamily: "Oswald" }}>{price.toLocaleString("ru")} ₽</p>
              <p className="text-white/30 text-xs mt-1">Точную цену уточни у оператора</p>
            </div>
          ) : calcDist && parseInt(calcDist) < 200 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-5">
              <p className="text-white/50 text-sm">Минимальная поездка — 200 км</p>
            </div>
          ) : null}

          <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-sky-500 hover:bg-sky-400 text-white font-black text-base px-8 py-4 rounded-2xl transition active:scale-[0.97] shadow-lg shadow-sky-500/20"
            style={{ fontFamily: "Oswald" }}>
            <Icon name="Send" size={20} />Получить точную цену в Telegram
          </a>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          НОВЫЕ ТЕРРИТОРИИ
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="py-16 px-4 border-y border-red-900/40 bg-gradient-to-b from-red-950/30 to-transparent">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-1 h-8 bg-red-500 rounded-full" />
                <div>
                  <p className="text-red-400 text-xs font-bold tracking-[0.3em] uppercase">специальный тариф</p>
                  <h2 className="font-black text-2xl sm:text-3xl text-white mt-0.5" style={{ fontFamily: "Oswald" }}>
                    НОВЫЕ ТЕРРИТОРИИ
                  </h2>
                </div>
              </div>
              <p className="text-white/55 text-sm leading-relaxed max-w-md">
                Работаем по всей России, включая новые территории — ДНР, ЛНР, Запорожскую и Херсонскую области. Отдельный тариф с учётом особенностей маршрута.
              </p>
              <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-400 text-white font-black text-sm px-6 py-3 rounded-xl transition active:scale-[0.97]"
                style={{ fontFamily: "Oswald" }}>
                <Icon name="Send" size={16} />Уточнить маршрут — откроется Telegram
              </a>
            </div>
            <div className="w-full md:w-auto flex-shrink-0 grid grid-cols-3 gap-3">
              {[
                { name: "СТАНДАРТ", price: "80", icon: "Car" },
                { name: "КОМФОРТ",  price: "100", icon: "Star" },
                { name: "МИНИВЭН",  price: "110", icon: "Users" },
              ].map(t => (
                <div key={t.name} className="flex flex-col items-center p-4 rounded-2xl border border-red-800/40 bg-red-950/30 min-w-[90px]">
                  <Icon name={t.icon} fallback="Car" size={18} className="text-red-400 mb-2" />
                  <p className="font-black text-xl text-white leading-none" style={{ fontFamily: "Oswald" }}>{t.price}₽</p>
                  <p className="text-red-400/70 text-[10px] mt-0.5">за км</p>
                  <p className="text-white/40 text-[10px] mt-1 text-center leading-tight" style={{ fontFamily: "Oswald" }}>{t.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ПОЧЕМУ МЫ
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="why" ref={secWhy.ref} className="py-20 sm:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className={cls("mb-10 transition-all duration-700", secWhy.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
            <p className="text-amber text-xs font-bold tracking-[0.3em] uppercase mb-2">почему мы</p>
            <h2 className="font-black text-4xl sm:text-5xl text-white" style={{ fontFamily: "Oswald" }}>6 ПРИЧИН ВЫБРАТЬ<br /><span className="text-amber">ДАЛЬНЯК</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {WHY.map((w, i) => (
              <div key={w.title}
                className={cls("p-6 rounded-2xl border border-white/8 bg-white/[0.02] hover:border-white/15 transition-all duration-700", secWhy.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}
                style={{ transitionDelay: `${i * 60}ms` }}>
                <div className="w-11 h-11 rounded-xl bg-amber/10 flex items-center justify-center mb-4">
                  <Icon name={w.icon} fallback="Check" size={20} className="text-amber" />
                </div>
                <h3 className="font-black text-base text-white mb-2" style={{ fontFamily: "Oswald" }}>{w.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{w.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          ОТЗЫВЫ
      ══════════════════════════════════════════════════════════════════════ */}
      <div ref={secReviews.ref} className="py-16 px-4 bg-white/[0.02] border-y border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className={cls("mb-8 text-center transition-all duration-700", secReviews.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
            <p className="text-amber text-xs font-bold tracking-[0.3em] uppercase mb-2">отзывы</p>
            <h2 className="font-black text-3xl sm:text-4xl text-white" style={{ fontFamily: "Oswald" }}>ЧТО ГОВОРЯТ КЛИЕНТЫ</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {REVIEWS.map((r, i) => (
              <div key={r.name}
                className={cls("p-6 rounded-2xl border border-white/8 bg-white/[0.02] transition-all duration-700", secReviews.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}
                style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="flex mb-3">
                  {Array.from({ length: r.stars }).map((_, j) => (
                    <Icon key={j} name="Star" size={16} className="text-amber fill-amber" />
                  ))}
                </div>
                <p className="text-sm text-white/70 leading-relaxed mb-4">«{r.text}»</p>
                <div>
                  <p className="font-bold text-sm text-white" style={{ fontFamily: "Oswald" }}>{r.name}</p>
                  <p className="text-xs text-white/30 mt-0.5">{r.city}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          КОНТАКТЫ
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="contacts" ref={secContacts.ref} className="py-20 sm:py-28 px-4">
        <div className="max-w-4xl mx-auto">
          <div className={cls("mb-8 transition-all duration-700", secContacts.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
            <p className="text-amber text-xs font-bold tracking-[0.3em] uppercase mb-2">контакты</p>
            <h2 className="font-black text-4xl sm:text-5xl text-white" style={{ fontFamily: "Oswald" }}>СВЯЖИСЬ<br /><span className="text-amber">СЕЙЧАС</span></h2>
          </div>

          {/* Большие кнопки */}
          <div className={cls("grid sm:grid-cols-2 gap-3 mb-3 transition-all duration-700 delay-100", secContacts.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
            <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white transition active:scale-[0.98] group">
              <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-white/25 transition">
                <Icon name="Send" size={26} />
              </div>
              <div>
                <p className="font-black text-xl" style={{ fontFamily: "Oswald" }}>Telegram</p>
                <p className="text-sm opacity-75">@Mezhgorod1816 · быстрый ответ</p>
              </div>
            </a>
            <a href={PHONE_HREF}
              className="flex items-center gap-4 p-5 rounded-2xl bg-amber hover:bg-amber/90 text-coal transition active:scale-[0.98] group">
              <div className="w-14 h-14 bg-black/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-black/20 transition">
                <Icon name="Phone" size={26} />
              </div>
              <div>
                <p className="font-black text-xl" style={{ fontFamily: "Oswald" }}>Позвонить</p>
                <p className="text-sm opacity-60">{PHONE} · 24/7</p>
              </div>
            </a>
            <a href={WA_HREF} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl bg-green-600 hover:bg-green-500 text-white transition active:scale-[0.98] group">
              <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-white/25 transition">
                <Icon name="MessageCircle" size={26} />
              </div>
              <div>
                <p className="font-black text-xl" style={{ fontFamily: "Oswald" }}>WhatsApp</p>
                <p className="text-sm opacity-75">{PHONE}</p>
              </div>
            </a>
            <a href={VK_HREF} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl bg-[#0077FF] hover:bg-[#0088FF] text-white transition active:scale-[0.98] group">
              <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-white/25 transition">
                <Icon name="Users" size={26} />
              </div>
              <div>
                <p className="font-black text-xl" style={{ fontFamily: "Oswald" }}>ВКонтакте</p>
                <p className="text-sm opacity-75">vk.ru/dalnyack</p>
              </div>
            </a>
          </div>

          {/* MAX + Поделиться */}
          <div className={cls("flex flex-col sm:flex-row gap-3 transition-all duration-700 delay-200", secContacts.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
            <a href={MAX_HREF} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center gap-3 p-4 rounded-2xl bg-[#005FF9] hover:bg-[#1a70ff] text-white transition active:scale-[0.98]">
              <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center shrink-0"><MaxIcon size={22} /></div>
              <div>
                <p className="font-black text-base" style={{ fontFamily: "Oswald" }}>MAX</p>
                <p className="text-xs opacity-70">Мессенджер от ВКонтакте</p>
              </div>
            </a>
            <div className="flex-1 flex items-center gap-3 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="flex-1">
                <p className="font-bold text-sm text-white" style={{ fontFamily: "Oswald" }}>Порекомендуй нас</p>
                <p className="text-xs text-white/40">Поделись сайтом с другом</p>
              </div>
              <button onClick={doShare} className="flex items-center gap-2 bg-amber text-coal font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-amber/90 transition shrink-0" style={{ fontFamily: "Oswald" }}>
                <Icon name="Share2" size={15} />Поделиться
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Последний CTA блок ── */}
      <div className="py-16 px-4 bg-amber/[0.05] border-t border-amber/10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-black text-3xl sm:text-4xl text-white mb-3" style={{ fontFamily: "Oswald" }}>
            ГОТОВ ЕХАТЬ?<br /><span className="text-amber">УЗНАЙ СТОИМОСТЬ ПРЯМО СЕЙЧАС</span>
          </h2>
          <p className="text-white/50 text-sm mb-8">Пишите маршрут — ответим за 2 минуты и назовём точную цену</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <CTABlock text="Написать" />
          </div>
        </div>
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-white/8 py-8 px-4 pb-20 md:pb-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-2.5">
              <img src={LOGO} alt="" className="w-8 h-8 rounded-lg object-cover" />
              <span className="font-black text-base tracking-widest text-white uppercase" style={{ fontFamily: "Oswald" }}>Дальняк</span>
            </div>
            <div className="flex items-center gap-3">
              <a href={TG_HREF} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-sky-500/20 hover:bg-sky-500/40 rounded-xl flex items-center justify-center text-sky-400 transition"><Icon name="Send" size={16} /></a>
              <a href={WA_HREF} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-green-600/20 hover:bg-green-600/40 rounded-xl flex items-center justify-center text-green-400 transition"><Icon name="MessageCircle" size={16} /></a>
              <a href={VK_HREF} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-blue-500/20 hover:bg-blue-500/40 rounded-xl flex items-center justify-center text-blue-400 transition"><Icon name="Users" size={16} /></a>
              <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-[#005FF9]/20 hover:bg-[#005FF9]/40 rounded-xl flex items-center justify-center transition"><MaxIcon size={18} /></a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-white/5">
            <p className="text-xs text-white/20">© 2025 Такси «Дальняк» · Межгородное такси</p>
            <p className="text-xs text-white/15">такси межгород · междугороднее такси · дальние поездки</p>
          </div>
        </div>
      </footer>
    </div>
  );
}