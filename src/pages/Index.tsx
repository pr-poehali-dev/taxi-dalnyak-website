import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const HERO_BG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/9f1988fa-044e-4fe0-9ed6-d8c75200c13b.jpg";
const CAR_IMG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/d777a0ac-bb72-4451-9248-4a96fb44db9f.jpg";
const LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/eed871f1-fcfc-4342-ba10-6d3337b98fe4.jpg";

const NAV_ITEMS = [
  { id: "home", label: "Главная" },
  { id: "tariffs", label: "Тарифы" },
  { id: "chat", label: "Чат" },
  { id: "about", label: "О компании" },
  { id: "contacts", label: "Контакты" },
];

const TARIFFS = [
  {
    name: "СТАНДАРТ",
    price: "от 30 ₽/км",
    badge: null,
    desc: "Поездки от 200 км, комфортный седан",
    features: ["Седан / Хэтчбек", "До 3 пассажиров", "Кондиционер", "Оплата картой"],
    featured: false,
  },
  {
    name: "КОМФОРТ",
    price: "от 40 ₽/км",
    badge: "Хит",
    desc: "Просторный салон, опытный водитель",
    features: ["Бизнес-класс", "До 4 пассажиров", "Зарядка в авто", "Вода в подарок"],
    featured: true,
  },
  {
    name: "МИНИВЭН",
    price: "от 50 ₽/км",
    badge: "VIP",
    desc: "Большой салон для компаний и багажа",
    features: ["Минивэн / Внедорожник", "До 6 пассажиров", "Детское кресло", "Помощь с багажом"],
    featured: false,
  },
];

const PHONE = "8(995) 645-5125";
const PHONE_HREF = "tel:+79956455125";
const TG_HREF = "https://t.me/Mezhgorod1816";
const CHAT_URL = "https://functions.poehali.dev/7cea919d-afa7-4c03-a9cd-0e6cc7e634e8";

type Msg = { id: string; from: string; text: string; time: string; image_url?: string | null };

function getSessionId() {
  let sid = localStorage.getItem("dalnyak_session");
  if (!sid) {
    sid = "s_" + Math.random().toString(36).slice(2) + Date.now();
    localStorage.setItem("dalnyak_session", sid);
  }
  return sid;
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setInView(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

function sendNotif(title: string, body: string) {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  try { new Notification(title, { body, icon: LOGO }); } catch { /* Safari может не поддерживать */ }
}

// Рендер сообщения — вынесен ВНЕ компонента Index чтобы не пересоздаваться
function MsgList({ messages, msgsRef }: { messages: Msg[]; msgsRef: React.RefObject<HTMLDivElement> }) {
  return (
    <div ref={msgsRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
      {messages.length === 0 && (
        <div className="flex justify-start">
          <div className="bg-secondary text-foreground rounded-tr-lg rounded-br-lg rounded-bl-lg px-3 py-2.5 max-w-[85%]">
            <p className="font-golos text-sm leading-relaxed">
              Добрый день! Специализируемся на дальних поездках от 200 км. Чем могу помочь?
            </p>
          </div>
        </div>
      )}
      {messages.map(msg => (
        <div key={msg.id} className={`flex ${msg.from === "client" ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-[85%] ${msg.from === "client"
            ? "bg-amber text-coal rounded-tl-lg rounded-bl-lg rounded-br-lg"
            : "bg-secondary text-foreground rounded-tr-lg rounded-br-lg rounded-bl-lg"}`}>
            {msg.image_url && (
              <a href={msg.image_url} target="_blank" rel="noopener noreferrer">
                <img src={msg.image_url} alt="фото" className="rounded-t-lg max-w-[240px] w-full object-cover" style={{ maxHeight: 200 }} />
              </a>
            )}
            <div className="px-3 py-2">
              {msg.text && <p className="font-golos text-sm leading-relaxed">{msg.text}</p>}
              <p className={`font-golos text-[10px] mt-0.5 ${msg.from === "client" ? "text-coal/60 text-right" : "text-muted-foreground"}`}>
                {msg.time}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function Index() {
  const [activeSection, setActiveSection] = useState("home");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [sending, setSending] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotificationPermission>(
    "Notification" in window ? Notification.permission : "denied"
  );
  const [installPrompt, setInstallPrompt] = useState<Event | null>(null);
  const [installDismissed, setInstallDismissed] = useState(() => localStorage.getItem("pwa_dismissed") === "1");
  const [chatOpen, setChatOpen] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputSectionRef = useRef<HTMLInputElement>(null);

  // Два отдельных рефа для скролла — для секции и для плавающего чата
  const chatMsgsRef = useRef<HTMLDivElement>(null);
  const chatFloatMsgsRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(getSessionId());
  const lastSeenId = useRef<string | null>(null);
  const initialized = useRef(false);

  const tariffSection = useInView();
  const aboutSection = useInView();
  const contactSection = useInView();

  // PWA install prompt — перехватываем до показа браузерного
  useEffect(() => {
    const handler = (e: Event) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const loadMessages = async () => {
    try {
      const res = await fetch(`${CHAT_URL}?session_id=${sessionId.current}`);
      const data = await res.json();
      if (data.messages) {
        const msgs: Msg[] = data.messages;
        if (!initialized.current) {
          // Первый запуск — запоминаем baseline, не уведомляем
          initialized.current = true;
          lastSeenId.current = msgs.length > 0 ? msgs[msgs.length - 1].id : null;
        } else {
          // Ищем новые сообщения оператора
          const lastIdx = lastSeenId.current
            ? msgs.findIndex(m => m.id === lastSeenId.current)
            : -1;
          const newMsgs = lastIdx >= 0 ? msgs.slice(lastIdx + 1) : [];
          const newFromOperator = newMsgs.filter(m => m.from === "operator");
          if (newFromOperator.length > 0) {
            sendNotif("Такси Дальняк", newFromOperator[newFromOperator.length - 1].text);
          }
          if (msgs.length > 0) lastSeenId.current = msgs[msgs.length - 1].id;
        }
        setMessages(msgs);
      }
    } catch { /* сеть недоступна */ }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
  }, []);

  // Скролл ТОЛЬКО внутри контейнера чата — никакого scrollIntoView на странице
  useEffect(() => {
    if (chatMsgsRef.current) chatMsgsRef.current.scrollTop = chatMsgsRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    if (chatOpen && chatFloatMsgsRef.current) chatFloatMsgsRef.current.scrollTop = chatFloatMsgsRef.current.scrollHeight;
  }, [messages, chatOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "tariffs", "chat", "about", "contacts"];
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) { setActiveSection(id); break; }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  const sendMessage = async () => {
    if (!inputVal.trim() || sending) return;
    setSending(true);
    const text = inputVal.trim();
    setInputVal("");
    try {
      await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId.current, text, from_role: "client" }),
      });
      await loadMessages();
    } catch { /* */ }
    setSending(false);
  };

  const sendPhoto = async (file: File) => {
    setUploadingImg(true);
    try {
      const reader = new FileReader();
      const b64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(",")[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId.current, image_b64: b64, from_role: "client" }),
      });
      await loadMessages();
    } catch { /* */ }
    setUploadingImg(false);
  };

  const askNotif = async () => {
    if (!("Notification" in window)) return;
    const perm = await Notification.requestPermission();
    setNotifPermission(perm);
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (installPrompt as any).prompt();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (installPrompt as any).userChoice;
    setInstallPrompt(null);
    setInstallDismissed(true);
    localStorage.setItem("pwa_dismissed", "1");
  };

  const dismissInstall = () => {
    setInstallDismissed(true);
    localStorage.setItem("pwa_dismissed", "1");
  };

  const showNotifBtn = notifPermission !== "granted" && "Notification" in window;

  return (
    <div className="min-h-screen bg-background font-golos grain-overlay">

      {/* PWA INSTALL BANNER — яркий, хорошо заметный */}
      {installPrompt && !installDismissed && (
        <div className="fixed top-16 left-0 right-0 z-[60] mx-3 sm:mx-auto sm:max-w-md">
          <div className="bg-amber rounded-xl px-4 py-3 flex items-center gap-3 shadow-2xl border-2 border-amber">
            <img src={LOGO} alt="" className="w-10 h-10 rounded-lg object-contain flex-shrink-0 bg-black border border-black/20" />
            <div className="flex-1 min-w-0">
              <p className="font-oswald font-bold text-coal text-sm leading-tight">Добавить на главный экран</p>
              <p className="font-golos text-coal/70 text-xs mt-0.5">Такси Дальняк — быстрый доступ</p>
            </div>
            <button onClick={handleInstall} className="bg-coal text-amber font-oswald font-bold text-xs px-4 py-2 rounded-lg whitespace-nowrap hover:bg-coal/80 transition-colors shrink-0">
              Добавить
            </button>
            <button onClick={dismissInstall} className="text-coal/50 hover:text-coal p-1 shrink-0">
              <Icon name="X" size={16} />
            </button>
          </div>
        </div>
      )}

      {/* FLOATING CHAT */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        {chatOpen && (
          <div
            className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
            style={{ width: "min(calc(100vw - 32px), 360px)", height: "min(calc(100vh - 120px), 500px)" }}
          >
            {/* Шапка плавающего чата */}
            <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border bg-card shrink-0">
              <div className="relative shrink-0">
                <div className="w-8 h-8 bg-amber rounded-sm flex items-center justify-center">
                  <Icon name="Car" size={15} className="text-coal" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-card" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-oswald font-semibold text-sm text-foreground leading-none">Такси «Дальняк»</div>
                <div className="text-green-400 text-[10px] font-golos mt-0.5">● Онлайн · от 200 км</div>
              </div>
              {showNotifBtn && (
                <button onClick={askNotif} className="text-amber/70 hover:text-amber p-1 transition-colors" title="Включить уведомления">
                  <Icon name="Bell" size={15} />
                </button>
              )}
              <button onClick={() => setChatOpen(false)} className="text-muted-foreground hover:text-foreground p-1">
                <Icon name="X" size={15} />
              </button>
            </div>

            {/* Сообщения */}
            <MsgList messages={messages} msgsRef={chatFloatMsgsRef} />

            {/* Ввод */}
            <div className="p-2 border-t border-border flex gap-1.5 shrink-0 bg-card">
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Маршрут или вопрос..."
                autoComplete="off"
                className="flex-1 bg-secondary border-none outline-none font-golos text-sm text-foreground placeholder:text-muted-foreground px-3 py-2.5 rounded-sm min-w-0"
              />
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) sendPhoto(f); e.target.value = ""; }} />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImg}
                className="text-muted-foreground hover:text-amber p-2.5 transition-colors disabled:opacity-40 shrink-0"
                title="Прикрепить фото"
              >
                {uploadingImg ? <Icon name="Loader" size={15} className="animate-spin" /> : <Icon name="Paperclip" size={15} />}
              </button>
              <button
                onClick={sendMessage}
                disabled={sending}
                className="bg-amber text-coal px-3 py-2.5 hover:bg-amber/90 transition-colors flex items-center disabled:opacity-50 rounded-sm shrink-0"
              >
                <Icon name="Send" size={15} />
              </button>
            </div>
          </div>
        )}

        {/* Кнопка открытия */}
        <button
          onClick={() => setChatOpen(prev => !prev)}
          className="w-14 h-14 bg-amber rounded-full shadow-2xl flex items-center justify-center hover:bg-amber/90 transition-all active:scale-95"
          aria-label="Открыть чат"
        >
          <Icon name={chatOpen ? "X" : "MessageCircle"} size={24} className="text-coal" />
        </button>
      </div>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <button onClick={() => scrollTo("home")} className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-amber flex items-center justify-center rounded-sm shrink-0">
              <span className="font-oswald font-bold text-coal text-xs">Д</span>
            </div>
            <span className="font-oswald font-bold text-lg sm:text-xl tracking-widest text-foreground uppercase">Дальняк</span>
          </button>

          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`font-golos text-sm tracking-wide transition-colors ${activeSection === item.id ? "text-amber" : "text-muted-foreground hover:text-foreground"}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a href={PHONE_HREF} className="hidden md:flex items-center gap-2 text-amber font-oswald font-medium tracking-wider hover:opacity-80 transition-opacity text-sm">
              <Icon name="Phone" size={15} />
              {PHONE}
            </a>
            <a href={PHONE_HREF} className="md:hidden text-amber p-1">
              <Icon name="Phone" size={20} />
            </a>
            <button className="md:hidden text-foreground p-1" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={22} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-card border-t border-border px-4 py-2 flex flex-col animate-fade-in">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`text-left font-golos text-sm py-3 px-2 border-b border-border/40 last:border-0 ${activeSection === item.id ? "text-amber" : "text-muted-foreground"}`}
              >
                {item.label}
              </button>
            ))}
            <a href={PHONE_HREF} className="text-amber font-oswald text-sm py-3 px-2 flex items-center gap-2 border-b border-border/40">
              <Icon name="Phone" size={14} />{PHONE}
            </a>
            <a href={TG_HREF} target="_blank" rel="noopener noreferrer" className="text-sky-400 font-golos text-sm py-3 px-2 flex items-center gap-2">
              <Icon name="Send" size={14} />Telegram @Mezhgorod1816
            </a>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_BG})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-coal/80 via-coal/60 to-background" />

        <div className="relative z-10 text-center px-4 sm:px-6 max-w-4xl mx-auto pt-14">
          <div className="mb-4 sm:mb-6 animate-fade-in" style={{ animationDelay: "0.1s", opacity: 0 }}>
            <span className="inline-block border border-amber/40 text-amber font-golos text-xs tracking-[0.2em] sm:tracking-[0.3em] px-3 sm:px-4 py-2 uppercase">
              Межгород · Аэропорт · От 200 км
            </span>
          </div>
          <h1 className="font-oswald font-bold text-5xl sm:text-7xl md:text-9xl tracking-tight text-white mb-3 sm:mb-4 animate-fade-up" style={{ animationDelay: "0.2s", opacity: 0 }}>
            ДАЛЬНЯК
          </h1>
          <p className="font-golos text-base sm:text-xl text-foreground/70 mb-8 sm:mb-10 max-w-xl mx-auto animate-fade-up leading-relaxed" style={{ animationDelay: "0.4s", opacity: 0 }}>
            Специализируемся только на дальних поездках от 200 км. Фиксированная цена за километр — без сюрпризов.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-up" style={{ animationDelay: "0.6s", opacity: 0 }}>
            <button
              onClick={() => scrollTo("tariffs")}
              className="w-full sm:w-auto group bg-amber text-coal font-oswald font-semibold tracking-widest uppercase px-8 py-4 text-sm hover:bg-amber/90 transition-all duration-300"
            >
              Тарифы <Icon name="ArrowRight" size={16} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setChatOpen(true)}
              className="w-full sm:w-auto border border-foreground/30 text-foreground font-golos text-sm px-8 py-4 hover:border-amber hover:text-amber transition-all duration-300"
            >
              Написать в чат
            </button>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: "1s", opacity: 0 }}>
          <span className="text-muted-foreground text-xs tracking-[0.2em] uppercase">Прокрутить</span>
          <div className="w-px h-8 bg-gradient-to-b from-amber to-transparent" />
        </div>
      </section>

      {/* STATS */}
      <section className="bg-asphalt border-y border-border py-6 sm:py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {[
            { num: "50 000+", label: "Поездок выполнено" },
            { num: "5+ лет", label: "На рынке" },
            { num: "24/7", label: "Работаем без выходных" },
            { num: "от 200 км", label: "Минимальная поездка" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-oswald font-bold text-xl sm:text-3xl text-amber">{stat.num}</div>
              <div className="font-golos text-[11px] sm:text-xs text-muted-foreground mt-1 tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TARIFFS */}
      <section id="tariffs" ref={tariffSection.ref} className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className={`mb-10 sm:mb-16 ${tariffSection.inView ? "animate-fade-up" : "opacity-0"}`}>
            <span className="text-amber font-golos text-xs tracking-[0.3em] uppercase">02 / тарифы</span>
            <h2 className="font-oswald font-bold text-4xl sm:text-6xl mt-2 text-foreground">
              ВЫБЕРИ СВОЙ<br /><span className="text-amber">ТАРИФ</span>
            </h2>
            <p className="font-golos text-sm text-muted-foreground mt-3 max-w-md">
              Стоимость считается за километр. Минимальная поездка — от 200 км.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {TARIFFS.map((t, i) => (
              <div
                key={t.name}
                className={`border bg-card p-6 sm:p-8 relative flex flex-col ${t.featured ? "border-amber" : "border-border"} ${tariffSection.inView ? "animate-fade-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 + i * 0.15}s` }}
              >
                {t.badge && (
                  <span className="absolute top-4 right-4 bg-amber text-coal font-oswald font-bold text-xs tracking-widest px-3 py-1 uppercase">{t.badge}</span>
                )}
                <div className="mb-4 sm:mb-6">
                  <h3 className="font-oswald font-bold text-2xl sm:text-3xl tracking-widest text-foreground mb-1">{t.name}</h3>
                  <p className="text-muted-foreground text-sm font-golos">{t.desc}</p>
                </div>
                <div className="text-amber font-oswald font-bold text-3xl sm:text-4xl mb-6 sm:mb-8">{t.price}</div>
                <ul className="space-y-2.5 mb-6 sm:mb-8 flex-1">
                  {t.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm font-golos text-foreground/80">
                      <Icon name="Check" size={14} className="text-amber flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setChatOpen(true)}
                  className={`w-full py-3 font-oswald font-semibold tracking-widest text-sm uppercase transition-all duration-300 ${t.featured ? "bg-amber text-coal hover:bg-amber/90" : "border border-border text-foreground hover:border-amber hover:text-amber"}`}
                >
                  Заказать
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CAR DIVIDER */}
      <div className="relative h-48 sm:h-64 overflow-hidden">
        <img src={CAR_IMG} alt="Такси Дальняк" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
        <div className="absolute inset-0 flex items-center justify-center px-4">
          <p className="font-oswald text-3xl sm:text-5xl font-bold text-white text-center tracking-[0.1em] uppercase opacity-90">Везём дальше всех</p>
        </div>
      </div>

      {/* CHAT SECTION */}
      <section id="chat" className="py-16 sm:py-24 px-4 sm:px-6 bg-asphalt">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8 sm:mb-12 animate-fade-up">
            <span className="text-amber font-golos text-xs tracking-[0.3em] uppercase">03 / чат</span>
            <h2 className="font-oswald font-bold text-4xl sm:text-6xl mt-2 text-foreground">
              НАПИШИ<br /><span className="text-amber">ОПЕРАТОРУ</span>
            </h2>
          </div>

          <div className="border border-border bg-card rounded-sm flex flex-col" style={{ height: "440px" }}>
            {/* Шапка */}
            <div className="flex flex-wrap items-center gap-3 p-3 sm:p-4 border-b border-border shrink-0">
              <div className="relative shrink-0">
                <div className="w-10 h-10 bg-amber rounded-sm flex items-center justify-center">
                  <Icon name="Car" size={18} className="text-coal" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-oswald font-semibold tracking-wide text-foreground text-sm sm:text-base">Такси «Дальняк»</div>
                <div className="text-green-400 text-xs font-golos flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                  Онлайн · от 200 км · ответим за 2 мин
                </div>
              </div>
              {showNotifBtn && (
                <button
                  onClick={askNotif}
                  className="flex items-center gap-1.5 text-[11px] text-amber font-golos border border-amber/40 hover:border-amber hover:bg-amber/10 px-2.5 py-1.5 transition-all whitespace-nowrap rounded-sm"
                >
                  <Icon name="Bell" size={13} />Уведомления
                </button>
              )}
            </div>

            {/* Сообщения */}
            <MsgList messages={messages} msgsRef={chatMsgsRef} />

            {/* Ввод */}
            <div className="p-2 sm:p-3 border-t border-border flex gap-1.5 shrink-0">
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Ваш маршрут или вопрос..."
                autoComplete="off"
                className="flex-1 bg-secondary border-none outline-none font-golos text-sm text-foreground placeholder:text-muted-foreground px-3 py-2.5 rounded-sm min-w-0"
              />
              <input ref={fileInputSectionRef} type="file" accept="image/*" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) sendPhoto(f); e.target.value = ""; }} />
              <button
                onClick={() => fileInputSectionRef.current?.click()}
                disabled={uploadingImg}
                className="text-muted-foreground hover:text-amber p-2.5 transition-colors disabled:opacity-40 shrink-0"
                title="Прикрепить фото"
              >
                {uploadingImg ? <Icon name="Loader" size={15} className="animate-spin" /> : <Icon name="Paperclip" size={15} />}
              </button>
              <button
                onClick={sendMessage}
                disabled={sending}
                className="bg-amber text-coal px-4 py-2.5 hover:bg-amber/90 transition-colors flex items-center gap-1 disabled:opacity-50 rounded-sm shrink-0"
              >
                <Icon name="Send" size={15} />
              </button>
            </div>
          </div>

          <p className="mt-3 text-muted-foreground text-xs font-golos text-center">
            Оператор ответит здесь — обновление автоматическое
          </p>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" ref={aboutSection.ref} className="py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className={`grid md:grid-cols-2 gap-10 sm:gap-16 items-center ${aboutSection.inView ? "animate-fade-up" : "opacity-0"}`}>
            <div>
              <span className="text-amber font-golos text-xs tracking-[0.3em] uppercase">04 / о компании</span>
              <h2 className="font-oswald font-bold text-4xl sm:text-6xl mt-2 mb-5 sm:mb-6 text-foreground">
                МЫ ТЕ,<br /><span className="text-amber">КТО ЕДЕТ</span>
              </h2>
              <p className="font-golos text-foreground/70 leading-relaxed mb-4 text-sm sm:text-base">
                «Дальняк» — сервис, который специализируется исключительно на дальних поездках от 200 км. Межгород, аэропорты, трансферы на большие расстояния. Городскими поездками не занимаемся.
              </p>
              <p className="font-golos text-foreground/70 leading-relaxed mb-6 text-sm sm:text-base">
                Фиксированная цена за километр без скрытых доплат — вы знаете стоимость заранее. Водители с опытом дальних маршрутов.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { icon: "Route", text: "Только поездки от 200 км" },
                  { icon: "DollarSign", text: "Фиксированная цена/км" },
                  { icon: "MapPin", text: "Маршруты по всей России" },
                  { icon: "Clock", text: "Работаем 24/7" },
                ].map(item => (
                  <div key={item.text} className="flex items-start gap-3">
                    <Icon name={item.icon} fallback="Circle" size={16} className="text-amber mt-0.5 flex-shrink-0" />
                    <span className="font-golos text-sm text-foreground/80">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border p-6 sm:p-8 space-y-5">
              <h3 className="font-oswald font-bold text-xl sm:text-2xl tracking-wider text-foreground">ЦЕНЫ ЗА КМ</h3>
              <p className="font-golos text-foreground/70 text-sm leading-relaxed">
                Итоговая стоимость = тариф × расстояние. Никаких доплат за время суток или пробки на трассе.
              </p>
              <div className="h-px bg-border" />
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  { val: "30 ₽", label: "Стандарт/км" },
                  { val: "40 ₽", label: "Комфорт/км" },
                  { val: "50 ₽", label: "Минивэн/км" },
                ].map(item => (
                  <div key={item.label}>
                    <div className="font-oswald font-bold text-amber text-xl sm:text-2xl">{item.val}</div>
                    <div className="font-golos text-[11px] sm:text-xs text-muted-foreground mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>
              <div className="h-px bg-border" />
              <div className="flex items-center gap-3 text-sm font-golos text-foreground/70">
                <Icon name="Info" size={16} className="text-amber shrink-0" />
                Минимальная поездка от 200 км
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" ref={contactSection.ref} className="py-16 sm:py-24 px-4 sm:px-6 bg-asphalt">
        <div className="max-w-6xl mx-auto">
          <div className={`mb-10 sm:mb-16 ${contactSection.inView ? "animate-fade-up" : "opacity-0"}`}>
            <span className="text-amber font-golos text-xs tracking-[0.3em] uppercase">05 / контакты</span>
            <h2 className="font-oswald font-bold text-4xl sm:text-6xl mt-2 text-foreground">
              НА СВЯЗИ<br /><span className="text-amber">ВСЕГДА</span>
            </h2>
          </div>

          <div className={`grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 ${contactSection.inView ? "animate-fade-up" : "opacity-0"}`} style={{ animationDelay: "0.2s" }}>
            {[
              { icon: "Phone", title: "Телефон", value: PHONE, sub: "Звонки и WhatsApp", href: PHONE_HREF, external: false },
              { icon: "Send", title: "Telegram", value: "@Mezhgorod1816", sub: "Пишите в любое время", href: TG_HREF, external: true },
              { icon: "MessageCircle", title: "Онлайн-чат", value: "Прямо на сайте", sub: "Ответим за 2 минуты", href: null, external: false },
            ].map(contact => (
              <div
                key={contact.title}
                onClick={() => {
                  if (contact.href) {
                    if (contact.external) window.open(contact.href, "_blank");
                    else window.location.href = contact.href;
                  } else {
                    setChatOpen(true);
                  }
                }}
                className="cursor-pointer bg-card border border-border p-6 sm:p-8 flex flex-col gap-4 hover:border-amber/50 transition-colors active:scale-[0.99]"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 bg-amber/10 border border-amber/30 flex items-center justify-center">
                  <Icon name={contact.icon} fallback="Circle" size={20} className="text-amber" />
                </div>
                <div>
                  <div className="font-oswald font-semibold text-sm tracking-wider text-muted-foreground uppercase">{contact.title}</div>
                  <div className="font-oswald font-bold text-base sm:text-xl text-foreground mt-1">{contact.value}</div>
                  <div className="font-golos text-sm text-muted-foreground mt-1">{contact.sub}</div>
                </div>
              </div>
            ))}
          </div>

          <div className={`mt-6 sm:mt-8 bg-card border border-amber/30 p-6 sm:p-8 ${contactSection.inView ? "animate-fade-up" : "opacity-0"}`} style={{ animationDelay: "0.4s" }}>
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <div>
                <h3 className="font-oswald font-bold text-xl sm:text-2xl text-foreground mb-2">ЗАКАЗАТЬ ЗВОНОК</h3>
                <p className="font-golos text-sm text-muted-foreground">Оставьте номер — перезвоним за 2 минуты</p>
              </div>
              <div className="flex gap-3">
                <input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  className="flex-1 bg-secondary border border-border px-4 py-3 font-golos text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-amber transition-colors min-w-0"
                />
                <button className="bg-amber text-coal font-oswald font-semibold tracking-wider uppercase px-4 sm:px-6 py-3 text-xs sm:text-sm hover:bg-amber/90 transition-colors whitespace-nowrap">
                  Позвонить
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-6 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-amber rounded-sm flex items-center justify-center">
              <span className="font-oswald font-bold text-coal text-[10px]">Д</span>
            </div>
            <span className="font-oswald font-bold text-sm tracking-widest text-muted-foreground uppercase">Дальняк</span>
          </div>
          <p className="font-golos text-xs text-muted-foreground text-center">© 2025 Такси «Дальняк». Все права защищены.</p>
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
            {NAV_ITEMS.map(item => (
              <button key={item.id} onClick={() => scrollTo(item.id)} className="font-golos text-xs text-muted-foreground hover:text-amber transition-colors">
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}