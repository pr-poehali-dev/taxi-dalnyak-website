import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { DEFAULT_CONTACTS, type Contacts } from "@/lib/contacts";
import FloatingContacts from "@/components/FloatingContacts";
import PriceGuide, { type PriceGuideRoute } from "@/components/PriceGuide";
import { routeFromQuery } from "@/lib/routeFromQuery";

const HERO_IMG  = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/7071b942-9c87-47e1-a16d-0af0c4b83c1d.jpg";
const LOGO      = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/3a499542-747a-49d2-808e-4c137548c76e.jpg";
const MAX_LOGO  = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/cf5e3e58-7d83-4d19-8c48-f91922395adf.png";

const REVIEW_1 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/b0eb5050-a05a-4647-8442-4b839d45161f.jpg";
const REVIEW_2 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/fedc4281-a106-4024-9369-8a03712c92a3.jpg";
const REVIEW_3 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/ac322d91-fd27-4c11-b86f-f28e85ec3df0.jpg";

const YM_ID = 111028538;

const GOLD  = "#c9a84c";
const GOLD2 = "#e8c96a";
// Сколько направлений показываем до нажатия «Показать все».
// Остальные есть в HTML — их видят поисковики и автотаргетинг.
const ROUTES_PREVIEW = 40;


const BASE_REVIEWS = [
  { name: "Валерия", route: "Москва – Новомичуринск", text: "Очень переживала — зимой с ребёнком, первый раз на такое расстояние. Но всё прошло замечательно! Машину нашли быстро, водитель — замечательный человек. Довёз идеально!", img: REVIEW_1 },
  { name: "Ирина",   route: "Лен. область – Санкт-Петербург", text: "Позвонила в две компании — ничего не нашли. На третий раз нашла Такси Дальняк. Водитель очень вежливый, машина в идеальном состоянии.", img: REVIEW_3 },
  { name: "Евгений", route: "Межгород по России", text: "Рекомендую! Удобная и быстрая доставка, комфортабельный авто. Пацаны отвечают за время, комфорт и стоимость. От всей семьи — Спасибо!", img: REVIEW_2 },
];

const REGIONS = [
  { label: "Москва и МО",     href: "/moskva" },
  { label: "Белгород",        href: "/belgorod" },
  { label: "Богучары",        href: "/boguchar" },
  { label: "Воронеж",         href: "/voronezh" },
  { label: "Курск",           href: "/kursk" },
  { label: "Рязань",          href: "/ryazan" },
  { label: "Санкт-Петербург", href: "/spb" },
  { label: "Нижний Новгород", href: "/nizhniy" },
  { label: "Ижевск",          href: "/izhevsk" },
  { label: "Краснодар",       href: "/krasnodar" },
  { label: "Ростов-на-Дону",  href: "/rostov" },
  { label: "Ставрополь",      href: "/stavropol" },
  { label: "Новосибирск",     href: "/novosibirsk" },
  { label: "Тюмень",          href: "/tyumen" },
  { label: "Челябинск",       href: "/chelyabinsk" },
  { label: "Екатеринбург",    href: "/ekaterinburg" },
  { label: "Донецк",          href: "/donetsk" },
  { label: "Луганск",         href: "/lugansk" },
  { label: "Херсонская область", href: "/kherson" },
];

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

function ymLead(channel: string, utmParams: { source: string; medium: string; campaign: string; term: string }, pageSource?: string) {
  ymGoal("lead", { channel, utm_source: utmParams.source, utm_medium: utmParams.medium, utm_campaign: utmParams.campaign, utm_term: utmParams.term });
  ymGoal(`lead_${channel}`, { utm_source: utmParams.source, utm_medium: utmParams.medium, utm_campaign: utmParams.campaign });
  if (pageSource) ymGoal(`lead_${pageSource}`);
  tmrGoal("lead");
  tmrGoal(`lead_${channel}`);
}

export interface RegionConfig {
  slug: string;
  city: string;
  cityRod: string;
  h1?: string;
  routes: string[];
  about: string;
  features: string[];
  reviews?: { name: string; route: string; text: string; img: string }[];
  badge?: string;
  sub?: string;
  lead?: string;
  aboutTitle?: string;
  routesTitle?: string;
  routesNote?: string;
  canonical?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  splashSub?: string;
  heroAlt?: string;
  /** Короткая версия: только шапка, заголовок, «Важно знать» и кнопки связи. */
  short?: boolean;
  /** Ориентиры цен «от» — показываются под блоком «Важно знать». */
  priceGuide?: PriceGuideRoute[];
  /** Минимальное расстояние для заказа, км (по умолчанию 200). */
  minKm?: number;
  /** Своя сетка тарифов за км — вместо общей. */
  rateTable?: { title?: string; note?: string; rows: { name: string; rate: number; desc?: string }[] };
}

export default function RegionalPage({ config, contacts = DEFAULT_CONTACTS, source }: { config: RegionConfig; contacts?: Contacts; source?: string }) {
  const { PHONE, PHONE_HREF, VK_HREF, TG_HREF, MAX_HREF } = contacts;
  const [utmParams, setUtmParams] = useState({ source: "direct", medium: "none", campaign: "none", term: "", content: "none" });
  const [splash, setSplash]       = useState(true);
  const [menuOpen, setMenuOpen]   = useState(false);
  const [allRoutes, setAllRoutes] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setUtmParams({ source: p.get("utm_source") || "direct", medium: p.get("utm_medium") || "none", campaign: p.get("utm_campaign") || "none", term: p.get("utm_term") || p.get("keyword") || "", content: p.get("utm_content") || "none" });
    const t = setTimeout(() => setSplash(false), 900);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const qr = routeFromQuery(new URLSearchParams(window.location.search).get("utm_term"));
    const title = qr
      ? `Такси ${qr.from} – ${qr.to} — фиксированная цена | Такси Дальняк`
      : config.seoTitle ?? `Заказать такси из ${config.cityRod} в другой город от 200 км — Такси Дальняк`;
    document.title = title;

    const description = config.seoDescription ?? `Такси из ${config.cityRod} в другой город по фиксированной цене. ${config.routes.slice(0, 4).join(", ")} и другие направления. Круглосуточно, звоните ${PHONE}.`;
    const keywords = config.seoKeywords ?? `такси ${config.cityRod}, заказать такси ${config.cityRod}, межгород ${config.cityRod}, такси из ${config.cityRod} в другой город`;
    const canonicalUrl = config.canonical ?? `https://taxidalnyack.ru/${config.slug === "moscow" ? "moskva" : config.slug === "nizhny" ? "nizhniy" : config.slug}`;

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector) as HTMLElement | null;
      if (!el) {
        const tagName = selector.startsWith("link") ? "link" : "meta";
        el = document.createElement(tagName);
        if (tagName === "meta") {
          const nameMatch = selector.match(/\[(name|property)="([^"]+)"\]/);
          if (nameMatch) el.setAttribute(nameMatch[1], nameMatch[2]);
        } else {
          el.setAttribute("rel", "canonical");
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[name="keywords"]', "content", keywords);
    setMeta('link[rel="canonical"]', "href", canonicalUrl);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", canonicalUrl);

    const schemaId = "regional-schema";
    let script = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = schemaId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "TaxiService",
      name: `Такси Дальняк — ${config.city}`,
      description,
      telephone: "+79956455125",
      url: canonicalUrl,
      areaServed: { "@type": "City", name: config.city },
      serviceType: "Междугороднее такси",
      provider: { "@type": "Organization", name: "Такси Дальняк", telephone: "+79956455125", url: "https://taxidalnyack.ru/" },
      openingHours: "Mo-Su 00:00-23:59",
      priceRange: "от 26₽/км",
    });

    const breadcrumbId = "regional-breadcrumb";
    let bc = document.getElementById(breadcrumbId) as HTMLScriptElement | null;
    if (!bc) {
      bc = document.createElement("script");
      bc.id = breadcrumbId;
      bc.type = "application/ld+json";
      document.head.appendChild(bc);
    }
    bc.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: "https://taxidalnyack.ru/" },
        { "@type": "ListItem", position: 2, name: config.city, item: canonicalUrl },
      ],
    });

    return () => {
      script?.remove();
      bc?.remove();
    };
  }, [config.city, config.cityRod, config.slug, config.routes]);

  const queryRoute = useMemo(() => routeFromQuery(utmParams.term), [utmParams.term]);

  const reviews = config.reviews ?? BASE_REVIEWS;

  const vkHref = useMemo(() => {
    const u = new URL(VK_HREF);
    u.searchParams.set("utm_source", utmParams.source);
    u.searchParams.set("utm_medium", utmParams.medium);
    u.searchParams.set("utm_campaign", utmParams.campaign);
    u.searchParams.set("utm_content", "vk_button");
    return u.toString();
  }, [utmParams]);

  const maxHref = useMemo(() => {
    const u = new URL(MAX_HREF);
    u.searchParams.set("utm_source", utmParams.source);
    u.searchParams.set("utm_medium", utmParams.medium);
    u.searchParams.set("utm_campaign", utmParams.campaign);
    u.searchParams.set("utm_content", "max_button");
    return u.toString();
  }, [utmParams]);

  return (
    <>
      {/* СПЛЭШ */}
      <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-500 ${splash ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ background: "#070b14" }}>
        <img src={LOGO} alt="" className="w-20 h-20 rounded-2xl object-cover mb-4" style={{ boxShadow: `0 0 40px rgba(201,168,76,0.4)` }} />
        <div style={{ fontFamily: "Oswald", color: GOLD, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5em", fontWeight: 700 }}>Такси</div>
        <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: 32, textTransform: "uppercase", fontWeight: 900, lineHeight: 1 }}>Дальняк</div>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 6 }}>{config.splashSub ?? `${config.city} · Межгородское такси`}</div>
        <div className="w-32 h-0.5 mt-5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full rounded-full splash-line" style={{ background: `linear-gradient(to right,${GOLD},${GOLD2})` }} />
        </div>
        <style>{`@keyframes splashLine{from{transform:translateX(-100%)}to{transform:translateX(0)}}.splash-line{animation:splashLine 0.85s ease-out forwards}`}</style>
      </div>

      <div className="min-h-[100dvh] w-full text-white flex flex-col" style={{ background: "#070b14", fontFamily: "Inter, sans-serif" }}>
        <style>{`
          @keyframes ctaPulse{0%,100%{box-shadow:0 4px 24px rgba(201,168,76,0.45),0 0 0 0 rgba(201,168,76,0.25)}50%{box-shadow:0 4px 24px rgba(201,168,76,0.7),0 0 0 12px rgba(201,168,76,0)}}
          .cta-gold{animation:ctaPulse 2.6s ease-out infinite}
        `}</style>

        {/* ШАПКА */}
        <header style={{ background: "rgba(7,11,20,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(201,168,76,0.12)", position: "sticky", top: 0, zIndex: 50 }}>
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="/" className="flex items-center gap-3">
              <img src={LOGO} alt="Такси Дальняк" className="w-9 h-9 rounded-xl object-cover" style={{ border: `1.5px solid rgba(201,168,76,0.5)` }} />
              <div>
                <div style={{ fontFamily: "Oswald", color: GOLD, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.4em", fontWeight: 700, lineHeight: 1 }}>Такси</div>
                <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: 17, textTransform: "uppercase", fontWeight: 900, lineHeight: 1, marginTop: 1 }}>Дальняк</div>
              </div>
            </a>
            <div className="flex items-center gap-2">
              <a href={PHONE_HREF} className="hidden md:flex items-center gap-2 rounded-xl px-4 py-2"
                style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                <Icon name="Phone" size={13} style={{ color: "#0a0f1e" }} />
                <span style={{ fontFamily: "Oswald", color: "#0a0f1e", fontSize: 13, fontWeight: 800, textTransform: "uppercase" }}>{PHONE}</span>
              </a>
              <button onClick={() => setMenuOpen(v => !v)}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2"
                style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>
                <Icon name="Globe" size={14} style={{ color: GOLD }} />
                <span style={{ fontFamily: "Oswald", color: GOLD, fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Города</span>
                <Icon name={menuOpen ? "ChevronUp" : "ChevronDown"} size={12} style={{ color: GOLD }} />
              </button>
            </div>
          </div>
          {menuOpen && (
            <div className="max-w-5xl mx-auto px-4 pb-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="pt-3 flex flex-wrap gap-2">
                {REGIONS.map(r => (
                  <a key={r.href} href={r.href}
                    className="rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all"
                    style={r.href === `/${config.slug}` ? { background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#0a0f1e" } : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
                    {r.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* HERO — ЗАГОЛОВОК ВВЕРХУ */}
        <section style={{ background: "linear-gradient(180deg,#0d1220 0%,#070b14 100%)" }}>
          <div className="max-w-5xl mx-auto px-4 pt-7 pb-0">

            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-4"
              style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)" }}>
              <Icon name="MapPin" size={12} style={{ color: GOLD }} />
              <span style={{ color: GOLD, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em" }}>{queryRoute ? `${queryRoute.from} – ${queryRoute.to} · Ваш маршрут` : config.badge ?? `${config.city} · Межгородское такси`}</span>
            </div>

            <h1 style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: "clamp(24px,6vw,52px)", lineHeight: 1.0, textTransform: "uppercase", color: "#fff", letterSpacing: "-0.01em", marginBottom: 10 }}>
              {queryRoute ? (
                <>Такси{" "}<span style={{ color: GOLD }}>{queryRoute.from} — {queryRoute.to}</span>{" "}по фиксированной цене</>
              ) : config.h1 ? (
                <span dangerouslySetInnerHTML={{ __html: config.h1.replace(/\[gold\](.*?)\[\/gold\]/g, `<span style="color:${GOLD}">$1</span>`) }} />
              ) : (
                <>Заказать автомобиль с водителем{" "}<span style={{ color: GOLD }}>из {config.cityRod}</span>{" "}в другой город</>
              )}
            </h1>

            <p style={{ fontFamily: "Oswald", color: GOLD2, fontSize: "clamp(13px,2.5vw,18px)", fontWeight: 600, marginBottom: 4 }}>
              {queryRoute ? `Прямой рейс ${queryRoute.from} – ${queryRoute.to} · Круглосуточно` : config.sub ?? "От 200 км · Большой опыт в перевозках"}
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.6, maxWidth: 560, marginBottom: 20 }}>
              {queryRoute
                ? `Выполняем маршрут ${queryRoute.from} – ${queryRoute.to}. Цену фиксируем до выезда — она не меняется из-за пробок, ночного времени и времени в пути. Машина едет только за вами, без попутчиков.`
                : config.lead ?? "Свои водители на дальних рейсах — седаны, кроссоверы и минивэны. Фиксированная стоимость без счётчика и сюрпризов."}
            </p>

            {/* ФОТО */}
            <div className="relative rounded-3xl overflow-hidden" style={{ maxHeight: 460 }}>
              <img src={HERO_IMG} alt={config.heroAlt ?? `Комфортная поездка из ${config.cityRod}`} {...{ fetchpriority: "high" }}
                className="w-full object-cover" style={{ maxHeight: 460, objectPosition: "center 15%" }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to right,rgba(7,11,20,0.6) 0%,transparent 45%,rgba(7,11,20,0.15) 100%)" }} />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(7,11,20,0.95) 0%,transparent 45%)" }} />

              <div className="absolute bottom-5 left-5 right-5">
                <div className="grid grid-cols-3 gap-2 max-w-xs">
                  {[{ val: "12+", label: "лет на рынке" }, { val: "50к+", label: "поездок" }, { val: "4.8★", label: "рейтинг" }].map(s => (
                    <div key={s.val} className="rounded-xl py-2 px-2 text-center" style={{ background: "rgba(7,11,20,0.75)", backdropFilter: "blur(8px)", border: `1px solid rgba(201,168,76,0.2)` }}>
                      <div style={{ fontFamily: "Oswald", color: GOLD2, fontSize: 17, fontWeight: 900, lineHeight: 1 }}>{s.val}</div>
                      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, marginTop: 2 }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="absolute top-4 right-4 rounded-xl px-3 py-1.5" style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                <span style={{ fontFamily: "Oswald", color: "#0a0f1e", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em" }}>С персональным водителем</span>
              </div>
            </div>
          </div>
        </section>

        {/* ВАЖНО */}
        <section className={`px-4 pt-6 max-w-5xl mx-auto w-full ${config.short ? "pb-5" : "pb-0"}`}>
          <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Icon name="AlertCircle" size={13} style={{ color: "rgba(255,255,255,0.25)" }} />
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>Важно знать</span>
            </div>
            <div className="space-y-2">
              {[
                { ok: false, text: "Поездками с попутчиками мы не занимаемся" },
                { ok: false, text: "Короткие внутренние поездки не выполняем" },
                { ok: true,  text: `Работаем только на дальних маршрутах — от ${config.minKm ?? 200} км` },
              ].map(item => (
                <div key={item.text} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: item.ok ? "rgba(74,222,128,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${item.ok ? "rgba(74,222,128,0.3)" : "rgba(239,68,68,0.3)"}` }}>
                    <Icon name={item.ok ? "Check" : "X"} size={10} style={{ color: item.ok ? "#4ade80" : "#ef4444" }} />
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 1.5 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {config.priceGuide && (
          <section className="px-4 pt-5 pb-1 max-w-5xl mx-auto w-full">
            <PriceGuide routes={config.priceGuide} />
          </section>
        )}

        {config.rateTable && (
          <section className="px-4 pt-5 pb-0 max-w-5xl mx-auto w-full">
            <div className="rounded-3xl p-5" style={{ background: "linear-gradient(135deg,rgba(201,168,76,0.07),rgba(201,168,76,0.02))", border: "1px solid rgba(201,168,76,0.22)" }}>
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
                <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  {config.rateTable.title ?? "Тарифы за километр"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {config.rateTable.rows.map(r => (
                  <div key={r.name} className="rounded-2xl px-4 py-3.5" style={{ background: "rgba(7,11,20,0.5)", border: "1px solid rgba(255,255,255,0.07)" }}>
                    <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{r.name}</div>
                    {r.desc && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10.5, marginTop: 1 }}>{r.desc}</div>}
                    <div style={{ fontFamily: "Oswald", color: GOLD2, fontSize: 22, fontWeight: 900, lineHeight: 1.1, marginTop: 5 }}>
                      {r.rate} ₽<span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.35)" }}>/км</span>
                    </div>
                  </div>
                ))}
              </div>
              {config.rateTable.note && (
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11.5, lineHeight: 1.6, marginTop: 12 }}>{config.rateTable.note}</p>
              )}
            </div>
          </section>
        )}

        {!config.short && <>
        {/* ДИСПЕТЧЕР */}
        <section className="px-4 pt-5 pb-0 max-w-5xl mx-auto w-full">
          <div className="rounded-2xl p-5" style={{ background: `linear-gradient(135deg,rgba(201,168,76,0.08),rgba(201,168,76,0.03))`, border: `1px solid rgba(201,168,76,0.2)` }}>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                <Icon name="Headphones" size={20} style={{ color: "#0a0f1e" }} />
              </div>
              <div>
                <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: 15, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>
                  Диспетчер <span style={{ color: GOLD }}>Алексей</span> — на связи 24/7
                </div>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.7 }}>
                  Если вам необходимо уехать далеко в другой город — Алексей с радостью{" "}
                  <span style={{ color: "rgba(255,255,255,0.9)" }}>назначит машину</span>,{" "}
                  <span style={{ color: "rgba(255,255,255,0.9)" }}>просчитает стоимость маршрута</span>{" "}
                  и ответит на все дополнительные вопросы.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* УТП */}
        <section className="px-4 pt-5 pb-0 max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: "Zap",         text: "Срочная подача" },
              { icon: "Calendar",    text: "Предзаказ без брони" },
              { icon: "Receipt",     text: "Чек самозанятого" },
              { icon: "ShieldCheck", text: "Работаем с 2014 года" },
            ].map(item => (
              <div key={item.text} className="flex items-start gap-2.5 rounded-2xl px-4 py-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Icon name={item.icon as "Zap"} size={15} style={{ color: GOLD, flexShrink: 0, marginTop: 1 }} />
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* О РЕГИОНЕ */}
        <section className="px-4 pt-5 pb-0 max-w-5xl mx-auto w-full">
          <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
              <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{config.aboutTitle ?? `Такси из ${config.cityRod}`}</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.8, marginBottom: 14 }}>{config.about}</p>
            <div className="space-y-2">
              {config.features.map(f => (
                <div key={f} className="flex items-start gap-2.5">
                  <Icon name="ChevronRight" size={12} style={{ color: GOLD, flexShrink: 0, marginTop: 2 }} />
                  <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 1.5 }}>{f}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* РЕЙТИНГИ */}
        <section className="px-4 pt-5 pb-0 max-w-5xl mx-auto w-full">
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Карты", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#fff"/><circle cx="12" cy="9" r="2.5" fill="#ff4433"/></svg>, bg: "linear-gradient(135deg,#ff4433,#ff6b35)" },
              { name: "2ГИС", icon: <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 10, fontWeight: 900 }}>2ГИС</span>, bg: "linear-gradient(135deg,#00b956,#008f42)" },
            ].map(r => (
              <div key={r.name} className="rounded-2xl px-4 py-4 flex flex-col gap-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: r.bg }}>{r.icon}</div>
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{r.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 26, fontWeight: 900, lineHeight: 1 }}>4.8</span>
                  <div className="flex gap-0.5 mt-0.5">
                    {[1,2,3,4].map(i => <Icon key={i} name="Star" size={12} style={{ color: GOLD }} className="fill-[#c9a84c]" />)}
                    <div className="relative" style={{ width: 12, height: 12, overflow: "hidden" }}>
                      <Icon name="Star" size={12} style={{ color: "rgba(255,255,255,0.12)", position: "absolute" }} />
                      <div style={{ width: "80%", overflow: "hidden", position: "absolute" }}>
                        <Icon name="Star" size={12} style={{ color: GOLD }} className="fill-[#c9a84c]" />
                      </div>
                    </div>
                  </div>
                </div>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>Средняя оценка организации</span>
              </div>
            ))}
          </div>
        </section>

        {/* МАРШРУТЫ */}
        <section className="px-4 pt-6 pb-0 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
            <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>{config.routesTitle ?? `Маршруты из ${config.cityRod}`}</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginBottom: 12, fontStyle: "italic" }}>{config.routesNote ?? "Часть направлений — выезжаем по всей России"}</p>
          <div className="flex flex-wrap gap-2">
            {config.routes.map((r, i) => (
              <span key={r} className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
                style={{
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                  color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 600,
                  display: !allRoutes && i >= ROUTES_PREVIEW ? "none" : undefined,
                }}>
                <Icon name="MapPin" size={9} style={{ color: GOLD, flexShrink: 0 }} />{r}
              </span>
            ))}
          </div>
          {config.routes.length > ROUTES_PREVIEW && (
            <button onClick={() => setAllRoutes(v => !v)}
              className="flex items-center gap-2 rounded-full px-4 py-2 mt-3"
              style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: GOLD2, fontSize: 12, fontWeight: 700 }}>
              <Icon name={allRoutes ? "ChevronUp" : "ChevronDown"} size={13} />
              {allRoutes ? "Свернуть список" : `Показать все направления (${config.routes.length})`}
            </button>
          )}
        </section>

        </>}

        {/* ОТЗЫВЫ */}
        <section className="px-4 pt-6 pb-32 max-w-5xl mx-auto w-full">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
            <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Отзывы пассажиров</span>
          </div>
          <div className="space-y-4">
            {reviews.map(r => (
              <div key={r.name} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <img src={r.img} alt={r.name} loading="lazy" className="w-full block" />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                      <div style={{ color: GOLD, fontSize: 11, marginTop: 1 }}>{r.route}</div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => <Icon key={i} name="Star" size={13} style={{ color: GOLD }} className="fill-[#c9a84c]" />)}
                    </div>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.7 }}>{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {!config.short && (
          <FloatingContacts
            contacts={contacts}
            onLead={(ch) => { ymGoal(`float_${ch}`, { city: config.slug }); ymLead(ch, utmParams, source); }}
          />
        )}

        {/* STICKY CTA */}
        <div className="sticky bottom-0 px-4 py-3 z-40" style={{ background: "rgba(7,11,20,0.97)", backdropFilter: "blur(12px)", borderTop: "1px solid rgba(201,168,76,0.15)" }}>
          <div className="max-w-5xl mx-auto">
            <a href={PHONE_HREF}
              onClick={() => { ymGoal("phone_click", { utm_source: utmParams.source, utm_medium: utmParams.medium, utm_campaign: utmParams.campaign, city: config.slug }); ymLead("phone", utmParams, source); }}
              className="cta-gold flex items-center justify-center gap-3 w-full rounded-2xl py-4 transition-transform hover:scale-[1.01] active:scale-[0.98] mb-2.5"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, fontFamily: "Oswald" }}>
              <Icon name="PhoneCall" size={22} style={{ color: "#0a0f1e" }} />
              <div className="flex flex-col items-start leading-none">
                <span style={{ fontSize: "clamp(16px,4.5vw,20px)", textTransform: "uppercase", letterSpacing: "0.05em", color: "#0a0f1e", fontWeight: 900 }}>Позвонить диспетчеру</span>
                <span style={{ fontSize: 11, color: "rgba(10,15,30,0.6)", fontWeight: 700, marginTop: 2 }}>{PHONE}</span>
              </div>
            </a>
            <div className="grid grid-cols-3 gap-2">
              <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
                onClick={() => { ymGoal("tg_click", { utm_source: utmParams.source, utm_medium: utmParams.medium, utm_campaign: utmParams.campaign, city: config.slug }); ymLead("tg", utmParams, source); }}
                className="flex items-center justify-center gap-1.5 rounded-2xl py-3.5 active:scale-95 transition-transform"
                style={{ fontFamily: "Oswald", background: "linear-gradient(135deg,#0e6da8,#1a8fc2)", color: "#fff", fontWeight: 800, fontSize: "clamp(11px,2.5vw,14px)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                <Icon name="Send" size={15} /> TG
              </a>
              <a href={vkHref} target="_blank" rel="noopener noreferrer"
                onClick={() => { ymGoal("vk_click", { utm_source: utmParams.source, utm_medium: utmParams.medium, utm_campaign: utmParams.campaign, city: config.slug }); ymLead("vk", utmParams, source); }}
                className="flex items-center justify-center gap-1.5 rounded-2xl py-3.5 active:scale-95 transition-transform"
                style={{ fontFamily: "Oswald", background: "linear-gradient(135deg,#1a3a6b,#2456a4)", color: "#fff", fontWeight: 800, fontSize: "clamp(11px,2.5vw,14px)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                <Icon name="Users" size={15} /> ВК
              </a>
              <a href={maxHref} target="_blank" rel="noopener noreferrer"
                onClick={() => { ymGoal("max_click", { utm_source: utmParams.source, utm_medium: utmParams.medium, utm_campaign: utmParams.campaign, city: config.slug }); ymLead("max", utmParams, source); }}
                className="flex items-center justify-center gap-1.5 rounded-2xl py-3.5 active:scale-95 transition-transform"
                style={{ fontFamily: "Oswald", background: "linear-gradient(135deg,#003a9e,#0055e5)", color: "#fff", fontWeight: 800, fontSize: "clamp(11px,2.5vw,14px)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                <img src={MAX_LOGO} alt="MAX" className="w-5 h-5 rounded-full object-cover" /> МАКС
              </a>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}