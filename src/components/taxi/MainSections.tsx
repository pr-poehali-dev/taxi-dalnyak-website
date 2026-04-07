import { useState, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";
import {
  CAR_IMG, LOGO,
  TG_HREF, WA_HREF, VK_HREF, MAX_HREF, PHONE, PHONE_HREF,
  TARIFFS, WHY, REVIEWS, NAV,
} from "./constants";

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

function CTABlock({ text = "Узнать стоимость" }: { text?: string }) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* MAX — главная */}
      <a href={MAX_HREF} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-2.5 bg-[#005FF9] hover:bg-[#1a70ff] active:scale-[0.97] text-white font-bold text-base px-7 py-4 rounded-2xl transition shadow-lg shadow-[#005FF9]/20 whitespace-nowrap"
        style={{ fontFamily: "Oswald" }}>
        {text} в MAX
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

interface MainSectionsProps {
  onGo: (id: string) => void;
  onShare: () => void;
}

export function MainSections({ onShare }: MainSectionsProps) {
  const [calcDist, setCalcDist] = useState("");
  const [calcTariff, setCalcTariff] = useState<"30" | "40" | "50">("30");

  const secTariffs  = useVisible();
  const secWhy      = useVisible();
  const secReviews  = useVisible();
  const secContacts = useVisible();

  const calcPrice = () => {
    const km = parseInt(calcDist.replace(/\D/g, ""), 10);
    if (!km || km < 200) return null;
    return km * parseInt(calcTariff, 10);
  };

  const price = calcPrice();

  return (
    <>
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
                {/* MAX — главная кнопка в карточке */}
                <a href={MAX_HREF} target="_blank" rel="noopener noreferrer"
                  className={cls(
                    "w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition active:scale-[0.98] text-center block",
                    t.featured ? "bg-[#005FF9] text-white hover:bg-[#1a70ff] shadow-lg shadow-[#005FF9]/20" : "bg-[#005FF9]/10 border border-[#005FF9]/30 text-[#5599FF] hover:bg-[#005FF9]/20"
                  )}
                  style={{ fontFamily: "Oswald" }}>
                  Узнать стоимость в MAX
                </a>
                {/* Telegram — второстепенный */}
                <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
                  className="mt-2 w-full py-2 rounded-xl font-bold text-xs text-white/30 hover:text-white/50 text-center block transition"
                  style={{ fontFamily: "Oswald" }}>
                  или написать в Telegram
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

          {/* MAX — главная */}
          <a href={MAX_HREF} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-[#005FF9] hover:bg-[#1a70ff] text-white font-black text-base px-8 py-4 rounded-2xl transition active:scale-[0.97] shadow-lg shadow-[#005FF9]/20"
            style={{ fontFamily: "Oswald" }}>
            Получить точную цену в MAX
          </a>
          {/* Telegram — второстепенный */}
          <div className="mt-3">
            <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/50 transition"
              style={{ fontFamily: "Oswald" }}>
              <Icon name="Send" size={13} />или написать в Telegram
            </a>
          </div>
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
              <a href={MAX_HREF} target="_blank" rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 bg-[#005FF9] hover:bg-[#1a70ff] text-white font-black text-sm px-6 py-3 rounded-xl transition active:scale-[0.97]"
                style={{ fontFamily: "Oswald" }}>
                Уточнить маршрут в MAX
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

          {/* Главные кнопки */}
          <div className={cls("grid sm:grid-cols-2 gap-3 mb-3 transition-all duration-700 delay-100", secContacts.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
            {/* MAX — первый и самый большой */}
            <a href={MAX_HREF} target="_blank" rel="noopener noreferrer"
              className="sm:col-span-2 flex items-center gap-4 p-5 rounded-2xl bg-[#005FF9] hover:bg-[#1a70ff] text-white transition active:scale-[0.98] group">
              <div className="w-14 h-14 bg-white/15 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-white/25 transition">
                <span className="font-black text-xl text-white" style={{ fontFamily: "Oswald" }}>MAX</span>
              </div>
              <div>
                <p className="font-black text-xl" style={{ fontFamily: "Oswald" }}>Написать в MAX</p>
                <p className="text-sm opacity-75">Мессенджер MAX — отвечаем быстрее всего</p>
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
          </div>

          {/* Второстепенные: Telegram + ВКонтакте + Поделиться */}
          <div className={cls("flex flex-col sm:flex-row gap-3 transition-all duration-700 delay-200", secContacts.v ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8")}>
            <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center gap-3 p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 text-white/50 hover:text-white transition active:scale-[0.98]">
              <div className="w-9 h-9 bg-white/5 rounded-xl flex items-center justify-center shrink-0"><Icon name="Send" size={18} /></div>
              <div>
                <p className="font-bold text-sm" style={{ fontFamily: "Oswald" }}>Telegram</p>
                <p className="text-xs opacity-60">@Mezhgorod1816</p>
              </div>
            </a>
            <a href={VK_HREF} target="_blank" rel="noopener noreferrer"
              className="flex-1 flex items-center gap-3 p-4 rounded-2xl bg-[#0077FF] hover:bg-[#0088FF] text-white transition active:scale-[0.98]">
              <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center shrink-0"><Icon name="Users" size={18} /></div>
              <div>
                <p className="font-bold text-sm" style={{ fontFamily: "Oswald" }}>ВКонтакте</p>
                <p className="text-xs opacity-75">vk.ru/dalnyack</p>
              </div>
            </a>
            <div className="flex-1 flex items-center gap-3 p-4 rounded-2xl border border-white/10 bg-white/[0.02]">
              <div className="flex-1">
                <p className="font-bold text-sm text-white" style={{ fontFamily: "Oswald" }}>Порекомендуй нас</p>
                <p className="text-xs text-white/40">Поделись с другом</p>
              </div>
              <button onClick={onShare} className="flex items-center gap-2 bg-amber text-coal font-bold text-sm px-4 py-2.5 rounded-xl hover:bg-amber/90 transition shrink-0" style={{ fontFamily: "Oswald" }}>
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
              <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" className="px-3 py-2 bg-[#005FF9]/20 hover:bg-[#005FF9]/40 rounded-xl text-[#5599FF] font-black text-xs transition" style={{ fontFamily: "Oswald" }}>MAX</a>
              <a href={WA_HREF} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-green-600/20 hover:bg-green-600/40 rounded-xl flex items-center justify-center text-green-400 transition"><Icon name="MessageCircle" size={16} /></a>
              <a href={TG_HREF} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-sky-500/20 hover:bg-sky-500/40 rounded-xl flex items-center justify-center text-sky-400/50 transition"><Icon name="Send" size={16} /></a>
              <a href={VK_HREF} target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-blue-500/20 hover:bg-blue-500/40 rounded-xl flex items-center justify-center text-blue-400 transition"><Icon name="Users" size={16} /></a>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-4 border-t border-white/5">
            <p className="text-xs text-white/20">© 2025 Такси «Дальняк» · Межгородное такси</p>
            <p className="text-xs text-white/15">такси межгород · междугороднее такси · дальние поездки</p>
          </div>
        </div>
      </footer>

      <div className="sr-only">{NAV.map(n => n.id).join(",")}</div>
    </>
  );
}
