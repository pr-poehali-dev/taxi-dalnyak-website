import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/27c914f4-b04e-4a4c-90dc-2f453c691890";
const LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/eed871f1-fcfc-4342-ba10-6d3337b98fe4.jpg";
const HERO_BG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/5b51c7b0-9a76-4168-9d48-1f212a2618c4.jpg";
const IMG_SOLARIS = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/127f047b-28ee-4c21-b1fa-c3163c861a85.jpg";
const IMG_CAMRY = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/d48194e6-00be-4078-a950-1191e7c530be.jpg";
const IMG_STAREX = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/58abbe0a-622c-4b10-bc65-0e2feaeb5648.jpg";
const IMG_SVO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/f980822b-31b7-41e1-a439-210af5f90f33.jpg";
const IMG_FAMILY = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/b702120f-a865-4d0f-aca3-9c839ddd3bf7.jpg";
const IMG_BIZ = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/f395953f-c908-4408-b355-d437272d8804.jpg";

const PHONE = "8 (995) 645-51-25";
const PHONE_HREF = "tel:+79956455125";
const TG = "https://t.me/Mezhgorod1816";
const MAX_URL = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";
const WA = "https://wa.me/79956455125";
const VK = "https://vk.ru/dalnyack";

type Suggestion = { title: string; subtitle: string; full: string };
type TariffPrice = { tariff: string; name: string; car: string; price: number; new_territory: boolean };
type CalcResult = { from: string; to: string; distance_km: number; duration_min: number; prices: TariffPrice[]; new_territory: boolean };

type ChatStep = "idle" | "utm_confirm" | "from" | "to" | "passengers" | "calc" | "date" | "phone" | "done";
type MsgRole = "bot" | "user";
interface ChatMsg {
  role: MsgRole;
  text: string;
  buttons?: string[];
  tariffs?: TariffPrice[];
}

function getUtmCity(): string | null {
  const params = new URLSearchParams(window.location.search);
  const candidates = [params.get("utm_term"), params.get("utm_content"), params.get("utm_campaign")];
  for (const c of candidates) {
    if (c) {
      const cleaned = c.replace(/[+_-]/g, " ").replace(/такси|межгород|трансфер|из|в|до/gi, "").trim();
      if (cleaned.length > 2) return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    }
  }
  return null;
}

function getAllUtmParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  params.forEach((v, k) => { if (k.startsWith("utm_")) utm[k] = v; });
  return utm;
}

export default function Index() {
  const [headerBg, setHeaderBg] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatNotif, setChatNotif] = useState(false);
  const [chatStep, setChatStep] = useState<ChatStep>("idle");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [typing, setTyping] = useState(false);
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [passengers, setPassengers] = useState(1);
  const [calcData, setCalcData] = useState<CalcResult | null>(null);
  const [dateVal, setDateVal] = useState("");
  const [phoneVal, setPhoneVal] = useState("");
  const [utmCity] = useState(() => getUtmCity());
  const [utmParams] = useState(() => getAllUtmParams());
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoOpenDone = useRef(false);
  const exitIntentDone = useRef(false);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scrollChat = useCallback(() => {
    setTimeout(() => {
      if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }, 50);
  }, []);

  const addBot = useCallback((text: string, buttons?: string[], tariffs?: TariffPrice[]) => {
    setTyping(true);
    scrollChat();
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { role: "bot", text, buttons, tariffs }]);
      scrollChat();
    }, 600);
  }, [scrollChat]);

  const addUser = useCallback((text: string) => {
    setMessages(prev => [...prev, { role: "user", text }]);
    scrollChat();
  }, [scrollChat]);

  useEffect(() => {
    const onScroll = () => setHeaderBg(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (autoOpenDone.current) return;
    const t = setTimeout(() => {
      autoOpenDone.current = true;
      setChatNotif(true);
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (e.clientY < 10 && !chatOpen && !exitIntentDone.current) {
        exitIntentDone.current = true;
        setChatNotif(true);
      }
    };
    document.addEventListener("mouseout", onMouse);
    return () => document.removeEventListener("mouseout", onMouse);
  }, [chatOpen]);

  useEffect(() => {
    if (chatOpen) return;
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      if (!chatOpen && !exitIntentDone.current) {
        exitIntentDone.current = true;
        setChatNotif(true);
      }
    }, 30000);
    return () => { if (idleTimer.current) clearTimeout(idleTimer.current); };
  }, [chatOpen]);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2) { setSuggestions([]); return; }
    try {
      const res = await fetch(`${API}?action=suggest&q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(Array.isArray(data) ? data.slice(0, 5) : []);
    } catch { setSuggestions([]); }
  }, []);

  const onInputChange = useCallback((val: string) => {
    setInputVal(val);
    if (chatStep === "from" || chatStep === "to") {
      if (suggestTimer.current) clearTimeout(suggestTimer.current);
      suggestTimer.current = setTimeout(() => fetchSuggestions(val), 300);
    }
  }, [chatStep, fetchSuggestions]);

  const selectSuggestion = useCallback((s: Suggestion) => {
    const city = s.full || s.title;
    setSuggestions([]);
    setInputVal("");
    addUser(city);
    if (chatStep === "from") {
      setFromCity(city);
      setChatStep("to");
      addBot("Куда поедете?");
    } else if (chatStep === "to") {
      setToCity(city);
      setChatStep("passengers");
      addBot("Сколько пассажиров? (1\u201310)");
    }
  }, [chatStep, addBot, addUser]);

  const doCalc = useCallback(async (from: string, to: string, pass: number) => {
    setChatStep("calc");
    setTyping(true);
    scrollChat();
    try {
      const res = await fetch(`${API}?action=calc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ from, to, passengers: pass }),
      });
      const data: CalcResult = await res.json();
      setCalcData(data);
      setTyping(false);
      const dist = data.distance_km;
      const dur = data.duration_min;
      const hours = Math.floor(dur / 60);
      const mins = dur % 60;
      const durStr = hours > 0 ? `${hours} ч ${mins} мин` : `${mins} мин`;
      setMessages(prev => [
        ...prev,
        {
          role: "bot",
          text: `${data.from} \u2192 ${data.to}\n${dist} км \u00B7 ${durStr}\n\nВыберите тариф:`,
          tariffs: data.prices,
        },
      ]);
      scrollChat();
    } catch {
      setTyping(false);
      addBot("Не удалось рассчитать. Попробуйте позже или позвоните нам: " + PHONE);
      setChatStep("from");
    }
  }, [addBot, scrollChat]);

  const doOrder = useCallback(async (phone: string, date: string) => {
    setTyping(true);
    scrollChat();
    try {
      await fetch(`${API}?action=order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromCity,
          to: toCity,
          phone,
          date,
          passengers,
          distance_km: calcData?.distance_km,
          prices: calcData?.prices,
          duration_min: calcData?.duration_min,
          utm: utmParams,
          new_territory: calcData?.new_territory,
        }),
      });
      setTyping(false);
      setChatStep("done");
      setMessages(prev => [
        ...prev,
        {
          role: "bot",
          text: `\u2705 Заявка отправлена! Диспетчер свяжется с вами в ближайшее время с номера 89956455125.\n\nСпасибо, что выбрали Дальняк!`,
        },
      ]);
      scrollChat();
    } catch {
      setTyping(false);
      addBot("Ошибка отправки. Позвоните нам: " + PHONE);
    }
  }, [fromCity, toCity, passengers, calcData, utmParams, addBot, scrollChat]);

  const handleSend = useCallback(() => {
    const val = inputVal.trim();
    if (!val) return;
    setInputVal("");
    setSuggestions([]);

    switch (chatStep) {
      case "utm_confirm":
        break;
      case "from": {
        addUser(val);
        setFromCity(val);
        setChatStep("to");
        addBot("Куда поедете?");
        break;
      }
      case "to": {
        addUser(val);
        setToCity(val);
        setChatStep("passengers");
        addBot("Сколько пассажиров? (1\u201310)");
        break;
      }
      case "passengers": {
        const n = parseInt(val);
        if (isNaN(n) || n < 1 || n > 10) {
          addBot("Укажите число от 1 до 10");
          return;
        }
        addUser(val);
        setPassengers(n);
        doCalc(fromCity, toCity, n);
        break;
      }
      case "date": {
        addUser(val);
        setDateVal(val);
        setChatStep("phone");
        addBot("Укажите номер телефона для связи.\n\nДиспетчер свяжется с вами с номера 89956455125");
        break;
      }
      case "phone": {
        addUser(val);
        setPhoneVal(val);
        doOrder(val, dateVal);
        break;
      }
      default:
        break;
    }
  }, [inputVal, chatStep, addUser, addBot, doCalc, doOrder, fromCity, toCity, dateVal]);

  const handleButton = useCallback((btn: string) => {
    addUser(btn);
    if (chatStep === "utm_confirm") {
      if (btn === "Да" && utmCity) {
        setToCity(utmCity);
        setChatStep("from");
        addBot("Откуда поедете?");
      } else {
        setChatStep("from");
        addBot("Откуда вы хотите поехать?");
      }
    }
  }, [chatStep, utmCity, addBot, addUser]);

  const fmtPrice = (n: number) => n.toLocaleString("ru-RU") + " \u20BD";

  const handleTariffSelect = useCallback((t: TariffPrice) => {
    addUser(`${t.name} \u2014 ${t.price.toLocaleString("ru-RU")} \u20BD`);
    setChatStep("date");
    addBot("Когда планируете поездку? (дата и время)");
  }, [addBot, addUser]);

  const toggleChat = useCallback(() => {
    setChatNotif(false);
    if (!chatOpen && messages.length === 0) {
      if (utmCity) {
        setChatStep("utm_confirm");
        addBot(`Здравствуйте! \u{1F44B} Вам нужно такси до ${utmCity}?`, ["Да", "Нет, другой город"]);
      } else {
        setChatStep("from");
        addBot("Здравствуйте! \u{1F44B} Я помогу рассчитать стоимость поездки. Откуда вы хотите поехать?");
      }
    }
    setChatOpen(prev => !prev);
  }, [chatOpen, messages.length, utmCity, addBot]);

  const showInput = chatStep === "from" || chatStep === "to" || chatStep === "passengers" || chatStep === "date" || chatStep === "phone";

  const inputPlaceholder = (() => {
    switch (chatStep) {
      case "from": return "Введите город отправления...";
      case "to": return "Введите город назначения...";
      case "passengers": return "Количество пассажиров (1-10)";
      case "date": return "Например: завтра в 10:00";
      case "phone": return "Ваш номер телефона";
      default: return "Введите сообщение...";
    }
  })();

  return (
    <div className="min-h-screen bg-background text-foreground grain-overlay">
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          headerBg ? "bg-coal/95 backdrop-blur-md border-b border-amber/15" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-3 md:px-4 py-2.5 flex items-center justify-between gap-2">
          <a href="#hero" className="flex items-center gap-2 shrink-0">
            <img src={LOGO} alt="Дальняк" className="w-9 h-9 rounded-full object-cover" />
            <span className="font-oswald text-lg font-bold text-amber uppercase tracking-wider hidden sm:block">Дальняк</span>
          </a>
          <nav className="hidden lg:flex items-center gap-5">
            <a href="#tariffs" className="nav-link text-sm text-white/70 hover:text-amber transition-colors font-golos">Тарифы</a>
            <a href="#advantages" className="nav-link text-sm text-white/70 hover:text-amber transition-colors font-golos">Преимущества</a>
            <a href="#who" className="nav-link text-sm text-white/70 hover:text-amber transition-colors font-golos">Кого возим</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href={TG} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/80 hover:text-[#38BDF8] font-oswald text-xs font-bold px-3 py-2 rounded-lg border border-white/10 hover:border-[#38BDF8]/40 transition-all">
              <Icon name="Send" size={14} />
              <span className="hidden sm:inline">Telegram</span>
            </a>
            <a href={MAX_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-[#005FF9] hover:bg-[#1a70ff] text-white font-oswald text-xs font-bold px-3 py-2 rounded-lg transition-all">
              MAX
            </a>
            <a href={PHONE_HREF} className="flex items-center gap-1.5 bg-amber text-coal font-oswald text-xs font-bold px-3 py-2 rounded-lg hover:bg-amber/90 transition-all">
              <Icon name="Phone" size={13} />
              <span className="hidden md:inline">{PHONE}</span>
              <span className="md:hidden">Звонок</span>
            </a>
          </div>
        </div>
      </header>

      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-coal" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="animate-fade-up">
            <p className="text-amber font-oswald text-sm md:text-base uppercase tracking-[0.3em] mb-4">Межгородное такси</p>
            <h1 className="font-oswald text-4xl sm:text-5xl md:text-7xl font-bold text-white uppercase leading-tight mb-6">
              Чем дальше &mdash;<br />
              <span className="text-amber">тем выгоднее</span>
            </h1>
            <p className="font-golos text-white/70 text-base md:text-lg max-w-xl mx-auto mb-8">
              Комфортные поездки между городами России. Фиксированная цена, без скрытых доплат.
            </p>
          </div>
          <div className="animate-fade-up flex flex-col sm:flex-row gap-3 justify-center items-center" style={{ animationDelay: "0.3s" }}>
            <button
              onClick={toggleChat}
              className="w-full sm:w-auto bg-amber text-coal font-oswald text-base sm:text-lg uppercase font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded hover:bg-amber/90 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Icon name="Calculator" size={18} />
              Рассчитать стоимость
            </button>
            <a
              href={PHONE_HREF}
              className="w-full sm:w-auto border border-amber/30 text-amber font-oswald text-base sm:text-lg uppercase font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded hover:bg-amber/10 transition-all flex items-center justify-center gap-2"
            >
              <Icon name="Phone" size={18} />
              {PHONE}
            </a>
          </div>
          <div className="animate-fade-up flex flex-wrap gap-2.5 justify-center mt-5" style={{ animationDelay: "0.5s" }}>
            <a href={TG} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-white/60 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-[#38BDF8] hover:border-[#38BDF8]/30 px-4 py-2.5 rounded-lg transition-all">
              <Icon name="Send" size={15} />Telegram
            </a>
            <a href={MAX_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-white bg-[#005FF9] hover:bg-[#1a70ff] px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-[#005FF9]/20">
              MAX — написать
            </a>
            <a href={WA} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm font-bold text-white/60 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-green-400 hover:border-green-500/30 px-4 py-2.5 rounded-lg transition-all">
              <Icon name="MessageCircle" size={15} />WhatsApp
            </a>
          </div>
          <div className="mt-10 animate-fade-in" style={{ animationDelay: "0.8s" }}>
            <Icon name="ChevronDown" size={28} className="text-amber/50 mx-auto animate-bounce" />
          </div>
        </div>
      </section>

      <section id="tariffs" className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber font-oswald text-sm uppercase tracking-[0.25em] mb-2">Наш автопарк</p>
            <h2 className="font-oswald text-3xl md:text-5xl font-bold text-white uppercase">Тарифы</h2>
            <div className="w-16 h-0.5 bg-amber mx-auto mt-4" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Стандарт",
                car: "Hyundai Solaris",
                img: IMG_SOLARIS,
                min: "3 000 ₽",
                rows: [
                  { d: "до 250 км", r: "35 ₽/км" },
                  { d: "от 250 км", r: "31 ₽/км" },
                  { d: "новые территории", r: "80 ₽/км" },
                ],
              },
              {
                name: "Комфорт+",
                car: "Toyota Camry 70",
                img: IMG_CAMRY,
                min: "5 000 ₽",
                rows: [
                  { d: "до 250 км", r: "50 ₽/км" },
                  { d: "от 250 км", r: "42 ₽/км" },
                  { d: "новые территории", r: "100 ₽/км" },
                ],
                popular: true,
              },
              {
                name: "Минивэн",
                car: "Hyundai Starex",
                img: IMG_STAREX,
                min: "5 000 ₽",
                rows: [
                  { d: "до 250 км", r: "60 ₽/км" },
                  { d: "от 250 км", r: "55 ₽/км" },
                  { d: "новые территории", r: "100 ₽/км" },
                ],
              },
            ].map((t, i) => (
              <div
                key={i}
                className={`relative border rounded overflow-hidden card-hover ${
                  t.popular ? "border-amber" : "border-white/8"
                } bg-card`}
              >
                {t.popular && (
                  <div className="absolute top-3 right-3 bg-amber text-coal text-xs font-oswald uppercase font-bold px-3 py-1 rounded z-10">
                    Популярный
                  </div>
                )}
                <div className="relative h-48 overflow-hidden">
                  <img src={t.img} alt={t.car} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="font-oswald text-2xl font-bold text-white uppercase">{t.name}</h3>
                  <p className="text-amber/60 font-golos text-sm mb-4">{t.car}</p>
                  <div className="space-y-2 mb-4">
                    {t.rows.map((r, j) => (
                      <div key={j} className="flex justify-between items-center text-sm font-golos">
                        <span className="text-white/60">{r.d}</span>
                        <span className="text-white font-semibold">{r.r}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-white/8 pt-3">
                    <p className="text-xs text-white/40 font-golos">Минимальный заказ</p>
                    <p className="text-amber font-oswald text-xl font-bold">{t.min}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="advantages" className="py-16 md:py-24 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber font-oswald text-sm uppercase tracking-[0.25em] mb-2">Почему мы</p>
            <h2 className="font-oswald text-3xl md:text-5xl font-bold text-white uppercase">Преимущества</h2>
            <div className="w-16 h-0.5 bg-amber mx-auto mt-4" />
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "Zap", title: "Подача от 30 минут", desc: "Кроме Москвы и Санкт-Петербурга" },
              { icon: "ShieldCheck", title: "Без предоплаты", desc: "Предзаказ точно ко времени" },
              { icon: "RotateCcw", title: "Бесплатное ожидание", desc: "При поездке туда-обратно в один день" },
              { icon: "Baby", title: "Детское кресло", desc: "Бесплатно, по запросу" },
              { icon: "PawPrint", title: "Животные", desc: "Перевозка без доплаты" },
              { icon: "Receipt", title: "Документы для юрлиц", desc: "Договор, акты, счёт-фактура" },
            ].map((p, i) => (
              <div
                key={i}
                className="border border-white/8 rounded p-5 hover:border-amber/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded bg-amber/10 flex items-center justify-center mb-3 group-hover:bg-amber/20 transition-colors">
                  <Icon name={p.icon} size={20} className="text-amber" />
                </div>
                <h3 className="font-oswald text-lg font-semibold text-white uppercase mb-1">{p.title}</h3>
                <p className="text-white/50 text-sm font-golos">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="who" className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber font-oswald text-sm uppercase tracking-[0.25em] mb-2">Наши пассажиры</p>
            <h2 className="font-oswald text-3xl md:text-5xl font-bold text-white uppercase">Кого возим</h2>
            <div className="w-16 h-0.5 bg-amber mx-auto mt-4" />
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { img: IMG_SVO, title: "Бойцы СВО", desc: "Личная доставка домой. Особые условия для военнослужащих и их семей." },
              { img: IMG_FAMILY, title: "Семьи с детьми", desc: "Детское кресло бесплатно. Перевозка животных без доплаты." },
              { img: IMG_BIZ, title: "Организации", desc: "Работаем по договору. Полный пакет закрывающих документов." },
            ].map((w, i) => (
              <div key={i} className="border border-white/8 rounded overflow-hidden card-hover bg-card">
                <div className="relative h-52 overflow-hidden">
                  <img src={w.img} alt={w.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="font-oswald text-xl font-bold text-white uppercase mb-2">{w.title}</h3>
                  <p className="text-white/50 text-sm font-golos">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 bg-card">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-amber font-oswald text-sm uppercase tracking-[0.25em] mb-2">Готовы ехать?</p>
          <h2 className="font-oswald text-3xl md:text-5xl font-bold text-white uppercase mb-4">
            Закажите такси<br />
            <span className="text-amber">прямо сейчас</span>
          </h2>
          <p className="text-white/50 font-golos mb-8 max-w-lg mx-auto">
            Напишите нам в мессенджер, позвоните или рассчитайте стоимость через ассистента.
          </p>
          <div className="flex flex-col gap-3 max-w-md mx-auto">
            <a href={TG} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2.5 bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8] font-oswald text-base uppercase font-bold px-6 py-4 rounded-lg hover:bg-[#38BDF8]/25 transition-all active:scale-[0.98]">
              <Icon name="Send" size={18} />Написать в Telegram
            </a>
            <a href={MAX_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2.5 bg-[#005FF9] text-white font-oswald text-base uppercase font-bold px-6 py-4 rounded-lg hover:bg-[#1a70ff] transition-all shadow-lg shadow-[#005FF9]/20 active:scale-[0.98]">
              Написать в MAX
            </a>
            <a href={PHONE_HREF} className="flex items-center justify-center gap-2.5 bg-amber text-coal font-oswald text-base uppercase font-bold px-6 py-4 rounded-lg hover:bg-amber/90 transition-all active:scale-[0.98]">
              <Icon name="Phone" size={18} />{PHONE}
            </a>
            <div className="flex gap-3">
              <a href={WA} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-green-400 border border-green-600/20 bg-green-600/10 hover:bg-green-600/20 px-4 py-3 rounded-lg transition-all">
                <Icon name="MessageCircle" size={15} />WhatsApp
              </a>
              <button onClick={toggleChat} className="flex-1 flex items-center justify-center gap-2 text-sm font-bold text-amber border border-amber/20 bg-amber/5 hover:bg-amber/15 px-4 py-3 rounded-lg transition-all">
                <Icon name="Calculator" size={15} />Рассчитать цену
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/8 py-6 px-4">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-white/30 font-golos">
          <span>&copy; {new Date().getFullYear()} Такси Дальняк. Межгородные перевозки.</span>
          <a href={PHONE_HREF} className="text-amber/60 hover:text-amber transition-colors">{PHONE}</a>
        </div>
      </footer>

      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
        <div className="flex gap-1.5 px-2 py-2">
          <a href={TG} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#38BDF8]/15 text-[#38BDF8] font-oswald text-xs font-bold active:scale-95 transition-all">
            <Icon name="Send" size={14} />TG
          </a>
          <a href={PHONE_HREF} className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-amber text-coal font-oswald text-xs font-bold active:scale-95 transition-all">
            <Icon name="Phone" size={14} />Звонок
          </a>
          <a href={MAX_URL} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#005FF9] text-white font-oswald text-xs font-bold active:scale-95 transition-all">
            MAX
          </a>
          <a href={WA} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-green-600/15 text-green-400 font-oswald text-xs font-bold active:scale-95 transition-all">
            <Icon name="MessageCircle" size={14} />WA
          </a>
        </div>
      </div>

      <div className="fixed z-50 bottom-[72px] md:bottom-6 right-3 md:right-4">
        {chatOpen && (
          <div className="chat-bubble-in mb-3 w-[calc(100vw-1.5rem)] sm:w-[380px] max-h-[70vh] md:max-h-[500px] bg-card border border-white/8 rounded-lg shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-amber/10 border-b border-amber/15 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber flex items-center justify-center">
                  <Icon name="Bot" size={16} className="text-coal" />
                </div>
                <div>
                  <p className="font-oswald text-sm font-semibold text-white">Ассистент Дальняк</p>
                  <p className="text-[10px] text-amber/60 font-golos">онлайн</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/40 hover:text-white transition-colors p-1">
                <Icon name="X" size={18} />
              </button>
            </div>

            <div ref={chatBodyRef} className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0" style={{ maxHeight: "380px" }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] ${msg.role === "user" ? "order-1" : "order-1"}`}>
                    <div
                      className={`rounded-lg px-3 py-2 text-sm font-golos whitespace-pre-wrap ${
                        msg.role === "user"
                          ? "bg-amber text-coal rounded-br-none"
                          : "bg-secondary text-white/90 rounded-bl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                    {msg.buttons && msg.buttons.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {msg.buttons.map((btn, j) => (
                          <button
                            key={j}
                            onClick={() => handleButton(btn)}
                            className="text-xs font-golos font-semibold border border-amber/30 text-amber px-3 py-1.5 rounded hover:bg-amber/10 transition-colors"
                          >
                            {btn}
                          </button>
                        ))}
                      </div>
                    )}
                    {msg.tariffs && msg.tariffs.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {msg.tariffs.map((t, j) => (
                          <button
                            key={j}
                            onClick={() => handleTariffSelect(t)}
                            className="w-full text-left border border-white/8 rounded p-3 hover:border-amber/30 transition-colors bg-secondary/50"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-oswald text-sm font-semibold text-white">{t.name}</p>
                                <p className="text-[11px] text-white/40 font-golos">{t.car}</p>
                              </div>
                              <p className="font-oswald text-lg font-bold text-amber">{fmtPrice(t.price)}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="bg-secondary rounded-lg rounded-bl-none px-4 py-3 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber/60 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-amber/60 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-amber/60 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}
            </div>

            {showInput && (
              <div className="shrink-0 border-t border-white/8 p-3 relative">
                {suggestions.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 bg-card border border-white/8 rounded-t max-h-40 overflow-y-auto">
                    {suggestions.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => selectSuggestion(s)}
                        className="w-full text-left px-3 py-2 hover:bg-amber/10 transition-colors border-b border-white/5 last:border-0"
                      >
                        <p className="text-sm text-white font-golos">{s.title}</p>
                        {s.subtitle && <p className="text-[11px] text-white/40 font-golos">{s.subtitle}</p>}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type={chatStep === "passengers" ? "number" : "text"}
                    min={chatStep === "passengers" ? 1 : undefined}
                    max={chatStep === "passengers" ? 10 : undefined}
                    value={inputVal}
                    onChange={(e) => onInputChange(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                    placeholder={inputPlaceholder}
                    className="flex-1 bg-secondary rounded px-3 py-2 text-sm font-golos text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-amber/50"
                    autoFocus
                  />
                  <button
                    onClick={handleSend}
                    className="w-9 h-9 rounded bg-amber flex items-center justify-center text-coal hover:bg-amber/90 transition-colors shrink-0"
                  >
                    <Icon name="SendHorizontal" size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex items-end justify-end gap-2">
          {chatNotif && !chatOpen && (
            <div className="chat-bubble-in bg-card border border-amber/20 rounded-lg rounded-br-none px-3 py-2 shadow-lg max-w-[200px]">
              <p className="text-xs text-white/80 font-golos">Рассчитать стоимость поездки?</p>
            </div>
          )}
          <button
            onClick={toggleChat}
            className="shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-amber text-coal shadow-lg hover:scale-105 transition-transform relative"
          >
            {chatOpen ? <Icon name="X" size={24} /> : <Icon name="MessageCircle" size={24} />}
            {chatNotif && !chatOpen && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 border-2 border-card" />
            )}
          </button>
        </div>
      </div>

      <div className="h-20 md:hidden" />
    </div>
  );
}