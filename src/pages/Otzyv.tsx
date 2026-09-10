import { useEffect } from "react";
import Icon from "@/components/ui/icon";
import { GOLD, GOLD2, ymGoal } from "@/components/regional/shared";

const YA_REVIEW_URL = "https://yandex.ru/maps/org/82867613833/reviews/";

export default function Otzyv() {
  useEffect(() => {
    document.title = "Оставить отзыв — Такси Дальняк";
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    ymGoal("otzyv_page_open");
    const t = setTimeout(() => {
      window.location.replace(YA_REVIEW_URL);
    }, 1200);
    return () => {
      clearTimeout(t);
      meta.remove();
    };
  }, []);

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center px-5"
      style={{ background: "#070b14", fontFamily: "Inter, sans-serif" }}>
      <div className="w-full max-w-sm text-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
          <Icon name="Star" size={30} style={{ color: "#0a0f1e" }} className="fill-[#0a0f1e]" />
        </div>

        <h1 style={{ fontFamily: "Oswald", color: "#fff", fontSize: 26, fontWeight: 900, textTransform: "uppercase", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
          Спасибо, что <span style={{ color: GOLD }}>выбрали нас</span>
        </h1>

        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, lineHeight: 1.7, marginTop: 12 }}>
          Открываем страницу отзывов в Яндекс Картах. Ваша оценка занимает меньше минуты и очень помогает нам.
        </p>

        <a href={YA_REVIEW_URL} target="_blank" rel="noopener noreferrer"
          onClick={() => ymGoal("otzyv_page_click")}
          className="flex items-center justify-center gap-2 rounded-2xl py-4 mt-7 transition-transform hover:scale-[1.01] active:scale-[0.98]"
          style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, fontFamily: "Oswald", boxShadow: "0 10px 30px rgba(201,168,76,0.25)" }}>
          <Icon name="Star" size={17} style={{ color: "#0a0f1e" }} className="fill-[#0a0f1e]" />
          <span style={{ color: "#0a0f1e", fontSize: 15, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Оставить отзыв
          </span>
        </a>

        <p style={{ color: "rgba(255,255,255,0.25)", fontSize: 12, marginTop: 14 }}>
          Если страница не открылась — нажмите кнопку выше
        </p>

        <a href="/" style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 22, display: "inline-block", textDecoration: "underline" }}>
          Вернуться на сайт
        </a>
      </div>
    </div>
  );
}