import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const HERO_BG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/9f1988fa-044e-4fe0-9ed6-d8c75200c13b.jpg";
const CAR_IMG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/d777a0ac-bb72-4451-9248-4a96fb44db9f.jpg";

const NAV_ITEMS = [
  { id: "home", label: "Главная" },
  { id: "tariffs", label: "Тарифы" },
  { id: "chat", label: "Чат" },
  { id: "about", label: "О компании" },
  { id: "contacts", label: "Контакты" },
];

const TARIFFS = [
  {
    name: "ЭКОНОМ",
    price: "от 299 ₽",
    badge: null,
    desc: "Комфортная поездка по городу",
    features: ["Седан / Хэтчбек", "До 3 пассажиров", "Кондиционер", "Оплата картой"],
    featured: false,
  },
  {
    name: "КОМФОРТ",
    price: "от 499 ₽",
    badge: "Хит",
    desc: "Просторный салон, опытный водитель",
    features: ["Бизнес-класс", "До 4 пассажиров", "Зарядка в авто", "Вода в подарок"],
    featured: true,
  },
  {
    name: "ДАЛЬНЯК",
    price: "от 899 ₽",
    badge: "VIP",
    desc: "Межгород без ограничений",
    features: ["Минивэн / Внедорожник", "До 6 пассажиров", "Детское кресло", "Помощь с багажом"],
    featured: false,
  },
];

const CHAT_URL = "https://functions.poehali.dev/7cea919d-afa7-4c03-a9cd-0e6cc7e634e8";

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

const LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/eed871f1-fcfc-4342-ba10-6d3337b98fe4.jpg";

async function requestAndNotify(title: string, body: string) {
  if (!("Notification" in window)) return;
  if (Notification.permission === "default") {
    await Notification.requestPermission();
  }
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: LOGO });
  }
}

export default function Index() {
  const [activeSection, setActiveSection] = useState("home");
  const [messages, setMessages] = useState<{id: string; from: string; text: string; time: string}[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [sending, setSending] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifAsked, setNotifAsked] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(getSessionId());
  const lastMsgCount = useRef(0);

  const tariffSection = useInView();
  const aboutSection = useInView();
  const contactSection = useInView();

  const loadMessages = async () => {
    try {
      const res = await fetch(`${CHAT_URL}?session_id=${sessionId.current}`);
      const data = await res.json();
      if (data.messages) {
        const msgs = data.messages.map((m: {id: string; from: string; text: string; time: string}) => ({ ...m }));
        // Уведомление при новом сообщении от оператора
        if (msgs.length > lastMsgCount.current && lastMsgCount.current > 0) {
          const newMsgs = msgs.slice(lastMsgCount.current);
          const operatorNew = newMsgs.filter((m: {from: string}) => m.from === "operator");
          if (operatorNew.length > 0) {
            requestAndNotify("Такси Дальняк", operatorNew[operatorNew.length - 1].text);
          }
        }
        lastMsgCount.current = msgs.length;
        setMessages(msgs);
      }
    } catch (e) { console.warn(e); }
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "tariffs", "chat", "about", "contacts"];
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 120) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setActiveSection(id);
    setMobileMenuOpen(false);
  };

  const sendMessage = async () => {
    if (!inputVal.trim() || sending) return;
    setSending(true);
    const text = inputVal;
    setInputVal("");
    try {
      await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId.current, text, from_role: "client" }),
      });
      await loadMessages();
    } catch (e) { console.warn(e); }
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-background font-golos grain-overlay">

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => scrollTo("home")} className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber flex items-center justify-center rounded-sm">
              <span className="font-oswald font-bold text-coal text-xs">Д</span>
            </div>
            <span className="font-oswald font-bold text-xl tracking-widest text-foreground uppercase">Дальняк</span>
          </button>

          <div className="hidden md:flex items-center gap-8">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`nav-link font-golos text-sm tracking-wide transition-colors relative ${activeSection === item.id ? "text-amber active" : "text-muted-foreground hover:text-foreground"}`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <a href="tel:+78001234567" className="hidden md:flex items-center gap-2 text-amber font-oswald font-medium tracking-wider hover:opacity-80 transition-opacity">
              <Icon name="Phone" size={16} />
              8 800 123-45-67
            </a>
            <button className="md:hidden text-foreground" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Icon name={mobileMenuOpen ? "X" : "Menu"} size={22} />
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-card border-t border-border px-6 py-4 flex flex-col gap-4 animate-fade-in">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`text-left font-golos text-sm tracking-wide ${activeSection === item.id ? "text-amber" : "text-muted-foreground"}`}
              >
                {item.label}
              </button>
            ))}
            <a href="tel:+78001234567" className="text-amber font-oswald text-sm">8 800 123-45-67</a>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_BG})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-coal/80 via-coal/60 to-background" />
        <div className="absolute bottom-0 left-0 right-0 h-32 road-line opacity-10" />

        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="mb-6 animate-fade-in" style={{ animationDelay: "0.1s", opacity: 0 }}>
            <span className="inline-block border border-amber/40 text-amber font-golos text-xs tracking-[0.3em] px-4 py-2 uppercase">
              Такси · Межгород · Аэропорт
            </span>
          </div>
          <h1
            className="font-oswald font-bold text-6xl md:text-8xl lg:text-9xl tracking-tight text-white mb-4 animate-fade-up"
            style={{ animationDelay: "0.2s", opacity: 0 }}
          >
            ДАЛЬНЯК
          </h1>
          <p
            className="font-golos text-lg md:text-xl text-foreground/70 mb-10 max-w-xl mx-auto animate-fade-up"
            style={{ animationDelay: "0.4s", opacity: 0 }}
          >
            Довезём куда угодно — по городу и за его пределами. Надёжно, быстро, без лишних слов.
          </p>
          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up"
            style={{ animationDelay: "0.6s", opacity: 0 }}
          >
            <button
              onClick={() => scrollTo("tariffs")}
              className="group bg-amber text-coal font-oswald font-semibold tracking-widest uppercase px-8 py-4 text-sm hover:bg-amber/90 transition-all duration-300 animate-pulse-amber"
            >
              Выбрать тариф
              <Icon name="ArrowRight" size={16} className="inline ml-2 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollTo("chat")}
              className="border border-foreground/30 text-foreground font-golos text-sm px-8 py-4 hover:border-amber hover:text-amber transition-all duration-300"
            >
              Написать в чат
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-fade-in" style={{ animationDelay: "1s", opacity: 0 }}>
          <span className="text-muted-foreground text-xs tracking-[0.2em] uppercase">Прокрутить</span>
          <div className="w-px h-10 bg-gradient-to-b from-amber to-transparent" />
        </div>
      </section>

      {/* STATS */}
      <section className="bg-asphalt border-y border-border py-8">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { num: "50 000+", label: "Поездок выполнено" },
            { num: "12 лет", label: "На рынке" },
            { num: "24/7", label: "Работаем без выходных" },
            { num: "4.9 ★", label: "Средний рейтинг" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="font-oswald font-bold text-2xl md:text-3xl text-amber">{stat.num}</div>
              <div className="font-golos text-xs text-muted-foreground mt-1 tracking-wide">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TARIFFS */}
      <section id="tariffs" ref={tariffSection.ref} className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className={`mb-16 ${tariffSection.inView ? "animate-fade-up" : "opacity-0"}`}>
            <span className="text-amber font-golos text-xs tracking-[0.3em] uppercase">02 / тарифы</span>
            <h2 className="font-oswald font-bold text-5xl md:text-6xl mt-2 text-foreground">
              ВЫБЕРИ СВОЙ<br /><span className="text-amber">ФОРМАТ</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TARIFFS.map((t, i) => (
              <div
                key={t.name}
                className={`card-hover border bg-card p-8 relative flex flex-col ${t.featured ? "border-amber" : "border-border"} ${tariffSection.inView ? "animate-fade-up" : "opacity-0"}`}
                style={{ animationDelay: `${0.1 + i * 0.15}s` }}
              >
                {t.badge && (
                  <span className="absolute top-4 right-4 bg-amber text-coal font-oswald font-bold text-xs tracking-widest px-3 py-1 uppercase">
                    {t.badge}
                  </span>
                )}
                <div className="mb-6">
                  <h3 className="font-oswald font-bold text-3xl tracking-widest text-foreground mb-1">{t.name}</h3>
                  <p className="text-muted-foreground text-sm font-golos">{t.desc}</p>
                </div>
                <div className="text-amber font-oswald font-bold text-4xl mb-8">{t.price}</div>
                <ul className="space-y-3 mb-8 flex-1">
                  {t.features.map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm font-golos text-foreground/80">
                      <Icon name="Check" size={14} className="text-amber flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => scrollTo("chat")}
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
      <div className="relative h-64 overflow-hidden">
        <img src={CAR_IMG} alt="Такси Дальняк" className="w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background" />
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="font-oswald text-4xl md:text-5xl font-bold text-white text-center tracking-[0.1em] uppercase opacity-90">
            Везём дальше всех
          </p>
        </div>
      </div>

      {/* CHAT */}
      <section id="chat" className="py-24 px-6 bg-asphalt">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12 animate-fade-up">
            <span className="text-amber font-golos text-xs tracking-[0.3em] uppercase">03 / чат</span>
            <h2 className="font-oswald font-bold text-5xl md:text-6xl mt-2 text-foreground">
              НАПИШИ<br /><span className="text-amber">ОПЕРАТОРУ</span>
            </h2>
          </div>

          <div className="border border-border bg-card">
            <div className="flex items-center gap-4 p-4 border-b border-border">
              <div className="relative">
                <div className="w-10 h-10 bg-amber rounded-sm flex items-center justify-center">
                  <Icon name="Car" size={18} className="text-coal" />
                </div>
                <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
              </div>
              <div>
                <div className="font-oswald font-semibold tracking-wide text-foreground">Такси «Дальняк»</div>
                <div className="text-green-400 text-xs font-golos flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" />
                  Онлайн · Ответим за 2 минуты
                </div>
              </div>
              {!notifAsked && "Notification" in window && Notification.permission !== "granted" && (
                <button
                  onClick={() => {
                    setNotifAsked(true);
                    Notification.requestPermission();
                  }}
                  className="ml-auto flex items-center gap-1.5 text-[11px] text-amber font-golos border border-amber/40 hover:border-amber hover:bg-amber/10 px-3 py-1.5 transition-all whitespace-nowrap"
                >
                  <Icon name="Bell" size={13} />
                  Уведомления
                </button>
              )}
            </div>

            <div className="h-80 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 && (
                <div className="flex justify-start">
                  <div className="bg-secondary text-foreground rounded-tr-lg rounded-br-lg rounded-bl-lg px-4 py-3 max-w-[75%]">
                    <p className="font-golos text-sm leading-relaxed">Добрый день! Такси «Дальняк». Чем могу помочь?</p>
                  </div>
                </div>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.from === "client" ? "justify-end" : "justify-start"} chat-bubble-in`}>
                  <div className={`max-w-[75%] px-4 py-3 ${msg.from === "client" ? "bg-amber text-coal rounded-tl-lg rounded-bl-lg rounded-br-lg" : "bg-secondary text-foreground rounded-tr-lg rounded-br-lg rounded-bl-lg"}`}>
                    <p className="font-golos text-sm leading-relaxed">{msg.text}</p>
                    <p className={`font-golos text-[10px] mt-1.5 ${msg.from === "client" ? "text-coal/60 text-right" : "text-muted-foreground"}`}>{msg.time}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-border flex gap-3">
              <input
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={e => e.key === "Enter" && sendMessage()}
                placeholder="Введите сообщение..."
                className="flex-1 bg-secondary border-none outline-none font-golos text-sm text-foreground placeholder:text-muted-foreground px-4 py-3 rounded-sm"
              />
              <button
                onClick={sendMessage}
                disabled={sending}
                className="bg-amber text-coal px-5 py-3 hover:bg-amber/90 transition-colors flex items-center gap-2 font-oswald font-semibold text-sm disabled:opacity-50"
              >
                <Icon name="Send" size={16} />
              </button>
            </div>
          </div>

          <p className="mt-4 text-muted-foreground text-xs font-golos text-center">
            Оператор ответит вам прямо здесь — обновление автоматическое
          </p>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" ref={aboutSection.ref} className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className={`grid md:grid-cols-2 gap-16 items-center ${aboutSection.inView ? "animate-fade-up" : "opacity-0"}`}>
            <div>
              <span className="text-amber font-golos text-xs tracking-[0.3em] uppercase">04 / о компании</span>
              <h2 className="font-oswald font-bold text-5xl md:text-6xl mt-2 mb-6 text-foreground">
                МЫ ТЕ,<br /><span className="text-amber">КТО ЕДЕТ</span>
              </h2>
              <p className="font-golos text-foreground/70 leading-relaxed mb-6">
                «Дальняк» — это не просто такси. Это команда людей, которые знают дороги лучше навигатора и умеют молчать, когда это нужно. Мы работаем с 2012 года и везём людей не только по городу — но и туда, куда другие отказываются.
              </p>
              <p className="font-golos text-foreground/70 leading-relaxed mb-8">
                Наши водители — проверенные профессионалы с медкомиссией, опытом от 5 лет и пятизвёздочным рейтингом. Автопарк — 120+ машин разных классов.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: "Shield", text: "Страховка на каждую поездку" },
                  { icon: "Clock", text: "Подача за 5–10 минут" },
                  { icon: "MapPin", text: "Маршруты по всей России" },
                  { icon: "Star", text: "Оценка 4.9 из 1000+ отзывов" },
                ].map(item => (
                  <div key={item.text} className="flex items-start gap-3">
                    <Icon name={item.icon} fallback="Circle" size={16} className="text-amber mt-1 flex-shrink-0" />
                    <span className="font-golos text-sm text-foreground/80">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 border border-amber/20" />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 border border-amber/20" />
              <div className="bg-card border border-border p-8 space-y-6">
                <h3 className="font-oswald font-bold text-2xl tracking-wider text-foreground">НАША МИССИЯ</h3>
                <p className="font-golos text-foreground/70 text-sm leading-relaxed">
                  Сделать каждую поездку безопасной, удобной и приятной. Мы верим, что хорошее такси — это не роскошь, а стандарт.
                </p>
                <div className="h-px bg-border" />
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber/10 border border-amber/30 flex items-center justify-center">
                    <Icon name="Award" size={20} className="text-amber" />
                  </div>
                  <div>
                    <div className="font-oswald font-semibold text-foreground">Лучшее такси 2023</div>
                    <div className="font-golos text-xs text-muted-foreground">По версии «Городской сервис»</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACTS */}
      <section id="contacts" ref={contactSection.ref} className="py-24 px-6 bg-asphalt">
        <div className="max-w-6xl mx-auto">
          <div className={`mb-16 ${contactSection.inView ? "animate-fade-up" : "opacity-0"}`}>
            <span className="text-amber font-golos text-xs tracking-[0.3em] uppercase">05 / контакты</span>
            <h2 className="font-oswald font-bold text-5xl md:text-6xl mt-2 text-foreground">
              НА СВЯЗИ<br /><span className="text-amber">ВСЕГДА</span>
            </h2>
          </div>

          <div className={`grid md:grid-cols-3 gap-6 ${contactSection.inView ? "animate-fade-up" : "opacity-0"}`} style={{ animationDelay: "0.2s" }}>
            {[
              { icon: "Phone", title: "Телефон", value: "8 800 123-45-67", sub: "Бесплатно по России", href: "tel:+78001234567" },
              { icon: "MessageCircle", title: "WhatsApp", value: "+7 (999) 000-00-00", sub: "Пишите в любое время", href: "#" },
              { icon: "MapPin", title: "Адрес", value: "ул. Дорожная, 1", sub: "г. Новосибирск", href: "#" },
            ].map(contact => (
              <a
                key={contact.title}
                href={contact.href}
                className="card-hover bg-card border border-border p-8 flex flex-col gap-4 group"
              >
                <div className="w-12 h-12 bg-amber/10 border border-amber/30 flex items-center justify-center group-hover:bg-amber/20 transition-colors">
                  <Icon name={contact.icon} fallback="Circle" size={20} className="text-amber" />
                </div>
                <div>
                  <div className="font-oswald font-semibold text-base tracking-wider text-muted-foreground uppercase">{contact.title}</div>
                  <div className="font-oswald font-bold text-xl text-foreground mt-1">{contact.value}</div>
                  <div className="font-golos text-sm text-muted-foreground mt-1">{contact.sub}</div>
                </div>
              </a>
            ))}
          </div>

          <div className={`mt-8 bg-card border border-amber/30 p-8 ${contactSection.inView ? "animate-fade-up" : "opacity-0"}`} style={{ animationDelay: "0.4s" }}>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="font-oswald font-bold text-2xl text-foreground mb-2">ЗАКАЗАТЬ ЗВОНОК</h3>
                <p className="font-golos text-sm text-muted-foreground">Оставьте номер — перезвоним за 2 минуты</p>
              </div>
              <div className="flex gap-3">
                <input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  className="flex-1 bg-secondary border border-border px-4 py-3 font-golos text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-amber transition-colors"
                />
                <button className="bg-amber text-coal font-oswald font-semibold tracking-widest uppercase px-6 py-3 text-sm hover:bg-amber/90 transition-colors whitespace-nowrap">
                  Позвоните мне
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 bg-amber rounded-sm flex items-center justify-center">
              <span className="font-oswald font-bold text-coal text-[10px]">Д</span>
            </div>
            <span className="font-oswald font-bold text-sm tracking-widest text-muted-foreground uppercase">Дальняк</span>
          </div>
          <p className="font-golos text-xs text-muted-foreground">© 2024 Такси «Дальняк». Все права защищены.</p>
          <div className="flex gap-6">
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