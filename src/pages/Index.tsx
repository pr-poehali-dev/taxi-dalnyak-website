import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

const LEAD_API = "https://functions.poehali.dev/08fe4061-ac7e-4404-8a08-788b739d491b";
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

const YEAR_START = 2019;
const YEARS_EXPERIENCE = new Date().getFullYear() - YEAR_START;

function getAllUtmParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  params.forEach((v, k) => { if (k.startsWith("utm_")) utm[k] = v; });
  return utm;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  const d = digits.startsWith("8") || digits.startsWith("7") ? digits : "7" + digits;
  const p = d.slice(0, 11);
  let out = "+7";
  if (p.length > 1) out += " (" + p.slice(1, 4);
  if (p.length >= 4) out += ") " + p.slice(4, 7);
  if (p.length >= 7) out += "-" + p.slice(7, 9);
  if (p.length >= 9) out += "-" + p.slice(9, 11);
  return out;
}

interface LeadForm {
  from: string;
  to: string;
  phone: string;
  name: string;
  tariff: string;
  when: string;
}

export default function Index() {
  const [headerBg, setHeaderBg] = useState(false);
  const [utmParams] = useState(() => getAllUtmParams());
  const [form, setForm] = useState<LeadForm>({ from: "", to: "", phone: "", name: "", tariff: "Комфорт+", when: "Сегодня" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setHeaderBg(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Prefill from/to from UTM
  useEffect(() => {
    const candidates = [utmParams.utm_term, utmParams.utm_content, utmParams.utm_campaign];
    for (const c of candidates) {
      if (!c) continue;
      const cleaned = c.replace(/[+_-]/g, " ").replace(/такси|межгород|трансфер/gi, "").trim();
      const match = cleaned.match(/(?:из\s+)?([А-ЯЁа-яё]+)\s+(?:в|до)\s+([А-ЯЁа-яё]+)/i);
      if (match) {
        setForm(f => ({
          ...f,
          from: f.from || match[1].charAt(0).toUpperCase() + match[1].slice(1),
          to: f.to || match[2].charAt(0).toUpperCase() + match[2].slice(1),
        }));
        return;
      }
    }
  }, [utmParams]);

  const scrollToForm = useCallback(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  const submitForm = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg("");

    const digits = form.phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setErrorMsg("Укажите корректный номер телефона");
      return;
    }
    if (!form.from.trim() || !form.to.trim()) {
      setErrorMsg("Укажите откуда и куда вы едете");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(LEAD_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "lead",
          from: form.from,
          to: form.to,
          phone: form.phone,
          name: form.name,
          tariff: form.tariff,
          when: form.when,
          utm: utmParams,
          page: window.location.href,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setSubmitted(true);
        if (typeof window !== "undefined" && (window as unknown as { ym?: (id: number, action: string, goal: string) => void }).ym) {
          try { (window as unknown as { ym: (id: number, action: string, goal: string) => void }).ym(0, "reachGoal", "lead"); } catch { /* noop */ }
        }
      } else {
        setErrorMsg("Не удалось отправить. Позвоните нам: " + PHONE);
      }
    } catch {
      setErrorMsg("Не удалось отправить. Позвоните нам: " + PHONE);
    }
    setSubmitting(false);
  }, [form, utmParams]);

  const tariffs = [
    { name: "Стандарт", car: "Hyundai Solaris", img: IMG_SOLARIS, seats: "3 пассажира", features: ["Седан", "Климат-контроль", "Кресло для ребёнка"] },
    { name: "Комфорт+", car: "Toyota Camry", img: IMG_CAMRY, seats: "3 пассажира", features: ["Бизнес-седан", "Кожаный салон", "Тихий ход"], popular: true },
    { name: "Минивэн", car: "Hyundai Starex", img: IMG_STAREX, seats: "6 пассажиров", features: ["Вместительный", "Много багажа", "Для больших групп"] },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground grain-overlay">
      {/* Header */}
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
          <div className="flex items-center gap-2">
            <a href={TG} target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1.5 text-white/90 hover:text-[#38BDF8] font-oswald text-xs font-bold px-3 py-2 rounded-lg border border-white/10 hover:border-[#38BDF8]/50 transition-all">
              <Icon name="Send" size={14} />
              Telegram
            </a>
            <a href={MAX_URL} target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1.5 bg-[#005FF9] hover:bg-[#1a70ff] text-white font-oswald text-xs font-bold px-3 py-2 rounded-lg transition-all">
              MAX
            </a>
            <a href={PHONE_HREF} className="flex items-center gap-1.5 bg-amber text-coal font-oswald text-xs font-bold px-3 py-2 rounded-lg hover:bg-amber/90 transition-all animate-pulse-amber">
              <Icon name="Phone" size={13} />
              <span className="hidden md:inline">{PHONE}</span>
              <span className="md:hidden">Звонок</span>
            </a>
          </div>
        </div>
      </header>

      {/* HERO with form */}
      <section id="hero" className="relative min-h-[100svh] flex items-center pt-20 pb-8 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_BG})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/70 to-coal" />

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 grid lg:grid-cols-[1.1fr_1fr] gap-8 items-center">
          {/* Left - headline & trust */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-2 bg-amber/15 border border-amber/30 rounded-full px-3 py-1.5 mb-4">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-amber font-oswald text-xs uppercase tracking-wider font-semibold">Диспетчер на линии — отвечаем за 2 минуты</span>
            </div>

            <h1 className="font-oswald text-3xl sm:text-4xl md:text-6xl font-bold text-white uppercase leading-[1.05] mb-4">
              Межгородное такси <span className="text-amber">из города в город</span>
            </h1>
            <p className="font-oswald text-lg md:text-2xl text-white/80 mb-5 leading-snug">
              Подача авто <span className="text-amber font-bold">от 30 минут</span>. Фиксированная цена — без накруток.
            </p>

            {/* Rating block */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                <div className="flex">
                  {[1,2,3,4,5].map(i => (
                    <Icon key={i} name="Star" size={16} className={i <= 4 ? "text-amber fill-amber" : "text-amber fill-amber/50"} />
                  ))}
                </div>
                <div>
                  <div className="font-oswald text-white font-bold text-sm leading-none">4.8</div>
                  <div className="text-[10px] text-white/50 font-golos">2 340+ отзывов</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                <Icon name="Shield" size={18} className="text-amber" />
                <div>
                  <div className="font-oswald text-white font-bold text-sm leading-none">с 2019</div>
                  <div className="text-[10px] text-white/50 font-golos">{YEARS_EXPERIENCE} {YEARS_EXPERIENCE === 1 ? "год" : YEARS_EXPERIENCE < 5 ? "года" : "лет"} на рынке</div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                <Icon name="Users" size={18} className="text-amber" />
                <div>
                  <div className="font-oswald text-white font-bold text-sm leading-none">50 000+</div>
                  <div className="text-[10px] text-white/50 font-golos">поездок</div>
                </div>
              </div>
            </div>

            {/* USP bullets */}
            <ul className="space-y-2 mb-6 hidden md:block">
              {[
                "Без предоплаты — оплата водителю на месте",
                "Детское кресло и перевозка животных — бесплатно",
                "Работаем по договору с юрлицами",
              ].map((u, i) => (
                <li key={i} className="flex items-start gap-2 text-white/80 font-golos">
                  <Icon name="Check" size={18} className="text-amber shrink-0 mt-0.5" />
                  <span>{u}</span>
                </li>
              ))}
            </ul>

            {/* Contact CTAs */}
            <div className="flex flex-wrap gap-2.5">
              <a href={PHONE_HREF} className="flex items-center gap-2 bg-amber text-coal font-oswald text-base md:text-lg uppercase font-bold px-5 py-3.5 rounded-lg hover:bg-amber/90 transition-all hover:scale-105 shadow-xl shadow-amber/20">
                <Icon name="Phone" size={18} />
                {PHONE}
              </a>
              <a href={TG} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#38BDF8] text-white font-oswald text-base uppercase font-bold px-5 py-3.5 rounded-lg hover:bg-[#0ea5e9] transition-all">
                <Icon name="Send" size={18} />
                Telegram
              </a>
              <a href={MAX_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-[#005FF9] text-white font-oswald text-base uppercase font-bold px-5 py-3.5 rounded-lg hover:bg-[#1a70ff] transition-all">
                MAX
              </a>
            </div>
          </div>

          {/* Right - form */}
          <div ref={formRef} id="order-form" className="bg-card/90 backdrop-blur-sm border border-amber/20 rounded-2xl p-5 md:p-6 shadow-2xl shadow-black/60 animate-fade-up" style={{ animationDelay: "0.15s" }}>
            {!submitted ? (
              <>
                <div className="text-center mb-4">
                  <div className="inline-block bg-amber/15 border border-amber/30 rounded-full px-3 py-1 mb-2">
                    <span className="text-amber font-oswald text-[11px] uppercase tracking-wider font-bold">Рассчитаем стоимость бесплатно</span>
                  </div>
                  <h2 className="font-oswald text-2xl md:text-3xl font-bold text-white uppercase">Закажите такси</h2>
                  <p className="text-white/60 text-sm font-golos mt-1">Перезвоним в течение 2 минут</p>
                </div>
                <form onSubmit={submitForm} className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="relative">
                      <Icon name="MapPin" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber/70" />
                      <input
                        type="text"
                        placeholder="Откуда"
                        value={form.from}
                        onChange={e => setForm(f => ({ ...f, from: e.target.value }))}
                        className="w-full bg-coal/80 border border-white/10 focus:border-amber/60 rounded-lg pl-9 pr-3 py-3 text-white placeholder:text-white/40 font-golos text-sm outline-none transition-colors"
                        required
                      />
                    </div>
                    <div className="relative">
                      <Icon name="Flag" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber/70" />
                      <input
                        type="text"
                        placeholder="Куда"
                        value={form.to}
                        onChange={e => setForm(f => ({ ...f, to: e.target.value }))}
                        className="w-full bg-coal/80 border border-white/10 focus:border-amber/60 rounded-lg pl-9 pr-3 py-3 text-white placeholder:text-white/40 font-golos text-sm outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <Icon name="Phone" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber/70" />
                    <input
                      type="tel"
                      inputMode="tel"
                      placeholder="+7 (___) ___-__-__"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: formatPhone(e.target.value) }))}
                      className="w-full bg-coal/80 border border-white/10 focus:border-amber/60 rounded-lg pl-9 pr-3 py-3 text-white placeholder:text-white/40 font-golos text-sm outline-none transition-colors"
                      required
                    />
                  </div>

                  <div className="relative">
                    <Icon name="User" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-amber/70" />
                    <input
                      type="text"
                      placeholder="Как к вам обращаться (необязательно)"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      className="w-full bg-coal/80 border border-white/10 focus:border-amber/60 rounded-lg pl-9 pr-3 py-3 text-white placeholder:text-white/40 font-golos text-sm outline-none transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={form.tariff}
                      onChange={e => setForm(f => ({ ...f, tariff: e.target.value }))}
                      className="bg-coal/80 border border-white/10 focus:border-amber/60 rounded-lg px-3 py-3 text-white font-golos text-sm outline-none transition-colors"
                    >
                      <option value="Стандарт">Стандарт</option>
                      <option value="Комфорт+">Комфорт+</option>
                      <option value="Минивэн">Минивэн</option>
                    </select>
                    <select
                      value={form.when}
                      onChange={e => setForm(f => ({ ...f, when: e.target.value }))}
                      className="bg-coal/80 border border-white/10 focus:border-amber/60 rounded-lg px-3 py-3 text-white font-golos text-sm outline-none transition-colors"
                    >
                      <option value="Сегодня">Сегодня</option>
                      <option value="Завтра">Завтра</option>
                      <option value="Позже">Позже</option>
                    </select>
                  </div>

                  {errorMsg && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-300 text-sm font-golos">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-amber text-coal font-oswald text-lg uppercase font-bold py-4 rounded-lg hover:bg-amber/90 transition-all hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100 shadow-lg shadow-amber/30 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Icon name="Loader2" size={18} className="animate-spin" />
                        Отправляем...
                      </>
                    ) : (
                      <>
                        Получить расчёт
                        <Icon name="ArrowRight" size={18} />
                      </>
                    )}
                  </button>

                  <p className="text-center text-[11px] text-white/40 font-golos leading-snug">
                    Нажимая кнопку, вы соглашаетесь с обработкой персональных данных.<br/>
                    Мы не передаём данные третьим лицам.
                  </p>
                </form>
              </>
            ) : (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center mx-auto mb-4">
                  <Icon name="Check" size={32} className="text-green-400" />
                </div>
                <h3 className="font-oswald text-2xl font-bold text-white uppercase mb-2">Заявка принята!</h3>
                <p className="text-white/70 font-golos mb-4">
                  Диспетчер свяжется с вами в течение <span className="text-amber font-bold">2 минут</span> с номера:
                </p>
                <a href={PHONE_HREF} className="block font-oswald text-2xl text-amber font-bold mb-4 hover:text-amber/80">{PHONE}</a>
                <p className="text-white/50 text-sm font-golos mb-5">Не дождались звонка? Напишите нам:</p>
                <div className="flex gap-2 justify-center">
                  <a href={TG} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-[#38BDF8] text-white px-4 py-2.5 rounded-lg font-oswald text-sm uppercase font-bold">
                    <Icon name="Send" size={14} /> Telegram
                  </a>
                  <a href={MAX_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-[#005FF9] text-white px-4 py-2.5 rounded-lg font-oswald text-sm uppercase font-bold">
                    MAX
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Advantages strip */}
      <section className="py-10 md:py-14 px-4 bg-card border-y border-white/5">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: "Timer", title: "От 30 минут", desc: "Подача авто" },
            { icon: "Wallet", title: "Без предоплаты", desc: "Оплата водителю" },
            { icon: "ShieldCheck", title: "Фикс. цена", desc: "Никаких доплат" },
            { icon: "Award", title: "С 2019 года", desc: YEARS_EXPERIENCE + "+ лет опыта" },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-amber/15 flex items-center justify-center shrink-0">
                <Icon name={a.icon} size={22} className="text-amber" />
              </div>
              <div>
                <div className="font-oswald text-white font-bold uppercase text-sm md:text-base leading-tight">{a.title}</div>
                <div className="text-white/50 text-xs md:text-sm font-golos">{a.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tariffs — without prices */}
      <section id="tariffs" className="py-16 md:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber font-oswald text-sm uppercase tracking-[0.25em] mb-2">Наш автопарк</p>
            <h2 className="font-oswald text-3xl md:text-5xl font-bold text-white uppercase">Выберите тариф</h2>
            <div className="w-16 h-0.5 bg-amber mx-auto mt-4" />
            <p className="text-white/60 font-golos mt-4 max-w-xl mx-auto">Точную стоимость диспетчер рассчитает после заявки. Минимальная цена — ниже, чем у сетевых агрегаторов.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {tariffs.map((t, i) => (
              <div key={i} className={`relative border rounded-lg overflow-hidden card-hover ${t.popular ? "border-amber" : "border-white/8"} bg-card`}>
                {t.popular && (
                  <div className="absolute top-3 right-3 bg-amber text-coal text-xs font-oswald uppercase font-bold px-3 py-1 rounded z-10">
                    Популярный
                  </div>
                )}
                <div className="relative h-48 overflow-hidden">
                  <img src={t.img} alt={t.car} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="font-oswald text-2xl font-bold text-white uppercase">{t.name}</h3>
                  <p className="text-amber/70 font-golos text-sm">{t.car}</p>
                  <p className="text-white/50 text-xs font-golos mb-4">{t.seats}</p>
                  <ul className="space-y-2 mb-5">
                    {t.features.map((f, j) => (
                      <li key={j} className="flex items-center gap-2 text-white/70 text-sm font-golos">
                        <Icon name="Check" size={14} className="text-amber shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => { setForm(f => ({ ...f, tariff: t.name })); scrollToForm(); }}
                    className="w-full bg-amber/10 hover:bg-amber text-amber hover:text-coal border border-amber/40 font-oswald text-sm uppercase font-bold py-3 rounded-lg transition-all"
                  >
                    Заказать
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-16 md:py-24 px-4 bg-card">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-amber font-oswald text-sm uppercase tracking-[0.25em] mb-2">Отзывы пассажиров</p>
            <h2 className="font-oswald text-3xl md:text-5xl font-bold text-white uppercase">Нам доверяют</h2>
            <div className="flex items-center justify-center gap-3 mt-4">
              <div className="flex">
                {[1,2,3,4,5].map(i => (
                  <Icon key={i} name="Star" size={22} className={i <= 4 ? "text-amber fill-amber" : "text-amber fill-amber/50"} />
                ))}
              </div>
              <span className="font-oswald text-2xl text-white font-bold">4.8</span>
              <span className="text-white/50 font-golos text-sm">· 2 340+ отзывов</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { name: "Андрей К.", route: "Москва → Тула", text: "Заказывал на утро, подача была через 25 минут. Водитель вежливый, машина чистая. Доехали без приключений за фиксированную цену — никаких доплат в пути.", stars: 5 },
              { name: "Елена М.", route: "СПб → Новгород", text: "Ехали с ребёнком, кресло предоставили бесплатно. Диспетчер перезвонила быстро, всё рассчитала. Цена честная, без сюрпризов.", stars: 5 },
              { name: "Дмитрий С.", route: "Воронеж → Москва", text: "Пользуюсь не первый раз по работе. Всегда подают вовремя, документы для бухгалтерии присылают сразу. Рекомендую.", stars: 5 },
              { name: "Ольга П.", route: "Москва → Рязань", text: "Комфорт+ на Камри. Салон кожаный, тихо, водитель спокойный. Отличный вариант для долгой дороги.", stars: 4 },
              { name: "Сергей Л.", route: "Тверь → Москва", text: "Срочно нужно было ехать в аэропорт. Подали машину за 20 минут, успели на рейс с запасом. Благодарен.", stars: 5 },
              { name: "Марина В.", route: "Москва → Калуга", text: "Везла маму к врачу. Водитель помог с вещами, ехал аккуратно. Обратно заказали у них же, ждал нас 2 часа бесплатно.", stars: 5 },
            ].map((r, i) => (
              <div key={i} className="border border-white/8 rounded-lg p-5 hover:border-amber/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex">
                    {[1,2,3,4,5].map(j => (
                      <Icon key={j} name="Star" size={14} className={j <= r.stars ? "text-amber fill-amber" : "text-white/20"} />
                    ))}
                  </div>
                  <span className="text-amber/60 font-golos text-xs">{r.route}</span>
                </div>
                <p className="text-white/80 font-golos text-sm leading-relaxed mb-3">{r.text}</p>
                <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                  <div className="w-8 h-8 rounded-full bg-amber/20 flex items-center justify-center text-amber font-oswald font-bold text-sm">
                    {r.name[0]}
                  </div>
                  <span className="text-white/60 font-golos text-sm">{r.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we drive */}
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
              <div key={i} className="border border-white/8 rounded-lg overflow-hidden card-hover bg-card">
                <div className="relative h-52 overflow-hidden">
                  <img src={w.img} alt={w.title} className="w-full h-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
                </div>
                <div className="p-5">
                  <h3 className="font-oswald text-xl font-bold text-white uppercase mb-2">{w.title}</h3>
                  <p className="text-white/60 text-sm font-golos">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 md:py-24 px-4 bg-card">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-amber font-oswald text-sm uppercase tracking-[0.25em] mb-2">Нужно ехать?</p>
          <h2 className="font-oswald text-3xl md:text-5xl font-bold text-white uppercase mb-4">
            Позвоните или оставьте <span className="text-amber">заявку</span>
          </h2>
          <p className="text-white/60 font-golos mb-8 max-w-lg mx-auto">
            Диспетчер перезвонит в течение 2 минут, рассчитает стоимость и подаст машину от 30 минут.
          </p>
          <div className="flex flex-col gap-3 max-w-md mx-auto">
            <a href={PHONE_HREF} className="flex items-center justify-center gap-2.5 bg-amber text-coal font-oswald text-lg uppercase font-bold px-6 py-4 rounded-lg hover:bg-amber/90 transition-all active:scale-[0.98] shadow-xl shadow-amber/20 animate-pulse-amber">
              <Icon name="Phone" size={20} />{PHONE}
            </a>
            <button onClick={scrollToForm} className="flex items-center justify-center gap-2.5 bg-white/5 border border-amber/40 text-amber font-oswald text-base uppercase font-bold px-6 py-4 rounded-lg hover:bg-amber/10 transition-all">
              <Icon name="FileText" size={18} />Оставить заявку
            </button>
            <div className="grid grid-cols-2 gap-3 mt-1">
              <a href={TG} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#38BDF8] text-white font-oswald text-base uppercase font-bold px-4 py-3.5 rounded-lg hover:bg-[#0ea5e9] transition-all">
                <Icon name="Send" size={16} />Telegram
              </a>
              <a href={MAX_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 bg-[#005FF9] text-white font-oswald text-base uppercase font-bold px-4 py-3.5 rounded-lg hover:bg-[#1a70ff] transition-all">
                MAX
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/8 py-6 px-4 mb-16 md:mb-0">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-white/40 font-golos">
          <span>&copy; {new Date().getFullYear()} Такси Дальняк. Межгородные перевозки.</span>
          <a href={PHONE_HREF} className="text-amber/70 hover:text-amber transition-colors font-oswald font-bold">{PHONE}</a>
        </div>
      </footer>

      {/* Mobile bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
        <div className="flex gap-1.5 px-2 py-2">
          <a href={TG} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-lg bg-[#38BDF8] text-white font-oswald text-xs font-bold active:scale-95 transition-all">
            <Icon name="Send" size={14} />TG
          </a>
          <a href={PHONE_HREF} className="flex-[2] flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-amber text-coal font-oswald text-xs font-bold active:scale-95 transition-all animate-pulse-amber">
            <Icon name="Phone" size={14} />Позвонить
          </a>
          <a href={MAX_URL} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1 py-2.5 rounded-lg bg-[#005FF9] text-white font-oswald text-xs font-bold active:scale-95 transition-all">
            MAX
          </a>
        </div>
      </div>
    </div>
  );
}
