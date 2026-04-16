import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

const AI_API = "https://functions.poehali.dev/08fe4061-ac7e-4404-8a08-788b739d491b";
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

interface ChatMsg {
  role: "bot" | "user";
  text: string;
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
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [typing, setTyping] = useState(false);
  const [phoneDone, setPhoneDone] = useState(false);
  const [userEngaged, setUserEngaged] = useState(false);
  const [showExitChat, setShowExitChat] = useState(false);
  const [utmParams] = useState(() => getAllUtmParams());
  const chatBodyRef = useRef<HTMLDivElement>(null);
  const exitTriggered = useRef(false);
  const conversationRef = useRef<{ role: string; content: string }[]>([]);

  const scrollChat = useCallback(() => {
    setTimeout(() => {
      if (chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }, 50);
  }, []);

  useEffect(() => {
    const onScroll = () => setHeaderBg(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const markEngaged = useCallback(() => {
    setUserEngaged(true);
    sessionStorage.setItem("dalnyak_engaged", "1");
  }, []);

  useEffect(() => {
    if (sessionStorage.getItem("dalnyak_engaged") === "1") {
      setUserEngaged(true);
    }
  }, []);

  const trackClick = useCallback((e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const link = target.closest("a[href]");
    if (link) {
      const href = link.getAttribute("href") || "";
      if (href.startsWith("tel:") || href.includes("t.me") || href.includes("max.ru") || href.includes("wa.me")) {
        markEngaged();
      }
    }
  }, [markEngaged]);

  useEffect(() => {
    document.addEventListener("click", trackClick, true);
    return () => document.removeEventListener("click", trackClick, true);
  }, [trackClick]);

  // Exit intent — desktop: mouse leaves viewport top
  useEffect(() => {
    const onMouse = (e: MouseEvent) => {
      if (e.clientY < 5 && !exitTriggered.current && !userEngaged && !chatOpen) {
        exitTriggered.current = true;
        setShowExitChat(true);
      }
    };
    document.addEventListener("mouseout", onMouse);
    return () => document.removeEventListener("mouseout", onMouse);
  }, [userEngaged, chatOpen]);

  // Exit intent — mobile: back button / visibility change after 20s
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden" && !exitTriggered.current && !userEngaged) {
        exitTriggered.current = true;
      }
      if (document.visibilityState === "visible" && exitTriggered.current && !showExitChat && !userEngaged && !chatOpen) {
        setShowExitChat(true);
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("visibilitychange", onVisibility);
    }, 20000);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [userEngaged, chatOpen, showExitChat]);

  // Idle fallback — if user does nothing for 40s
  useEffect(() => {
    if (userEngaged || exitTriggered.current) return;
    const t = setTimeout(() => {
      if (!exitTriggered.current && !userEngaged) {
        exitTriggered.current = true;
        setShowExitChat(true);
      }
    }, 40000);
    return () => clearTimeout(t);
  }, [userEngaged]);

  // When showExitChat triggers, open chat with greeting
  useEffect(() => {
    if (!showExitChat || chatOpen || messages.length > 0) return;
    setChatOpen(true);

    const utmCity = (() => {
      const candidates = [utmParams.utm_term, utmParams.utm_content, utmParams.utm_campaign];
      for (const c of candidates) {
        if (c) {
          const cleaned = c.replace(/[+_-]/g, " ").replace(/такси|межгород|трансфер|из|в|до/gi, "").trim();
          if (cleaned.length > 2) return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
        }
      }
      return null;
    })();

    let greeting: string;
    if (utmCity) {
      greeting = `Добрый день! Вижу, вас интересует поездка в ${utmCity}. Могу помочь с информацией — подскажите, откуда планируете выезжать?`;
    } else {
      greeting = "Добрый день! Планируете поездку? Могу подсказать по маршрутам и стоимости. Куда вам нужно?";
    }

    setTyping(true);
    scrollChat();
    conversationRef.current = [{ role: "assistant", content: greeting }];
    setTimeout(() => {
      setTyping(false);
      setMessages([{ role: "bot", text: greeting }]);
      scrollChat();
    }, 800);
  }, [showExitChat, chatOpen, messages.length, utmParams, scrollChat]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || typing || phoneDone) return;

    const userMsg = text.trim();
    setMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setInputVal("");
    setTyping(true);
    scrollChat();

    conversationRef.current.push({ role: "user", content: userMsg });

    try {
      const res = await fetch(AI_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "chat",
          message: userMsg,
          conversation: conversationRef.current,
          utm: utmParams,
        }),
      });
      const data = await res.json();
      const reply = data.reply || "Извините, произошла ошибка. Позвоните нам: " + PHONE;

      conversationRef.current.push({ role: "assistant", content: reply });

      setTyping(false);
      setMessages(prev => [...prev, { role: "bot", text: reply }]);
      scrollChat();

      if (data.phone_detected) {
        setPhoneDone(true);
      }
    } catch {
      setTyping(false);
      setMessages(prev => [...prev, { role: "bot", text: "Связь прервалась. Позвоните нам: " + PHONE }]);
      scrollChat();
    }
  }, [typing, phoneDone, utmParams, scrollChat]);

  const handleSend = useCallback(() => {
    sendMessage(inputVal);
  }, [inputVal, sendMessage]);

  return (
    <div className="min-h-screen bg-background text-foreground grain-overlay">
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          headerBg ? "bg-coal/95 backdrop-blur-md border-b border-amber/15" : "bg-transparent"
        }`}
      >
        <div className="max-w-6xl mx-auto px-3 md:px-4 py-2.5 flex items-center justify-between gap-2">
          <a href="#hero" className="flex items-center gap-2 shrink-0">
            <img src={LOGO} alt="Дальняк" className="w-9 h-9 rounded-full object-cover" loading="lazy" />
            <span className="font-oswald text-lg font-bold text-amber uppercase tracking-wider hidden sm:block">Дальняк</span>
          </a>
          <nav className="hidden lg:flex items-center gap-5">
            <a href="#tariffs" className="nav-link text-sm text-white/70 hover:text-amber transition-colors font-golos">Тарифы</a>
            <a href="#advantages" className="nav-link text-sm text-white/70 hover:text-amber transition-colors font-golos">Преимущества</a>
            <a href="#who" className="nav-link text-sm text-white/70 hover:text-amber transition-colors font-golos">Кого возим</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href={TG} target="_blank" rel="noopener noreferrer" onClick={() => markEngaged()} className="flex items-center gap-1.5 text-white/80 hover:text-[#38BDF8] font-oswald text-xs font-bold px-3 py-2 rounded-lg border border-white/10 hover:border-[#38BDF8]/40 transition-all">
              <Icon name="Send" size={14} />
              <span className="hidden sm:inline">Telegram</span>
            </a>
            <a href={MAX_URL} target="_blank" rel="noopener noreferrer" onClick={() => markEngaged()} className="flex items-center gap-1.5 bg-[#005FF9] hover:bg-[#1a70ff] text-white font-oswald text-xs font-bold px-3 py-2 rounded-lg transition-all">
              MAX
            </a>
            <a href={PHONE_HREF} onClick={() => markEngaged()} className="flex items-center gap-1.5 bg-amber text-coal font-oswald text-xs font-bold px-3 py-2 rounded-lg hover:bg-amber/90 transition-all">
              <Icon name="Phone" size={13} />
              <span className="hidden md:inline">{PHONE}</span>
              <span className="md:hidden">Звонок</span>
            </a>
          </div>
        </div>
      </header>

      <section id="hero" className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_BG})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-coal" />
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-16">
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
            <a
              href={PHONE_HREF}
              onClick={() => markEngaged()}
              className="w-full sm:w-auto bg-amber text-coal font-oswald text-base sm:text-lg uppercase font-bold px-6 sm:px-8 py-3.5 sm:py-4 rounded hover:bg-amber/90 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              <Icon name="Phone" size={18} />
              {PHONE}
            </a>
            <a
              href={TG}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => markEngaged()}
              className="w-full sm:w-auto border border-[#38BDF8]/30 text-[#38BDF8] font-oswald text-base sm:text-lg uppercase font-semibold px-6 sm:px-8 py-3.5 sm:py-4 rounded hover:bg-[#38BDF8]/10 transition-all flex items-center justify-center gap-2"
            >
              <Icon name="Send" size={18} />
              Написать в Telegram
            </a>
          </div>
          <div className="animate-fade-up flex flex-wrap gap-2.5 justify-center mt-5" style={{ animationDelay: "0.5s" }}>
            <a href={MAX_URL} target="_blank" rel="noopener noreferrer" onClick={() => markEngaged()} className="flex items-center gap-2 text-sm font-bold text-white bg-[#005FF9] hover:bg-[#1a70ff] px-4 py-2.5 rounded-lg transition-all shadow-lg shadow-[#005FF9]/20">
              MAX — написать
            </a>
            <a href={WA} target="_blank" rel="noopener noreferrer" onClick={() => markEngaged()} className="flex items-center gap-2 text-sm font-bold text-white/60 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-green-400 hover:border-green-500/30 px-4 py-2.5 rounded-lg transition-all">
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
                  <img src={t.img} alt={t.car} className="w-full h-full object-cover" loading="lazy" />
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
                  <img src={w.img} alt={w.title} className="w-full h-full object-cover" loading="lazy" />
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
            Напишите нам в мессенджер или позвоните — диспетчер ответит моментально.
          </p>
          <div className="flex flex-col gap-3 max-w-md mx-auto">
            <a href={TG} target="_blank" rel="noopener noreferrer" onClick={() => markEngaged()} className="flex items-center justify-center gap-2.5 bg-[#38BDF8]/15 border border-[#38BDF8]/30 text-[#38BDF8] font-oswald text-base uppercase font-bold px-6 py-4 rounded-lg hover:bg-[#38BDF8]/25 transition-all active:scale-[0.98]">
              <Icon name="Send" size={18} />Написать в Telegram
            </a>
            <a href={MAX_URL} target="_blank" rel="noopener noreferrer" onClick={() => markEngaged()} className="flex items-center justify-center gap-2.5 bg-[#005FF9] text-white font-oswald text-base uppercase font-bold px-6 py-4 rounded-lg hover:bg-[#1a70ff] transition-all shadow-lg shadow-[#005FF9]/20 active:scale-[0.98]">
              Написать в MAX
            </a>
            <a href={PHONE_HREF} onClick={() => markEngaged()} className="flex items-center justify-center gap-2.5 bg-amber text-coal font-oswald text-base uppercase font-bold px-6 py-4 rounded-lg hover:bg-amber/90 transition-all active:scale-[0.98]">
              <Icon name="Phone" size={18} />{PHONE}
            </a>
            <a href={WA} target="_blank" rel="noopener noreferrer" onClick={() => markEngaged()} className="flex items-center justify-center gap-2 text-sm font-bold text-green-400 border border-green-600/20 bg-green-600/10 hover:bg-green-600/20 px-4 py-3 rounded-lg transition-all">
              <Icon name="MessageCircle" size={15} />WhatsApp
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/8 py-6 px-4 mb-16 md:mb-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-white/30 font-golos">
          <span>&copy; {new Date().getFullYear()} Такси Дальняк. Межгородные перевозки.</span>
          <a href={PHONE_HREF} className="text-amber/60 hover:text-amber transition-colors">{PHONE}</a>
        </div>
      </footer>

      {/* Mobile bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
        <div className="flex gap-1.5 px-2 py-2">
          <a href={TG} target="_blank" rel="noopener noreferrer" onClick={() => markEngaged()} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#38BDF8]/15 text-[#38BDF8] font-oswald text-xs font-bold active:scale-95 transition-all">
            <Icon name="Send" size={14} />TG
          </a>
          <a href={PHONE_HREF} onClick={() => markEngaged()} className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-amber text-coal font-oswald text-xs font-bold active:scale-95 transition-all">
            <Icon name="Phone" size={14} />Звонок
          </a>
          <a href={MAX_URL} target="_blank" rel="noopener noreferrer" onClick={() => markEngaged()} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#005FF9] text-white font-oswald text-xs font-bold active:scale-95 transition-all">
            MAX
          </a>
          <a href={WA} target="_blank" rel="noopener noreferrer" onClick={() => markEngaged()} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-green-600/15 text-green-400 font-oswald text-xs font-bold active:scale-95 transition-all">
            <Icon name="MessageCircle" size={14} />WA
          </a>
        </div>
      </div>

      {/* AI Chat for exit-intent */}
      <div className="fixed z-50 bottom-[72px] md:bottom-6 right-3 md:right-4" style={{ display: chatOpen || showExitChat ? "block" : "none" }}>
        {chatOpen && (
          <div className="chat-bubble-in w-[calc(100vw-1.5rem)] sm:w-[380px] max-h-[70svh] md:max-h-[480px] bg-card border border-white/8 rounded-lg shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-amber/10 border-b border-amber/15 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-amber flex items-center justify-center">
                  <Icon name="Headset" size={16} className="text-coal" />
                </div>
                <div>
                  <p className="font-oswald text-sm font-semibold text-white">Диспетчер</p>
                  <p className="text-[10px] text-amber/60 font-golos">онлайн</p>
                </div>
              </div>
              <button onClick={() => setChatOpen(false)} className="text-white/40 hover:text-white transition-colors p-1">
                <Icon name="X" size={18} />
              </button>
            </div>

            <div ref={chatBodyRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0" style={{ maxHeight: "calc(70svh - 120px)", WebkitOverflowScrolling: "touch" }}>
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm font-golos whitespace-pre-wrap ${
                      msg.role === "user"
                        ? "bg-amber text-coal rounded-br-none"
                        : "bg-secondary text-white/90 rounded-bl-none"
                    }`}
                  >
                    {msg.text}
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

            {!phoneDone && (
              <div className="shrink-0 border-t border-white/8 p-3">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={(e) => setInputVal(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleSend(); }}
                    placeholder="Введите сообщение..."
                    className="flex-1 bg-secondary rounded px-3 py-2.5 text-sm font-golos text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-amber/50"
                    autoFocus
                  />
                  <button
                    onClick={handleSend}
                    disabled={typing}
                    className="w-10 h-10 rounded bg-amber flex items-center justify-center text-coal hover:bg-amber/90 transition-colors shrink-0 disabled:opacity-50"
                  >
                    <Icon name="SendHorizontal" size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="h-20 md:hidden" />
    </div>
  );
}