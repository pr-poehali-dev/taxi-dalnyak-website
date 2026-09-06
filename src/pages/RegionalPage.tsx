import { useEffect, useMemo, useState } from "react";
import { DEFAULT_CONTACTS, type Contacts } from "@/lib/contacts";
import FloatingContacts from "@/components/FloatingContacts";
import { routeFromQuery } from "@/lib/routeFromQuery";
import { BASE_REVIEWS, ymGoal, ymLead, type RegionConfig } from "@/components/regional/shared";
import { useRegionalSeo } from "@/components/regional/useRegionalSeo";
import RegionalHero from "@/components/regional/RegionalHero";
import RegionalContent from "@/components/regional/RegionalContent";
import RegionalCta from "@/components/regional/RegionalCta";

export type { RegionConfig };

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

  useRegionalSeo(config, PHONE);

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
      <div className="min-h-[100dvh] w-full text-white flex flex-col" style={{ background: "#070b14", fontFamily: "Inter, sans-serif" }}>
        <style>{`
          @keyframes ctaPulse{0%,100%{box-shadow:0 4px 24px rgba(201,168,76,0.45),0 0 0 0 rgba(201,168,76,0.25)}50%{box-shadow:0 4px 24px rgba(201,168,76,0.7),0 0 0 12px rgba(201,168,76,0)}}
          .cta-gold{animation:ctaPulse 2.6s ease-out infinite}
        `}</style>

        <RegionalHero
          config={config}
          splash={splash}
          menuOpen={menuOpen}
          setMenuOpen={setMenuOpen}
          queryRoute={queryRoute}
          PHONE={PHONE}
          PHONE_HREF={PHONE_HREF}
          utmParams={utmParams}
          source={source}
        />

        <RegionalContent
          config={config}
          allRoutes={allRoutes}
          setAllRoutes={setAllRoutes}
          reviews={reviews}
        />

        {!config.short && (
          <FloatingContacts
            contacts={contacts}
            onLead={(ch) => { ymGoal(`float_${ch}`, { city: config.slug }); ymLead(ch, utmParams, source); }}
          />
        )}

        <RegionalCta
          config={config}
          PHONE={PHONE}
          PHONE_HREF={PHONE_HREF}
          TG_HREF={TG_HREF}
          vkHref={vkHref}
          maxHref={maxHref}
          utmParams={utmParams}
          source={source}
        />

      </div>
    </>
  );
}
