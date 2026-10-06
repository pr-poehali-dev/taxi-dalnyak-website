import { useEffect, useMemo, useState, type ReactNode } from "react";
import { MAX_TRACK_CHAT, type Contacts } from "@/lib/contacts";
import { routeFromQuery, cityFromQuery, cityRod } from "@/lib/routeFromQuery";
import { roadKm, splitRoute } from "@/lib/cityDistances";
import { REGIONS, ymGoal, ymLead, type RegionConfig } from "@/components/regional/shared";
import { useRegionalSeo } from "@/components/regional/useRegionalSeo";
import { useMaxTrack } from "@/components/regional/useMaxTrack";
import Icon from "@/components/ui/icon";
import LpHero from "./LpHero";
import { type LpTariff } from "./LpCalc";
import LpRoutes, { type LpRouteCard } from "./LpRoutes";
import LpSteps from "./LpSteps";
import LpFaq, { type FaqItem } from "./LpFaq";
import LpCta from "./LpCta";
import LpStickyBar from "./LpStickyBar";
import AudienceBlock from "@/components/main/AudienceBlock";
import ReviewsSlider from "@/components/main/ReviewsSlider";

const DEFAULT_TARIFFS: LpTariff[] = [
  { name: "Стандарт", rate: 32 },
  { name: "Комфорт", rate: 37 },
  { name: "Комфорт+", rate: 42 },
  { name: "Минивэн", rate: 57 },
];

const CHANNEL_GOAL: Record<string, string> = { phone: "phone_click", telegram: "tg_click", max: "max_click" };
const CHIPS_PREVIEW = 30;
const fmt = (n: number) => n.toLocaleString("ru-RU");

function goldTitle(h1: string): ReactNode {
  const parts = h1.split(/(\[gold\].*?\[\/gold\])/g);
  return parts.map((part, i) => {
    const m = part.match(/^\[gold\](.*)\[\/gold\]$/);
    return m ? <span key={i} className="text-amber-400">{m[1]}</span> : <span key={i}>{part}</span>;
  });
}

export default function CityLanding({ config, contacts }: { config: RegionConfig; contacts: Contacts }) {
  const { PHONE, PHONE_HREF, TG_HREF } = contacts;
  const [utm, setUtm] = useState({ source: "direct", medium: "none", campaign: "none", term: "", content: "none" });
  const [allChips, setAllChips] = useState(false);

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

  useRegionalSeo(config, PHONE);
  useMaxTrack(true);

  const queryRoute = useMemo(() => routeFromQuery(utm.term), [utm.term]);
  const queryCity = useMemo(() => cityFromQuery(utm.term), [utm.term]);

  const links = useMemo(() => {
    const tg = new URL(TG_HREF);
    tg.searchParams.set("utm_source", utm.source);
    tg.searchParams.set("utm_medium", utm.medium);
    tg.searchParams.set("utm_campaign", utm.campaign);
    tg.searchParams.set("utm_content", "tg_button");
    return { phone: PHONE_HREF, telegram: tg.toString(), max: MAX_TRACK_CHAT };
  }, [PHONE_HREF, TG_HREF, utm]);

  const onLead = (channel: string) => {
    ymGoal(CHANNEL_GOAL[channel] ?? `${channel}_click`, {
      utm_source: utm.source, utm_medium: utm.medium, utm_campaign: utm.campaign, city: config.slug,
    });
    ymLead(channel, utm);
  };

  const minKm = config.minKm ?? 200;
  const tariffs: LpTariff[] = config.rateTable?.rows.map((r) => ({ name: r.name, rate: r.rate })) ?? DEFAULT_TARIFFS;
  const baseRate = tariffs[0].rate;

  const cards: LpRouteCard[] = useMemo(() => {
    const out: LpRouteCard[] = [];
    for (const r of config.routes) {
      const pair = splitRoute(r);
      if (!pair) continue;
      const km = roadKm(pair.from, pair.to);
      if (!km || km < minKm * 0.9) continue;
      out.push({ from: pair.from, to: pair.to, km, rate: baseRate });
      if (out.length === 5) break;
    }
    return out;
  }, [config.routes, minKm, baseRate]);

  const pickKm = () => {
    document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });
  };

  const faqExtra: FaqItem[] = useMemo(() => {
    const out: FaqItem[] = [];
    const c = cards[0];
    if (c) {
      out.push({
        q: `Сколько стоит такси из ${cityRod(c.from)} в ${c.to}?`,
        a: `Ориентировочно от ${fmt(c.km * baseRate)} ₽ по тарифу «${tariffs[0].name}» — это примерно ${fmt(c.km)} км по ${baseRate} ₽/км. Точную цену диспетчер назовёт до выезда, и она не изменится в дороге.`,
      });
    }
    out.push({
      q: `Какие поездки из ${config.cityRod} вы выполняете?`,
      a: `Только дальние маршруты от ${minKm} км в другие города и регионы. Короткие поездки внутри города и с попутчиками мы не выполняем.`,
    });
    return out;
  }, [cards, baseRate, tariffs, config.cityRod, minKm]);

  useEffect(() => {
    const id = "regional-faq";
    let el = document.getElementById(id) as HTMLScriptElement | null;
    if (!el) {
      el = document.createElement("script");
      el.id = id;
      el.type = "application/ld+json";
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqExtra.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    });
    return () => el?.remove();
  }, [faqExtra]);

  const badge = queryRoute
    ? `${queryRoute.from} – ${queryRoute.to} · Ваш маршрут`
    : queryCity
      ? `${queryCity} · Межгород от ${minKm} км`
      : config.badge ?? `${config.city} · Межгородское такси`;

  const title: ReactNode = queryRoute ? (
    <>Такси <span className="text-amber-400">{queryRoute.from} — {queryRoute.to}</span> по фиксированной цене</>
  ) : queryCity ? (
    <>Такси межгород <span className="text-amber-400">из {cityRod(queryCity)}</span> по фиксированной цене</>
  ) : config.h1 ? (
    goldTitle(config.h1)
  ) : (
    <>Такси из {config.cityRod} <span className="text-amber-400">в другой город</span></>
  );

  const sub = queryRoute
    ? `Выполняем маршрут ${queryRoute.from} – ${queryRoute.to}. Цену фиксируем до выезда — она не меняется из-за пробок и времени в пути. Машина едет только за вами.`
    : config.lead ?? `Из ${config.cityRod} в любой город России. Цену называем до выезда и фиксируем — в дороге она не меняется. Машина едет только за вами, без попутчиков.`;

  const chips = config.routes;
  const otherCities = REGIONS.filter((r) => r.href !== `/${config.slug}`);

  return (
    <main className="min-h-screen bg-black text-white pb-24" style={{ fontFamily: "Manrope, sans-serif" }}>
      <LpHero links={links} onLead={onLead} badge={badge} title={title} sub={sub} phone={PHONE} alt={config.heroAlt ?? `Междугороднее такси из ${config.cityRod}`} />

      <LpRoutes
        routes={cards}
        onPick={pickKm}
        title={`Популярные направления из ${config.cityRod}`}
        note={`Цены по тарифу «${tariffs[0].name}» (${baseRate} ₽/км), расстояние приблизительное. Точную стоимость назовёт диспетчер`}
      />

      <LpSteps />

      <section className="px-5 py-8 max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold uppercase text-center" style={{ fontFamily: "Oswald, sans-serif" }}>
          {config.aboutTitle ?? `Такси из ${config.cityRod}`}
        </h2>
        <p className="mt-5 text-[15px] leading-relaxed text-white/80">{config.about}</p>
        <ul className="mt-5 space-y-3">
          {config.features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-[15px] font-semibold text-white/90">
              <span className="w-6 h-6 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0 mt-0.5">
                <Icon name="Check" size={14} className="text-amber-300" />
              </span>
              {f}
            </li>
          ))}
        </ul>
      </section>

      <AudienceBlock />
      <ReviewsSlider city={config.city} />

      <section className="px-5 py-8 max-w-xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold uppercase text-center" style={{ fontFamily: "Oswald, sans-serif" }}>
          {config.routesTitle ?? `Маршруты из ${config.cityRod}`}
        </h2>
        <p className="mt-2 text-center text-xs text-white/50">{config.routesNote ?? "Часть направлений — выезжаем по всей России"}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {chips.map((r, i) => (
            <span
              key={r}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-white/75"
              style={{ background: "#14141a", border: "1px solid rgba(255,255,255,0.1)", display: !allChips && i >= CHIPS_PREVIEW ? "none" : undefined }}
            >
              <Icon name="MapPin" size={11} className="text-amber-400" />
              {r}
            </span>
          ))}
        </div>
        {chips.length > CHIPS_PREVIEW && (
          <button
            type="button"
            onClick={() => setAllChips((v) => !v)}
            className="mt-4 mx-auto flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
            style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.4)", color: "#fbbf24" }}
          >
            <Icon name={allChips ? "ChevronUp" : "ChevronDown"} size={14} />
            {allChips ? "Свернуть список" : `Показать все направления (${chips.length})`}
          </button>
        )}
      </section>

      <LpFaq extra={faqExtra} />

      <section className="px-5 pb-6 max-w-xl mx-auto">
        <div className="rounded-2xl p-4 text-sm text-white/65 leading-relaxed" style={{ background: "#14141a", border: "1px solid rgba(255,255,255,0.08)" }}>
          Работаем только на дальних маршрутах — от {minKm} км. Поездки с попутчиками и короткие внутренние поездки не выполняем.
        </div>
      </section>

      <section id="order" className="px-5 pb-10 max-w-xl mx-auto scroll-mt-4">
        <h2 className="text-2xl font-bold uppercase text-center mb-5" style={{ fontFamily: "Oswald, sans-serif" }}>
          Закажите поездку из {config.cityRod}
        </h2>
        <LpCta links={links} onLead={onLead} />
      </section>

      <nav className="px-5 pb-8 max-w-xl mx-auto" aria-label="Другие города">
        <h2 className="text-sm font-bold uppercase text-white/50 text-center mb-3">Другие города</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {otherCities.map((r) => (
            <a key={r.href} href={r.href} className="rounded-full px-3 py-1.5 text-xs font-semibold text-white/70" style={{ background: "#14141a", border: "1px solid rgba(255,255,255,0.1)" }}>
              {r.label}
            </a>
          ))}
        </div>
      </nav>

      <LpStickyBar links={links} onLead={onLead} />
    </main>
  );
}
