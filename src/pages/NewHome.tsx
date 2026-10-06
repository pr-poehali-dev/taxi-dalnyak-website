import { useMemo } from "react";
import { useSeo } from "@/hooks/use-seo";
import { DEFAULT_CONTACTS } from "@/lib/contacts";
import { withVisitKey, trackLeadClick } from "@/lib/tracking";
import LpHero from "@/components/lp/LpHero";
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
    title: "Такси межгород для военных и вахтовиков — Дальняк | ДНР, ЛНР, Херсон, Запорожье, вся Россия",
    description:
      "Междугороднее такси для военнослужащих, вахтовиков и сотрудников: по России, в Донецк, Луганск, Мариуполь, Херсон, Запорожье. Фиксированная цена, без предоплаты, 24/7. +7 (995) 645-51-25.",
    path: "/",
    keywords:
      "такси военнослужащему домой, такси для военных межгород, такси из отпуска в часть, такси на новые территории, такси донецк луганск херсон запорожье, такси мариуполь, такси мелитополь, такси бердянск, вахтовые перевозки, корпоративное такси по договору, такси межгород, междугороднее такси, такси дальняк",
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

  const toOrder = () => document.getElementById("order")?.scrollIntoView({ behavior: "smooth" });

  return (
    <main className="min-h-screen bg-black text-white pb-24" style={{ fontFamily: "Manrope, sans-serif" }}>
      <LpHero links={links} onLead={onLead} />
      <LpRoutes onPick={toOrder} />
      <LpSteps />
      <AudienceBlock />
      <ReviewsSlider />
      <LpFaq />
      <section id="order" className="px-5 pb-10 max-w-xl mx-auto scroll-mt-4">
        <h2 className="text-2xl font-bold uppercase text-center mb-5" style={{ fontFamily: "Oswald, sans-serif" }}>
          Закажите поездку сейчас
        </h2>
        <LpCta links={links} onLead={onLead} />
      </section>
      <LpStickyBar links={links} onLead={onLead} />
    </main>
  );
}
