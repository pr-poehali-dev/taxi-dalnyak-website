import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { useSeo } from "@/hooks/use-seo";
import { DEFAULT_CONTACTS } from "@/lib/contacts";
import { withVisitKey, trackLeadClick } from "@/lib/tracking";

const POSTER_WEBP = "/poster-home.webp";
const POSTER_JPG = "/poster-home.jpg";

const IMG_W = 853;
const IMG_H = 1980;

/** Низ достроен продолжением фона — верх макета не смещался. */
const OFFSET_Y = 0;

/** Цвет нижней кромки постера — им заливаем экран, чтобы не было светлой полосы. */
const EDGE_DEEP = "#1d3a63";

const YM_ID = 111028538;

declare global {
  interface Window {
    ym?: (id: number, action: string, goal: string, params?: Record<string, unknown>) => void;
    _tmr?: { push: (o: Record<string, unknown>) => void };
  }
}

function ymGoal(goal: string, params: Record<string, string> = {}) {
  if (typeof window.ym === "function") window.ym(YM_ID, "reachGoal", goal, params);
}

function tmrGoal(goal: string) {
  if (window._tmr) window._tmr.push({ id: "3789002", type: "reachGoal", goal });
}

function pct(v: number, total: number) {
  return `${(v / total) * 100}%`;
}

const HOTSPOTS = [
  { channel: "phone", cx: 304, cy: 1164 + OFFSET_Y, r: 46, label: "Позвонить" },
  { channel: "telegram", cx: 416, cy: 1164 + OFFSET_Y, r: 46, label: "Написать в Telegram" },
  { channel: "max", cx: 523, cy: 1165 + OFFSET_Y, r: 46, label: "Написать в Макс" },
];

export default function PosterHome() {
  const { PHONE, PHONE_HREF, TG_HREF, MAX_HREF } = DEFAULT_CONTACTS;
  const [utm, setUtm] = useState({ source: "direct", medium: "none", campaign: "none", term: "" });

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setUtm({
      source: p.get("utm_source") || "direct",
      medium: p.get("utm_medium") || "none",
      campaign: p.get("utm_campaign") || "none",
      term: p.get("utm_term") || p.get("keyword") || "",
    });
  }, []);

  useSeo({
    title: "Заказать такси из города в город от 200 км — Такси Дальняк",
    description:
      "Межгородское такси по России от 200 км. Без попутчиков, цена не меняется, без предоплаты. Звоните +7 (995) 645-51-25 круглосуточно.",
    path: "/",
    keywords: "такси межгород, заказать такси из города в город, междугороднее такси",
  });

  const links = useMemo(
    () => ({
      phone: PHONE_HREF,
      telegram: withVisitKey(TG_HREF),
      max: withVisitKey(MAX_HREF),
    }),
    [PHONE_HREF, TG_HREF, MAX_HREF],
  );

  const lead = (channel: string) => {
    ymGoal("lead", { channel, utm_source: utm.source, utm_campaign: utm.campaign, utm_term: utm.term });
    ymGoal(`lead_${channel}`, { utm_source: utm.source, utm_campaign: utm.campaign });
    tmrGoal("lead");
    tmrGoal(`lead_${channel}`);
    trackLeadClick(channel);
  };

  const href = (c: string) => links[c as keyof typeof links];
  const isExternal = (c: string) => c !== "phone";

  return (
    <main
      style={{
        background: EDGE_DEEP,
        height: "100dvh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <h1 style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0 0 0 0)" }}>
        Заказать такси из города в город от 200 км — Такси Дальняк
      </h1>

      <div
        style={{
          position: "absolute",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 560,
          lineHeight: 0,
        }}
      >
        <picture>
          <source srcSet={POSTER_WEBP} type="image/webp" />
          <img
            src={POSTER_JPG}
            alt="Такси Дальняк — заказать такси из города в город от 200 км. Тарифы: стандарт 32 ₽/км, комфорт 37 ₽/км, комфорт+ 42 ₽/км, минивен 57 ₽/км"
            width={IMG_W}
            height={IMG_H}
            fetchPriority="high"
            decoding="sync"
            style={{ display: "block", width: "100%", height: "auto" }}
          />
        </picture>

        {HOTSPOTS.map((h) => (
          <a
            key={h.channel}
            href={href(h.channel)}
            aria-label={h.label}
            target={isExternal(h.channel) ? "_blank" : undefined}
            rel={isExternal(h.channel) ? "noopener noreferrer" : undefined}
            onClick={() => lead(h.channel)}
            style={{
              position: "absolute",
              left: pct(h.cx - h.r, IMG_W),
              top: pct(h.cy - h.r, IMG_H),
              width: pct(h.r * 2, IMG_W),
              height: pct(h.r * 2, IMG_H),
              borderRadius: "50%",
              display: "block",
              WebkitTapHighlightColor: "rgba(255,255,255,0.35)",
            }}
          />
        ))}
      </div>

      <FloatingButtons phone={PHONE} links={links} onLead={lead} />
    </main>
  );
}

function FloatingButtons({
  phone,
  links,
  onLead,
}: {
  phone: string;
  links: { phone: string; telegram: string; max: string };
  onLead: (c: string) => void;
}) {
  const side = [
    { channel: "telegram", href: links.telegram, icon: "Send", bg: "#2aabee", title: "Telegram" },
    { channel: "max", href: links.max, icon: "MessageCircle", bg: "#7f5af0", title: "Макс" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        right: "max(12px, env(safe-area-inset-right))",
        bottom: "max(20px, calc(env(safe-area-inset-bottom) + 12px))",
        zIndex: 60,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <a
        key={side[0].channel}
        href={side[0].href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={side[0].title}
        onClick={() => onLead(side[0].channel)}
        style={{
          width: 54,
          height: 54,
          flexShrink: 0,
          pointerEvents: "auto",
          borderRadius: "50%",
          background: side[0].bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 5px 18px rgba(0,0,0,0.35)",
          border: "2px solid rgba(255,255,255,0.28)",
        }}
      >
        <Icon name="Send" size={24} style={{ color: "#fff" }} />
      </a>

      <a
        key={side[1].channel}
        href={side[1].href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={side[1].title}
        onClick={() => onLead(side[1].channel)}
        style={{
          width: 54,
          height: 54,
          flexShrink: 0,
          pointerEvents: "auto",
          borderRadius: "50%",
          background: side[1].bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 5px 18px rgba(0,0,0,0.35)",
          border: "2px solid rgba(255,255,255,0.28)",
        }}
      >
        <Icon name="MessageCircle" size={24} style={{ color: "#fff" }} />
      </a>

      <a
        href={links.phone}
        aria-label={`Позвонить ${phone}`}
        onClick={() => onLead("phone")}
        style={{
          width: 66,
          height: 66,
          flexShrink: 0,
          pointerEvents: "auto",
          borderRadius: "50%",
          background: "linear-gradient(135deg,#c9a84c,#e0c574)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 8px 26px rgba(201,168,76,0.5)",
          border: "2px solid rgba(255,255,255,0.3)",
          animation: "fabPulse 2.4s ease-out infinite",
        }}
      >
        <Icon name="PhoneCall" size={29} style={{ color: "#12233d" }} />
      </a>

      <style>{`
        @keyframes fabPulse {
          0%,100% { box-shadow: 0 8px 26px rgba(201,168,76,0.5), 0 0 0 0 rgba(201,168,76,0.45) }
          50%     { box-shadow: 0 8px 26px rgba(201,168,76,0.5), 0 0 0 14px rgba(201,168,76,0) }
        }
      `}</style>
    </div>
  );
}