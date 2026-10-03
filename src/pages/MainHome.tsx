import { useMemo } from "react";
import { useSeo } from "@/hooks/use-seo";
import { DEFAULT_CONTACTS } from "@/lib/contacts";
import { withVisitKey, trackLeadClick } from "@/lib/tracking";
import MainHero from "@/components/main/MainHero";
import ContactButtons from "@/components/main/ContactButtons";
import TariffSlider from "@/components/main/TariffSlider";
import BottomNav from "@/components/main/BottomNav";
import ServicesBlock from "@/components/main/ServicesBlock";
import AdvantagesBlock from "@/components/main/AdvantagesBlock";
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

export default function MainHome() {
  const { PHONE, PHONE_HREF, TG_HREF, MAX_HREF } = DEFAULT_CONTACTS;

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

  return (
    <main className="min-h-screen bg-black text-white pb-20" style={{ fontFamily: "Manrope, sans-serif" }}>
      <MainHero />
      <ContactButtons id="contacts" links={links} phone={PHONE} onLead={onLead} />
      <TariffSlider links={links} onLead={onLead} />
      <ServicesBlock />
      <ContactButtons links={links} phone={PHONE} onLead={onLead} />
      <AdvantagesBlock />
      <AudienceBlock />
      <ReviewsSlider />
      <ContactButtons links={links} phone={PHONE} onLead={onLead} />
      <BottomNav />
    </main>
  );
}
