import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import {
  LOGO, HERO_BG,
  PHONE, PHONE_HREF, TG_HREF, MAX_HREF, WA_HREF,
  TARIFFS, ADVANTAGES, WHO,
} from "@/components/taxi/constants";

// ─── Сцены фильма ─────────────────────────────────────────────────────────────
const SCENES = ["intro", "tariff-0", "tariff-1", "tariff-2", "advantages", "contacts"] as const;
type Scene = typeof SCENES[number];

// ─── Утилиты ──────────────────────────────────────────────────────────────────
function cls(...a: (string | false | undefined | null)[]) { return a.filter(Boolean).join(" "); }

export default function Index() {
  const [splash, setSplash]           = useState(true);
  const [splashOut, setSplashOut]     = useState(false);
  const [scene, setScene]             = useState<Scene>("intro");
  const [prevScene, setPrevScene]     = useState<Scene>("intro");
  const [animDir, setAnimDir]         = useState<"next" | "prev">("next");
  const [transitioning, setTransit]   = useState(false);
  const [pwaEvt, setPwaEvt]           = useState<Event | null>(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [autoPlay, setAutoPlay]       = useState(true);

  // Заставка
  useEffect(() => {
    const t1 = setTimeout(() => setSplashOut(true), 1900);
    const t2 = setTimeout(() => setSplash(false), 2600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // PWA
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setPwaEvt(e); };
    window.addEventListener("beforeinstallprompt", h);
    window.addEventListener("appinstalled", () => setPwaInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  const goScene = useCallback((next: Scene, dir: "next" | "prev" = "next") => {
    if (transitioning || next === scene) return;
    setAnimDir(dir);
    setTransit(true);
    setPrevScene(scene);
    setTimeout(() => {
      setScene(next);
      setTransit(false);
    }, 350);
  }, [transitioning, scene]);

  const goNext = useCallback(() => {
    const idx = SCENES.indexOf(scene);
    if (idx < SCENES.length - 1) goScene(SCENES[idx + 1], "next");
  }, [scene, goScene]);

  const goPrev = useCallback(() => {
    const idx = SCENES.indexOf(scene);
    if (idx > 0) goScene(SCENES[idx - 1], "prev");
  }, [scene, goScene]);

  // Автопереход на intro → tariff-0 через 3 сек
  useEffect(() => {
    if (!splash && scene === "intro" && autoPlay) {
      const t = setTimeout(() => { goScene("tariff-0", "next"); setAutoPlay(false); }, 3200);
      return () => clearTimeout(t);
    }
  }, [splash, scene, autoPlay, goScene]);

  // Свайп / колесо
  useEffect(() => {
    let startY = 0;
    const onTouch = (e: TouchEvent) => { startY = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = startY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 50) { if (dy > 0) goNext(); else goPrev(); }
    };
    const onWheel = (e: WheelEvent) => { e.preventDefault(); if (e.deltaY > 30) goNext(); else if (e.deltaY < -30) goPrev(); };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") goNext();
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("touchstart", onTouch, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("touchstart", onTouch);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
    };
  }, [goNext, goPrev]);

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

  const sceneIdx = SCENES.indexOf(scene);
  const isFirst  = sceneIdx === 0;
  const isLast   = sceneIdx === SCENES.length - 1;

  const enterClass = animDir === "next"
    ? (transitioning ? "opacity-0 translate-y-8 scale-[0.97]" : "opacity-100 translate-y-0 scale-100")
    : (transitioning ? "opacity-0 -translate-y-8 scale-[0.97]" : "opacity-100 translate-y-0 scale-100");

  return (
    <div className="fixed inset-0 bg-[#080808] text-white overflow-hidden select-none" style={{ fontFamily: "'Golos Text', sans-serif" }}>

      {/* ══ ЗАСТАВКА ══ */}
      {splash && (
        <div className={cls(
          "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#080808]",
          "transition-all duration-700",
          splashOut ? "opacity-0 scale-105" : "opacity-100 scale-100"
        )}>
          <img src={LOGO} alt="" className="w-24 h-24 rounded-3xl object-cover mb-6 shadow-2xl shadow-amber/20" />
          <div className="font-black text-5xl tracking-[0.3em] text-white uppercase" style={{ fontFamily: "Oswald" }}>ДАЛЬНЯК</div>
          <div className="mt-2 text-white/30 text-xs tracking-[0.5em] uppercase">Межгородное такси</div>
          <div className="mt-10 flex gap-2">
            {[0,1,2,3].map(i => (
              <div key={i} className="w-1 h-6 rounded-full bg-amber/40 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </div>
        </div>
      )}

      {/* ══ ФОНОВОЕ ИЗОБРАЖЕНИЕ (меняется по сцене) ══ */}
      <div className="absolute inset-0 z-0">
        {/* Базовый фон */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-all duration-700"
          style={{
            backgroundImage: scene.startsWith("tariff-")
              ? `url(${TARIFFS[parseInt(scene.split("-")[1])].img})`
              : `url(${HERO_BG})`,
            filter: scene === "advantages" || scene === "contacts" ? "brightness(0.15) blur(2px)" : "brightness(0.35)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
        {scene.startsWith("tariff-") && (
          <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at center, ${TARIFFS[parseInt(scene.split("-")[1])].accentColor}08 0%, transparent 70%)` }} />
        )}
      </div>

      {/* ══ ШАПКА ══ */}
      <header className="absolute top-0 inset-x-0 z-30 px-4 pt-3">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
          <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-sky-400 border border-sky-500/30 bg-black/40 backdrop-blur-sm hover:bg-sky-500/20 px-3 py-2 rounded-xl text-xs font-bold transition"
            style={{ fontFamily: "Oswald" }}>
            <Icon name="Send" size={13} />Telegram
          </a>
          <a href={PHONE_HREF}
            className="flex items-center gap-1.5 font-black text-sm text-white bg-black/40 backdrop-blur-sm hover:bg-white/10 px-3 py-2 rounded-xl transition"
            style={{ fontFamily: "Oswald" }}>
            <Icon name="Phone" size={14} className="text-amber" />{PHONE}
          </a>
          <a href={MAX_HREF} target="_blank" rel="noopener noreferrer"
            className="flex items-center bg-[#005FF9] hover:bg-[#1a70ff] text-white px-3 py-2 rounded-xl text-xs font-black transition"
            style={{ fontFamily: "Oswald" }}>
            MAX
          </a>
        </div>
      </header>

      {/* ══ КОНТЕНТ СЦЕНЫ ══ */}
      <div className={cls(
        "absolute inset-0 z-10 flex flex-col items-center justify-center px-4 pt-14 pb-20",
        "transition-all duration-350",
        enterClass
      )}>

        {/* ─ СЦЕНА: INTRO ─ */}
        {scene === "intro" && (
          <div className="text-center max-w-sm mx-auto">
            <div className="flex items-center justify-center gap-3 mb-5">
              <img src={LOGO} alt="" className="w-12 h-12 rounded-2xl object-cover shadow-xl" />
              <span className="font-black text-2xl tracking-widest text-white uppercase" style={{ fontFamily: "Oswald" }}>ДАЛЬНЯК</span>
            </div>
            <h1 className="font-black text-white leading-[0.9] mb-3"
              style={{ fontFamily: "Oswald", fontSize: "clamp(52px,14vw,110px)" }}>
              ТАКСИ<br /><span className="text-amber">МЕЖГОРОД</span>
            </h1>
            <p className="text-white/50 text-sm mb-5 tracking-wide">От 200 км · Вся Россия · Новые территории</p>
            <div className="inline-block border border-amber/50 bg-amber/8 text-amber font-black text-sm px-6 py-2 rounded-full tracking-widest uppercase mb-8" style={{ fontFamily: "Oswald" }}>
              Чем дальше — тем выгоднее!
            </div>
            <div className="flex gap-3 justify-center">
              <a href={MAX_HREF} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 bg-[#005FF9] hover:bg-[#1a70ff] text-white font-black text-sm px-6 py-3.5 rounded-2xl transition shadow-xl shadow-[#005FF9]/30 active:scale-[0.97]"
                style={{ fontFamily: "Oswald" }}>
                Узнать стоимость
              </a>
              <a href={PHONE_HREF}
                className="flex items-center gap-2 border-2 border-amber/50 text-amber font-black text-sm px-6 py-3.5 rounded-2xl transition active:scale-[0.97]"
                style={{ fontFamily: "Oswald" }}>
                <Icon name="Phone" size={16} />Звонок
              </a>
            </div>
          </div>
        )}

        {/* ─ СЦЕНЫ: ТАРИФЫ ─ */}
        {scene.startsWith("tariff-") && (() => {
          const ti = parseInt(scene.split("-")[1]);
          const t  = TARIFFS[ti];
          return (
            <div className="w-full max-w-sm mx-auto">
              {/* Заголовок тарифа */}
              <div className="text-center mb-4">
                <p className="text-xs font-bold tracking-[0.35em] uppercase mb-1" style={{ color: t.accentColor, opacity: 0.7 }}>тариф</p>
                <h2 className="font-black leading-none" style={{ fontFamily: "Oswald", fontSize: "clamp(40px,12vw,80px)", color: t.accentColor }}>
                  {t.name}
                </h2>
                <p className="text-white/40 text-sm mt-1">{t.car}</p>
              </div>

              {/* Цены — три столбца */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                {t.prices.map((p, i) => (
                  <div key={i}
                    className="flex flex-col items-center py-3 px-2 rounded-2xl border bg-black/40 backdrop-blur-sm text-center"
                    style={{ borderColor: `${t.accentColor}30` }}>
                    <div className="font-black text-xl leading-none" style={{ fontFamily: "Oswald", color: t.accentColor }}>{p.price}</div>
                    <div className="text-white/35 text-[10px] mt-1 leading-tight">{p.label}</div>
                    {i === 2 && <div className="text-[9px] mt-1 font-bold" style={{ color: t.accentColor }}>выгоднее всего</div>}
                  </div>
                ))}
              </div>

              {/* Слоган */}
              <div className="text-center mb-3">
                <span className="text-amber text-xs font-black tracking-wider uppercase" style={{ fontFamily: "Oswald" }}>
                  ↓ Чем дальше — тем выгоднее!
                </span>
              </div>

              {/* Новые территории */}
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-red-950/60 border border-red-700/30 backdrop-blur-sm mb-4">
                <span className="text-lg">🗺️</span>
                <div className="flex-1">
                  <div className="text-red-400 text-[10px] font-bold uppercase tracking-wider">Новые территории</div>
                  <div className="font-black text-sm text-white" style={{ fontFamily: "Oswald" }}>{t.newTerr} · ДНР, ЛНР, Запорожье, Херсон</div>
                </div>
              </div>

              {/* Кнопка */}
              <a href={MAX_HREF} target="_blank" rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 bg-[#005FF9] hover:bg-[#1a70ff] text-white font-black text-base py-3.5 rounded-2xl transition active:scale-[0.98] shadow-lg shadow-[#005FF9]/20"
                style={{ fontFamily: "Oswald" }}>
                Узнать стоимость в MAX
              </a>

              {/* Переключатель тарифов */}
              <div className="flex gap-2 justify-center mt-3">
                {TARIFFS.map((tar, i) => (
                  <button key={tar.id}
                    onClick={() => goScene(`tariff-${i}` as Scene, i > ti ? "next" : "prev")}
                    className={cls("w-2 h-2 rounded-full transition-all duration-300",
                      ti === i ? "scale-125" : "bg-white/20 hover:bg-white/40"
                    )}
                    style={ti === i ? { background: t.accentColor } : {}}
                  />
                ))}
              </div>
            </div>
          );
        })()}

        {/* ─ СЦЕНА: ПРЕИМУЩЕСТВА ─ */}
        {scene === "advantages" && (
          <div className="w-full max-w-sm mx-auto">
            <div className="text-center mb-5">
              <p className="text-amber text-xs font-bold tracking-[0.3em] uppercase mb-1">почему мы</p>
              <h2 className="font-black text-4xl text-white" style={{ fontFamily: "Oswald" }}>НАШИ<br />ПРЕИМУЩЕСТВА</h2>
            </div>

            <div className="space-y-2.5 mb-5">
              {ADVANTAGES.map((a, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/8 bg-white/5 backdrop-blur-sm">
                  {a.img ? (
                    <img src={a.img} alt="" className="w-9 h-9 rounded-xl object-cover shrink-0" />
                  ) : (
                    <span className="text-2xl w-9 text-center shrink-0">{a.icon}</span>
                  )}
                  <div>
                    <div className="font-black text-sm text-white leading-tight" style={{ fontFamily: "Oswald" }}>{a.text}</div>
                    <div className="text-white/40 text-xs mt-0.5">{a.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {WHO.map((w, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm text-center">
                  <span className="text-2xl">{w.icon}</span>
                  <p className="font-black text-xs text-white/80 leading-tight" style={{ fontFamily: "Oswald" }}>{w.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─ СЦЕНА: КОНТАКТЫ ─ */}
        {scene === "contacts" && (
          <div className="w-full max-w-sm mx-auto text-center">
            <div className="mb-6">
              <h2 className="font-black text-white leading-none mb-2"
                style={{ fontFamily: "Oswald", fontSize: "clamp(32px,9vw,60px)" }}>
                ЧЕМ ДАЛЬШЕ —<br /><span className="text-amber">ТЕМ ВЫГОДНЕЕ!</span>
              </h2>
              <p className="text-white/40 text-sm">Назовите маршрут — ответим за 2 минуты</p>
            </div>

            {/* Три главные кнопки */}
            <div className="flex flex-col gap-2.5 mb-5">
              <a href={MAX_HREF} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-[#005FF9] hover:bg-[#1a70ff] text-white font-black text-lg py-4 rounded-2xl transition active:scale-[0.97] shadow-xl shadow-[#005FF9]/25"
                style={{ fontFamily: "Oswald" }}>
                MAX — написать
              </a>
              <a href={PHONE_HREF}
                className="flex items-center justify-center gap-2 bg-amber hover:bg-amber/90 text-[#080808] font-black text-lg py-4 rounded-2xl transition active:scale-[0.97] shadow-xl shadow-amber/20"
                style={{ fontFamily: "Oswald" }}>
                <Icon name="Phone" size={22} />Позвонить
              </a>
              <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-white/5 border border-white/15 hover:bg-white/10 text-white/70 font-black text-base py-3.5 rounded-2xl transition active:scale-[0.97]"
                style={{ fontFamily: "Oswald" }}>
                <Icon name="Send" size={18} />Telegram
              </a>
              <a href={WA_HREF} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-green-600/20 border border-green-600/30 hover:bg-green-600/30 text-green-400 font-black text-base py-3.5 rounded-2xl transition active:scale-[0.97]"
                style={{ fontFamily: "Oswald" }}>
                <Icon name="MessageCircle" size={18} />WhatsApp
              </a>
            </div>

            {/* Поделиться + PWA */}
            <div className="flex gap-2">
              <button onClick={doShare}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/10 bg-white/5 text-white/50 hover:text-white hover:bg-white/10 text-sm font-bold transition"
                style={{ fontFamily: "Oswald" }}>
                <Icon name="Share2" size={16} />Поделиться
              </button>
              {pwaEvt && !pwaInstalled && (
                <button onClick={doInstall}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-amber/30 bg-amber/5 text-amber hover:bg-amber/10 text-sm font-bold transition"
                  style={{ fontFamily: "Oswald" }}>
                  <Icon name="Smartphone" size={16} />На экран
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ══ ТОЧКИ-НАВИГАЦИЯ справа ══ */}
      <nav className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-2.5">
        {SCENES.map((s, i) => (
          <button key={s}
            onClick={() => goScene(s, i > sceneIdx ? "next" : "prev")}
            className={cls(
              "rounded-full transition-all duration-300",
              scene === s ? "w-2 h-6 bg-amber shadow-lg shadow-amber/40" : "w-2 h-2 bg-white/25 hover:bg-white/50"
            )}
          />
        ))}
      </nav>

      {/* ══ СТРЕЛКИ ПЕРЕКЛЮЧЕНИЯ ══ */}
      {!isFirst && (
        <button onClick={goPrev}
          className="absolute top-16 left-1/2 -translate-x-1/2 z-30 w-10 h-10 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-white/40 hover:text-white hover:bg-black/50 transition active:scale-[0.9]">
          <Icon name="ChevronUp" size={20} />
        </button>
      )}
      {!isLast && (
        <button onClick={goNext}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-1 group">
          <span className="text-white/20 text-[9px] tracking-[0.3em] uppercase group-hover:text-white/40 transition">
            {scene === "intro" ? "тарифы" : scene.startsWith("tariff-") && sceneIdx < 3 ? "следующий" : scene.startsWith("tariff-") ? "преимущества" : "далее"}
          </span>
          <div className="w-8 h-8 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-sm border border-white/10 text-amber/60 group-hover:text-amber group-hover:bg-black/50 transition animate-bounce">
            <Icon name="ChevronDown" size={18} />
          </div>
        </button>
      )}

      {/* ══ НИЖНЯЯ МОБИЛЬНАЯ ПАНЕЛЬ ══ */}
      <div className="absolute bottom-0 inset-x-0 z-30 md:hidden border-t border-white/8 bg-black/60 backdrop-blur-xl px-3 py-2 flex gap-2">
        <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1 bg-sky-500/80 text-white font-black text-xs py-2.5 rounded-xl active:scale-[0.97] transition"
          style={{ fontFamily: "Oswald" }}>
          <Icon name="Send" size={13} />TG
        </a>
        <a href={PHONE_HREF}
          className="flex-1 flex items-center justify-center gap-1 bg-amber text-[#080808] font-black text-xs py-2.5 rounded-xl active:scale-[0.97] transition"
          style={{ fontFamily: "Oswald" }}>
          <Icon name="Phone" size={13} />Звонок
        </a>
        <a href={MAX_HREF} target="_blank" rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center bg-[#005FF9] text-white font-black text-xs py-2.5 rounded-xl active:scale-[0.97] transition"
          style={{ fontFamily: "Oswald" }}>
          MAX
        </a>
      </div>

    </div>
  );
}