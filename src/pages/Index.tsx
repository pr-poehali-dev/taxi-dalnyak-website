import { useState, useEffect, useCallback, useRef } from "react";

// ─── Константы ────────────────────────────────────────────────────────────────
const LOGO    = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/eed871f1-fcfc-4342-ba10-6d3337b98fe4.jpg";
const PHONE   = "8 (995) 645-51-25";
const PHONE_H = "tel:+79956455125";
const TG      = "https://t.me/Mezhgorod1816";
const MAX     = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";
const WA      = "https://wa.me/79956455125?text=" + encodeURIComponent("Хочу узнать стоимость поездки.");

const IMG = {
  road:    "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/635bc32c-ece1-42f9-ab56-5eacdba7faae.jpg",
  solaris: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/c4158496-7ea3-41a3-b40a-6e19deab36d1.jpg",
  camry:   "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/a426143a-e9b6-48d8-90c0-fcb20094f2cf.jpg",
  starex:  "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/12ee82fe-f1a5-441c-b40f-c4f3b720dd0a.jpg",
  mil:     "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/0b60554b-a7cd-49ba-8722-155d755fbd73.jpg",
  family:  "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/80b711b2-61c1-4760-84f3-fc8ed6875af8.jpg",
  biz:     "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/a1d87dfd-c611-4d5a-b825-8cec8e5f15d8.jpg",
};

type SceneId = "intro" | "t0" | "t1" | "t2" | "services" | "who" | "cta";
const SCENE_ORDER: SceneId[] = ["intro","t0","t1","t2","services","who","cta"];
const SCENE_BG: Record<SceneId, string> = {
  intro: IMG.road, t0: IMG.solaris, t1: IMG.camry, t2: IMG.starex,
  services: IMG.road, who: IMG.family, cta: IMG.road,
};

const TARIFFS = [
  {
    id: "t0" as SceneId, name: "СТАНДАРТ", car: "Hyundai Solaris", color: "#F0C040",
    prices: [
      { dist: "до 200 км",  rub: "35₽/км", nt: "80₽/км" },
      { dist: "до 500 км",  rub: "32₽/км", nt: "75₽/км" },
      { dist: "от 1000 км", rub: "30₽/км", nt: "70₽/км" },
    ],
  },
  {
    id: "t1" as SceneId, name: "КОМФОРТ+", car: "Toyota Camry 70", color: "#60CFFF",
    prices: [
      { dist: "до 200 км",  rub: "45₽/км", nt: "105₽/км" },
      { dist: "до 500 км",  rub: "40₽/км", nt: "100₽/км" },
      { dist: "от 1000 км", rub: "38₽/км", nt: "90₽/км"  },
    ],
  },
  {
    id: "t2" as SceneId, name: "МИНИВЭН", car: "Hyundai Starex", color: "#7EE880",
    prices: [
      { dist: "до 200 км",  rub: "60₽/км", nt: "110₽/км" },
      { dist: "до 500 км",  rub: "55₽/км", nt: "105₽/км" },
      { dist: "от 1000 км", rub: "50₽/км", nt: "100₽/км" },
    ],
  },
];

const WHO_ITEMS = [
  { img: IMG.mil,    label: "Бойцы СВО",       sub: "Личная доставка домой" },
  { img: IMG.family, label: "Семьи с детьми",   sub: "Кресло и зверята — бесплатно" },
  { img: IMG.biz,    label: "Организации",      sub: "Договор, закрывающие docs" },
];

// ─── Частицы ─────────────────────────────────────────────────────────────────
function Particles() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 2 }}>
      {Array.from({ length: 28 }).map((_, i) => (
        <div key={i} style={{
          position: "absolute",
          width: i % 3 === 0 ? 3 : 1.5,
          height: i % 3 === 0 ? 3 : 1.5,
          borderRadius: "50%",
          background: i % 4 === 0 ? "#F0C040" : "rgba(255,255,255,0.5)",
          left: `${(i * 37 + 7) % 100}%`,
          top: `${(i * 53 + 11) % 100}%`,
          animation: `pFloat ${3 + (i % 5)}s ease-in-out infinite alternate`,
          animationDelay: `${(i * 0.3) % 4}s`,
          boxShadow: i % 4 === 0 ? "0 0 6px #F0C040" : "none",
        }} />
      ))}
    </div>
  );
}

// ─── Компонент ────────────────────────────────────────────────────────────────
export default function Index() {
  const [splash, setSplash]           = useState(true);
  const [splashOut, setSplashOut]     = useState(false);
  const [scene, setScene]             = useState<SceneId>("intro");
  const [leaving, setLeaving]         = useState(false);
  const [dir, setDir]                 = useState<1|-1>(1);
  const [pwaEvt, setPwaEvt]           = useState<Event|null>(null);
  const [pwaInstalled, setPwaInstall] = useState(false);
  const [whoIdx, setWhoIdx]           = useState(0);
  const transitioning                 = useRef(false);
  const autoTimer                     = useRef<ReturnType<typeof setTimeout>|null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setSplashOut(true), 2000);
    const t2 = setTimeout(() => setSplash(false), 2800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setPwaEvt(e); };
    window.addEventListener("beforeinstallprompt", h);
    window.addEventListener("appinstalled", () => setPwaInstall(true));
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  const goScene = useCallback((next: SceneId, direction: 1|-1 = 1) => {
    if (transitioning.current) return;
    transitioning.current = true;
    setDir(direction);
    setLeaving(true);
    setTimeout(() => {
      setScene(next);
      setLeaving(false);
      transitioning.current = false;
    }, 420);
  }, []);

  const goNext = useCallback(() => {
    const i = SCENE_ORDER.indexOf(scene);
    if (i < SCENE_ORDER.length - 1) goScene(SCENE_ORDER[i + 1], 1);
  }, [scene, goScene]);

  const goPrev = useCallback(() => {
    const i = SCENE_ORDER.indexOf(scene);
    if (i > 0) goScene(SCENE_ORDER[i - 1], -1);
  }, [scene, goScene]);

  useEffect(() => {
    if (splash) return;
    if (autoTimer.current) clearTimeout(autoTimer.current);
    autoTimer.current = setTimeout(() => {
      const i = SCENE_ORDER.indexOf(scene);
      if (i < SCENE_ORDER.length - 1) goScene(SCENE_ORDER[i + 1], 1);
    }, 6500);
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  }, [scene, splash, goScene]);

  useEffect(() => {
    let sy = 0;
    const onTS = (e: TouchEvent) => { sy = e.touches[0].clientY; };
    const onTE = (e: TouchEvent) => {
      const dy = sy - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 55) { if (dy > 0) goNext(); else goPrev(); }
    };
    const onW = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 25) goNext(); else if (e.deltaY < -25) goPrev();
    };
    const onK = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === "ArrowRight") goNext();
      if (e.key === "ArrowUp"   || e.key === "ArrowLeft")  goPrev();
    };
    window.addEventListener("touchstart", onTS, { passive: true });
    window.addEventListener("touchend",   onTE, { passive: true });
    window.addEventListener("wheel",      onW,  { passive: false });
    window.addEventListener("keydown",    onK);
    return () => {
      window.removeEventListener("touchstart", onTS);
      window.removeEventListener("touchend",   onTE);
      window.removeEventListener("wheel",      onW);
      window.removeEventListener("keydown",    onK);
    };
  }, [goNext, goPrev]);

  useEffect(() => {
    if (scene !== "who") return;
    const t = setInterval(() => setWhoIdx(w => (w + 1) % WHO_ITEMS.length), 3200);
    return () => clearInterval(t);
  }, [scene]);

  const doInstall = async () => {
    if (!pwaEvt) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pwaEvt as any).prompt();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { outcome } = await (pwaEvt as any).userChoice;
    if (outcome === "accepted") setPwaInstall(true);
    setPwaEvt(null);
  };

  const doShare = () => {
    if (navigator.share) navigator.share({ title: "Такси Дальняк", text: "Межгородное такси. Чем дальше — тем выгоднее!", url: window.location.href });
    else navigator.clipboard.writeText(window.location.href).then(() => alert("Ссылка скопирована!"));
  };

  const sceneIdx = SCENE_ORDER.indexOf(scene);
  const isFirst  = sceneIdx === 0;
  const isLast   = sceneIdx === SCENE_ORDER.length - 1;
  const bg       = SCENE_BG[scene];
  const tariff   = TARIFFS.find(t => t.id === scene) ?? null;

  const slideStyle: React.CSSProperties = {
    transition: "opacity 0.42s cubic-bezier(.4,0,.2,1), transform 0.42s cubic-bezier(.4,0,.2,1)",
    opacity: leaving ? 0 : 1,
    transform: leaving
      ? `translateY(${dir > 0 ? "-7%" : "7%"}) scale(0.96)`
      : "translateY(0) scale(1)",
  };

  const F = "'Oswald', sans-serif";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; overflow: hidden; background: #000; }

        @keyframes pFloat {
          from { transform: translateY(0) scale(1); opacity: .5; }
          to   { transform: translateY(-20px) scale(1.4); opacity: 1; }
        }
        @keyframes pulseRing {
          0%   { box-shadow: 0 0 0 0 rgba(240,192,64,.55); }
          70%  { box-shadow: 0 0 0 14px rgba(240,192,64,0); }
          100% { box-shadow: 0 0 0 0 rgba(240,192,64,0); }
        }
        @keyframes pulseBlue {
          0%   { box-shadow: 0 0 0 0 rgba(0,95,249,.55); }
          70%  { box-shadow: 0 0 0 14px rgba(0,95,249,0); }
          100% { box-shadow: 0 0 0 0 rgba(0,95,249,0); }
        }
        @keyframes goldFlicker {
          0%,100% { color: #F0C040; text-shadow: 0 0 16px #F0C040, 0 0 32px #F0C04080; }
          48%     { color: #fff;    text-shadow: none; }
          52%     { color: #fff;    text-shadow: none; }
        }
        @keyframes scanMove {
          from { background-position: 0 0; }
          to   { background-position: 0 100vh; }
        }
        @keyframes carIn {
          from { transform: translateX(-60px) scale(.94); opacity: 0; filter: brightness(.2); }
          to   { transform: translateX(0) scale(1); opacity: 1; filter: brightness(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes zoomReveal {
          from { opacity: 0; transform: scale(.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes explode {
          0%   { opacity: 0; transform: scale(.4); }
          65%  { transform: scale(1.06); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes bobble {
          from { transform: translateY(0); }
          to   { transform: translateY(-8px); }
        }
        @keyframes bgZoom {
          from { transform: scale(1.0); }
          to   { transform: scale(1.07); }
        }
        @keyframes glitch1 {
          0%,94%,100% { clip-path: inset(0 0 100% 0); transform: none; }
          95% { clip-path: inset(15% 0 50% 0); transform: translateX(-5px); color: #f05; }
          97% { clip-path: inset(55% 0 10% 0); transform: translateX(5px); color: #0ff; }
          99% { clip-path: inset(0 0 0 0); transform: none; color: inherit; }
        }
        .scene-content { animation: fadeUp .5s ease forwards; }
        .car-in        { animation: carIn .85s cubic-bezier(.2,.8,.3,1) forwards; }
        .zoom-reveal   { animation: zoomReveal .5s ease forwards; }
        .explode-in    { animation: explode .7s ease forwards; }
        .progress-fill { transition: width 6.5s linear; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, fontFamily: F, overflow: "hidden", background: "#000" }}>

        {/* ─── ЗАСТАВКА ─── */}
        {splash && (
          <div style={{
            position: "fixed", inset: 0, zIndex: 300,
            background: "linear-gradient(135deg, #0a0a0a 0%, #111 100%)",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            transition: "opacity .8s ease, transform .8s ease",
            opacity: splashOut ? 0 : 1,
            transform: splashOut ? "scale(1.1)" : "scale(1)",
            pointerEvents: splashOut ? "none" : "all",
          }}>
            <div style={{ position: "relative", marginBottom: 24 }}>
              <img src={LOGO} alt="" style={{
                width: 100, height: 100, borderRadius: 24,
                objectFit: "cover",
                boxShadow: "0 0 50px rgba(240,192,64,.45), 0 20px 40px rgba(0,0,0,.5)",
              }} />
              <div style={{
                position: "absolute", inset: -8, borderRadius: 32,
                border: "2px solid rgba(240,192,64,.35)",
                animation: "pulseRing 1.6s infinite",
              }} />
            </div>
            <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: "0.32em", color: "#fff", textShadow: "0 0 20px rgba(255,255,255,.2)" }}>
              ДАЛЬНЯК
            </div>
            <div style={{ fontSize: 11, letterSpacing: "0.55em", color: "rgba(255,255,255,.3)", marginTop: 6, textTransform: "uppercase" }}>
              Межгородное такси
            </div>
            <div style={{ marginTop: 36, display: "flex", gap: 10, alignItems: "flex-end" }}>
              {[0,1,2,3].map(i => (
                <div key={i} style={{
                  width: 3, height: 20 + i * 6, borderRadius: 2,
                  background: "#F0C040",
                  animation: `pFloat ${.8 + i * .15}s ease-in-out infinite alternate`,
                  animationDelay: `${i * .12}s`,
                  boxShadow: "0 0 8px #F0C040",
                }} />
              ))}
            </div>
            {/* прогресс */}
            <div style={{ marginTop: 32, width: 160, height: 2, background: "rgba(255,255,255,.08)", borderRadius: 2, overflow: "hidden" }}>
              <div className="progress-fill" style={{
                height: "100%", background: "linear-gradient(90deg, #F0C040, #fff)",
                width: splashOut ? "100%" : "0%",
                transitionDuration: "2s",
              }} />
            </div>
          </div>
        )}

        {/* ─── ФОН ─── */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img key={bg} src={bg} alt="" style={{
            width: "100%", height: "100%", objectFit: "cover",
            animation: "bgZoom 7s ease-in-out infinite alternate",
          }} />
          {/* Многослойный оверлей */}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,.65) 0%, rgba(0,0,0,.2) 45%, rgba(0,0,0,.8) 100%)" }} />
          {/* Цветной акцент для тарифа */}
          {tariff && (
            <div style={{
              position: "absolute", inset: 0,
              background: `radial-gradient(ellipse at 50% 60%, ${tariff.color}12 0%, transparent 65%)`,
              transition: "all .7s",
            }} />
          )}
          {/* Сканлайн */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none",
            backgroundImage: "repeating-linear-gradient(transparent, transparent 3px, rgba(0,0,0,.018) 3px, rgba(0,0,0,.018) 4px)",
            animation: "scanMove 12s linear infinite",
          }} />
          {/* Кино-рамки */}
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 36, background: "#000" }} />
          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 36, background: "#000" }} />
        </div>

        {/* ─── ЧАСТИЦЫ ─── */}
        <Particles />

        {/* ─── ШАПКА ─── */}
        <header style={{
          position: "absolute", top: 36, left: 0, right: 0, zIndex: 100,
          padding: "5px 10px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6,
          background: "rgba(0,0,0,.5)", backdropFilter: "blur(14px)",
          borderBottom: "1px solid rgba(255,255,255,.07)",
        }}>
          <a href={TG} target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", gap: 6,
            color: "#38BDF8", textDecoration: "none", fontWeight: 700, fontSize: 13,
            border: "1px solid rgba(56,189,248,.3)", borderRadius: 12, padding: "6px 10px",
            background: "rgba(56,189,248,.08)",
            animation: "pulseRing 2.5s infinite",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.24 14.748l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.576.838z"/></svg>
            Telegram
          </a>

          <a href={PHONE_H} style={{
            color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 13,
            display: "flex", alignItems: "center", gap: 5,
            textShadow: "0 0 14px rgba(255,255,255,.35)",
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F0C040" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.95a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            {PHONE}
          </a>

          <a href={MAX} target="_blank" rel="noopener noreferrer" style={{
            color: "#fff", textDecoration: "none", fontWeight: 700, fontSize: 13,
            background: "#005FF9", borderRadius: 12, padding: "6px 12px",
            boxShadow: "0 0 16px rgba(0,95,249,.4)",
          }}>MAX</a>
        </header>

        {/* ─── СЦЕНА ─── */}
        <div style={{
          position: "absolute", zIndex: 10,
          top: 80, bottom: 48, left: 0, right: 0,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 14px",
          overflowY: "auto",
          ...slideStyle,
        }}>

          {/* ═══ INTRO ═══ */}
          {scene === "intro" && (
            <div className="scene-content" style={{ textAlign: "center", maxWidth: 400, width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginBottom: 14 }}>
                <img src={LOGO} alt="" style={{ width: 44, height: 44, borderRadius: 12, objectFit: "cover", boxShadow: "0 0 20px rgba(240,192,64,.3)" }} />
                <span style={{ fontSize: 20, fontWeight: 700, letterSpacing: "0.28em", color: "#fff" }}>ДАЛЬНЯК</span>
              </div>
              <h1 style={{
                fontSize: "clamp(48px,14vw,100px)", fontWeight: 700, lineHeight: .9,
                color: "#fff", marginBottom: 10,
                textShadow: "0 4px 30px rgba(0,0,0,.5)",
              }}>
                ТАКСИ<br />
                <span style={{ color: "#F0C040", animation: "goldFlicker 2.8s infinite", display: "inline-block", textShadow: "0 0 20px #F0C040, 0 0 40px #F0C04060" }}>
                  МЕЖГОРОД
                </span>
              </h1>
              <p style={{ color: "rgba(255,255,255,.45)", fontSize: 13, marginBottom: 18, letterSpacing: ".04em" }}>
                От 200 км · Вся Россия · Новые территории
              </p>
              <div style={{
                display: "inline-block", border: "1px solid rgba(240,192,64,.45)", borderRadius: 40,
                padding: "8px 22px", marginBottom: 22,
                color: "#F0C040", fontWeight: 700, fontSize: 13, letterSpacing: ".1em",
                background: "rgba(240,192,64,.06)",
                textTransform: "uppercase",
              }}>
                Чем дальше — тем выгоднее!
              </div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <a href={MAX} target="_blank" rel="noopener noreferrer" style={{
                  background: "#005FF9", color: "#fff", textDecoration: "none",
                  fontWeight: 700, fontSize: 15, padding: "13px 26px", borderRadius: 18,
                  boxShadow: "0 0 24px rgba(0,95,249,.45)",
                  animation: "pulseBlue 2s infinite",
                }}>Узнать стоимость</a>
                <a href={PHONE_H} style={{
                  border: "2px solid rgba(240,192,64,.6)", color: "#F0C040",
                  textDecoration: "none", fontWeight: 700, fontSize: 15,
                  padding: "12px 22px", borderRadius: 18,
                  display: "flex", alignItems: "center", gap: 6,
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.95a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Звонок
                </a>
              </div>
            </div>
          )}

          {/* ═══ ТАРИФ ═══ */}
          {tariff && (
            <div style={{ width: "100%", maxWidth: 420 }}>
              <div className="scene-content" style={{ textAlign: "center", marginBottom: 10 }}>
                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".4em", textTransform: "uppercase", color: tariff.color, opacity: .75 }}>тариф</span>
                <h2 style={{
                  fontSize: "clamp(40px,12vw,72px)", fontWeight: 700, lineHeight: .92,
                  color: tariff.color,
                  textShadow: `0 0 18px ${tariff.color}90, 0 0 40px ${tariff.color}40`,
                  animation: "goldFlicker 3.5s infinite",
                }}>{tariff.name}</h2>
                <p style={{ color: "rgba(255,255,255,.38)", fontSize: 12, marginTop: 3 }}>{tariff.car}</p>
              </div>

              <div className="car-in" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 7, marginBottom: 10 }}>
                {tariff.prices.map((p, i) => (
                  <div key={i} style={{
                    padding: "12px 6px", borderRadius: 16, textAlign: "center",
                    background: "rgba(0,0,0,.55)", backdropFilter: "blur(14px)",
                    border: `1px solid ${tariff.color}30`,
                    animationDelay: `${i * .1}s`,
                  }}>
                    <div style={{
                      fontSize: 19, fontWeight: 700, color: tariff.color,
                      textShadow: `0 0 10px ${tariff.color}80`,
                      animation: i === 2 ? "goldFlicker 1.8s infinite" : "none",
                    }}>{p.rub}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,.28)", marginTop: 3, lineHeight: 1.3 }}>{p.dist}</div>
                    {i === 2 && <div style={{ fontSize: 8, color: tariff.color, marginTop: 3, fontWeight: 600, letterSpacing: ".05em" }}>ВЫГОДНЕЕ!</div>}
                  </div>
                ))}
              </div>

              <div style={{ textAlign: "center", marginBottom: 8 }}>
                <span style={{ color: "#F0C040", fontSize: 11, fontWeight: 700, letterSpacing: ".08em", textTransform: "uppercase" }}>
                  ↓ Чем дальше — тем выгоднее!
                </span>
              </div>

              <div style={{
                display: "flex", gap: 10, alignItems: "center",
                padding: "9px 13px", borderRadius: 13,
                background: "rgba(180,0,0,.22)", border: "1px solid rgba(255,80,80,.22)",
                backdropFilter: "blur(10px)", marginBottom: 10,
              }}>
                <span style={{ fontSize: 16 }}>🗺️</span>
                <div>
                  <div style={{ fontSize: 8, color: "#ff8888", fontWeight: 600, letterSpacing: ".2em", textTransform: "uppercase" }}>Новые территории</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>от {tariff.prices[0].nt} · ДНР, ЛНР, Запорожье</div>
                </div>
              </div>

              <a href={MAX} target="_blank" rel="noopener noreferrer" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                background: "#005FF9", color: "#fff", textDecoration: "none",
                fontWeight: 700, fontSize: 15, padding: "14px", borderRadius: 20,
                boxShadow: "0 0 26px rgba(0,95,249,.35)", width: "100%",
              }}>Узнать точную стоимость</a>
            </div>
          )}

          {/* ═══ УСЛУГИ ═══ */}
          {scene === "services" && (
            <div className="scene-content" style={{ width: "100%", maxWidth: 420 }}>
              <div style={{ textAlign: "center", marginBottom: 16 }}>
                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".4em", textTransform: "uppercase", color: "rgba(240,192,64,.7)" }}>наши преимущества</span>
                <h2 style={{ fontSize: "clamp(32px,10vw,56px)", fontWeight: 700, color: "#fff", lineHeight: .92 }}>ПОЧЕМУ МЫ</h2>
              </div>
              {[
                { icon: "⚡", t: "Подача от 30 минут",       s: "кроме Москвы и СПб" },
                { icon: "📋", t: "Предзаказ без предоплаты", s: "точно ко времени" },
                { icon: "🔄", t: "Ожидание бесплатно",       s: "туда-обратно в один день" },
                { icon: "🪑", t: "Детское кресло",            s: "бесплатно" },
                { icon: "🐾", t: "Животные",                  s: "без доплаты" },
              ].map((a, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 13,
                  padding: "10px 14px", borderRadius: 16, marginBottom: 7,
                  background: "rgba(0,0,0,.5)", backdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,.08)",
                  animation: `fadeUp .5s ease ${i * .07}s forwards`,
                  opacity: 0,
                }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>{a.t}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,.38)", marginTop: 1 }}>{a.s}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ КОГО ВОЗИМ ═══ */}
          {scene === "who" && (
            <div className="scene-content" style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
              <div style={{ marginBottom: 14 }}>
                <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: ".4em", textTransform: "uppercase", color: "rgba(240,192,64,.7)" }}>пассажиры</span>
                <h2 style={{ fontSize: "clamp(30px,9vw,52px)", fontWeight: 700, color: "#fff", lineHeight: .92 }}>КОГО МЫ<br />ВОЗИМ</h2>
              </div>
              <div style={{ position: "relative", borderRadius: 22, overflow: "hidden", marginBottom: 12, height: 200 }}>
                <img key={whoIdx} src={WHO_ITEMS[whoIdx].img} alt="" className="zoom-reveal"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.85) 0%, transparent 55%)" }} />
                <div style={{ position: "absolute", bottom: 14, left: 0, right: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 20, color: "#fff" }}>{WHO_ITEMS[whoIdx].label}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,.45)", marginTop: 2 }}>{WHO_ITEMS[whoIdx].sub}</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 16 }}>
                {WHO_ITEMS.map((_, i) => (
                  <button key={i} onClick={() => setWhoIdx(i)} style={{
                    width: whoIdx === i ? 26 : 8, height: 8, borderRadius: 4,
                    background: whoIdx === i ? "#F0C040" : "rgba(255,255,255,.22)",
                    border: "none", cursor: "pointer", transition: "all .3s",
                    boxShadow: whoIdx === i ? "0 0 8px #F0C040" : "none",
                  }} />
                ))}
              </div>
              <a href={MAX} target="_blank" rel="noopener noreferrer" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#005FF9", color: "#fff", textDecoration: "none",
                fontWeight: 700, fontSize: 15, padding: "13px 30px", borderRadius: 18,
                boxShadow: "0 0 22px rgba(0,95,249,.35)",
              }}>Заказать поездку</a>
            </div>
          )}

          {/* ═══ CTA ═══ */}
          {scene === "cta" && (
            <div className="explode-in" style={{ width: "100%", maxWidth: 420, textAlign: "center" }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{
                  width: 70, height: 70, borderRadius: "50%", margin: "0 auto 14px",
                  background: "radial-gradient(circle, #F0C040 0%, rgba(240,192,64,0) 70%)",
                  boxShadow: "0 0 50px rgba(240,192,64,.7), 0 0 100px rgba(240,192,64,.3)",
                  animation: "pulseRing 1.5s infinite",
                }} />
                <h2 style={{ fontSize: "clamp(26px,8vw,50px)", fontWeight: 700, color: "#fff", lineHeight: 1.05 }}>
                  ЧЕМ ДАЛЬШЕ —<br />
                  <span style={{ color: "#F0C040", textShadow: "0 0 20px #F0C040, 0 0 40px #F0C04060" }}>ТЕМ ВЫГОДНЕЕ!</span>
                </h2>
                <p style={{ color: "rgba(255,255,255,.38)", fontSize: 12, marginTop: 6 }}>Назовите маршрут — ответим за 2 минуты</p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 12 }}>
                <a href={MAX} target="_blank" rel="noopener noreferrer" style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "#005FF9", color: "#fff", textDecoration: "none",
                  fontWeight: 700, fontSize: 18, padding: "15px", borderRadius: 22,
                  boxShadow: "0 0 30px rgba(0,95,249,.45)",
                  animation: "pulseBlue 2s infinite",
                }}>MAX — написать</a>
                <a href={PHONE_H} style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: "#F0C040", color: "#000", textDecoration: "none",
                  fontWeight: 700, fontSize: 18, padding: "15px", borderRadius: 22,
                  boxShadow: "0 0 28px rgba(240,192,64,.4)",
                  animation: "pulseRing 2s infinite",
                  animationDelay: ".4s",
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.95a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  Позвонить
                </a>
                <a href={TG} target="_blank" rel="noopener noreferrer" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: "rgba(56,189,248,.12)", border: "1px solid rgba(56,189,248,.3)",
                  color: "#38BDF8", textDecoration: "none", fontWeight: 700, fontSize: 16,
                  padding: "12px", borderRadius: 18,
                }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.24 14.748l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.576.838z"/></svg>
                  Telegram
                </a>
                <a href={WA} target="_blank" rel="noopener noreferrer" style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  background: "rgba(34,197,94,.12)", border: "1px solid rgba(34,197,94,.28)",
                  color: "#22C55E", textDecoration: "none", fontWeight: 700, fontSize: 16,
                  padding: "12px", borderRadius: 18,
                }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/></svg>
                  WhatsApp
                </a>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={doShare} style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)",
                  color: "rgba(255,255,255,.55)", fontFamily: F,
                  fontWeight: 700, fontSize: 12, padding: "10px", borderRadius: 14, cursor: "pointer",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                  Поделиться
                </button>
                {pwaEvt && !pwaInstalled && (
                  <button onClick={doInstall} style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    background: "rgba(240,192,64,.08)", border: "1px solid rgba(240,192,64,.28)",
                    color: "#F0C040", fontFamily: F,
                    fontWeight: 700, fontSize: 12, padding: "10px", borderRadius: 14, cursor: "pointer",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                    На экран
                  </button>
                )}
              </div>
            </div>
          )}

        </div>

        {/* ─── ТОЧКИ-НАВ справа ─── */}
        <nav style={{
          position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
          zIndex: 50, display: "flex", flexDirection: "column", gap: 9,
        }}>
          {SCENE_ORDER.map((s, i) => (
            <button key={s} onClick={() => goScene(s, i > sceneIdx ? 1 : -1)} style={{
              width: 8, height: scene === s ? 28 : 8, borderRadius: 4,
              background: scene === s ? "#F0C040" : "rgba(255,255,255,.22)",
              border: "none", cursor: "pointer", transition: "all .3s",
              boxShadow: scene === s ? "0 0 10px #F0C040" : "none",
              padding: 0,
            }} />
          ))}
        </nav>

        {/* ─── КНОПКА НАЗАД ─── */}
        {!isFirst && (
          <button onClick={goPrev} style={{
            position: "absolute", top: 88, left: "50%", transform: "translateX(-50%)",
            zIndex: 50, width: 38, height: 38, borderRadius: "50%",
            background: "rgba(0,0,0,.45)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(255,255,255,.1)", color: "rgba(255,255,255,.4)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
          </button>
        )}

        {/* ─── КНОПКА ВПЕРЁД ─── */}
        {!isLast && (
          <button onClick={goNext} style={{
            position: "absolute", bottom: 55, left: "50%", transform: "translateX(-50%)",
            zIndex: 50, background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
          }}>
            <span style={{ color: "rgba(255,255,255,.18)", fontSize: 8, letterSpacing: ".3em", textTransform: "uppercase", fontFamily: F }}>
              далее
            </span>
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "rgba(0,0,0,.45)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(240,192,64,.28)",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#F0C040", animation: "bobble 1.4s ease-in-out infinite alternate",
            }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </button>
        )}

        {/* ─── ПРОГРЕСС АВТО-ПЕРЕХОДА ─── */}
        <div style={{ position: "absolute", bottom: 36, left: 0, right: 0, height: 2, background: "rgba(255,255,255,.06)", zIndex: 30 }}>
          <div key={`${scene}-prog`} className="progress-fill" style={{
            height: "100%",
            background: "linear-gradient(90deg, #F0C040, rgba(240,192,64,.4))",
            width: isLast ? "0%" : "100%",
            transitionDuration: isLast ? "0s" : "6.5s",
          }} />
        </div>

        {/* ─── МОБИЛЬНАЯ ПАНЕЛЬ ─── */}
        <div style={{
          position: "absolute", bottom: 36, left: 0, right: 0,
          zIndex: 40, padding: "5px 8px",
          display: "flex", gap: 7,
          background: "rgba(0,0,0,.65)", backdropFilter: "blur(14px)",
          borderTop: "1px solid rgba(255,255,255,.05)",
        }}>
          <a href={TG} target="_blank" rel="noopener noreferrer" style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            background: "rgba(56,189,248,.75)", color: "#fff", textDecoration: "none",
            fontWeight: 700, fontSize: 12, padding: "9px 2px", borderRadius: 13,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.248-1.97 9.289c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.24 14.748l-2.96-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.576.838z"/></svg>
            TG
          </a>
          <a href={PHONE_H} style={{
            flex: 1.8, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
            background: "#F0C040", color: "#000", textDecoration: "none",
            fontWeight: 700, fontSize: 12, padding: "9px 2px", borderRadius: 13,
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.42 2 2 0 0 1 3.6 1.24h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.95a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Звонок
          </a>
          <a href={MAX} target="_blank" rel="noopener noreferrer" style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
            background: "#005FF9", color: "#fff", textDecoration: "none",
            fontWeight: 700, fontSize: 12, padding: "9px 2px", borderRadius: 13,
            boxShadow: "0 0 12px rgba(0,95,249,.4)",
          }}>MAX</a>
        </div>

      </div>
    </>
  );
}
