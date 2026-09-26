import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { DIRECT_ADS_CONTACTS } from "@/lib/contacts";
import { routeFromQuery, cityFromQuery, cityRod } from "@/lib/routeFromQuery";
import { GOLD, GOLD2, LOGO, ymGoal, ymLead } from "@/components/regional/shared";

const NAVY = "#0b0b0d";
const TG_BLUE = "#229ED9";
const TG_BLUE2 = "#2ab3ec";
const LITE_BG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/61968b78-9167-454f-a663-0eb20d9c02fe.jpg";
// Ведём в канал на конкретный пост. Скрипт tgtrack перехватывает клик
// по ссылке с этим адресом и сам проставляет метки — UTM тут не нужны.
const LITE_TG_POST = "https://t.me/gorodvgorode1/52";

export default function Lite() {
  const { PHONE, PHONE_HREF } = DIRECT_ADS_CONTACTS;
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

  const route = useMemo(() => routeFromQuery(utm.term), [utm.term]);
  const city = useMemo(() => cityFromQuery(utm.term), [utm.term]);

  const title = route
    ? `Такси ${route.from} — ${route.to}`
    : city
    ? `Такси межгород из ${cityRod(city)}`
    : "Такси из города в город";

  const sub = route
    ? `Прямой рейс ${route.from} – ${route.to} · от 200 км`
    : city
    ? `Из ${cityRod(city)} в любой город России · от 200 км`
    : "Междугородние поездки от 200 км по всей России";

  useEffect(() => {
    document.title = `${title} · фиксированная цена | Такси Дальняк`;
    const desc = `${title}. Поездки от 200 км, цена фиксируется до выезда, машина только за вами. Узнать стоимость в Telegram или по телефону ${PHONE}.`;
    let m = document.querySelector('meta[name="description"]');
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute("name", "description");
      document.head.appendChild(m);
    }
    m.setAttribute("content", desc);
    let r = document.querySelector('link[rel="canonical"]');
    if (!r) {
      r = document.createElement("link");
      r.setAttribute("rel", "canonical");
      document.head.appendChild(r);
    }
    r.setAttribute("href", "https://taxidalnyack.ru/lite");
  }, [title, PHONE]);

  useEffect(() => {
    ymGoal("view_lite");
  }, []);

  const tgHref = LITE_TG_POST;

  return (
    <main
      style={{
        minHeight: "100dvh",
        background: NAVY,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "28px 18px 34px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url(${LITE_BG})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          opacity: 0.62,
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, rgba(11,11,13,0.82) 0%, rgba(11,11,13,0.58) 42%, rgba(11,11,13,0.9) 100%)`,
        }}
      />

      <div style={{ position: "relative", width: "100%", maxWidth: 460, textAlign: "center" }}>
        <img
          src={LOGO}
          alt="Такси Дальняк"
          width={56}
          height={56}
          style={{ width: 56, height: 56, borderRadius: 14, marginBottom: 18, objectFit: "cover", display: "block", marginLeft: "auto", marginRight: "auto" }}
        />

        <div
          className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5"
          style={{ background: "rgba(201,168,76,0.1)", border: `1px solid rgba(201,168,76,0.25)`, marginBottom: 14 }}
        >
          <Icon name="MapPin" size={12} style={{ color: GOLD }} />
          <span style={{ color: GOLD, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.18em" }}>
            Межгород · от 200 км
          </span>
        </div>

        <h1
          style={{
            fontFamily: "Oswald",
            fontWeight: 900,
            fontSize: "clamp(28px,8vw,46px)",
            lineHeight: 1.03,
            textTransform: "uppercase",
            color: "#fff",
            letterSpacing: "-0.01em",
            marginBottom: 12,
          }}
        >
          {route ? (
            <>
              Такси{" "}
              <span style={{ color: GOLD }}>
                {route.from} — {route.to}
              </span>
            </>
          ) : city ? (
            <>
              Такси межгород{" "}
              <span style={{ color: GOLD }}>из {cityRod(city)}</span>
            </>
          ) : (
            <>
              Такси{" "}
              <span style={{ color: GOLD }}>из города в город</span>
            </>
          )}
        </h1>

        <p style={{ fontFamily: "Oswald", color: GOLD2, fontSize: "clamp(14px,3.4vw,18px)", fontWeight: 600, marginBottom: 22 }}>
          {sub}
        </p>

        <a
          href={tgHref}
          target="_blank"
          rel="noopener"
          onClick={() => ymLead("telegram", utm, "lite")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            width: "100%",
            background: `linear-gradient(135deg, ${TG_BLUE2}, ${TG_BLUE})`,
            color: "#fff",
            borderRadius: 16,
            padding: "18px 20px",
            fontFamily: "Oswald",
            fontWeight: 800,
            fontSize: "clamp(17px,4.6vw,21px)",
            textTransform: "uppercase",
            letterSpacing: "0.02em",
            boxShadow: "0 14px 34px rgba(34,158,217,0.38)",
            marginBottom: 10,
          }}
        >
          <Icon name="Send" size={22} />
          Узнать стоимость
        </a>

        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 20 }}>
          Ответим в Telegram за 2 минуты · без предоплаты
        </p>

        <a
          href={PHONE_HREF}
          onClick={() => ymLead("call", utm, "lite")}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            width: "100%",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.14)",
            color: "#fff",
            borderRadius: 16,
            padding: "15px 20px",
            fontFamily: "Oswald",
            fontWeight: 700,
            fontSize: "clamp(16px,4.2vw,19px)",
            marginBottom: 24,
          }}
        >
          <Icon name="Phone" size={19} style={{ color: GOLD }} />
          {PHONE}
        </a>

        <ul
          style={{
            display: "grid",
            gap: 9,
            textAlign: "left",
            color: "rgba(255,255,255,0.62)",
            fontSize: 14,
            lineHeight: 1.45,
          }}
        >
          {[
            "Цену фиксируем до выезда — в дороге не меняется",
            "Машина едет только за вами, без попутчиков",
            "Подача к подъезду в любое время суток",
          ].map((t) => (
            <li key={t} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
              <Icon name="Check" size={16} style={{ color: GOLD, flexShrink: 0, marginTop: 2 }} />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}