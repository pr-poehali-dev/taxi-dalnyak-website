import { useMemo } from "react";
import { useSeo } from "@/hooks/use-seo";
import { DEFAULT_CONTACTS } from "@/lib/contacts";
import { withVisitKey, trackLeadClick } from "@/lib/tracking";
import LpHero from "@/components/lp/LpHero";
import LpCalc from "@/components/lp/LpCalc";
import LpRoutes from "@/components/lp/LpRoutes";
import LpSteps from "@/components/lp/LpSteps";
import LpFaq from "@/components/lp/LpFaq";
import LpCta from "@/components/lp/LpCta";
import LpStickyBar from "@/components/lp/LpStickyBar";
import AudienceBlock from "@/components/main/AudienceBlock";
import ReviewsSlider from "@/components/main/ReviewsSlider";

const YM_ID = 111028538;

function goal(name: string, params: Record<string, string> = {}) {
  const w = window as unknown as {
    ym?: (id: number, a: string, g: string, p?: Record<string, unknown>) => void;
    _tmr?: { push: (o: Record<string, unknown>) => void };
  };
  if (typeof w.ym === "function") w.ym(YM_ID, "reachGoal", name, params);
  if (w._tmr) w._tmr.push({ id: "3789002", type: "reachGoal", goal: name });
}

export default function NewHome() {
  const { PHONE_HREF, TG_HREF, MAX_HREF } = DEFAULT_CONTACTS;

  useSeo({
    title: "Такси межгород по фиксированной цене — Дальняк | Россия, ДНР, ЛНР, Херсон, Запорожье",
    description: "Междугороднее такси по всей России и на новые территории. Цена фиксируется до поездки, без предоплаты, подача от 30 минут, 24/7. +7 (995) 645-51-25.",
    path: "/new",
    keywords: "такси межгород, междугороднее такси, такси дальняк, такси военнослужащему домой, такси донецк луганск херсон запорожье",
  });

  const links = useMemo(
    () => ({ phone: PHONE_HREF, telegram: withVisitKey(TG_HREF), max: withVisitKey(MAX_HREF) }),
    [PHONE_HREF, TG_HREF, MAX_HREF],
  );

  const onLead = (channel: string) => {
    const p = new URLSearchParams(window.location.search);
    goal("lead", { channel, utm_source: p.get("utm_source") || "direct", utm_campaign: p.get("utm_campaign") || "none" });
    goal(`lead_${channel}`);
    trackLeadClick(channel);
  };

  const toCalc = () => document.getElementById("calc")?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="min-h-screen bg-black text-white pb-24" style={{ fontFamily: "Manrope, sans-serif" }}>
      <LpHero links={links} onLead={onLead} />
      <LpCalc links={links} onLead={onLead} />
      <LpRoutes onPick={toCalc} />
      <LpSteps />
      <AudienceBlock />
      <ReviewsSlider />
      <LpFaq />
      <section className="px-5 pb-10 max-w-xl mx-auto">
        <h2 className="text-2xl font-bold uppercase text-center mb-5" style={{ fontFamily: "Oswald, sans-serif" }}>
          Закажите поездку сейчас
        </h2>
        <LpCta links={links} onLead={onLead} />
      </section>
      <LpStickyBar links={links} onLead={onLead} />
    </main>
  );
}
