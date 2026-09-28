import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { ROUTE_LANDINGS, OTHER_LANDINGS } from "@/lib/routeLandings";

const NAVY = "#0d1b2e";
const NAVY_DEEP = "#081321";
const CARD = "#13263d";
const LINE = "rgba(255,255,255,0.09)";
const ORANGE = "#ff7a1a";
const ORANGE2 = "#ff9f45";
const MUTED = "rgba(255,255,255,0.62)";
const F = "Manrope, system-ui, sans-serif";

const SITE = "https://taxidalnyack.ru";

export default function Pages() {
  const [copied, setCopied] = useState("");

  useEffect(() => {
    document.title = "Все посадочные страницы | Такси Дальняк";
    let m = document.querySelector('meta[name="robots"]');
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute("name", "robots");
      document.head.appendChild(m);
    }
    m.setAttribute("content", "noindex, nofollow");
    return () => m?.setAttribute("content", "index, follow");
  }, []);

  const copy = async (path: string) => {
    const url = SITE + path;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.createElement("textarea");
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(path);
    window.setTimeout(() => setCopied((c) => (c === path ? "" : c)), 1600);
  };

  const Row = ({
    path, title, note, icon, accent,
  }: { path: string; title: string; note: string; icon: string; accent?: boolean }) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: CARD,
        border: accent ? "1px solid rgba(255,122,26,0.34)" : `1px solid ${LINE}`,
        borderRadius: 14,
        padding: "12px 13px",
      }}
    >
      <div
        style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: "grid", placeItems: "center",
          background: "rgba(255,122,26,0.12)", color: ORANGE2,
        }}
      >
        <Icon name={icon} size={19} />
      </div>

      <Link to={path} style={{ flex: 1, minWidth: 0, color: "#fff" }}>
        <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.2 }}>{title}</div>
        <div style={{ color: MUTED, fontSize: 13, marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {note} · {path}
        </div>
      </Link>

      <button
        type="button"
        onClick={() => copy(path)}
        aria-label={`Скопировать ссылку ${path}`}
        style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: "grid", placeItems: "center",
          background: copied === path ? `linear-gradient(135deg, ${ORANGE2}, ${ORANGE})` : "rgba(255,255,255,0.07)",
          border: `1px solid ${LINE}`, color: copied === path ? "#10192a" : "#fff", cursor: "pointer",
        }}
      >
        <Icon name={copied === path ? "Check" : "Copy"} size={17} />
      </button>

      <Link
        to={path}
        style={{
          width: 38, height: 38, borderRadius: 11, flexShrink: 0, display: "grid", placeItems: "center",
          background: "rgba(255,255,255,0.07)", border: `1px solid ${LINE}`, color: "#fff",
        }}
      >
        <Icon name="ArrowRight" size={17} />
      </Link>
    </div>
  );

  const H = ({ children }: { children: React.ReactNode }) => (
    <h2 style={{ fontFamily: F, fontWeight: 800, fontSize: 20, marginBottom: 12, letterSpacing: "-0.02em" }}>
      {children}
    </h2>
  );

  return (
    <main style={{ background: NAVY, minHeight: "100dvh", fontFamily: F, color: "#fff", padding: "28px 16px 48px" }}>
      <div style={{ maxWidth: 620, margin: "0 auto" }}>
        <h1 style={{ fontFamily: F, fontWeight: 800, fontSize: "clamp(26px,7vw,36px)", letterSpacing: "-0.03em", marginBottom: 6 }}>
          Посадочные <span style={{ color: ORANGE2 }}>страницы</span>
        </h1>
        <p style={{ color: MUTED, fontSize: 14.5, marginBottom: 26, lineHeight: 1.45 }}>
          Все ссылки для рекламы в одном месте. Нажми на копию — ссылка попадёт в буфер обмена.
        </p>

        <section style={{ marginBottom: 28 }}>
          <H>Маршруты ({ROUTE_LANDINGS.length})</H>
          <div style={{ display: "grid", gap: 9 }}>
            {ROUTE_LANDINGS.map((r) => (
              <Row
                key={r.slug}
                accent
                path={`/${r.slug}`}
                title={`${r.from} — ${r.to}`}
                note={`от ${r.priceFrom}`}
                icon="Route"
              />
            ))}
          </div>
        </section>

        <section>
          <H>Остальные страницы</H>
          <div style={{ display: "grid", gap: 9 }}>
            {OTHER_LANDINGS.map((p) => (
              <Row key={p.path} path={p.path} title={p.title} note={p.note} icon={p.icon} />
            ))}
          </div>
        </section>

        <p
          style={{
            marginTop: 26, padding: "13px 14px", borderRadius: 13,
            background: NAVY_DEEP, border: `1px solid ${LINE}`,
            color: MUTED, fontSize: 13.5, lineHeight: 1.5,
          }}
        >
          Страница служебная: закрыта от поисковиков и не видна посетителям сайта. Открывается по адресу{" "}
          <span style={{ color: ORANGE2, fontWeight: 700 }}>/pages</span>.
        </p>
      </div>
    </main>
  );
}
