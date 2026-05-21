import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/3a499542-747a-49d2-808e-4c137548c76e.jpg";
const MAX_LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/cf5e3e58-7d83-4d19-8c48-f91922395adf.png";
const CAR_IMG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/091d3d1c-1649-4d9e-8958-1a624bf8f371.jpg";

const PHONE = "8 (995) 645-51-25";
const PHONE_HREF = "tel:+79956455125";
const TG_HREF = "https://t.me/Mezhgorod1816";
const MAX_HREF = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";

function ymGoal(goal: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).ym?.(98584604, "reachGoal", goal);
}

export default function Quick() {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    document.title = "Такси Дальняк — Заказать межгород";
    const t = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ background: "#0a0a0f" }}>

      {/* фоновое фото с затемнением */}
      <div className="absolute inset-0 z-0">
        <img src={CAR_IMG} alt="" className="w-full h-full object-cover opacity-20" style={{ objectPosition: "center 40%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,10,15,0.6) 0%, rgba(10,10,15,0.85) 50%, #0a0a0f 100%)" }} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen px-5 pt-10 pb-6 max-w-sm mx-auto w-full">

        {/* лого + бейдж онлайн */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="Дальняк" className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#F5A800]/40" />
            <div>
              <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 18, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Такси Дальняк
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full bg-green-400 ${pulse ? "opacity-100" : "opacity-40"} transition-opacity duration-700`} />
                <span className="text-green-400 text-[11px] font-bold uppercase tracking-wider">Диспетчер на связи</span>
              </div>
            </div>
          </div>
        </div>

        {/* главный заголовок */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="mb-2">
            <div className="text-[#F5A800] text-[11px] font-bold uppercase tracking-[0.25em] mb-3">
              Межгородское такси по России
            </div>
            <h1 style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: "clamp(36px, 11vw, 52px)", lineHeight: 1.05, color: "#fff", textTransform: "uppercase" }}>
              Узнай цену<br />
              <span style={{ color: "#F5A800" }}>прямо сейчас</span>
            </h1>
            <p className="text-white/50 text-[14px] mt-3 leading-relaxed">
              Нажми — и через секунду<br />разговариваешь с диспетчером
            </p>
          </div>

          {/* факты */}
          <div className="flex gap-3 mt-5 mb-8 flex-wrap">
            {[
              { icon: "Zap", text: "Срочная подача" },
              { icon: "ShieldCheck", text: "С 2014 года" },
              { icon: "MapPin", text: "Вся Россия" },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1.5 border border-white/8">
                <Icon name={item.icon as "Zap"} size={11} className="text-[#F5A800]" />
                <span className="text-white/70 text-[11px] font-semibold">{item.text}</span>
              </div>
            ))}
          </div>

          {/* ГЛАВНАЯ КНОПКА — ЗВОНОК */}
          <a
            href={PHONE_HREF}
            onClick={() => ymGoal("quick_phone_click")}
            className="relative flex flex-col items-center justify-center w-full rounded-3xl py-6 mb-3 overflow-hidden active:scale-[0.97] transition-transform select-none"
            style={{ background: "linear-gradient(135deg, #F5A800 0%, #ffb800 100%)", boxShadow: "0 0 40px rgba(245,168,0,0.45), 0 4px 20px rgba(0,0,0,0.4)" }}
          >
            {/* пульсирующий ореол */}
            <div className="absolute inset-0 rounded-3xl" style={{ boxShadow: pulse ? "0 0 0 8px rgba(245,168,0,0.15)" : "0 0 0 0px rgba(245,168,0,0)", transition: "box-shadow 0.7s ease" }} />
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-black/20 flex items-center justify-center">
                <Icon name="PhoneCall" size={22} className="text-[#0a0a0f]" />
              </div>
              <div style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 26, color: "#0a0a0f", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                Позвонить
              </div>
            </div>
            <div className="text-[#0a0a0f]/70 text-[13px] font-bold tracking-wide">{PHONE}</div>
          </a>

          {/* строка разделитель */}
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-white/25 text-[11px] font-bold uppercase tracking-wider">или напиши</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>

          {/* MAX + TELEGRAM */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* MAX — акцент, т.к. сейчас больше пишут туда */}
            <a
              href={MAX_HREF}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => ymGoal("quick_max_click")}
              className="relative flex flex-col items-center justify-center rounded-2xl py-5 gap-2 overflow-hidden active:scale-[0.97] transition-transform border border-[#0077FF]/40"
              style={{ background: "linear-gradient(135deg, #003d80 0%, #0055bb 100%)", boxShadow: "0 4px 20px rgba(0,119,255,0.3)" }}
            >
              <div className="absolute top-2 right-2">
                <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider bg-white/10 rounded-full px-1.5 py-0.5">Популярно</span>
              </div>
              <img src={MAX_LOGO} alt="MAX" className="h-7 object-contain" />
              <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 15, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Написать
              </div>
            </a>

            {/* Telegram */}
            <a
              href={TG_HREF}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => ymGoal("quick_tg_click")}
              className="flex flex-col items-center justify-center rounded-2xl py-5 gap-2 active:scale-[0.97] transition-transform border border-[#229ED9]/30"
              style={{ background: "linear-gradient(135deg, #0d4f6e 0%, #1278a0 100%)", boxShadow: "0 4px 20px rgba(34,158,217,0.2)" }}
            >
              <Icon name="Send" size={26} className="text-[#229ED9]" />
              <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 15, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Telegram
              </div>
            </a>
          </div>

          {/* подсказка про голосовое */}
          <div className="flex items-start gap-2.5 bg-white/4 border border-white/8 rounded-2xl px-4 py-3">
            <Icon name="Mic" size={15} className="text-[#F5A800] shrink-0 mt-0.5" />
            <p className="text-white/50 text-[12px] leading-relaxed">
              Запиши <span className="text-white/80 font-semibold">голосовое сообщение</span> — откуда и куда едешь. Диспетчер перезвонит с ценой.
            </p>
          </div>
        </div>

        {/* футер */}
        <div className="mt-6 text-center text-white/20 text-[11px]">
          Работаем круглосуточно · Фиксированная цена
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@700;800;900&display=swap');
      `}</style>
    </div>
  );
}