import { useState, useEffect, useRef, useCallback, memo } from "react";
import Icon from "@/components/ui/icon";

const HERO_BG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/9f1988fa-044e-4fe0-9ed6-d8c75200c13b.jpg";
const CAR_IMG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/d777a0ac-bb72-4451-9248-4a96fb44db9f.jpg";
const LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/eed871f1-fcfc-4342-ba10-6d3337b98fe4.jpg";
const PHONE = "8 (995) 645-51-25";
const PHONE_HREF = "tel:+79956455125";
const TG_HREF = "https://t.me/Mezhgorod1816";
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

let audioCtx: AudioContext | null = null;
function playSound() {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(880, audioCtx.currentTime);
    osc.frequency.setValueAtTime(1100, audioCtx.currentTime + 0.1);
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
    osc.start(audioCtx.currentTime);
    osc.stop(audioCtx.currentTime + 0.4);
  } catch { /* */ }
}

function useVisible(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [v, setV] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setV(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { ref, v };
}

const Bubble = memo(({ msg }: { msg: Msg }) => {
  const me = msg.from === "client";
  return (
    <div className={`flex ${me ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[80%] overflow-hidden rounded-2xl ${me ? "bg-amber text-coal rounded-br-sm" : "bg-white/5 text-foreground rounded-bl-sm"}`}>
        {msg.image_url && (
          <a href={msg.image_url} target="_blank" rel="noopener noreferrer">
            <img src={msg.image_url} alt="фото" className="block max-w-full object-cover" style={{ maxHeight: 220 }} />
          </a>
        )}
        {(msg.text || !msg.image_url) && (
          <div className="px-4 py-2.5">
            {msg.text && <p className="text-sm leading-relaxed font-golos">{msg.text}</p>}
            <p className={`text-[10px] mt-1 font-golos ${me ? "text-coal/50 text-right" : "text-white/30"}`}>{msg.time}</p>
          </div>
        )}
      </div>
    </div>
  );
});
Bubble.displayName = "Bubble";

function ChatInput({ onSend }: { onSend: (t: string) => Promise<void> }) {
  const [txt, setTxt] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const send = async () => {
    const t = txt.trim();
    if (!t || busy) return;
    setBusy(true);
    setTxt("");
    await onSend(t);
    setBusy(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex items-center gap-2 p-3 border-t border-white/[0.08] bg-[#111]/80 shrink-0">
      <input ref={inputRef} type="text" value={txt} onChange={(e) => setTxt(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        placeholder="Напишите маршрут или вопрос..."
        autoComplete="off" enterKeyHint="send"
        className="flex-1 bg-white/5 rounded-xl px-4 py-2.5 text-sm font-golos text-foreground placeholder:text-white/30 outline-none focus:ring-1 focus:ring-amber/50 transition min-w-0" />
      <button onClick={send} disabled={busy || !txt.trim()}
        className="w-10 h-10 flex items-center justify-center rounded-xl bg-amber text-coal hover:bg-amber/90 transition disabled:opacity-40 shrink-0">
        <Icon name="Send" size={16} />
      </button>
    </div>
  );
}

export default function Index() {
  const [section, setSection] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatVisible, setChatVisible] = useState(false);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission>(
    "Notification" in window ? Notification.permission : "denied"
  );
  const [pwaEvt, setPwaEvt] = useState<Event | null>(null);
  const [pwaDone, setPwaDone] = useState(false);

  const sid = useRef(getSid());
  const lastSeen = useRef<string | null>(null);
  const inited = useRef(false);
  const floatScroll = useRef<HTMLDivElement>(null);
  const secScroll = useRef<HTMLDivElement>(null);
  const chatSectionRef = useRef<HTMLDivElement>(null);

  const secTariffs = useVisible();
  const secAbout = useVisible();
  const secContacts = useVisible();

  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setPwaEvt(e); };
    window.addEventListener("beforeinstallprompt", h);
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => setChatVisible(e.isIntersecting), { threshold: 0.1 });
    if (chatSectionRef.current) obs.observe(chatSectionRef.current);
    return () => obs.disconnect();
  }, []);

  const load = useCallback(async () => {
    try {
      const r = await fetch(`${API}?session_id=${sid.current}`);
      if (!r.ok) return;
      const d = await r.json();
      if (!d.messages) return;
      const m: Msg[] = d.messages;

      if (!inited.current) {
        inited.current = true;
        lastSeen.current = m.length ? m[m.length - 1].id : null;
      } else {
        const idx = lastSeen.current ? m.findIndex((x) => x.id === lastSeen.current) : -1;
        const nw = idx >= 0 ? m.slice(idx + 1) : [];
        const op = nw.filter((x) => x.from === "operator");
        if (op.length) {
          playSound();
          if ("Notification" in window && Notification.permission === "granted") {
            try { new Notification("Такси Дальняк", { body: op[op.length - 1].text || "Новое сообщение", icon: LOGO }); } catch { /* */ }
          }
        }
        if (m.length) lastSeen.current = m[m.length - 1].id;
      }
      setMsgs(m);
    } catch { /* тихо */ }
  }, []);

  const needPolling = chatOpen || chatVisible;
  useEffect(() => {
    if (!needPolling) return;
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load, needPolling]);

  useEffect(() => {
    if (secScroll.current) secScroll.current.scrollTop = secScroll.current.scrollHeight;
  }, [msgs]);

  useEffect(() => {
    if (chatOpen && floatScroll.current) floatScroll.current.scrollTop = floatScroll.current.scrollHeight;
  }, [msgs, chatOpen]);

  useEffect(() => {
    const fn = () => {
      for (const id of [...NAV.map((n) => n.id)].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 130) { setSection(id); break; }
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

  const doSendText = async (text: string) => {
    try {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sid.current, text, from_role: "client" }),
      });
      await load();
    } catch { /* */ }
  };

  const askNotif = async () => {
    if (!("Notification" in window)) return;
    const p = await Notification.requestPermission();
    setNotifPerm(p);
    playSound();
  };

  const doInstall = async () => {
    if (!pwaEvt) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pwaEvt as any).prompt();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (pwaEvt as any).userChoice;
    setPwaEvt(null);
    setPwaDone(true);
  };

  const showNotif = notifPerm !== "granted" && "Notification" in window;
  const showPwa = !!pwaEvt && !pwaDone;

  return (
    <div className="min-h-screen bg-background text-foreground font-golos">

      {showPwa && (
        <div className="fixed top-[57px] sm:top-[65px] inset-x-0 z-50 flex justify-center px-3 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-md bg-amber rounded-2xl shadow-2xl flex items-center gap-3 px-4 py-3">
            <img src={LOGO} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0 bg-black" />
            <div className="flex-1 min-w-0">
              <p className="font-oswald font-bold text-coal text-sm leading-tight">Добавить на главный экран</p>
              <p className="text-coal/60 text-xs font-golos mt-0.5">Быстрый доступ к Такси Дальняк</p>
            </div>
            <button onClick={doInstall} className="bg-coal text-amber font-oswald font-bold text-xs px-4 py-2 rounded-lg shrink-0">Добавить</button>
            <button onClick={() => setPwaDone(true)} className="text-coal/40 hover:text-coal p-1 shrink-0"><Icon name="X" size={15} /></button>
          </div>
        </div>
      )}

      {/* floating chat */}
      <div className="fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3">
        {chatOpen && (
          <div className="rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-white/10 bg-[#111]"
            style={{ width: "min(calc(100vw - 32px), 370px)", height: "min(calc(100dvh - 130px), 520px)" }}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.08] bg-black/40 shrink-0">
              <div className="relative shrink-0">
                <img src={LOGO} alt="" className="w-9 h-9 rounded-lg object-cover bg-black" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#111]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-oswald font-semibold text-sm text-white leading-none">Такси «Дальняк»</p>
                <p className="text-green-400 text-[11px] font-golos mt-0.5">● Онлайн · от 200 км</p>
              </div>
              {showNotif && (
                <button onClick={askNotif} className="w-8 h-8 flex items-center justify-center rounded-lg text-amber/60 hover:text-amber hover:bg-white/5 transition shrink-0">
                  <Icon name="Bell" size={16} />
                </button>
              )}
              <button onClick={() => setChatOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition shrink-0">
                <Icon name="X" size={16} />
              </button>
            </div>
            <div ref={floatScroll} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
              <div className="flex justify-start">
                <div className="bg-white/5 text-foreground rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%]">
                  <p className="text-sm leading-relaxed font-golos">Здравствуйте! Напишите маршрут — рассчитаем стоимость. Поездки от 200 км.</p>
                  <p className="text-[10px] mt-1 text-white/30 font-golos">сейчас</p>
                </div>
              </div>
              {msgs.map((m) => <Bubble key={m.id} msg={m} />)}
            </div>
            <ChatInput onSend={doSendText} />
          </div>
        )}
        <button onClick={() => setChatOpen((v) => !v)}
          className="w-14 h-14 bg-amber text-coal rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform">
          <Icon name={chatOpen ? "X" : "MessageCircle"} size={24} />
        </button>
      </div>

      {/* nav */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-white/[0.08] bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <button onClick={() => go("home")} className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-amber rounded-lg flex items-center justify-center shrink-0"><span className="font-oswald font-black text-coal text-sm">Д</span></div>
            <span className="font-oswald font-bold text-lg tracking-widest text-white uppercase">Дальняк</span>
          </button>
          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((n) => (
              <button key={n.id} onClick={() => go(n.id)}
                className={`px-3 py-1.5 rounded-lg font-golos text-sm transition-colors ${section === n.id ? "text-amber bg-amber/10" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
                {n.label}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <a href={PHONE_HREF} className="hidden md:flex items-center gap-2 text-amber font-oswald font-semibold text-sm"><Icon name="Phone" size={14} />{PHONE}</a>
            <a href={PHONE_HREF} className="md:hidden text-amber p-2"><Icon name="Phone" size={20} /></a>
            <button onClick={() => setMenuOpen((v) => !v)} className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition">
              <Icon name={menuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden border-t border-white/[0.08] bg-background/95 backdrop-blur-xl">
            <div className="max-w-6xl mx-auto px-4 py-3 space-y-1">
              {NAV.map((n) => (
                <button key={n.id} onClick={() => go(n.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-golos text-sm transition-colors ${section === n.id ? "text-amber bg-amber/10" : "text-white/60 hover:text-white hover:bg-white/5"}`}>
                  {n.label}
                </button>
              ))}
              <div className="pt-2 pb-1 flex flex-col gap-2">
                <a href={PHONE_HREF} className="flex items-center gap-2 px-4 py-3 text-amber font-oswald font-semibold text-sm"><Icon name="Phone" size={16} />{PHONE}</a>
                <a href={TG_HREF} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-3 text-sky-400 font-golos text-sm"><Icon name="Send" size={16} />Telegram @Mezhgorod1816</a>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* hero */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${HERO_BG})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        <div className="relative z-10 text-center px-4 sm:px-6 max-w-5xl mx-auto pt-16">
          <div className="inline-flex items-center gap-2 border border-amber/30 rounded-full px-4 py-1.5 mb-8 text-amber text-xs font-golos tracking-widest uppercase opacity-0 animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
            <span className="w-1.5 h-1.5 bg-amber rounded-full animate-pulse" />Межгород · Аэропорт · От 200 км
          </div>
          <h1 className="font-oswald font-black text-6xl sm:text-8xl md:text-[110px] leading-none tracking-tight text-white opacity-0 animate-fade-up" style={{ animationDelay: "0.2s", animationFillMode: "forwards" }}>ДАЛЬНЯК</h1>
          <p className="mt-6 font-golos text-base sm:text-xl text-white/60 max-w-xl mx-auto leading-relaxed opacity-0 animate-fade-up" style={{ animationDelay: "0.35s", animationFillMode: "forwards" }}>
            Специализируемся только на дальних поездках от&nbsp;200&nbsp;км.<br />Фиксированная цена за километр — никаких сюрпризов.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-up" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
            <button onClick={() => go("tariffs")} className="group w-full sm:w-auto bg-amber text-coal font-oswald font-bold tracking-widest uppercase px-8 py-4 rounded-xl text-sm hover:bg-amber/90 transition-all hover:scale-[1.02] active:scale-[0.98]">
              Посмотреть тарифы<Icon name="ArrowRight" size={16} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => setChatOpen(true)} className="w-full sm:w-auto border border-white/20 text-white font-golos text-sm px-8 py-4 rounded-xl hover:border-amber/50 hover:text-amber hover:bg-amber/5 transition-all">Написать оператору</button>
          </div>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-0 animate-fade-in" style={{ animationDelay: "1.2s", animationFillMode: "forwards" }}>
          <span className="text-white/30 text-[11px] tracking-[0.2em] uppercase font-golos">Листать</span>
          <div className="w-px h-10 bg-gradient-to-b from-amber/60 to-transparent" />
        </div>
      </section>

      {/* stats */}
      <div className="border-y border-white/[0.08] bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[{ v: "50 000+", l: "Поездок выполнено" }, { v: "5+ лет", l: "На рынке" }, { v: "24 / 7", l: "Круглосуточно" }, { v: "≥ 200 км", l: "Мин. маршрут" }].map((s) => (
            <div key={s.v} className="text-center">
              <div className="font-oswald font-bold text-2xl sm:text-3xl text-amber">{s.v}</div>
              <div className="font-golos text-xs text-white/40 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* tariffs */}
      <section id="tariffs" ref={secTariffs.ref} className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className={`mb-12 sm:mb-16 transition-all duration-700 ${secTariffs.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className="text-amber font-golos text-xs tracking-[0.3em] uppercase mb-3">02 — тарифы</p>
            <h2 className="font-oswald font-black text-4xl sm:text-6xl text-white leading-none">ВЫБЕРИ<br /><span className="text-amber">ТАРИФ</span></h2>
            <p className="mt-4 font-golos text-sm text-white/40 max-w-sm">Цена за каждый километр. Минимальная поездка — 200 км.</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {TARIFFS.map((t, i) => (
              <div key={t.name}
                className={`relative flex flex-col rounded-2xl border p-6 sm:p-8 transition-all duration-700 ${secTariffs.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"} ${t.featured ? "border-amber/40 bg-amber/5 shadow-[0_0_40px_rgba(245,158,11,0.08)]" : "border-white/[0.08] bg-white/[0.02] hover:border-white/[0.16] hover:bg-white/[0.04]"} transition-colors`}
                style={{ transitionDelay: `${i * 100}ms` }}>
                {t.badge && <div className="absolute top-5 right-5 bg-amber text-coal font-oswald font-bold text-[11px] tracking-wider px-3 py-1 rounded-full uppercase">{t.badge}</div>}
                <div className="mb-6">
                  <h3 className="font-oswald font-black text-2xl tracking-wider text-white">{t.name}</h3>
                  <p className="mt-1 font-golos text-sm text-white/40">{t.desc}</p>
                </div>
                <div className="mb-8 flex items-baseline gap-1.5">
                  <span className="font-oswald font-black text-5xl text-amber">{t.price}</span>
                  <span className="font-golos text-sm text-white/40">{t.unit}</span>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 font-golos text-sm text-white/70">
                      <span className="w-4 h-4 rounded-full bg-amber/15 flex items-center justify-center shrink-0"><Icon name="Check" size={10} className="text-amber" /></span>{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => setChatOpen(true)}
                  className={`w-full py-3 rounded-xl font-oswald font-bold text-sm tracking-wider uppercase transition-all hover:scale-[1.01] active:scale-[0.99] ${t.featured ? "bg-amber text-coal hover:bg-amber/90" : "border border-white/15 text-white hover:border-amber/50 hover:text-amber"}`}>
                  Заказать
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* divider */}
      <div className="relative h-52 sm:h-72 overflow-hidden">
        <img src={CAR_IMG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-background/50" />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <p className="font-oswald font-black text-3xl sm:text-6xl text-white/90 tracking-[0.08em] uppercase text-center drop-shadow-2xl">Везём дальше всех</p>
        </div>
      </div>

      {/* chat section */}
      <section id="chat" ref={chatSectionRef} className="py-20 sm:py-32 px-4 sm:px-6 bg-white/[0.01]">
        <div className="max-w-2xl mx-auto">
          <div className="mb-10">
            <p className="text-amber font-golos text-xs tracking-[0.3em] uppercase mb-3">03 — чат</p>
            <h2 className="font-oswald font-black text-4xl sm:text-6xl text-white leading-none">НАПИШИ<br /><span className="text-amber">ОПЕРАТОРУ</span></h2>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] overflow-hidden flex flex-col" style={{ height: 460 }}>
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.08] bg-black/20 shrink-0">
              <div className="relative shrink-0">
                <img src={LOGO} alt="" className="w-9 h-9 rounded-lg object-cover bg-black" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-[#0d0d0d]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-oswald font-semibold text-sm text-white">Такси «Дальняк»</p>
                <p className="text-green-400 text-[11px] font-golos">● Онлайн · Ответим за 2 минуты</p>
              </div>
              {showNotif && (
                <button onClick={askNotif} className="flex items-center gap-1.5 text-xs text-amber border border-amber/30 hover:border-amber hover:bg-amber/10 px-3 py-1.5 rounded-lg font-golos transition shrink-0">
                  <Icon name="Bell" size={13} /><span className="hidden sm:inline">Уведомления</span>
                </button>
              )}
            </div>
            <div ref={secScroll} className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
              <div className="flex justify-start">
                <div className="bg-white/5 text-foreground rounded-2xl rounded-bl-sm px-4 py-3 max-w-[80%]">
                  <p className="text-sm leading-relaxed font-golos">Здравствуйте! Напишите маршрут — рассчитаем стоимость. Поездки от 200 км.</p>
                  <p className="text-[10px] mt-1 text-white/30 font-golos">сейчас</p>
                </div>
              </div>
              {msgs.map((m) => <Bubble key={m.id} msg={m} />)}
            </div>
            <ChatInput onSend={doSendText} />
          </div>
        </div>
      </section>

      {/* about */}
      <section id="about" ref={secAbout.ref} className="py-20 sm:py-32 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className={`grid md:grid-cols-2 gap-12 sm:gap-20 items-center transition-all duration-700 ${secAbout.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div>
              <p className="text-amber font-golos text-xs tracking-[0.3em] uppercase mb-3">04 — о нас</p>
              <h2 className="font-oswald font-black text-4xl sm:text-6xl text-white leading-none mb-8">МЫ ТЕ,<br /><span className="text-amber">КТО ЕДЕТ</span></h2>
              <div className="space-y-4 font-golos text-sm text-white/55 leading-relaxed">
                <p>«Дальняк» — сервис, который специализируется исключительно на дальних поездках от 200 км. Межгород, аэропорты, трансферы.</p>
                <p>Фиксированная цена за километр — никаких надбавок за время суток, пробки или погоду.</p>
              </div>
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[{ icon: "Route", text: "Только поездки от 200 км" }, { icon: "DollarSign", text: "Фиксированная цена за км" }, { icon: "MapPin", text: "Любые маршруты по России" }, { icon: "Clock", text: "Работаем круглосуточно" }].map((item) => (
                  <div key={item.text} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center shrink-0"><Icon name={item.icon} fallback="Circle" size={15} className="text-amber" /></div>
                    <span className="font-golos text-sm text-white/60">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8">
              <h3 className="font-oswald font-bold text-xl text-white mb-2">ТАРИФЫ ЗА КМ</h3>
              <p className="font-golos text-xs text-white/30 mb-8">Итог = тариф × расстояние. Нет скрытых доплат.</p>
              <div className="space-y-5">
                {[{ name: "Стандарт", price: "30 ₽/км", f: false }, { name: "Комфорт", price: "40 ₽/км", f: true }, { name: "Минивэн", price: "50 ₽/км", f: false }].map((t) => (
                  <div key={t.name} className={`flex items-center justify-between p-4 rounded-xl ${t.f ? "bg-amber/10 border border-amber/20" : "bg-white/[0.03]"}`}>
                    <span className={`font-oswald font-semibold text-sm ${t.f ? "text-amber" : "text-white/60"}`}>{t.name}</span>
                    <span className={`font-oswald font-black text-xl ${t.f ? "text-amber" : "text-white"}`}>{t.price}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 pt-6 border-t border-white/[0.08] flex items-center gap-3">
                <Icon name="Info" size={15} className="text-amber shrink-0" /><p className="font-golos text-xs text-white/30">Минимальная поездка — 200 км</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* contacts */}
      <section id="contacts" ref={secContacts.ref} className="py-20 sm:py-32 px-4 sm:px-6 bg-white/[0.01] border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className={`mb-12 sm:mb-16 transition-all duration-700 ${secContacts.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <p className="text-amber font-golos text-xs tracking-[0.3em] uppercase mb-3">05 — контакты</p>
            <h2 className="font-oswald font-black text-4xl sm:text-6xl text-white leading-none">НА СВЯЗИ<br /><span className="text-amber">ВСЕГДА</span></h2>
          </div>
          <div className={`grid sm:grid-cols-3 gap-4 transition-all duration-700 delay-150 ${secContacts.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {[
              { icon: "Phone", title: "Телефон", value: PHONE, sub: "Звонки и WhatsApp", action: () => { window.location.href = PHONE_HREF; } },
              { icon: "Send", title: "Telegram", value: "@Mezhgorod1816", sub: "Пишите в любое время", action: () => { window.open(TG_HREF, "_blank"); } },
              { icon: "MessageCircle", title: "Онлайн-чат", value: "Прямо на сайте", sub: "Ответим за 2 минуты", action: () => { setChatOpen(true); go("chat"); } },
            ].map((c) => (
              <button key={c.title} onClick={c.action}
                className="group text-left rounded-2xl border border-white/[0.08] bg-white/[0.02] hover:border-amber/30 hover:bg-amber/[0.03] p-6 sm:p-8 flex flex-col gap-5 transition-all">
                <div className="w-12 h-12 rounded-xl bg-amber/10 border border-amber/20 flex items-center justify-center group-hover:bg-amber/20 transition-colors"><Icon name={c.icon} fallback="Circle" size={20} className="text-amber" /></div>
                <div>
                  <p className="font-oswald font-semibold text-xs tracking-wider text-white/30 uppercase mb-1">{c.title}</p>
                  <p className="font-oswald font-bold text-lg text-white group-hover:text-amber transition-colors">{c.value}</p>
                  <p className="font-golos text-xs text-white/30 mt-1">{c.sub}</p>
                </div>
              </button>
            ))}
          </div>

          {/* Поделиться */}
          <div className={`mt-6 transition-all duration-700 delay-300 ${secContacts.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-6">
              <div className="flex-1 min-w-0">
                <p className="font-oswald font-bold text-lg text-white">Знаете тех, кому нужно такси?</p>
                <p className="font-golos text-sm text-white/40 mt-1">Поделитесь сайтом — и другу поможете, и нам спасибо.</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: "Такси Дальняк — межгород", text: "Такси на дальние поездки от 200 км. Фиксированная цена за км.", url: window.location.href });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Ссылка скопирована!");
                    }
                  }}
                  className="flex items-center gap-2 bg-amber text-coal font-oswald font-bold text-sm tracking-wider uppercase px-6 py-3 rounded-xl hover:bg-amber/90 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  <Icon name="Share2" size={16} />Поделиться
                </button>
                <a href={`https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent("Такси Дальняк — межгородное такси от 200 км. Фиксированная цена за км.")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 border border-sky-500/30 text-sky-400 font-golos text-sm px-5 py-3 rounded-xl hover:bg-sky-500/10 hover:border-sky-500/60 transition-all">
                  <Icon name="Send" size={16} />Telegram
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* footer */}
      <footer className="border-t border-white/5 py-8 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-amber rounded-lg flex items-center justify-center"><span className="font-oswald font-black text-coal text-xs">Д</span></div>
            <span className="font-oswald font-bold text-sm tracking-widest text-white/40 uppercase">Дальняк</span>
          </div>
          <p className="font-golos text-xs text-white/20 text-center">© 2025 Такси «Дальняк»</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {NAV.map((n) => <button key={n.id} onClick={() => go(n.id)} className="font-golos text-xs text-white/25 hover:text-amber transition-colors">{n.label}</button>)}
          </div>
        </div>
      </footer>
    </div>
  );
}