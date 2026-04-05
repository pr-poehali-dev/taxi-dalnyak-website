import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const HERO_BG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/9f1988fa-044e-4fe0-9ed6-d8c75200c13b.jpg";
const CAR_IMG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/d777a0ac-bb72-4451-9248-4a96fb44db9f.jpg";
const LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/eed871f1-fcfc-4342-ba10-6d3337b98fe4.jpg";
const PHONE = "8 (995) 645-51-25";
const PHONE_HREF = "tel:+79956455125";
const TG_HREF = "https://t.me/Mezhgorod1816";
const WA_HREF = "https://wa.me/79956455125";

const NAV = [
  { id: "home", label: "Главная" },
  { id: "tariffs", label: "Тарифы" },
  { id: "contacts", label: "Контакты" },
  { id: "about", label: "О нас" },
];

const TARIFFS = [
  { name: "СТАНДАРТ", price: "30 ₽", unit: "за км", desc: "Надёжный седан", features: ["Седан / Хэтчбек", "До 3 пассажиров", "Кондиционер", "Карта или наличные"], featured: false },
  { name: "КОМФОРТ", price: "40 ₽", unit: "за км", desc: "Бизнес-класс", features: ["Бизнес авто", "До 4 пассажиров", "USB зарядка", "Вода в дорогу"], featured: true },
  { name: "МИНИВЭН", price: "50 ₽", unit: "за км", desc: "Для компаний", features: ["Минивэн / Внедорожник", "До 6 пассажиров", "Детское кресло", "Большой багажник"], featured: false },
];

function useVisible() {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold: 0.08 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
     
  }, []);
  return { ref, v };
}

// Виджет «написать» — открывает Telegram/WhatsApp/звонок
function ContactWidget({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [route, setRoute] = useState("");

  const tgMsg = route ? `Здравствуйте! Хочу узнать стоимость поездки: ${route}` : "Здравствуйте! Хочу узнать стоимость поездки.";
  const waMsg = encodeURIComponent(route ? `Здравствуйте! Поездка: ${route}` : "Здравствуйте! Хочу узнать стоимость.");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-sm rounded-2xl bg-[#111] border border-white/10 overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Шапка */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/10 bg-black/20">
          <div className="relative shrink-0">
            <img src={LOGO} alt="" className="w-10 h-10 rounded-xl object-cover" />
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#111]" />
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm text-white" style={{ fontFamily: "Oswald" }}>Такси «Дальняк»</p>
            <p className="text-green-400 text-xs">● Онлайн · Ответим быстро</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition">
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* Приветственное сообщение */}
        <div className="px-4 py-4">
          <div className="bg-white/5 rounded-2xl rounded-bl-sm px-4 py-3 mb-4">
            <p className="text-sm text-white leading-relaxed">Здравствуйте! Напишите маршрут — быстро рассчитаем стоимость. Работаем от 200 км.</p>
            <p className="text-[11px] text-white/30 mt-1">сейчас</p>
          </div>

          {/* Поле маршрута */}
          <input
            value={route}
            onChange={e => setRoute(e.target.value)}
            placeholder="Ваш маршрут (напр: Москва — Казань)"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-amber/50 transition mb-3"
          />

          {/* Кнопки — реальные мессенджеры */}
          <div className="space-y-2">
            <a
              href={`https://t.me/Mezhgorod1816?text=${encodeURIComponent(tgMsg)}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 w-full bg-sky-500 hover:bg-sky-400 text-white px-4 py-3.5 rounded-xl transition active:scale-[0.98]"
            >
              <Icon name="Send" size={20} />
              <div className="text-left">
                <p className="font-bold text-sm" style={{ fontFamily: "Oswald" }}>Написать в Telegram</p>
                <p className="text-xs opacity-75">@Mezhgorod1816</p>
              </div>
              <Icon name="ArrowRight" size={16} className="ml-auto opacity-60" />
            </a>

            <a
              href={`${WA_HREF}?text=${waMsg}`}
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-3 w-full bg-green-600 hover:bg-green-500 text-white px-4 py-3.5 rounded-xl transition active:scale-[0.98]"
            >
              <Icon name="MessageCircle" size={20} />
              <div className="text-left">
                <p className="font-bold text-sm" style={{ fontFamily: "Oswald" }}>Написать в WhatsApp</p>
                <p className="text-xs opacity-75">{PHONE}</p>
              </div>
              <Icon name="ArrowRight" size={16} className="ml-auto opacity-60" />
            </a>

            <a
              href={PHONE_HREF}
              className="flex items-center gap-3 w-full bg-amber text-coal px-4 py-3.5 rounded-xl hover:bg-amber/90 transition active:scale-[0.98]"
            >
              <Icon name="Phone" size={20} />
              <div className="text-left">
                <p className="font-bold text-sm" style={{ fontFamily: "Oswald" }}>Позвонить сейчас</p>
                <p className="text-xs opacity-60">{PHONE}</p>
              </div>
              <Icon name="ArrowRight" size={16} className="ml-auto opacity-60" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Index() {
  const [section, setSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [pwaEvt, setPwaEvt] = useState<Event | null>(null);

  const secTariffs = useVisible();
  const secContacts = useVisible();
  const secAbout = useVisible();

  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setPwaEvt(e); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  useEffect(() => {
    const fn = () => {
      for (const n of [...NAV].reverse()) {
        const el = document.getElementById(n.id);
        if (el && window.scrollY >= el.offsetTop - 130) { setSection(n.id); break; }
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
    await (pwaEvt as any).userChoice;
    setPwaEvt(null);
  };

  const doShare = () => {
    if (navigator.share) {
      navigator.share({ title: "Такси Дальняк", text: "Такси на дальние поездки от 200 км.", url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => alert("Ссылка скопирована!"));
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Golos Text', sans-serif" }}>

      <ContactWidget open={chatOpen} onClose={() => setChatOpen(false)} />

      {/* PWA баннер */}
      {pwaEvt && (
        <div className="fixed top-[57px] inset-x-0 z-40 flex justify-center px-3 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-sm bg-amber rounded-2xl shadow-2xl flex items-center gap-3 px-4 py-3">
            <img src={LOGO} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-coal text-sm">Добавить на главный экран</p>
              <p className="text-coal/60 text-xs mt-0.5">Быстрый доступ к Такси Дальняк</p>
            </div>
            <button onClick={doInstall} className="bg-coal text-amber font-bold text-xs px-4 py-2 rounded-xl shrink-0" style={{ fontFamily: "Oswald" }}>Добавить</button>
            <button onClick={() => setPwaEvt(null)} className="text-coal/40 p-1 shrink-0"><Icon name="X" size={15} /></button>
          </div>
        </div>
      )}

      {/* Плавающая кнопка */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-5 right-4 z-50 w-14 h-14 bg-amber text-coal rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        aria-label="Написать"
      >
        <Icon name="MessageCircle" size={26} />
      </button>

      {/* Навигация */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <button onClick={() => go("home")} className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-amber rounded-lg flex items-center justify-center">
              <span className="font-black text-coal text-sm" style={{ fontFamily: "Oswald" }}>Д</span>
            </div>
            <span className="font-bold text-base tracking-widest text-white uppercase hidden sm:block" style={{ fontFamily: "Oswald" }}>Дальняк</span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(n => (
              <button key={n.id} onClick={() => go(n.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${section === n.id ? "text-amber bg-amber/10" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs px-3 py-2 rounded-xl transition active:scale-95">
              <Icon name="Send" size={14} /><span className="hidden sm:inline">Telegram</span>
            </a>
            <a href={PHONE_HREF}
              className="flex items-center gap-1.5 bg-amber text-coal font-bold text-xs px-3 py-2 rounded-xl transition active:scale-95" style={{ fontFamily: "Oswald" }}>
              <Icon name="Phone" size={14} /><span className="hidden sm:inline">{PHONE}</span>
            </a>
            <button onClick={() => setMenuOpen(v => !v)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition">
              <Icon name={menuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-background/95 backdrop-blur-xl">
            <div className="px-4 py-3 space-y-1">
              {NAV.map(n => (
                <button key={n.id} onClick={() => go(n.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-colors ${section === n.id ? "text-amber bg-amber/10" : "text-white/60 hover:text-white hover:bg-white/5"}`}>
                  {n.label}
                </button>
              ))}
              <div className="pt-2 pb-1 grid grid-cols-1 gap-2">
                <a href={PHONE_HREF} className="flex items-center justify-center gap-2 bg-amber text-coal font-bold py-3 rounded-xl" style={{ fontFamily: "Oswald" }}>
                  <Icon name="Phone" size={16} />{PHONE}
                </a>
                <a href={TG_HREF} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-sky-500 text-white font-bold py-3 rounded-xl">
                  <Icon name="Send" size={16} />Telegram @Mezhgorod1816
                </a>
                <a href={WA_HREF} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 rounded-xl">
                  <Icon name="MessageCircle" size={16} />WhatsApp
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_BG})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-background" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-16">
          <div className="inline-flex items-center gap-2 border border-amber/30 rounded-full px-4 py-1.5 mb-6 text-amber text-xs tracking-widest uppercase opacity-0 animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
            <span className="w-1.5 h-1.5 bg-amber rounded-full animate-pulse" />Межгород · Аэропорт · От 200 км
          </div>
          <h1 className="font-black text-6xl sm:text-8xl md:text-[108px] leading-none tracking-tight text-white opacity-0 animate-fade-up" style={{ fontFamily: "Oswald", animationDelay: "0.2s", animationFillMode: "forwards" }}>
            ДАЛЬНЯК
          </h1>
          <p className="mt-5 text-lg text-white/60 max-w-lg mx-auto leading-relaxed opacity-0 animate-fade-up" style={{ animationDelay: "0.35s", animationFillMode: "forwards" }}>
            Дальние поездки от 200 км по фиксированной цене.<br />Никаких сюрпризов — цена известна до посадки.
          </p>

          {/* Крупные CTA кнопки */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-center opacity-0 animate-fade-up" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
            <button onClick={() => setChatOpen(true)}
              className="w-full sm:w-auto bg-amber text-coal font-bold tracking-wider uppercase px-8 py-4 rounded-2xl text-base hover:bg-amber/90 transition active:scale-[0.98] shadow-lg shadow-amber/20" style={{ fontFamily: "Oswald" }}>
              <Icon name="MessageCircle" size={18} className="inline mr-2" />Написать оператору
            </button>
            <a href={PHONE_HREF}
              className="w-full sm:w-auto flex items-center justify-center gap-2 border-2 border-amber/40 text-amber font-bold text-base px-8 py-4 rounded-2xl hover:bg-amber/10 transition active:scale-[0.98]" style={{ fontFamily: "Oswald" }}>
              <Icon name="Phone" size={18} />{PHONE}
            </a>
          </div>

          {/* Мессенджеры под кнопками */}
          <div className="mt-4 flex gap-3 justify-center opacity-0 animate-fade-in" style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}>
            <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-sky-500/15 border border-sky-500/30 text-sky-400 text-sm font-bold px-4 py-2 rounded-xl hover:bg-sky-500/25 transition">
              <Icon name="Send" size={15} />Telegram
            </a>
            <a href={WA_HREF} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-600/15 border border-green-600/30 text-green-400 text-sm font-bold px-4 py-2 rounded-xl hover:bg-green-600/25 transition">
              <Icon name="MessageCircle" size={15} />WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{ v: "50 000+", l: "Поездок" }, { v: "5+ лет", l: "На рынке" }, { v: "24/7", l: "Работаем" }, { v: "≥200 км", l: "Маршруты" }].map(s => (
            <div key={s.v} className="text-center">
              <div className="font-black text-2xl text-amber" style={{ fontFamily: "Oswald" }}>{s.v}</div>
              <div className="text-xs text-white/40 mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tariffs */}
      <section id="tariffs" ref={secTariffs.ref} className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className={`mb-10 transition-all duration-700 ${secTariffs.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className="text-amber text-xs tracking-[0.3em] uppercase mb-2">тарифы</p>
            <h2 className="font-black text-4xl sm:text-5xl text-white" style={{ fontFamily: "Oswald" }}>ВЫБЕРИ ТАРИФ</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {TARIFFS.map((t, i) => (
              <div key={t.name}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-700 ${secTariffs.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${t.featured ? "border-amber/50 bg-amber/5 shadow-lg shadow-amber/5" : "border-white/10 bg-white/[0.02]"}`}
                style={{ transitionDelay: `${i * 80}ms` }}>
                {t.featured && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber text-coal font-black text-xs px-4 py-1 rounded-full" style={{ fontFamily: "Oswald" }}>Популярный</div>}
                <h3 className="font-black text-xl text-white mb-1" style={{ fontFamily: "Oswald" }}>{t.name}</h3>
                <p className="text-xs text-white/40 mb-4">{t.desc}</p>
                <div className="flex items-baseline gap-1 mb-5">
                  <span className="font-black text-4xl text-amber" style={{ fontFamily: "Oswald" }}>{t.price}</span>
                  <span className="text-sm text-white/40">{t.unit}</span>
                </div>
                <ul className="space-y-2 flex-1 mb-5">
                  {t.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                      <Icon name="Check" size={14} className="text-amber shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => setChatOpen(true)}
                  className={`w-full py-3 rounded-xl font-bold text-sm uppercase transition hover:scale-[1.01] active:scale-[0.98] ${t.featured ? "bg-amber text-coal" : "border border-white/15 text-white hover:border-amber/40 hover:text-amber"}`}
                  style={{ fontFamily: "Oswald" }}>
                  Заказать
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative h-44 overflow-hidden">
        <img src={CAR_IMG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-black text-2xl sm:text-5xl text-white/80 tracking-widest uppercase" style={{ fontFamily: "Oswald" }}>Везём дальше всех</p>
        </div>
      </div>

      {/* Contacts */}
      <section id="contacts" ref={secContacts.ref} className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className={`mb-8 transition-all duration-700 ${secContacts.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className="text-amber text-xs tracking-[0.3em] uppercase mb-2">контакты</p>
            <h2 className="font-black text-4xl sm:text-5xl text-white" style={{ fontFamily: "Oswald" }}>СВЯЖИСЬ С НАМИ</h2>
          </div>

          <div className={`grid sm:grid-cols-3 gap-3 transition-all duration-700 delay-100 ${secContacts.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <a href={PHONE_HREF}
              className="flex items-center gap-4 p-5 rounded-2xl bg-amber text-coal hover:bg-amber/90 transition active:scale-[0.98]">
              <div className="w-12 h-12 bg-black/10 rounded-xl flex items-center justify-center shrink-0"><Icon name="Phone" size={22} /></div>
              <div>
                <p className="text-xs font-semibold opacity-60 uppercase tracking-wider">Позвонить</p>
                <p className="font-black text-base" style={{ fontFamily: "Oswald" }}>{PHONE}</p>
              </div>
            </a>
            <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl bg-sky-500 text-white hover:bg-sky-400 transition active:scale-[0.98]">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center shrink-0"><Icon name="Send" size={22} /></div>
              <div>
                <p className="text-xs font-semibold opacity-70 uppercase tracking-wider">Telegram</p>
                <p className="font-black text-base" style={{ fontFamily: "Oswald" }}>@Mezhgorod1816</p>
              </div>
            </a>
            <a href={WA_HREF} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl bg-green-600 text-white hover:bg-green-500 transition active:scale-[0.98]">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center shrink-0"><Icon name="MessageCircle" size={22} /></div>
              <div>
                <p className="text-xs font-semibold opacity-70 uppercase tracking-wider">WhatsApp</p>
                <p className="font-black text-base" style={{ fontFamily: "Oswald" }}>{PHONE}</p>
              </div>
            </a>
          </div>

          {/* Поделиться */}
          <div className={`mt-3 transition-all duration-700 delay-200 ${secContacts.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1">
                <p className="font-bold text-white" style={{ fontFamily: "Oswald" }}>Знаете тех, кому нужно такси?</p>
                <p className="text-sm text-white/40 mt-0.5">Поделитесь — и другу поможете.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={doShare} className="flex items-center gap-2 bg-amber text-coal font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-amber/90 transition" style={{ fontFamily: "Oswald" }}>
                  <Icon name="Share2" size={15} />Поделиться
                </button>
                <a href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent("Такси Дальняк — межгородное такси от 200 км")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 border border-sky-500/40 text-sky-400 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-sky-500/10 transition">
                  <Icon name="Send" size={15} />TG
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" ref={secAbout.ref} className="py-20 px-4 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className={`grid md:grid-cols-2 gap-10 items-center transition-all duration-700 ${secAbout.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div>
              <p className="text-amber text-xs tracking-[0.3em] uppercase mb-2">о нас</p>
              <h2 className="font-black text-4xl text-white mb-5" style={{ fontFamily: "Oswald" }}>ТОЛЬКО ДАЛЬНИЕ<br /><span className="text-amber">ПОЕЗДКИ</span></h2>
              <div className="space-y-3 text-sm text-white/55 leading-relaxed">
                <p>«Дальняк» специализируется исключительно на поездках от 200 км. Межгород, аэропорты, трансферы по всей России.</p>
                <p>Фиксированная цена за километр — без надбавок за время суток и пробки. Стоимость известна заранее.</p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[{ icon: "Route", text: "От 200 км" }, { icon: "DollarSign", text: "Фикс. цена" }, { icon: "MapPin", text: "Вся Россия" }, { icon: "Clock", text: "24/7" }].map(item => (
                  <div key={item.text} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center shrink-0"><Icon name={item.icon} fallback="Circle" size={15} className="text-amber" /></div>
                    <span className="text-sm text-white/60">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <h3 className="font-black text-xl text-white mb-4" style={{ fontFamily: "Oswald" }}>ТАРИФЫ ЗА КМ</h3>
              <div className="space-y-3">
                {[{ name: "Стандарт", price: "30 ₽/км", f: false }, { name: "Комфорт", price: "40 ₽/км", f: true }, { name: "Минивэн", price: "50 ₽/км", f: false }].map(t => (
                  <div key={t.name} className={`flex items-center justify-between p-3.5 rounded-xl ${t.f ? "bg-amber/10 border border-amber/20" : "bg-white/[0.03]"}`}>
                    <span className={`font-bold text-sm ${t.f ? "text-amber" : "text-white/60"}`} style={{ fontFamily: "Oswald" }}>{t.name}</span>
                    <span className={`font-black text-lg ${t.f ? "text-amber" : "text-white"}`} style={{ fontFamily: "Oswald" }}>{t.price}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/25 mt-4">Минимальная поездка — 200 км</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-6 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber rounded-lg flex items-center justify-center"><span className="font-black text-coal text-xs" style={{ fontFamily: "Oswald" }}>Д</span></div>
            <span className="font-bold text-sm tracking-widest text-white/30 uppercase" style={{ fontFamily: "Oswald" }}>Дальняк</span>
          </div>
          <p className="text-xs text-white/20">© 2025 Такси «Дальняк» · Межгородное такси</p>
          <div className="flex gap-4">
            {NAV.map(n => <button key={n.id} onClick={() => go(n.id)} className="text-xs text-white/25 hover:text-amber transition">{n.label}</button>)}
          </div>
        </div>
      </footer>
    </div>
  );
}
