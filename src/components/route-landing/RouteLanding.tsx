import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { DEFAULT_CONTACTS } from "@/lib/contacts";
import { ymGoal, ymLead } from "@/components/regional/shared";
import { withVisitKey } from "@/lib/tracking";

const NAVY = "#0d1b2e";
const NAVY_DEEP = "#081321";
const CARD = "#13263d";
const LINE = "rgba(255,255,255,0.09)";
const ORANGE = "#ff7a1a";
const ORANGE2 = "#ff9f45";
const MUTED = "rgba(255,255,255,0.62)";

const F = "Manrope, system-ui, sans-serif";

const PHOTOS = [
  { src: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/dcda6258-21cd-407d-a1ec-0bb7c13f348b.jpg", alt: "Автомобиль для междугородней поездки" },
  { src: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/38f8c2aa-ebc6-4a58-bedb-3322efbce272.jpg", alt: "Бизнес-седан Toyota Camry" },
  { src: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/238966ba-ee86-4f06-bc36-0872f043ebfb.jpg", alt: "Кроссовер для тарифа Комфорт" },
  { src: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/92a14984-9eac-4b0c-aa50-8c49af1c12b7.jpg", alt: "Минивэн на 6 пассажиров" },
  { src: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/39d043f8-acde-4a27-a69c-ebe03e8bd403.jpg", alt: "Седан тарифа Стандарт" },
];

const STEPS = [
  { n: "1", title: "Свяжитесь с нами", desc: "Напишите в Telegram, Макс или позвоните" },
  { n: "2", title: "Назовите детали", desc: "Дата, время, адрес подачи и тариф" },
  { n: "3", title: "Подаём машину", desc: "Подтверждаем заказ и подаём авто вовремя" },
];

const TRUST = [
  "Проверенные водители со стажем",
  "Фикс-цена — не меняется после подтверждения",
  "Оплата после посадки",
  "Поддержка 24/7 в пути",
  "Возврат предоплаты при отмене по нашей вине",
];

export interface RouteTariff {
  name: string;
  price: string;
  desc: string;
  icon: string;
  hit?: boolean;
}

export interface RouteLandingConfig {
  slug: string;
  goalKey: string;
  from: string;
  to: string;
  fromPrep: string;
  badge: string;
  km: string;
  priceFrom: string;
  /** Название платной трассы. Если её на маршруте нет — не указывай. */
  tollLabel?: string;
  /** Чем заменить упоминание платной дороги, когда её нет. */
  tollAlt?: { included: string; hero: string; note: string; seo: string };
  tariffs: RouteTariff[];
  /** Город назначения в предложном падеже — нужен, чтобы собрать обратный маршрут. */
  toPrep?: string;
  /** Адрес обратного направления. По умолчанию части слага меняются местами. */
  reverseSlug?: string;
}

type Btn = { kind: "tg" | "max" | "phone"; href: string; label: string; icon: string };

export default function RouteLanding({ config }: { config: RouteLandingConfig }) {
  const { PHONE, PHONE_HREF, TG_HREF, MAX_HREF } = DEFAULT_CONTACTS;
  const [utm, setUtm] = useState({ source: "direct", medium: "none", campaign: "none", term: "", content: "none" });

  const routeName = `${config.from} — ${config.to}`;

  const toll = config.tollAlt ?? {
    included: "Все дорожные расходы включены",
    hero: "Платная дорога включена.",
    note: "Все расходы в пути включены.",
    seo: "все расходы в пути включены",
  };

  const INCLUDED = [
    { icon: "Home", text: `Подача к подъезду ${config.fromPrep}` },
    { icon: "Route", text: `Поездка ${routeName} (${config.km})` },
    { icon: "TicketCheck", text: config.tollLabel ? `${config.tollLabel} включена` : toll.included },
    { icon: "Luggage", text: "Багаж: 2 чемодана + ручная кладь" },
    { icon: "Clock", text: "Ожидание 15 минут бесплатно" },
    { icon: "Baby", text: "Детское кресло — по запросу" },
    { icon: "CreditCard", text: "Оплата: наличные / карта / перевод" },
  ];

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
    document.title = `Такси ${routeName} · фикс-цена ${config.priceFrom} | Такси Дальняк`;
    const desc =
      `Такси ${routeName} по фиксированной цене от ${config.priceFrom} под ключ. Без попутчиков, ` +
      `${config.tollLabel ? config.tollLabel.toLowerCase() + " включена" : toll.seo}, подача к подъезду. ` +
      `Звоните ${PHONE} круглосуточно.`;
    const set = (sel: string, make: () => Element, attr: string, val: string) => {
      let el = document.querySelector(sel);
      if (!el) { el = make(); document.head.appendChild(el); }
      el.setAttribute(attr, val);
    };
    set('meta[name="description"]', () => {
      const m = document.createElement("meta"); m.setAttribute("name", "description"); return m;
    }, "content", desc);
    set('link[rel="canonical"]', () => {
      const l = document.createElement("link"); l.setAttribute("rel", "canonical"); return l;
    }, "href", `https://taxidalnyack.ru/${config.slug}`);
    ymGoal(`view_${config.goalKey}`);
  }, [PHONE, routeName, config.priceFrom, config.slug, config.goalKey, config.tollLabel, toll.seo]);

  const BTNS: Btn[] = [
    { kind: "tg", href: withVisitKey(TG_HREF), label: "Telegram", icon: "Send" },
    { kind: "max", href: withVisitKey(MAX_HREF), label: "Макс", icon: "MessageCircle" },
    { kind: "phone", href: PHONE_HREF, label: PHONE, icon: "Phone" },
  ];

  const click = (kind: string, place: string) => {
    ymGoal(`click_${kind}_${config.goalKey}`);
    ymGoal(`${config.goalKey}_${place}_${kind}`);
    ymLead(kind, utm, config.goalKey);
  };

  const CtaRow = ({ place }: { place: string }) => (
    <div style={{ display: "grid", gap: 10, gridTemplateColumns: "1fr", width: "100%" }}>
      {BTNS.map((b) => {
        const primary = b.kind === "phone";
        return (
          <a
            key={b.kind}
            href={b.href}
            target={b.kind === "phone" ? undefined : "_blank"}
            rel={b.kind === "phone" ? undefined : "noopener"}
            onClick={() => click(b.kind, place)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "16px 18px",
              borderRadius: 14,
              fontFamily: F,
              fontWeight: 800,
              fontSize: primary ? "clamp(17px,4.6vw,21px)" : "clamp(15px,4vw,18px)",
              letterSpacing: "0.005em",
              background: primary ? `linear-gradient(135deg, ${ORANGE2}, ${ORANGE})` : "rgba(255,255,255,0.07)",
              color: primary ? "#10192a" : "#fff",
              border: primary ? "none" : `1px solid ${LINE}`,
              boxShadow: primary ? "0 12px 30px rgba(255,122,26,0.28)" : "none",
            }}
          >
            <Icon name={b.icon} size={primary ? 22 : 19} />
            {b.label}
          </a>
        );
      })}
    </div>
  );

  const H = ({ children }: { children: React.ReactNode }) => (
    <h2
      style={{
        fontFamily: F,
        fontWeight: 800,
        fontSize: "clamp(22px,5.6vw,32px)",
        lineHeight: 1.15,
        color: "#fff",
        marginBottom: 18,
        letterSpacing: "-0.02em",
      }}
    >
      {children}
    </h2>
  );

  const Section = ({ children, bg }: { children: React.ReactNode; bg?: string }) => (
    <section style={{ background: bg || "transparent", padding: "44px 18px" }}>
      <div style={{ maxWidth: 560, margin: "0 auto" }}>{children}</div>
    </section>
  );

  return (
    <main style={{ background: NAVY, fontFamily: F, color: "#fff", minHeight: "100dvh" }}>
      {/* 1. Первый экран */}
      <section
        style={{
          minHeight: "100dvh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "26px 18px 30px",
          position: "relative",
          overflow: "hidden",
          background: `radial-gradient(120% 70% at 50% 0%, #17304d 0%, ${NAVY} 55%, ${NAVY_DEEP} 100%)`,
        }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto", width: "100%" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              padding: "6px 12px",
              borderRadius: 999,
              background: "rgba(255,122,26,0.12)",
              border: "1px solid rgba(255,122,26,0.3)",
              marginBottom: 16,
            }}
          >
            <Icon name="MapPin" size={12} style={{ color: ORANGE2 }} />
            <span style={{ color: ORANGE2, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase" }}>
              {config.badge}
            </span>
          </div>

          <h1
            style={{
              fontFamily: F,
              fontWeight: 800,
              fontSize: "clamp(32px,9vw,54px)",
              lineHeight: 1.03,
              letterSpacing: "-0.03em",
              marginBottom: 12,
            }}
          >
            Такси <span style={{ color: ORANGE2 }}>{routeName}</span>
          </h1>

          <p style={{ color: MUTED, fontSize: "clamp(15px,3.9vw,18px)", lineHeight: 1.45, marginBottom: 8, fontWeight: 500 }}>
            Фикс-цена под ключ. Без попутчиков. {config.tollLabel ? "Платная дорога включена." : toll.hero}
          </p>

          <div style={{ display: "flex", alignItems: "baseline", gap: 9, marginBottom: 20 }}>
            <span style={{ color: MUTED, fontSize: 14 }}>от</span>
            <span style={{ fontSize: "clamp(30px,8vw,42px)", fontWeight: 800, color: "#fff", letterSpacing: "-0.02em" }}>
              {config.priceFrom}
            </span>
            <span style={{ color: MUTED, fontSize: 14 }}>за машину целиком</span>
          </div>

          <CtaRow place="hero" />

          <p style={{ color: MUTED, fontSize: 13.5, marginTop: 14, textAlign: "center" }}>
            Отвечаем за 5 минут. Подтверждение сразу.
          </p>
        </div>
      </section>

      {/* 2. Тарифы */}
      <Section bg={NAVY_DEEP}>
        <H>{config.tariffs.length > 1 ? "Тарифы" : "Цена поездки"}</H>
        <div style={{ display: "grid", gap: 12 }}>
          {config.tariffs.map((t) => (
            <div
              key={t.name}
              style={{
                background: CARD,
                border: t.hit ? `1px solid rgba(255,122,26,0.42)` : `1px solid ${LINE}`,
                borderRadius: 18,
                padding: "18px 18px 16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center",
                      background: "rgba(255,122,26,0.13)", color: ORANGE2, flexShrink: 0,
                    }}
                  >
                    <Icon name={t.icon} size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 800 }}>{t.name}</div>
                    {t.hit && (
                      <div style={{ fontSize: 11, fontWeight: 700, color: ORANGE2, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                        Популярный
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ fontSize: "clamp(20px,5.4vw,25px)", fontWeight: 800, whiteSpace: "nowrap" }}>{t.price}</div>
              </div>
              <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.4, marginBottom: 14 }}>{t.desc}</p>
              <a
                href={PHONE_HREF}
                onClick={() => click("phone", `tariff_${t.name.toLowerCase()}`)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "13px 16px", borderRadius: 12,
                  background: `linear-gradient(135deg, ${ORANGE2}, ${ORANGE})`,
                  color: "#10192a", fontWeight: 800, fontSize: 16,
                }}
              >
                <Icon name="Phone" size={18} />
                Забронировать
              </a>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
                <a
                  href={withVisitKey(TG_HREF)} target="_blank" rel="noopener"
                  onClick={() => click("tg", `tariff_${t.name.toLowerCase()}`)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    padding: "11px 10px", borderRadius: 12, background: "rgba(255,255,255,0.07)",
                    border: `1px solid ${LINE}`, color: "#fff", fontWeight: 700, fontSize: 14.5,
                  }}
                >
                  <Icon name="Send" size={16} /> Telegram
                </a>
                <a
                  href={withVisitKey(MAX_HREF)} target="_blank" rel="noopener"
                  onClick={() => click("max", `tariff_${t.name.toLowerCase()}`)}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                    padding: "11px 10px", borderRadius: 12, background: "rgba(255,255,255,0.07)",
                    border: `1px solid ${LINE}`, color: "#fff", fontWeight: 700, fontSize: 14.5,
                  }}
                >
                  <Icon name="MessageCircle" size={16} /> Макс
                </a>
              </div>
            </div>
          ))}
        </div>
        <p
          style={{
            marginTop: 16, textAlign: "center", color: ORANGE2,
            fontWeight: 700, fontSize: 15, lineHeight: 1.4,
          }}
        >
          Фикс-цена. {config.tollLabel ? `${config.tollLabel} включена.` : toll.note} Без доплат.
        </p>
      </Section>

      {/* 3. Что входит в цену */}
      <Section>
        <H>Что входит в цену</H>
        <ul style={{ display: "grid", gap: 11 }}>
          {INCLUDED.map((i) => (
            <li key={i.text} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div
                style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0, display: "grid", placeItems: "center",
                  background: "rgba(255,255,255,0.06)", border: `1px solid ${LINE}`, color: ORANGE2,
                }}
              >
                <Icon name={i.icon} size={18} />
              </div>
              <span style={{ fontSize: 15.5, lineHeight: 1.35, color: "rgba(255,255,255,0.88)" }}>{i.text}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* 4. Фото автомобилей */}
      <Section bg={NAVY_DEEP}>
        <H>Наши автомобили</H>
        <div style={{ display: "grid", gap: 10 }}>
          <img
            src={PHOTOS[0].src}
            alt={`${PHOTOS[0].alt} ${routeName}`}
            loading="lazy"
            style={{ width: "100%", aspectRatio: "16/10", objectFit: "cover", borderRadius: 16, border: `1px solid ${LINE}` }}
          />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {PHOTOS.slice(1).map((p) => (
              <img
                key={p.src}
                src={p.src}
                alt={p.alt}
                loading="lazy"
                style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: 14, border: `1px solid ${LINE}` }}
              />
            ))}
          </div>
        </div>
        <p style={{ color: MUTED, fontSize: 13.5, marginTop: 12, textAlign: "center" }}>
          Фото машин нашего парка. Конкретное авто согласуем при бронировании.
        </p>
      </Section>

      {/* 5. Как заказать */}
      <Section>
        <H>Как заказать</H>
        <div style={{ display: "grid", gap: 12 }}>
          {STEPS.map((s) => (
            <div
              key={s.n}
              style={{
                display: "flex", gap: 14, alignItems: "flex-start",
                background: CARD, border: `1px solid ${LINE}`, borderRadius: 16, padding: "15px 16px",
              }}
            >
              <div
                style={{
                  width: 34, height: 34, borderRadius: 999, flexShrink: 0, display: "grid", placeItems: "center",
                  background: `linear-gradient(135deg, ${ORANGE2}, ${ORANGE})`, color: "#10192a", fontWeight: 800, fontSize: 16,
                }}
              >
                {s.n}
              </div>
              <div>
                <div style={{ fontSize: 16.5, fontWeight: 700, marginBottom: 3 }}>{s.title}</div>
                <div style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.4 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* 6. Доверие */}
      <Section bg={NAVY_DEEP}>
        <H>Почему нам доверяют</H>
        <ul style={{ display: "grid", gap: 11 }}>
          {TRUST.map((t) => (
            <li key={t} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
              <Icon name="CircleCheck" size={20} style={{ color: ORANGE2, flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 15.5, lineHeight: 1.38, color: "rgba(255,255,255,0.88)" }}>{t}</span>
            </li>
          ))}
        </ul>
      </Section>

      {/* 7. Финальный CTA */}
      <section
        style={{
          padding: "48px 18px 56px",
          background: `radial-gradient(120% 80% at 50% 100%, #17304d 0%, ${NAVY} 60%)`,
        }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
          <h2
            style={{
              fontFamily: F, fontWeight: 800, fontSize: "clamp(24px,6.4vw,36px)",
              lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: 8,
            }}
          >
            Забронировать <span style={{ color: ORANGE2 }}>{routeName}</span>
          </h2>
          <p style={{ color: MUTED, fontSize: 15, marginBottom: 22 }}>
            Фикс-цена от {config.priceFrom} · машина только за вами
          </p>
          <CtaRow place="bottom" />
          <p style={{ color: MUTED, fontSize: 13.5, marginTop: 14 }}>
            Работаем 24/7. Отвечаем за 5 минут.
          </p>
        </div>
      </section>
    </main>
  );
}