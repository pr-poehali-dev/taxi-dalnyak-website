import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

declare global { interface Window { ym?: (id: number, action: string, goal: string, params?: Record<string, string>) => void; } }

function ymGoal(goal: string) {
  if (typeof window.ym === "function") window.ym(108400932, "reachGoal", goal);
}

const LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/3a499542-747a-49d2-808e-4c137548c76e.jpg";
const HERO_IMG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/763338a3-9023-4930-8f1f-67cc73d245fc.jpg";
const MAX_LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/cf5e3e58-7d83-4d19-8c48-f91922395adf.png";

const PHONE = "8 (995) 645-51-25";
const PHONE_HREF = "tel:+79956455125";
const TG_HREF = "https://t.me/Mezhgorod1816";
const MAX_HREF = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";

const GUARANTEES = [
  { icon: "Shield",     text: "Довезём в любую точку", sub: "Включая новые территории" },
  { icon: "Clock",      text: "Подача 24/7",            sub: "В любое время суток" },
  { icon: "Banknote",   text: "Наличные / карта",       sub: "Без чека, без вопросов" },
  { icon: "UserCheck",  text: "Трезвый водитель",        sub: "Проверенные, надёжные" },
  { icon: "Lock",       text: "Полная конфиденциальность", sub: "Маршрут только между нами" },
  { icon: "MapPin",     text: "От 500 км",              sub: "Специализируемся на дальних" },
];

const ROUTES = [
  "Донецк – Москва", "Луганск – Питер", "Херсон – Ростов",
  "ДНР – Воронеж", "Запорожье – Москва", "Мариуполь – Краснодар",
  "Донецк – Екатеринбург", "ЛНР – Челябинск", "Херсон – Тюмень",
];

function Splash({ visible }: { visible: boolean }) {
  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0f] transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className="flex flex-col items-center gap-4 text-center px-6">
        <img src={LOGO} alt="Такси Дальняк" className="w-20 h-20 rounded-2xl object-cover shadow-2xl ring-4 ring-[#F5A800]/40" />
        <div style={{ fontFamily: "Oswald" }}>
          <div className="text-[10px] uppercase tracking-[0.4em] text-[#F5A800] font-bold">Такси</div>
          <div className="text-3xl font-black uppercase text-white mt-0.5">Дальняк</div>
          <div className="text-sm text-white/40 mt-1">Надёжно. Далеко. Без вопросов.</div>
        </div>
        <div className="w-40 h-[3px] bg-white/10 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-[#F5A800] splash-bar-m" />
        </div>
      </div>
      <style>{`
        @keyframes splashBarM { from { transform:translateX(-100%) } to { transform:translateX(0) } }
        .splash-bar-m { animation: splashBarM 1.0s ease-out forwards; }
      `}</style>
    </div>
  );
}

export default function Military() {
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    document.title = "Такси для военных — дальние маршруты от 500 км | Такси Дальняк";
    const t = setTimeout(() => setSplash(false), 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <Splash visible={splash} />

      <div className="min-h-[100dvh] w-full bg-[#0a0a0f] text-white flex flex-col">
        <style>{`
          @keyframes ctaPulse {
            0%,100% { box-shadow: 0 4px 20px rgba(245,168,0,0.4), 0 0 0 0 rgba(245,168,0,0.3); }
            50%      { box-shadow: 0 4px 20px rgba(245,168,0,0.7), 0 0 0 10px rgba(245,168,0,0); }
          }
          .cta-pulse { animation: ctaPulse 2.4s ease-out infinite; }
          @keyframes fadeUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
          .fade-up { animation: fadeUp 0.6s ease-out forwards; }
        `}</style>

        {/* ШАПКА */}
        <div className="bg-[#111118] px-4 py-3 flex items-center justify-between border-b border-white/8">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="Такси Дальняк" className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#F5A800]/50" fetchPriority="high" />
            <div style={{ fontFamily: "Oswald" }}>
              <div className="text-[9px] uppercase tracking-[0.35em] text-[#F5A800] font-bold leading-none">Такси</div>
              <div className="text-lg font-black uppercase text-white leading-none mt-0.5">Дальняк</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-green-500/15 border border-green-400/30 rounded-full px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse shrink-0" />
            <span className="text-green-300 text-[11px] font-bold uppercase tracking-wide">На связи</span>
          </div>
        </div>

        {/* ГЕРОЙ */}
        <div className="relative overflow-hidden" style={{ minHeight: "56vw", maxHeight: "420px" }}>
          <img
            src={HERO_IMG}
            alt="Такси для военных"
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0a0a0f 0%, rgba(10,10,15,0.55) 55%, rgba(10,10,15,0.15) 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(10,10,15,0.7) 0%, transparent 60%)" }} />

          {/* бейдж конфиденциальности */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#0a0a0f]/80 backdrop-blur-md rounded-full px-3 py-1.5 border border-[#F5A800]/20">
            <Icon name="Lock" size={11} className="text-[#F5A800]" />
            <span className="text-[10px] font-bold text-[#F5A800] uppercase tracking-wider">Конфиденциально</span>
          </div>
        </div>

        {/* ГЛАВНЫЙ ЗАГОЛОВОК */}
        <div className="px-4 pt-5 pb-4 fade-up">
          <div className="inline-flex items-center gap-1.5 bg-[#F5A800]/15 border border-[#F5A800]/30 rounded-full px-3 py-1 mb-3">
            <Icon name="Star" size={11} className="text-[#F5A800] fill-[#F5A800] shrink-0" />
            <span className="text-[#F5A800] text-[11px] font-bold uppercase tracking-wide">Для военнослужащих</span>
          </div>

          <h1 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: "clamp(24px,7vw,42px)", lineHeight: 1.05, textTransform: "uppercase", color: "#fff" }}>
            Такси от 500 км —<br />
            <span style={{ color: "#F5A800" }}>довезём куда нужно</span>
          </h1>

          <p className="text-white/60 text-[13px] leading-relaxed mt-3">
            Работаем с военнослужащими с 2014 года. Знаем специфику — без лишних вопросов, оплата как удобно, подача в любое время.
          </p>
        </div>

        {/* ГАРАНТИИ */}
        <div className="px-4 pb-6">
          <div className="grid grid-cols-2 gap-2.5">
            {GUARANTEES.map((g) => (
              <div key={g.text} className="bg-[#111118] rounded-2xl border border-white/6 p-3.5 flex flex-col gap-1.5">
                <div className="w-8 h-8 rounded-xl bg-[#F5A800]/15 flex items-center justify-center">
                  <Icon name={g.icon as "Shield"} size={16} className="text-[#F5A800]" />
                </div>
                <div className="text-white font-bold text-[12px] leading-snug">{g.text}</div>
                <div className="text-white/40 text-[10px] leading-snug">{g.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* МАРШРУТЫ */}
        <div className="px-4 pb-6">
          <div className="bg-[#111118] rounded-2xl border border-white/6 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Route" size={14} className="text-[#F5A800]" />
              <span style={{ fontFamily: "Oswald" }} className="text-white font-bold uppercase tracking-wide text-sm">Популярные направления</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {ROUTES.map((r) => (
                <span key={r} className="flex items-center gap-1 bg-[#F5A800]/10 border border-[#F5A800]/20 rounded-full px-3 py-1.5 text-[11px] text-[#F5A800] font-semibold">
                  <Icon name="MapPin" size={9} className="shrink-0" />{r}
                </span>
              ))}
            </div>
            <p className="text-white/30 text-[10px] mt-3 italic">Едем в любую точку — включая новые территории РФ</p>
          </div>
        </div>

        {/* БЛОК ДОВЕРИЯ */}
        <div className="px-4 pb-6">
          <div className="relative rounded-2xl overflow-hidden border border-[#F5A800]/15 p-4" style={{ background: "linear-gradient(135deg, #111118 0%, #1a1508 100%)" }}>
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#F5A800] via-[#F5A800]/50 to-transparent" />
            <div style={{ fontFamily: "Oswald" }} className="text-[#F5A800] font-bold uppercase tracking-wide text-sm mb-3">Почему выбирают нас</div>
            <div className="flex flex-col gap-2.5">
              {[
                "Работаем с 2014 года — тысячи выполненных рейсов",
                "Водители знают дорогу через КПП и блокпосты",
                "Фиксированная цена — никаких накруток в пути",
                "Маршрут и данные клиента не разглашаются",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2.5">
                  <Icon name="CheckCircle" size={14} className="text-[#F5A800] shrink-0 mt-0.5" />
                  <span className="text-white/75 text-[12px] leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* СРОЧНЫЙ ПРИЗЫВ */}
        <div className="px-4 pb-4">
          <div className="bg-[#F5A800]/8 border border-[#F5A800]/25 rounded-2xl px-4 py-3 text-center">
            <div style={{ fontFamily: "Oswald" }} className="text-white font-black uppercase text-base tracking-wide">Нужно уехать?</div>
            <div className="text-white/50 text-[12px] mt-0.5">Звоните — ответим сразу, найдём машину быстро</div>
          </div>
        </div>

        {/* КНОПКИ */}
        <div className="sticky bottom-0 bg-[#111118] border-t border-white/8 px-3 py-3 shadow-[0_-8px_32px_rgba(0,0,0,0.8)]">

          <a
            href={PHONE_HREF}
            onClick={() => ymGoal("military_phone_click")}
            className="cta-pulse flex items-center justify-center gap-3 w-full bg-[#F5A800] hover:bg-amber-400 active:scale-[0.98] text-[#0a0a0f] font-black py-4 rounded-2xl transition mb-2"
            style={{ fontFamily: "Oswald" }}
          >
            <Icon name="PhoneCall" size={24} />
            <div className="flex flex-col items-start leading-none">
              <span style={{ fontSize: "clamp(16px,4.5vw,20px)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Позвонить сейчас</span>
              <span className="text-[12px] font-bold opacity-70 mt-0.5">{PHONE}</span>
            </div>
          </a>

          <div className="grid grid-cols-2 gap-2">
            <a
              href={TG_HREF}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => ymGoal("military_telegram_click")}
              className="flex items-center justify-center gap-2 bg-[#229ED9] hover:bg-sky-400 active:scale-95 text-white font-black py-3.5 rounded-2xl transition"
              style={{ fontFamily: "Oswald" }}
            >
              <Icon name="Send" size={20} />
              <span style={{ fontSize: "clamp(13px,3.5vw,16px)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Telegram</span>
            </a>

            <a
              href={MAX_HREF}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => ymGoal("military_max_click")}
              className="flex items-center justify-center gap-2 bg-[#0077FF] hover:bg-blue-500 active:scale-95 text-white font-black py-3.5 rounded-2xl transition"
              style={{ fontFamily: "Oswald" }}
            >
              <img src={MAX_LOGO} alt="МАКС" className="w-6 h-6 rounded-full object-cover shrink-0" loading="lazy" />
              <span style={{ fontSize: "clamp(13px,3.5vw,16px)", textTransform: "uppercase", letterSpacing: "0.04em" }}>МАКС</span>
            </a>
          </div>

        </div>
      </div>
    </>
  );
}
