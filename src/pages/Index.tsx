import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import {
  LOGO, HERO_BG,
  PHONE, PHONE_HREF, TG_HREF, MAX_HREF, WA_HREF,
  TARIFFS, ADVANTAGES, WHO,
} from "@/components/taxi/constants";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

export default function Index() {
  const [splash, setSplash] = useState(true);
  const [splashOut, setSplashOut] = useState(false);
  const [pwaEvt, setPwaEvt] = useState<Event | null>(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [activeTariff, setActiveTariff] = useState(0);

  const secTariffs   = useInView();
  const secAdvantage = useInView();
  const secBottom    = useInView();

  useEffect(() => {
    const t1 = setTimeout(() => setSplashOut(true), 1800);
    const t2 = setTimeout(() => setSplash(false), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setPwaEvt(e); };
    window.addEventListener("beforeinstallprompt", h);
    window.addEventListener("appinstalled", () => setPwaInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

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
      navigator.share({ title: "Такси Дальняк", text: "Межгородное такси. Чем дальше — тем выгоднее!", url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => alert("Ссылка скопирована!"));
    }
  };

  const t = TARIFFS[activeTariff];

  return (
    <div className="bg-[#080808] text-white overflow-x-hidden" style={{ fontFamily: "'Golos Text', sans-serif" }}>

      {/* ══ ЗАСТАВКА ══ */}
      {splash && (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#080808] transition-opacity duration-600 ${splashOut ? "opacity-0" : "opacity-100"}`}>
          <img src={LOGO} alt="" className="w-20 h-20 rounded-2xl object-cover mb-5 shadow-2xl" />
          <div className="font-black text-4xl tracking-[0.25em] text-white uppercase" style={{ fontFamily: "Oswald" }}>ДАЛЬНЯК</div>
          <div className="mt-2 text-white/40 text-sm tracking-widest uppercase">Межгородное такси</div>
          <div className="mt-8 flex gap-1.5">
            {[0,1,2].map(i => (
              <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber/60 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* ══ ШАПКА ══ */}
      <header className="fixed top-0 inset-x-0 z-50 bg-[#080808]/90 backdrop-blur-xl border-b border-white/8">
        <div className="max-w-5xl mx-auto px-3 h-12 flex items-center justify-between gap-2">
          {/* Telegram слева */}
          <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sky-400 border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 px-3 py-1.5 rounded-xl text-xs font-bold transition"
            style={{ fontFamily: "Oswald" }}>
            <Icon name="Send" size={13} />TG
          </a>

          {/* Телефон по центру */}
          <a href={PHONE_HREF} className="flex items-center gap-1.5 font-black text-sm text-white hover:text-amber transition" style={{ fontFamily: "Oswald" }}>
            <Icon name="Phone" size={14} />{PHONE}
          </a>

          {/* MAX справа */}
          <a href={MAX_HREF} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#005FF9] hover:bg-[#1a70ff] text-white px-3 py-1.5 rounded-xl text-xs font-black transition"
            style={{ fontFamily: "Oswald" }}>
            MAX
          </a>
        </div>
      </header>

      {/* ══ HERO — один экран ══ */}
      <section className="relative min-h-screen flex flex-col pt-12">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_BG})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-[#080808]" />

        <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-4 text-center py-8">
          {/* Лого + название */}
          <div className="flex items-center gap-3 mb-4 opacity-0 animate-fade-in" style={{ animationFillMode: "forwards", animationDelay: "0.1s" }}>
            <img src={LOGO} alt="" className="w-10 h-10 rounded-xl object-cover" />
            <span className="font-black text-2xl tracking-widest text-white uppercase" style={{ fontFamily: "Oswald" }}>ДАЛЬНЯК</span>
          </div>

          {/* Заголовок */}
          <h1 className="font-black text-white leading-none mb-2 opacity-0 animate-fade-up"
            style={{ fontFamily: "Oswald", fontSize: "clamp(42px,11vw,100px)", animationFillMode: "forwards", animationDelay: "0.2s" }}>
            ТАКСИ<br /><span className="text-amber">МЕЖГОРОД</span>
          </h1>

          <p className="text-white/60 text-base sm:text-lg mb-1 opacity-0 animate-fade-up"
            style={{ animationFillMode: "forwards", animationDelay: "0.35s" }}>
            От 200 км · Вся Россия · Новые территории
          </p>

          {/* Слоган */}
          <div className="mt-3 mb-6 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards", animationDelay: "0.45s" }}>
            <span className="inline-block border border-amber/40 bg-amber/5 text-amber font-black text-sm px-5 py-2 rounded-full tracking-widest uppercase" style={{ fontFamily: "Oswald" }}>
              Чем дальше — тем выгоднее!
            </span>
          </div>

          {/* CTA кнопки */}
          <div className="flex flex-col sm:flex-row gap-3 opacity-0 animate-fade-up" style={{ animationFillMode: "forwards", animationDelay: "0.55s" }}>
            <a href={MAX_HREF} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-[#005FF9] hover:bg-[#1a70ff] text-white font-black text-base px-8 py-4 rounded-2xl transition shadow-xl shadow-[#005FF9]/30 active:scale-[0.97]"
              style={{ fontFamily: "Oswald" }}>
              Узнать стоимость в MAX
            </a>
            <a href={PHONE_HREF}
              className="flex items-center justify-center gap-2 border-2 border-amber/50 text-amber hover:bg-amber hover:text-[#080808] font-black text-base px-8 py-4 rounded-2xl transition active:scale-[0.97]"
              style={{ fontFamily: "Oswald" }}>
              <Icon name="Phone" size={20} />{PHONE}
            </a>
          </div>

          {/* Стрелка вниз */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-0 animate-fade-in" style={{ animationFillMode: "forwards", animationDelay: "1.4s" }}>
            <span className="text-white/20 text-[10px] tracking-[0.3em] uppercase">смотреть тарифы</span>
            <Icon name="ChevronDown" size={20} className="text-amber/50 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ══ ТАРИФЫ — один экран ══ */}
      <section ref={secTariffs.ref} className="min-h-screen flex flex-col justify-center px-4 py-16">
        <div className={`max-w-5xl mx-auto w-full transition-all duration-700 ${secTariffs.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>

          <div className="text-center mb-6">
            <p className="text-amber text-xs font-bold tracking-[0.3em] uppercase mb-1">тарифы</p>
            <h2 className="font-black text-3xl sm:text-5xl text-white" style={{ fontFamily: "Oswald" }}>ВЫБЕРИ ТАРИФ</h2>
          </div>

          {/* Переключатель тарифов */}
          <div className="flex gap-2 justify-center mb-6">
            {TARIFFS.map((tar, i) => (
              <button key={tar.id} onClick={() => setActiveTariff(i)}
                className={`font-black text-xs sm:text-sm px-4 py-2 rounded-xl transition border ${activeTariff === i ? "border-amber bg-amber/10 text-amber" : "border-white/10 text-white/40 hover:text-white hover:border-white/30"}`}
                style={{ fontFamily: "Oswald" }}>
                {tar.name}
              </button>
            ))}
          </div>

          {/* Карточка тарифа */}
          <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/[0.02]">
            {/* Фото авто */}
            <div className="relative h-44 sm:h-64 overflow-hidden">
              <img src={t.img} alt={t.car} className="w-full h-full object-cover transition-all duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0d] via-[#0d0d0d]/20 to-transparent" />
              <div className="absolute bottom-4 left-5">
                <p className="text-white/50 text-xs uppercase tracking-widest">{t.car}</p>
                <h3 className="font-black text-3xl sm:text-4xl text-white" style={{ fontFamily: "Oswald", color: t.accentColor }}>{t.name}</h3>
              </div>
            </div>

            {/* Цены */}
            <div className="p-5">
              <div className="grid grid-cols-3 gap-3 mb-4">
                {t.prices.map((p, i) => (
                  <div key={i} className="text-center p-3 rounded-2xl border border-white/8 bg-white/[0.02]">
                    <div className="font-black text-xl sm:text-2xl" style={{ fontFamily: "Oswald", color: t.accentColor }}>{p.price}</div>
                    <div className="text-white/40 text-[11px] mt-0.5 leading-tight">{p.label}</div>
                  </div>
                ))}
              </div>

              {/* Слоган */}
              <div className="text-center mb-4">
                <span className="text-amber font-black text-sm tracking-wider uppercase" style={{ fontFamily: "Oswald" }}>
                  ↓ Чем дальше — тем выгоднее!
                </span>
              </div>

              {/* Новые территории */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-red-950/30 border border-red-800/30 mb-4">
                <span className="text-red-400 text-lg">🗺️</span>
                <div>
                  <span className="text-red-400 text-xs font-bold uppercase tracking-wider">Новые территории</span>
                  <div className="font-black text-base text-white" style={{ fontFamily: "Oswald" }}>{t.newTerr} · ДНР, ЛНР, Запорожье, Херсон</div>
                </div>
              </div>

              {/* Особенности + кнопка */}
              <div className="flex flex-wrap gap-2 mb-4">
                {t.features.map(f => (
                  <span key={f} className="text-xs text-white/50 border border-white/10 rounded-lg px-3 py-1">{f}</span>
                ))}
              </div>

              <a href={MAX_HREF} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#005FF9] hover:bg-[#1a70ff] text-white font-black text-base py-4 rounded-2xl transition active:scale-[0.98] shadow-lg shadow-[#005FF9]/20"
                style={{ fontFamily: "Oswald" }}>
                Узнать стоимость поездки в MAX
              </a>
              <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
                className="mt-2 w-full flex items-center justify-center gap-2 text-white/30 hover:text-white/50 text-sm py-2 transition"
                style={{ fontFamily: "Oswald" }}>
                <Icon name="Send" size={13} />или написать в Telegram
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══ ПРЕИМУЩЕСТВА + КОГО ВОЗИМ — один экран ══ */}
      <section ref={secAdvantage.ref} className="min-h-screen flex flex-col justify-center px-4 py-16 bg-white/[0.01] border-y border-white/5">
        <div className={`max-w-5xl mx-auto w-full transition-all duration-700 ${secAdvantage.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>

          <div className="text-center mb-8">
            <p className="text-amber text-xs font-bold tracking-[0.3em] uppercase mb-1">наши преимущества</p>
            <h2 className="font-black text-3xl sm:text-4xl text-white" style={{ fontFamily: "Oswald" }}>ПОЧЕМУ МЫ</h2>
          </div>

          {/* Преимущества */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
            {ADVANTAGES.map((a, i) => (
              <div key={i} className={`flex items-start gap-4 p-4 rounded-2xl border border-white/8 bg-white/[0.02] transition-all duration-500 ${secAdvantage.visible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-6"}`}
                style={{ transitionDelay: `${i * 80}ms` }}>
                <span className="text-2xl shrink-0 mt-0.5">{a.icon}</span>
                <p className="text-sm text-white/70 leading-relaxed">{a.text}</p>
              </div>
            ))}
          </div>

          {/* Кого возим */}
          <div className="text-center mb-5">
            <h3 className="font-black text-2xl sm:text-3xl text-white" style={{ fontFamily: "Oswald" }}>КОГО МЫ ВОЗИМ</h3>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {WHO.map((w, i) => (
              <div key={i} className={`flex flex-col items-center gap-2 p-5 rounded-2xl border border-white/10 bg-white/[0.02] text-center transition-all duration-500 ${secAdvantage.visible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
                style={{ transitionDelay: `${400 + i * 80}ms` }}>
                <span className="text-3xl sm:text-4xl">{w.icon}</span>
                <p className="font-black text-xs sm:text-sm text-white/80 leading-tight" style={{ fontFamily: "Oswald" }}>{w.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ НИЖНИЙ БЛОК — CTA + PWA + Поделиться ══ */}
      <section ref={secBottom.ref} className="min-h-screen flex flex-col justify-center px-4 py-16">
        <div className={`max-w-md mx-auto w-full text-center transition-all duration-700 ${secBottom.visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`}>

          {/* Большой слоган */}
          <div className="mb-8">
            <h2 className="font-black text-white mb-2" style={{ fontFamily: "Oswald", fontSize: "clamp(32px,8vw,64px)" }}>
              ЧЕМ ДАЛЬШЕ —<br /><span className="text-amber">ТЕМ ВЫГОДНЕЕ!</span>
            </h2>
            <p className="text-white/40 text-sm">Назовите маршрут — ответим за 2 минуты</p>
          </div>

          {/* Кнопки связи */}
          <div className="flex flex-col gap-3 mb-8">
            <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 bg-sky-500 hover:bg-sky-400 text-white font-black text-lg py-4 rounded-2xl transition active:scale-[0.97] shadow-lg shadow-sky-500/20"
              style={{ fontFamily: "Oswald" }}>
              <Icon name="Send" size={22} />Написать в Telegram
            </a>
            <a href={PHONE_HREF}
              className="flex items-center justify-center gap-2.5 bg-amber hover:bg-amber/90 text-[#080808] font-black text-lg py-4 rounded-2xl transition active:scale-[0.97] shadow-lg shadow-amber/20"
              style={{ fontFamily: "Oswald" }}>
              <Icon name="Phone" size={22} />Позвонить
            </a>
            <a href={MAX_HREF} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 bg-[#005FF9] hover:bg-[#1a70ff] text-white font-black text-lg py-4 rounded-2xl transition active:scale-[0.97] shadow-lg shadow-[#005FF9]/20"
              style={{ fontFamily: "Oswald" }}>
              MAX — написать
            </a>
            <a href={WA_HREF} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2.5 bg-green-600 hover:bg-green-500 text-white font-black text-lg py-4 rounded-2xl transition active:scale-[0.97] shadow-lg shadow-green-600/20"
              style={{ fontFamily: "Oswald" }}>
              <Icon name="MessageCircle" size={22} />WhatsApp
            </a>
          </div>

          {/* PWA + Поделиться */}
          <div className="flex flex-col sm:flex-row gap-3">
            {pwaEvt && !pwaInstalled && (
              <button onClick={doInstall}
                className="flex-1 flex flex-col items-center gap-1.5 p-4 rounded-2xl border-2 border-amber/40 bg-amber/5 hover:bg-amber/10 transition active:scale-[0.97]">
                <Icon name="Smartphone" size={22} className="text-amber" />
                <span className="font-black text-sm text-amber" style={{ fontFamily: "Oswald" }}>Добавить на экран</span>
                <span className="text-white/40 text-xs">Чтобы не потерять нас</span>
              </button>
            )}
            <button onClick={doShare}
              className="flex-1 flex flex-col items-center gap-1.5 p-4 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition active:scale-[0.97]">
              <Icon name="Share2" size={22} className="text-white/60" />
              <span className="font-black text-sm text-white/70" style={{ fontFamily: "Oswald" }}>Поделиться сайтом</span>
              <span className="text-white/30 text-xs">Расскажи другу о Дальняке</span>
            </button>
          </div>

          {/* Footer */}
          <div className="mt-10 pt-6 border-t border-white/8">
            <div className="flex items-center justify-center gap-2 mb-3">
              <img src={LOGO} alt="" className="w-6 h-6 rounded-lg object-cover" />
              <span className="font-black text-sm tracking-widest text-white/60 uppercase" style={{ fontFamily: "Oswald" }}>Дальняк</span>
            </div>
            <p className="text-xs text-white/20">© 2025 Такси «Дальняк» · Межгородное такси</p>
            <p className="text-xs text-white/10 mt-1">такси межгород · чем дальше тем выгоднее</p>
          </div>
        </div>
      </section>

      {/* ══ МОБИЛЬНАЯ НИЖНЯЯ ПАНЕЛЬ ══ */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-white/10 bg-[#080808]/95 backdrop-blur-xl px-3 py-2 flex gap-2">
        <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1 bg-sky-500 text-white font-black text-xs py-3 rounded-xl active:scale-[0.97] transition"
          style={{ fontFamily: "Oswald" }}>
          <Icon name="Send" size={14} />TG
        </a>
        <a href={PHONE_HREF}
          className="flex-1 flex items-center justify-center gap-1 bg-amber text-[#080808] font-black text-xs py-3 rounded-xl active:scale-[0.97] transition"
          style={{ fontFamily: "Oswald" }}>
          <Icon name="Phone" size={14} />Звонок
        </a>
        <a href={MAX_HREF} target="_blank" rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1 bg-[#005FF9] text-white font-black text-xs py-3 rounded-xl active:scale-[0.97] transition"
          style={{ fontFamily: "Oswald" }}>
          MAX
        </a>
      </div>

    </div>
  );
}
