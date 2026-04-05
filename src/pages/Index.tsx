import { useState, useEffect, useRef, useCallback, memo } from "react";
import Icon from "@/components/ui/icon";

const HERO_BG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/9f1988fa-044e-4fe0-9ed6-d8c75200c13b.jpg";
const CAR_IMG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/d777a0ac-bb72-4451-9248-4a96fb44db9f.jpg";
const LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/eed871f1-fcfc-4342-ba10-6d3337b98fe4.jpg";
const PHONE = "8 (995) 645-51-25";
const PHONE_HREF = "tel:+79956455125";
const TG_HREF = "https://t.me/Mezhgorod1816";
const WA_HREF = "https://wa.me/79956455125";
const API = "https://functions.poehali.dev/2cfb628d-f55c-47b3-9871-e215cef551a3";

const NAV = [
  { id: "home", label: "Главная" },
  { id: "tariffs", label: "Тарифы" },
  { id: "chat", label: "Чат" },
  { id: "about", label: "О нас" },
  { id: "contacts", label: "Контакты" },
];

const TARIFFS = [
  { name: "СТАНДАРТ", price: "30 ₽", unit: "за км", desc: "Надёжный седан для дальних поездок", features: ["Седан / Хэтчбек", "До 3 пассажиров", "Кондиционер", "Оплата картой или наличными"], featured: false, badge: "" },
  { name: "КОМФОРТ", price: "40 ₽", unit: "за км", desc: "Бизнес-класс с максимальным удобством", features: ["Бизнес-класс авто", "До 4 пассажиров", "Зарядка USB-C / USB-A", "Вода в дорогу"], featured: true, badge: "Популярный" },
  { name: "МИНИВЭН", price: "50 ₽", unit: "за км", desc: "Для компаний и больших поездок", features: ["Минивэн / Внедорожник", "До 6 пассажиров", "Детское кресло", "Большой багажник"], featured: false, badge: "" },
];

type Msg = { id: string; from: string; text: string; time: string; image_url?: string | null };

function getSid(): string {
  let s = localStorage.getItem("dalnyak_sid");
  if (!s) {
    s = "u_" + crypto.randomUUID().replace(/-/g, "").slice(0, 16) + "_" + Date.now();
    localStorage.setItem("dalnyak_sid", s);
  }
  return s;
}

// Звук уведомления через Web Audio API
let _ac: AudioContext | null = null;
function beep() {
  try {
    if (!_ac) _ac = new AudioContext();
    if (_ac.state === "suspended") _ac.resume();
    const o = _ac.createOscillator();
    const g = _ac.createGain();
    o.connect(g); g.connect(_ac.destination);
    o.type = "sine";
    o.frequency.setValueAtTime(880, _ac.currentTime);
    o.frequency.exponentialRampToValueAtTime(1200, _ac.currentTime + 0.15);
    g.gain.setValueAtTime(0.4, _ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, _ac.currentTime + 0.5);
    o.start(_ac.currentTime);
    o.stop(_ac.currentTime + 0.5);
  } catch { /* */ }
}

function useVisible() {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
     
  }, []);
  return { ref, v };
}

const Bubble = memo(({ msg }: { msg: Msg }) => {
  const me = msg.from === "client";
  return (
    <div className={`flex ${me ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[82%] rounded-2xl overflow-hidden ${me ? "bg-amber text-coal rounded-br-sm" : "bg-white/8 text-white rounded-bl-sm"}`}>
        {msg.image_url && (
          <a href={msg.image_url} target="_blank" rel="noopener noreferrer">
            <img src={msg.image_url} alt="" className="block max-w-full" style={{ maxHeight: 200 }} />
          </a>
        )}
        {(msg.text || !msg.image_url) && (
          <div className="px-4 py-2.5">
            {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
            <p className={`text-[11px] mt-1 ${me ? "text-coal/50 text-right" : "text-white/30"}`}>{msg.time}</p>
          </div>
        )}
      </div>
    </div>
  );
});
Bubble.displayName = "Bubble";

// Поле ввода — отдельный компонент со своим state
// чтобы перерисовка сообщений НЕ сбрасывала клавиатуру
function ChatInput({ onSend, disabled }: { onSend: (t: string) => Promise<void>; disabled?: boolean }) {
  const [txt, setTxt] = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const send = async () => {
    const t = txt.trim();
    if (!t || busy) return;
    setBusy(true);
    setTxt("");
    await onSend(t);
    setBusy(false);
    // возвращаем фокус — клавиатура остаётся
    requestAnimationFrame(() => ref.current?.focus());
  };

  return (
    <div className="flex gap-2 p-3 border-t border-white/10 bg-black/30 shrink-0">
      <input
        ref={ref}
        value={txt}
        onChange={e => setTxt(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        placeholder={disabled ? "Нет соединения..." : "Напишите маршрут или вопрос..."}
        disabled={disabled}
        autoComplete="off"
        enterKeyHint="send"
        inputMode="text"
        className="flex-1 min-w-0 bg-white/5 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-amber/60 transition disabled:opacity-40"
      />
      <button
        onClick={send}
        disabled={busy || !txt.trim() || disabled}
        className="w-10 h-10 shrink-0 rounded-xl bg-amber text-coal flex items-center justify-center hover:bg-amber/90 active:scale-95 transition disabled:opacity-40"
      >
        {busy ? <Icon name="Loader" size={16} className="animate-spin" /> : <Icon name="Send" size={16} />}
      </button>
    </div>
  );
}

export default function Index() {
  const [section, setSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [connected, setConnected] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [pwaEvt, setPwaEvt] = useState<Event | null>(null);

  const sid = useRef(getSid());
  const lastId = useRef<string | null>(null);
  const firstLoad = useRef(true);
  const floatEnd = useRef<HTMLDivElement>(null);
  const secEnd = useRef<HTMLDivElement>(null);
  const chatSecRef = useRef<HTMLDivElement>(null);
  const [chatSecVisible, setChatSecVisible] = useState(false);

  const secTariffs = useVisible();
  const secAbout = useVisible();
  const secContacts = useVisible();

  // PWA
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setPwaEvt(e); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  // Observer для секции чата
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => setChatSecVisible(e.isIntersecting), { threshold: 0.05 });
    if (chatSecRef.current) obs.observe(chatSecRef.current);
    return () => obs.disconnect();
  }, []);

  // Загрузка сообщений
  const load = useCallback(async () => {
    try {
      const r = await fetch(`${API}?session_id=${sid.current}`, { signal: AbortSignal.timeout(8000) });
      if (!r.ok) return;
      const d = await r.json();
      const m: Msg[] = d.messages || [];
      setConnected(true);

      if (firstLoad.current) {
        firstLoad.current = false;
        lastId.current = m.length ? m[m.length - 1].id : null;
        setMsgs(m);
        return;
      }

      const newMsgs = lastId.current
        ? m.filter((x, i) => i > m.findLastIndex(x => x.id === lastId.current))
        : m;

      const idx = m.findLastIndex(x => x.id === lastId.current);
      const fresh = idx >= 0 ? m.slice(idx + 1) : (m.length !== msgs.length ? m : []);

      if (fresh.filter(x => x.from === "operator").length > 0) {
        beep();
        if ("Notification" in window && Notification.permission === "granted") {
          try { new Notification("Такси Дальняк", { body: fresh.filter(x => x.from === "operator").at(-1)?.text || "Новое сообщение", icon: LOGO }); } catch { /* */ }
        }
      }

      if (m.length) lastId.current = m[m.length - 1].id;
      setMsgs(m);
      void newMsgs; // suppress unused warning
    } catch {
      setConnected(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!chatOpen && !chatSecVisible) return;
    load();
    const t = setInterval(load, 6000);
    return () => clearInterval(t);
  }, [load, chatOpen, chatSecVisible]);

  // Скролл
  useEffect(() => {
    floatEnd.current?.scrollIntoView({ block: "nearest" });
  }, [msgs, chatOpen]);
  useEffect(() => {
    secEnd.current?.scrollIntoView({ block: "nearest" });
  }, [msgs]);

  // Активная секция при скролле
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

  const sendMsg = async (text: string) => {
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sid.current, text, from_role: "client" }),
    }).catch(() => {});
    await load();
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
      navigator.share({ title: "Такси Дальняк — межгород", text: "Такси на дальние поездки от 200 км. Фиксированная цена.", url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => alert("Ссылка скопирована!"));
    }
  };

  const ChatWidget = (
    <div className="flex flex-col h-full">
      {/* Шапка чата */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-black/20 shrink-0">
        <div className="relative shrink-0">
          <img src={LOGO} alt="" className="w-9 h-9 rounded-lg object-cover" />
          <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#111] ${connected ? "bg-green-400" : "bg-yellow-500"}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-oswald font-semibold text-sm text-white">Такси «Дальняк»</p>
          <p className={`text-[11px] ${connected ? "text-green-400" : "text-yellow-400"}`}>
            {connected ? "● Онлайн · отвечаем быстро" : "● Подключение..."}
          </p>
        </div>
      </div>
      {/* Сообщения */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        <div className="flex justify-start">
          <div className="bg-white/8 text-white rounded-2xl rounded-bl-sm px-4 py-3 max-w-[82%]">
            <p className="text-sm leading-relaxed">Здравствуйте! Напишите маршрут — рассчитаем стоимость. Работаем от 200 км.</p>
            <p className="text-[11px] mt-1 text-white/30">сейчас</p>
          </div>
        </div>
        {msgs.map(m => <Bubble key={m.id} msg={m} />)}
        <div ref={floatEnd} />
      </div>
      <ChatInput onSend={sendMsg} disabled={!connected && !firstLoad.current} />
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground" style={{ fontFamily: "'Golos Text', sans-serif" }}>

      {/* PWA баннер */}
      {pwaEvt && (
        <div className="fixed top-[57px] inset-x-0 z-50 flex justify-center px-3 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-md bg-amber rounded-2xl shadow-2xl flex items-center gap-3 px-4 py-3">
            <img src={LOGO} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-coal text-sm">Добавить на главный экран</p>
              <p className="text-coal/60 text-xs mt-0.5">Быстрый доступ к Такси Дальняк</p>
            </div>
            <button onClick={doInstall} className="bg-coal text-amber font-bold text-xs px-4 py-2 rounded-lg shrink-0">Добавить</button>
            <button onClick={() => setPwaEvt(null)} className="text-coal/40 p-1 shrink-0"><Icon name="X" size={15} /></button>
          </div>
        </div>
      )}

      {/* Плавающая кнопка чата */}
      <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3">
        {chatOpen && (
          <div className="rounded-2xl shadow-2xl overflow-hidden border border-white/10 bg-[#111]"
            style={{ width: "min(calc(100vw - 32px), 370px)", height: "min(calc(100dvh - 140px), 520px)", display: "flex", flexDirection: "column" }}>
            {/* Кнопка закрыть */}
            <div className="absolute top-3 right-3 z-10">
              <button onClick={() => setChatOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/10 text-white/60 hover:text-white transition">
                <Icon name="X" size={14} />
              </button>
            </div>
            {ChatWidget}
          </div>
        )}
        <button
          onClick={() => setChatOpen(v => !v)}
          className="w-14 h-14 bg-amber text-coal rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        >
          <Icon name={chatOpen ? "X" : "MessageCircle"} size={26} />
        </button>
      </div>

      {/* Навигация */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-white/10 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
          <button onClick={() => go("home")} className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-amber rounded-lg flex items-center justify-center">
              <span className="font-black text-coal text-sm" style={{ fontFamily: "Oswald" }}>Д</span>
            </div>
            <span className="font-bold text-lg tracking-widest text-white uppercase hidden sm:block" style={{ fontFamily: "Oswald" }}>Дальняк</span>
          </button>

          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
            {NAV.map(n => (
              <button key={n.id} onClick={() => go(n.id)}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${section === n.id ? "text-amber bg-amber/10" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                {n.label}
              </button>
            ))}
          </nav>

          {/* Контакты в шапке — заметные */}
          <div className="flex items-center gap-2 shrink-0">
            <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs px-3 py-2 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]">
              <Icon name="Send" size={14} />
              <span className="hidden sm:inline">Telegram</span>
            </a>
            <a href={PHONE_HREF}
              className="flex items-center gap-1.5 bg-amber text-coal font-bold text-xs px-3 py-2 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ fontFamily: "Oswald" }}>
              <Icon name="Phone" size={14} />
              <span className="hidden sm:inline">{PHONE}</span>
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
              <div className="pt-3 pb-1 grid grid-cols-2 gap-2">
                <a href={PHONE_HREF} className="flex items-center justify-center gap-2 bg-amber text-coal font-bold text-sm py-3 rounded-xl" style={{ fontFamily: "Oswald" }}>
                  <Icon name="Phone" size={16} />{PHONE}
                </a>
                <a href={TG_HREF} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-sky-500 text-white font-bold text-sm py-3 rounded-xl">
                  <Icon name="Send" size={16} />Telegram
                </a>
                <a href={WA_HREF} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-green-600 text-white font-bold text-sm py-3 rounded-xl col-span-2">
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
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto pt-16">
          <div className="inline-flex items-center gap-2 border border-amber/30 rounded-full px-4 py-1.5 mb-8 text-amber text-xs tracking-widest uppercase opacity-0 animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
            <span className="w-1.5 h-1.5 bg-amber rounded-full animate-pulse" />Межгород · Аэропорт · От 200 км
          </div>
          <h1 className="font-black text-6xl sm:text-8xl md:text-[110px] leading-none tracking-tight text-white opacity-0 animate-fade-up" style={{ fontFamily: "Oswald", animationDelay: "0.2s", animationFillMode: "forwards" }}>
            ДАЛЬНЯК
          </h1>
          <p className="mt-6 text-base sm:text-xl text-white/60 max-w-xl mx-auto leading-relaxed opacity-0 animate-fade-up" style={{ animationDelay: "0.35s", animationFillMode: "forwards" }}>
            Специализируемся только на дальних поездках от&nbsp;200&nbsp;км.<br />Фиксированная цена за километр — никаких сюрпризов.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 opacity-0 animate-fade-up" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
            <button onClick={() => go("tariffs")} className="w-full sm:w-auto bg-amber text-coal font-bold tracking-widest uppercase px-8 py-4 rounded-xl text-sm hover:bg-amber/90 transition-all hover:scale-[1.02] active:scale-[0.98]" style={{ fontFamily: "Oswald" }}>
              Тарифы <Icon name="ArrowRight" size={16} className="inline ml-1" />
            </button>
            <a href={PHONE_HREF} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-amber/10 border border-amber/30 text-amber font-bold text-sm px-8 py-4 rounded-xl hover:bg-amber/20 transition-all" style={{ fontFamily: "Oswald" }}>
              <Icon name="Phone" size={16} />{PHONE}
            </a>
            <a href={TG_HREF} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-sky-500/10 border border-sky-500/30 text-sky-400 font-bold text-sm px-8 py-4 rounded-xl hover:bg-sky-500/20 transition-all" style={{ fontFamily: "Oswald" }}>
              <Icon name="Send" size={16} />Telegram
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <div className="border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[{ v: "50 000+", l: "Поездок" }, { v: "5+ лет", l: "На рынке" }, { v: "24/7", l: "Работаем" }, { v: "≥200 км", l: "Маршруты" }].map(s => (
            <div key={s.v} className="text-center">
              <div className="font-black text-2xl sm:text-3xl text-amber" style={{ fontFamily: "Oswald" }}>{s.v}</div>
              <div className="text-xs text-white/40 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tariffs */}
      <section id="tariffs" ref={secTariffs.ref} className="py-20 sm:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className={`mb-12 transition-all duration-700 ${secTariffs.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className="text-amber text-xs tracking-[0.3em] uppercase mb-3">02 — тарифы</p>
            <h2 className="font-black text-4xl sm:text-6xl text-white leading-none" style={{ fontFamily: "Oswald" }}>ВЫБЕРИ<br /><span className="text-amber">ТАРИФ</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {TARIFFS.map((t, i) => (
              <div key={t.name}
                className={`relative flex flex-col rounded-2xl border p-6 transition-all duration-700 ${secTariffs.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${t.featured ? "border-amber/50 bg-amber/5" : "border-white/10 bg-white/[0.02] hover:border-white/20"}`}
                style={{ transitionDelay: `${i * 80}ms` }}>
                {t.badge && <div className="absolute top-4 right-4 bg-amber text-coal font-bold text-[11px] px-3 py-1 rounded-full" style={{ fontFamily: "Oswald" }}>{t.badge}</div>}
                <h3 className="font-black text-xl text-white mb-1" style={{ fontFamily: "Oswald" }}>{t.name}</h3>
                <p className="text-xs text-white/40 mb-4">{t.desc}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="font-black text-4xl text-amber" style={{ fontFamily: "Oswald" }}>{t.price}</span>
                  <span className="text-xs text-white/40">{t.unit}</span>
                </div>
                <ul className="space-y-2 flex-1 mb-6">
                  {t.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                      <Icon name="Check" size={14} className="text-amber shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => setChatOpen(true)}
                  className={`w-full py-3 rounded-xl font-bold text-sm uppercase transition hover:scale-[1.01] active:scale-[0.99] ${t.featured ? "bg-amber text-coal" : "border border-white/15 text-white hover:border-amber/50 hover:text-amber"}`}
                  style={{ fontFamily: "Oswald" }}>
                  Заказать
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <img src={CAR_IMG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-black text-2xl sm:text-5xl text-white/80 tracking-widest uppercase" style={{ fontFamily: "Oswald" }}>Везём дальше всех</p>
        </div>
      </div>

      {/* Chat section */}
      <section id="chat" ref={chatSecRef} className="py-20 sm:py-28 px-4 bg-white/[0.01]">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <p className="text-amber text-xs tracking-[0.3em] uppercase mb-3">03 — чат</p>
            <h2 className="font-black text-4xl sm:text-5xl text-white leading-none" style={{ fontFamily: "Oswald" }}>НАПИШИ<br /><span className="text-amber">ОПЕРАТОРУ</span></h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] overflow-hidden" style={{ height: 460, display: "flex", flexDirection: "column" }}>
            {ChatWidget}
            {/* переопределяем ref для секции */}
            <div ref={secEnd} />
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" ref={secAbout.ref} className="py-20 sm:py-28 px-4">
        <div className="max-w-5xl mx-auto">
          <div className={`grid md:grid-cols-2 gap-10 items-center transition-all duration-700 ${secAbout.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div>
              <p className="text-amber text-xs tracking-[0.3em] uppercase mb-3">04 — о нас</p>
              <h2 className="font-black text-4xl sm:text-5xl text-white leading-none mb-6" style={{ fontFamily: "Oswald" }}>МЫ ТЕ,<br /><span className="text-amber">КТО ЕДЕТ</span></h2>
              <div className="space-y-3 text-sm text-white/55 leading-relaxed">
                <p>«Дальняк» — только дальние поездки от 200 км. Межгород, аэропорты, трансферы.</p>
                <p>Фиксированная цена за километр — без надбавок за время суток и пробки.</p>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[{ icon: "Route", text: "От 200 км" }, { icon: "DollarSign", text: "Фикс. цена" }, { icon: "MapPin", text: "Вся Россия" }, { icon: "Clock", text: "24/7" }].map(item => (
                  <div key={item.text} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center shrink-0"><Icon name={item.icon} fallback="Circle" size={15} className="text-amber" /></div>
                    <span className="text-sm text-white/60">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <h3 className="font-bold text-lg text-white mb-4" style={{ fontFamily: "Oswald" }}>ЦЕНЫ ЗА КМ</h3>
              <div className="space-y-3">
                {[{ name: "Стандарт", price: "30 ₽/км", f: false }, { name: "Комфорт", price: "40 ₽/км", f: true }, { name: "Минивэн", price: "50 ₽/км", f: false }].map(t => (
                  <div key={t.name} className={`flex items-center justify-between p-3.5 rounded-xl ${t.f ? "bg-amber/10 border border-amber/20" : "bg-white/[0.03]"}`}>
                    <span className={`font-semibold text-sm ${t.f ? "text-amber" : "text-white/60"}`} style={{ fontFamily: "Oswald" }}>{t.name}</span>
                    <span className={`font-black text-lg ${t.f ? "text-amber" : "text-white"}`} style={{ fontFamily: "Oswald" }}>{t.price}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-white/30 mt-4">Минимальная поездка — 200 км</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contacts */}
      <section id="contacts" ref={secContacts.ref} className="py-20 sm:py-28 px-4 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className={`mb-10 transition-all duration-700 ${secContacts.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className="text-amber text-xs tracking-[0.3em] uppercase mb-3">05 — контакты</p>
            <h2 className="font-black text-4xl sm:text-5xl text-white leading-none" style={{ fontFamily: "Oswald" }}>НА СВЯЗИ<br /><span className="text-amber">ВСЕГДА</span></h2>
          </div>

          {/* Большие кнопки контактов */}
          <div className={`grid sm:grid-cols-3 gap-4 transition-all duration-700 delay-100 ${secContacts.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <a href={PHONE_HREF}
              className="flex items-center gap-4 p-5 rounded-2xl bg-amber text-coal hover:bg-amber/90 transition-all hover:scale-[1.01] active:scale-[0.98]">
              <div className="w-12 h-12 bg-coal/10 rounded-xl flex items-center justify-center shrink-0"><Icon name="Phone" size={22} /></div>
              <div>
                <p className="font-semibold text-xs uppercase tracking-wider opacity-60">Позвонить</p>
                <p className="font-black text-base leading-tight" style={{ fontFamily: "Oswald" }}>{PHONE}</p>
              </div>
            </a>
            <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl bg-sky-500 text-white hover:bg-sky-400 transition-all hover:scale-[1.01] active:scale-[0.98]">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0"><Icon name="Send" size={22} /></div>
              <div>
                <p className="font-semibold text-xs uppercase tracking-wider opacity-70">Telegram</p>
                <p className="font-black text-base leading-tight" style={{ fontFamily: "Oswald" }}>@Mezhgorod1816</p>
              </div>
            </a>
            <a href={WA_HREF} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-4 p-5 rounded-2xl bg-green-600 text-white hover:bg-green-500 transition-all hover:scale-[1.01] active:scale-[0.98]">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center shrink-0"><Icon name="MessageCircle" size={22} /></div>
              <div>
                <p className="font-semibold text-xs uppercase tracking-wider opacity-70">WhatsApp</p>
                <p className="font-black text-base leading-tight" style={{ fontFamily: "Oswald" }}>{PHONE}</p>
              </div>
            </a>
          </div>

          {/* Поделиться */}
          <div className={`mt-4 transition-all duration-700 delay-200 ${secContacts.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex flex-col sm:flex-row items-center gap-4">
              <div className="flex-1">
                <p className="font-bold text-white text-base" style={{ fontFamily: "Oswald" }}>Знаете тех, кому нужно такси?</p>
                <p className="text-sm text-white/40 mt-0.5">Поделитесь — и другу поможете, и нам спасибо.</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={doShare} className="flex items-center gap-2 bg-amber text-coal font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-amber/90 transition" style={{ fontFamily: "Oswald" }}>
                  <Icon name="Share2" size={15} />Поделиться
                </button>
                <a href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent("Такси Дальняк — межгородное такси от 200 км")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 border border-sky-500/40 text-sky-400 font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-sky-500/10 transition">
                  <Icon name="Send" size={15} />TG
                </a>
              </div>
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
