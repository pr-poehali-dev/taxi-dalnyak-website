import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { DEFAULT_CONTACTS, type Contacts } from "@/lib/contacts";
import PriceGuide from "@/components/PriceGuide";
import { BASE_REVIEWS } from "@/lib/promoReviews";

const HERO_WIDE = "/hero-promo-wide.jpg";
const LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/3a499542-747a-49d2-808e-4c137548c76e.jpg";
const MAX_LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/cf5e3e58-7d83-4d19-8c48-f91922395adf.png";

const YM_ID = 111028538;
const GOLD = "#c9a84c";
const GOLD2 = "#e8c96a";

declare global {
  interface Window { ym?: (id: number, action: string, goal: string, params?: Record<string, unknown>) => void; }
}

function ymGoal(goal: string, params: Record<string, string> = {}) {
  if (typeof window.ym === "function") window.ym(YM_ID, "reachGoal", goal, params);
}
function tmrGoal(goal: string) {
  const tmr = (window as unknown as { _tmr?: { push: (o: Record<string, unknown>) => void } })._tmr;
  if (tmr) tmr.push({ id: "3789002", type: "reachGoal", goal });
}

const BENEFITS = [
  { icon: "Route",       title: "Поездки",            sub: "от 200 км" },
  { icon: "Clock",       title: "В удобное",          sub: "для вас время" },
  { icon: "Armchair",    title: "Комфортные",         sub: "автомобили" },
  { icon: "ShieldCheck", title: "Без пересадок",      sub: "и лишних ожиданий" },
];

const SIGN_ROUTES = [
  { city: "Воронеж", km: 520 },
  { city: "Курск", km: 530 },
  { city: "Санкт-Петербург", km: 710 },
  { city: "Ростов-на-Дону", km: 1080 },
];

const PRICE_ROUTES = [
  { route: "Москва – Воронеж", from: 16200 },
  { route: "Москва – Курск", from: 15900 },
  { route: "Москва – Санкт-Петербург", from: 21900 },
  { route: "Москва – Ростов-на-Дону", from: 34200 },
];

export default function Promo({
  contacts = DEFAULT_CONTACTS,
  source = "promo",
}: { contacts?: Contacts; source?: string } = {}) {
  const { PHONE, PHONE_HREF, VK_HREF, TG_HREF, MAX_HREF } = contacts;
  const [utm, setUtm] = useState({ source: "direct", medium: "none", campaign: "none", term: "", content: "none" });

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setUtm({
      source: p.get("utm_source") || "direct",
      medium: p.get("utm_medium") || "none",
      campaign: p.get("utm_campaign") || "none",
      term: p.get("utm_term") || p.get("keyword") || "",
      content: p.get("utm_content") || "none",
    });
  }, []);

  useEffect(() => {
    document.title = "Межгородное такси от адреса до адреса — Такси Дальняк";
    const setMeta = (sel: string, attr: string, val: string) => {
      let el = document.querySelector(sel) as HTMLElement | null;
      if (!el) {
        const tag = sel.startsWith("link") ? "link" : "meta";
        el = document.createElement(tag);
        const m = sel.match(/\[(name|property)="([^"]+)"\]/);
        if (m && tag === "meta") el.setAttribute(m[1], m[2]);
        if (tag === "link") el.setAttribute("rel", "canonical");
        document.head.appendChild(el);
      }
      el.setAttribute(attr, val);
    };
    setMeta('meta[name="description"]', "content", "Межгородное такси от адреса до адреса. Поездки от 200 км по всей России, комфортные авто, без пересадок. Фиксированная цена до выезда.");
    setMeta('link[rel="canonical"]', "href", "https://taxidalnyack.ru/promo");
  }, []);

  const lead = (channel: string) => {
    ymGoal("lead", { channel, utm_source: utm.source, utm_medium: utm.medium, utm_campaign: utm.campaign, utm_term: utm.term });
    ymGoal(`lead_${channel}`, { utm_source: utm.source, utm_campaign: utm.campaign });
    ymGoal(`lead_${source}`);
    tmrGoal("lead");
    tmrGoal(`lead_${channel}`);
  };

  const withUtm = (base: string, content: string) => {
    const u = new URL(base);
    u.searchParams.set("utm_source", utm.source);
    u.searchParams.set("utm_medium", utm.medium);
    u.searchParams.set("utm_campaign", utm.campaign);
    u.searchParams.set("utm_content", content);
    return u.toString();
  };

  const vkHref = useMemo(() => withUtm(VK_HREF, "vk_button"), [utm, VK_HREF]);
  const maxHref = useMemo(() => withUtm(MAX_HREF, "max_button"), [utm, MAX_HREF]);

  return (
    <div className="min-h-[100dvh] w-full text-white flex flex-col" style={{ background: "#070b14", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @keyframes ctaPulse{0%,100%{box-shadow:0 4px 24px rgba(201,168,76,0.45),0 0 0 0 rgba(201,168,76,0.25)}50%{box-shadow:0 4px 24px rgba(201,168,76,0.7),0 0 0 12px rgba(201,168,76,0)}}
        .cta-gold{animation:ctaPulse 2.6s ease-out infinite}
      `}</style>

      {/* ШАПКА */}
      <header style={{ background: "rgba(7,11,20,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(201,168,76,0.12)", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src={LOGO} alt="Такси Дальняк" className="w-9 h-9 rounded-xl object-cover" style={{ border: "1.5px solid rgba(201,168,76,0.5)" }} />
            <div>
              <div style={{ fontFamily: "Oswald", color: GOLD, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.4em", fontWeight: 700, lineHeight: 1 }}>Такси</div>
              <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: 17, textTransform: "uppercase", fontWeight: 900, lineHeight: 1, marginTop: 1 }}>Дальняк</div>
            </div>
          </a>
          <a href={PHONE_HREF} onClick={() => lead("phone")}
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
            <Icon name="Phone" size={13} style={{ color: "#0a0f1e" }} />
            <span className="hidden sm:inline" style={{ fontFamily: "Oswald", color: "#0a0f1e", fontSize: 13, fontWeight: 800, textTransform: "uppercase" }}>{PHONE}</span>
            <span className="sm:hidden" style={{ fontFamily: "Oswald", color: "#0a0f1e", fontSize: 12, fontWeight: 800, textTransform: "uppercase" }}>Звонок</span>
          </a>
        </div>
      </header>

      {/* HERO — ФОТО ФОНОМ, ТЕКСТ ПОВЕРХ */}
      <section className="relative overflow-hidden">
        <img src={HERO_WIDE} alt="Межгородное такси от адреса до адреса" {...{ fetchpriority: "high" }}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "58% 42%" }} />
        {/* затемнение: плотное только под текстом слева, машина справа остаётся светлой */}
        <div className="absolute inset-0" style={{ background: "linear-gradient(105deg,rgba(7,11,20,0.93) 0%,rgba(7,11,20,0.8) 30%,rgba(7,11,20,0.3) 58%,transparent 88%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top,#070b14 0%,rgba(7,11,20,0.4) 16%,transparent 42%)" }} />

        <div className="relative max-w-5xl mx-auto px-4 pt-8 pb-6">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-5"
            style={{ background: "rgba(201,168,76,0.14)", border: "1px solid rgba(201,168,76,0.35)", backdropFilter: "blur(6px)" }}>
            <Icon name="MapPin" size={12} style={{ color: GOLD2 }} />
            <span style={{ color: GOLD2, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em" }}>Дорога без лишних хлопот</span>
          </div>

          <h1 className="max-w-2xl" style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: "clamp(32px,9vw,68px)", lineHeight: 0.92, textTransform: "uppercase", color: "#fff", letterSpacing: "-0.015em", textShadow: "0 4px 30px rgba(0,0,0,0.85)" }}>
            Межгородное
          </h1>
          <div className="inline-block rounded-xl px-3.5 py-1 my-2"
            style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow: "0 8px 32px rgba(201,168,76,0.45)" }}>
            <span style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: "clamp(32px,9vw,68px)", lineHeight: 1.05, textTransform: "uppercase", color: "#0a0f1e", display: "block" }}>Такси</span>
          </div>
          <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: "clamp(18px,5vw,34px)", fontWeight: 500, textShadow: "0 2px 18px rgba(0,0,0,0.9)" }}>
            от адреса до адреса
          </div>

          {/* ДОРОЖНЫЙ УКАЗАТЕЛЬ — как на трассе */}
          <div className="mt-6 rounded-xl overflow-hidden max-w-[280px]"
            style={{ background: "linear-gradient(180deg,#12539b,#0d3f78)", border: "2px solid rgba(255,255,255,0.85)", boxShadow: "0 12px 40px rgba(0,0,0,0.6)" }}>
            {SIGN_ROUTES.map((s, i) => (
              <div key={s.city} className="flex items-center gap-2.5 px-3 py-1.5"
                style={{ borderTop: i === 0 ? "none" : "1px solid rgba(255,255,255,0.22)" }}>
                <Icon name="ArrowUp" size={14} style={{ color: "#fff" }} className="shrink-0" />
                <span className="flex-1" style={{ color: "#fff", fontSize: 13, fontWeight: 600, letterSpacing: "0.02em" }}>{s.city}</span>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 700, fontFamily: "Oswald" }}>{s.km}</span>
              </div>
            ))}
          </div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10.5, marginTop: 7 }}>
            Расстояние от Москвы, км · возим по всей России
          </div>

          {/* ЦИФРЫ */}
          <div className="grid grid-cols-3 gap-2 max-w-xs mt-6">
            {[{ v: "12+", l: "лет на рынке" }, { v: "50к+", l: "поездок" }, { v: "4.8★", l: "рейтинг" }].map(s => (
              <div key={s.v} className="rounded-xl py-2 px-2 text-center"
                style={{ background: "rgba(7,11,20,0.7)", backdropFilter: "blur(8px)", border: "1px solid rgba(201,168,76,0.25)" }}>
                <div style={{ fontFamily: "Oswald", color: GOLD2, fontSize: 17, fontWeight: 900, lineHeight: 1 }}>{s.v}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 9, marginTop: 2 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ШАШЕЧНАЯ ЛЕНТА */}
      <div style={{ height: 12, background: `repeating-linear-gradient(90deg,${GOLD} 0 14px,#0a0f1e 14px 28px)`, opacity: 0.85 }} />

      {/* ПРЕИМУЩЕСТВА */}
      <section className="px-4 pt-6 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-2.5">
          {BENEFITS.map(b => (
            <div key={b.title} className="flex items-center gap-3 rounded-2xl px-3.5 py-3.5"
              style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))", border: "1px solid rgba(201,168,76,0.18)" }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow: "0 4px 16px rgba(201,168,76,0.3)" }}>
                <Icon name={b.icon} size={18} style={{ color: "#0a0f1e" }} />
              </div>
              <div className="leading-tight">
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{b.title}</div>
                <div style={{ color: GOLD, fontSize: 12, fontWeight: 600 }}>{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ПОД КАКИЕ ЗАДАЧИ */}
      <section className="px-4 pt-5 max-w-5xl mx-auto w-full">
        <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13.5, lineHeight: 1.7 }}>
            Командировка, поездка к родным, аэропорт или просто путешествие —{" "}
            <span style={{ color: GOLD2, fontWeight: 700 }}>мы довезём вас с комфортом.</span>
          </p>
        </div>
      </section>

      {/* ВАЖНО ЗНАТЬ */}
      <section className="px-4 pt-4 max-w-5xl mx-auto w-full">
        <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Icon name="AlertCircle" size={13} style={{ color: "rgba(255,255,255,0.25)" }} />
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>Важно знать</span>
          </div>
          <div className="space-y-2">
            {[
              { ok: false, text: "Поездками с попутчиками мы не занимаемся" },
              { ok: false, text: "Короткие внутренние поездки не выполняем" },
              { ok: true, text: "Работаем только на дальних маршрутах — от 200 км" },
            ].map(i => (
              <div key={i.text} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: i.ok ? "rgba(74,222,128,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${i.ok ? "rgba(74,222,128,0.3)" : "rgba(239,68,68,0.3)"}` }}>
                  <Icon name={i.ok ? "Check" : "X"} size={10} style={{ color: i.ok ? "#4ade80" : "#ef4444" }} />
                </div>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 1.5 }}>{i.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ЦЕНЫ */}
      <section className="px-4 pt-4 max-w-5xl mx-auto w-full">
        <PriceGuide routes={PRICE_ROUTES} />
      </section>

      {/* ОТЗЫВЫ */}
      <section className="px-4 pt-6 pb-4 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
          <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Отзывы пассажиров</span>
        </div>
        <div className="space-y-4">
          {BASE_REVIEWS.map(r => (
            <div key={r.name} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <img src={r.img} alt={r.name} loading="lazy" className="w-full block" />
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                    <div style={{ color: GOLD, fontSize: 11, marginTop: 1 }}>{r.route}</div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => <Icon key={i} name="Star" size={13} style={{ color: GOLD }} className="fill-[#c9a84c]" />)}
                  </div>
                </div>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.7 }}>{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* STICKY CTA */}
      <div className="sticky bottom-0 px-4 py-3 z-40 mt-auto" style={{ background: "rgba(7,11,20,0.97)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(201,168,76,0.15)" }}>
        <div className="max-w-5xl mx-auto">
          <a href={PHONE_HREF} onClick={() => lead("phone")}
            className="cta-gold flex items-center justify-center gap-3 w-full rounded-2xl py-4 transition-transform hover:scale-[1.01] active:scale-[0.98] mb-2.5"
            style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, fontFamily: "Oswald" }}>
            <Icon name="PhoneCall" size={22} style={{ color: "#0a0f1e" }} />
            <div className="flex flex-col items-start leading-none">
              <span style={{ fontSize: "clamp(16px,4.5vw,20px)", textTransform: "uppercase", letterSpacing: "0.05em", color: "#0a0f1e", fontWeight: 900 }}>Оставьте заявку</span>
              <span style={{ fontSize: 11, color: "rgba(10,15,30,0.65)", fontWeight: 700, marginTop: 2 }}>Рассчитаем стоимость и свяжемся с вами</span>
            </div>
          </a>
          <div className="grid grid-cols-3 gap-2">
            <a href={TG_HREF} target="_blank" rel="noopener noreferrer" onClick={() => lead("tg")}
              className="flex items-center justify-center gap-1.5 rounded-2xl py-3.5 active:scale-95 transition-transform"
              style={{ fontFamily: "Oswald", background: "linear-gradient(135deg,#0e6da8,#1a8fc2)", color: "#fff", fontWeight: 800, fontSize: "clamp(11px,2.5vw,14px)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              <Icon name="Send" size={15} /> TG
            </a>
            <a href={vkHref} target="_blank" rel="noopener noreferrer" onClick={() => lead("vk")}
              className="flex items-center justify-center gap-1.5 rounded-2xl py-3.5 active:scale-95 transition-transform"
              style={{ fontFamily: "Oswald", background: "linear-gradient(135deg,#1a3a6b,#2456a4)", color: "#fff", fontWeight: 800, fontSize: "clamp(11px,2.5vw,14px)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              <Icon name="Users" size={15} /> ВК
            </a>
            <a href={maxHref} target="_blank" rel="noopener noreferrer" onClick={() => lead("max")}
              className="flex items-center justify-center gap-1.5 rounded-2xl py-3.5 active:scale-95 transition-transform"
              style={{ fontFamily: "Oswald", background: "linear-gradient(135deg,#003a9e,#0055e5)", color: "#fff", fontWeight: 800, fontSize: "clamp(11px,2.5vw,14px)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              <img src={MAX_LOGO} alt="MAX" className="w-5 h-5 rounded-full object-cover" /> МАКС
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}