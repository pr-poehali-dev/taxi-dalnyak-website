import Icon from "@/components/ui/icon";
import { HERO_BG, TG_HREF, WA_HREF, VK_HREF, MAX_HREF, PHONE, PHONE_HREF } from "./constants";
import { MaxIcon } from "./MaxIcon";

interface HeroSectionProps {
  onGo: (id: string) => void;
}

export function HeroSection({ onGo }: HeroSectionProps) {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════════════ */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${HERO_BG})` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/55 to-[#0a0a0a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-16 pb-24">
          {/* Бейдж */}
          <div className="inline-flex items-center gap-2 border border-amber/40 bg-amber/5 rounded-full px-5 py-2 mb-6 opacity-0 animate-fade-in" style={{ animationDelay: "0.1s", animationFillMode: "forwards" }}>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-amber text-xs font-bold tracking-widest uppercase">Вся Россия · Новые территории · 24/7</span>
          </div>

          {/* Заголовок */}
          <h1 className="font-black leading-none tracking-tight text-white opacity-0 animate-fade-up"
            style={{ fontFamily: "Oswald", fontSize: "clamp(56px,12vw,120px)", animationDelay: "0.15s", animationFillMode: "forwards" }}>
            ТАКСИ<br /><span className="text-amber">ДАЛЬНЯК</span>
          </h1>

          {/* Подзаголовок */}
          <p className="mt-5 text-lg sm:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-up"
            style={{ animationDelay: "0.3s", animationFillMode: "forwards" }}>
            Межгородное такси от 200 км.<br />
            <span className="text-white font-semibold">Фиксированная цена — знаешь сумму до посадки.</span>
          </p>

          {/* Цены быстро */}
          <div className="mt-6 flex flex-wrap gap-3 justify-center opacity-0 animate-fade-up" style={{ animationDelay: "0.4s", animationFillMode: "forwards" }}>
            {[{ l: "Стандарт", p: "30₽/км" }, { l: "Комфорт", p: "40₽/км" }, { l: "Минивэн", p: "50₽/км" }].map(t => (
              <div key={t.l} className="bg-white/8 border border-white/10 rounded-xl px-4 py-2 text-sm">
                <span className="text-white/50">{t.l} </span>
                <span className="font-bold text-amber" style={{ fontFamily: "Oswald" }}>{t.p}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center opacity-0 animate-fade-up" style={{ animationDelay: "0.5s", animationFillMode: "forwards" }}>
            <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-0.5 bg-sky-500 hover:bg-sky-400 active:scale-[0.97] text-white px-8 py-3.5 rounded-2xl transition shadow-xl shadow-sky-500/25"
              style={{ fontFamily: "Oswald" }}>
              <span className="flex items-center gap-2 font-black text-lg"><Icon name="Send" size={22} />Узнать стоимость</span>
              <span className="text-xs font-normal opacity-75 tracking-normal" style={{ fontFamily: "'Golos Text', sans-serif" }}>откроется Telegram</span>
            </a>
            <a href={PHONE_HREF}
              className="flex items-center justify-center gap-2.5 border-2 border-amber/60 text-amber hover:bg-amber hover:text-coal font-black text-lg px-8 py-4 rounded-2xl transition"
              style={{ fontFamily: "Oswald" }}>
              <Icon name="Phone" size={22} />{PHONE}
            </a>
          </div>

          {/* Мессенджеры */}
          <div className="mt-4 flex gap-3 justify-center opacity-0 animate-fade-in" style={{ animationDelay: "0.7s", animationFillMode: "forwards" }}>
            <a href={WA_HREF} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-bold text-green-400 border border-green-600/30 bg-green-600/10 hover:bg-green-600/20 px-4 py-2 rounded-xl transition">
              <Icon name="MessageCircle" size={15} />WhatsApp
            </a>
            <a href={VK_HREF} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-bold text-blue-400 border border-blue-600/30 bg-blue-600/10 hover:bg-blue-600/20 px-4 py-2 rounded-xl transition">
              <Icon name="Users" size={15} />ВКонтакте
            </a>
            <a href={MAX_HREF} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm font-bold text-white border border-[#005FF9]/40 bg-[#005FF9]/15 hover:bg-[#005FF9]/25 px-4 py-2 rounded-xl transition">
              <MaxIcon size={16} />MAX
            </a>
          </div>

          {/* Скролл-подсказка */}
          <div className="mt-12 flex flex-col items-center gap-2 opacity-0 animate-fade-in" style={{ animationDelay: "1.2s", animationFillMode: "forwards" }}>
            <span className="text-white/20 text-xs tracking-[0.3em] uppercase">Листать вниз</span>
            <div className="w-px h-10 bg-gradient-to-b from-amber/50 to-transparent" />
          </div>
        </div>
      </section>

      {/* ── Полоса статистики ── */}
      <div className="border-y border-white/10 bg-white/[0.02]">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { v: "50 000+", l: "Выполненных поездок" },
            { v: "5+ лет",  l: "Работаем на рынке"   },
            { v: "24 / 7",  l: "Принимаем заказы"    },
            { v: "≥ 200 км",l: "Минимальный маршрут" },
          ].map(s => (
            <div key={s.v} className="text-center">
              <div className="font-black text-2xl sm:text-3xl text-amber" style={{ fontFamily: "Oswald" }}>{s.v}</div>
              <div className="text-xs text-white/40 mt-1">{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
