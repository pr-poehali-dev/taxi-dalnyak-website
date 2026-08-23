import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Icon from "@/components/ui/icon";

const NAVY = "#0a0f1e";
const GOLD = "#c9a84c";
const GOLD2 = "#e8c96a";
const BORDER = "1px solid rgba(201,168,76,0.25)";

const PHONE = "+7 (995) 645-51-25";
const PHONE_HREF = "tel:+79956455125";

const LINKS = [
  { label: "Главная", href: "/", icon: "Home", sub: "Заказать такси" },
  { label: "Тарифы", href: "/tariffs", icon: "Car", sub: "Наши авто и цены" },
  { label: "Отзывы", href: "/reviews", icon: "Star", sub: "Что говорят клиенты" },
  { label: "Москва", href: "/moskva", icon: "MapPin", sub: "Другие направления" },
];

export default function PageNotFound() {
  const location = useLocation();

  useEffect(() => {
    document.title = "Страница не найдена — Такси Дальняк";

    let robots = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content = "noindex, nofollow";

    const canonical = document.querySelector('link[rel="canonical"]');
    canonical?.remove();

    const status = document.createElement("meta");
    status.name = "prerender-status-code";
    status.content = "404";
    document.head.appendChild(status);

    return () => {
      if (robots) robots.content = "index, follow";
      status.remove();
    };
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: NAVY }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: "rgba(201,168,76,0.1)", border: BORDER }}
          >
            <Icon name="MapPinOff" size={28} style={{ color: GOLD }} fallback="MapPin" />
          </div>

          <div
            style={{
              fontFamily: "Oswald",
              fontWeight: 900,
              fontSize: 64,
              lineHeight: 1,
              background: `linear-gradient(${GOLD2},${GOLD})`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            404
          </div>

          <h1
            style={{
              fontFamily: "Oswald",
              fontWeight: 800,
              fontSize: 22,
              color: "#fff",
              textTransform: "uppercase",
              marginTop: 10,
            }}
          >
            Такой страницы нет
          </h1>

          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 13.5, lineHeight: 1.6, marginTop: 10 }}>
            Возможно, адрес набран с ошибкой или страницу удалили. Но мы всё так же возим
            из города в город — выберите, куда дальше.
          </p>
        </div>

        <a
          href={PHONE_HREF}
          className="flex items-center justify-center gap-3 w-full rounded-2xl py-4 mb-3 transition-transform active:scale-[0.97] hover:scale-[1.01]"
          style={{ background: `linear-gradient(135deg,${GOLD2},${GOLD})` }}
        >
          <Icon name="Phone" size={18} style={{ color: NAVY }} />
          <div>
            <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 15, color: NAVY, textTransform: "uppercase" }}>
              Позвонить диспетчеру
            </div>
            <div style={{ fontSize: 11, color: "rgba(10,15,30,0.65)", fontWeight: 600, textAlign: "center" }}>
              {PHONE}
            </div>
          </div>
        </a>

        <div className="grid grid-cols-2 gap-2.5">
          {LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="flex flex-col gap-1.5 rounded-2xl px-3.5 py-3.5 transition-transform hover:scale-[1.02] active:scale-[0.97]"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <Icon name={l.icon} size={17} style={{ color: GOLD }} fallback="CircleAlert" />
              <div>
                <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{l.label}</div>
                <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10.5, marginTop: 1 }}>{l.sub}</div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
