import Icon from "@/components/ui/icon";
import {
  GOLD, GOLD2, MAX_LOGO,
  ymGoal, ymLead,
  type RegionConfig, type UtmParams,
} from "@/components/regional/shared";

interface Props {
  config: RegionConfig;
  PHONE: string;
  PHONE_HREF: string;
  TG_HREF: string;
  vkHref: string;
  maxHref: string;
  utmParams: UtmParams;
  source?: string;
}

export default function RegionalCta({
  config, PHONE, PHONE_HREF, TG_HREF, vkHref, maxHref, utmParams, source,
}: Props) {
  return (
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
  );
}
