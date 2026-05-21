import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const LOGO     = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/3a499542-747a-49d2-808e-4c137548c76e.jpg";
const MAX_LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/cf5e3e58-7d83-4d19-8c48-f91922395adf.png";
const CAR_IMG  = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/091d3d1c-1649-4d9e-8958-1a624bf8f371.jpg";
const REVIEW_1 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/b0eb5050-a05a-4647-8442-4b839d45161f.jpg";
const REVIEW_2 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/fedc4281-a106-4024-9369-8a03712c92a3.jpg";
const REVIEW_3 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/ac322d91-fd27-4c11-b86f-f28e85ec3df0.jpg";

const PHONE      = "8 (995) 645-51-25";
const PHONE_HREF = "tel:+79956455125";
const TG_HREF    = "https://t.me/Mezhgorod1816";
const MAX_HREF   = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";

function getStartCount() {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return 12 + (seed % 19);
}

function ymGoal(goal: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).ym?.(98584604, "reachGoal", goal);
}

export default function Quick() {
  const [pulse, setPulse] = useState(false);
  const [count, setCount] = useState(getStartCount());
  const [mins, setMins]   = useState(7);

  useEffect(() => {
    document.title = "Такси Дальняк — Межгород по России";
    const p = setInterval(() => setPulse(v => !v), 2000);
    const c = setInterval(() => {
      setCount(n => n + 1);
      setMins(Math.floor(Math.random() * 11) + 2);
    }, (Math.random() * 3 + 2) * 60000);
    const m = setInterval(() => setMins(v => v >= 40 ? 5 : v + 1), 60000);
    return () => { clearInterval(p); clearInterval(c); clearInterval(m); };
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#09090e" }}>

      {/* фон */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src={CAR_IMG} alt="" className="w-full h-full object-cover opacity-[0.14]" style={{ objectPosition: "center 38%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,rgba(9,9,14,0.4) 0%,rgba(9,9,14,0.85) 50%,#09090e 100%)" }} />
      </div>

      <div className="relative z-10 flex flex-col max-w-sm mx-auto w-full px-4 pt-8 pb-36">

        {/* ШАПКА */}
        <div className="flex items-center gap-3 mb-6">
          <img src={LOGO} alt="Дальняк" className="w-11 h-11 rounded-2xl object-cover shrink-0" style={{ boxShadow: "0 0 0 2px rgba(245,168,0,0.5)" }} />
          <div>
            <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 17, color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Такси Дальняк
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full bg-green-400 transition-opacity duration-700 ${pulse ? "opacity-100" : "opacity-25"}`} />
              <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider">Диспетчер на связи</span>
            </div>
          </div>
        </div>

        {/* СЧЁТЧИК */}
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-7" style={{ background: "#111018", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex -space-x-2 shrink-0">
            {[REVIEW_1, REVIEW_2, REVIEW_3].map((img, i) => (
              <img key={i} src={img} alt="" className="w-7 h-7 rounded-full object-cover" style={{ border: "2px solid #09090e" }} />
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <span style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 15, color: "#fff" }}>{count} пассажира</span>
            <span className="text-white/40 text-[12px]"> сегодня доехали с нами</span>
          </div>
          <div className="text-right shrink-0">
            <div className="text-white/25 text-[10px]">помогли</div>
            <div className="text-[#F5A800] text-[11px] font-bold">{mins} мин назад</div>
          </div>
        </div>

        {/* ЗАГОЛОВОК */}
        <div className="mb-4">
          <div className="text-[#F5A800] text-[10px] font-black uppercase tracking-[0.28em] mb-2">
            Межгород · от 200 км · Россия и Новые территории
          </div>
          <h1 style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: "clamp(34px,10vw,50px)", lineHeight: 1.0, color: "#fff", textTransform: "uppercase" }}>
            Заказать такси<br />
            <span style={{ color: "#F5A800" }}>из города в город</span>
          </h1>
          <p className="text-white/45 text-[13px] mt-2 leading-relaxed">
            Звони или пиши — ответим сразу, назовём цену
          </p>
        </div>

        {/* ФАКТЫ */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { top: "Новые авто", bot: "не старше 10 лет", icon: "Car" },
            { top: "12 лет",     bot: "на рынке",         icon: "Trophy" },
            { top: "Фикс. цена", bot: "без счётчика",     icon: "BadgeCheck" },
          ].map(f => (
            <div key={f.top} className="flex flex-col items-center rounded-2xl py-3 px-2 gap-1"
              style={{ background: "#161520", border: "1px solid rgba(245,168,0,0.2)" }}>
              <Icon name={f.icon as "Car"} size={18} className="text-[#F5A800] mb-0.5" />
              <span style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 12, color: "#fff", textAlign: "center", lineHeight: 1.1 }}>{f.top}</span>
              <span className="text-white/38 text-[10px] text-center leading-tight">{f.bot}</span>
            </div>
          ))}
        </div>

        {/* ЯКОРЬ */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex-1 h-px bg-white/7" />
          <span className="text-white/30 text-[11px] font-semibold">Такси. Не попутка. Не доставка.</span>
          <div className="flex-1 h-px bg-white/7" />
        </div>

        {/* КНОПКА ЗВОНОК */}
        <a
          href={PHONE_HREF}
          onClick={() => ymGoal("phone_click")}
          className="relative flex flex-col items-center justify-center w-full rounded-3xl py-6 mb-3 active:scale-[0.97] transition-transform select-none overflow-hidden"
          style={{ background: "linear-gradient(135deg,#F5A800,#ffba00)", boxShadow: "0 0 50px rgba(245,168,0,0.45), 0 6px 24px rgba(0,0,0,0.5)" }}
        >
          <div className="absolute inset-0 rounded-3xl" style={{ boxShadow: pulse ? "0 0 0 12px rgba(245,168,0,0.1)" : "0 0 0 0px rgba(245,168,0,0)", transition: "box-shadow 0.8s ease" }} />
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-black/20 flex items-center justify-center">
              <Icon name="PhoneCall" size={22} className="text-[#09090e]" />
            </div>
            <div style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 30, color: "#09090e", textTransform: "uppercase" }}>
              Позвонить
            </div>
          </div>
          <div className="text-[#09090e]/60 text-[13px] font-bold">{PHONE}</div>
        </a>

        {/* разделитель */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-white/22 text-[10px] font-bold uppercase tracking-wider">или напиши</span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        {/* MAX + TG */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <a href={MAX_HREF} target="_blank" rel="noopener noreferrer"
            onClick={() => ymGoal("max_click")}
            className="relative flex flex-col items-center justify-center rounded-2xl py-5 gap-2 active:scale-[0.97] transition-transform"
            style={{ background: "linear-gradient(135deg,#002d60,#004aad)", border: "1px solid rgba(0,119,255,0.45)", boxShadow: "0 4px 24px rgba(0,119,255,0.3)" }}>
            <div className="absolute top-2 right-2 rounded-full px-1.5 py-0.5" style={{ background: "#F5A800" }}>
              <span className="text-[8px] font-black text-[#09090e] uppercase tracking-wide">Чаще пишут</span>
            </div>
            <img src={MAX_LOGO} alt="MAX" className="h-7 object-contain" />
            <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 15, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>Написать в MAX</div>
          </a>
          <a href={TG_HREF} target="_blank" rel="noopener noreferrer"
            onClick={() => ymGoal("tg_click")}
            className="flex flex-col items-center justify-center rounded-2xl py-5 gap-2 active:scale-[0.97] transition-transform"
            style={{ background: "linear-gradient(135deg,#0a3d54,#0f6090)", border: "1px solid rgba(34,158,217,0.3)" }}>
            <Icon name="Send" size={26} className="text-[#4fc3f7]" />
            <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 15, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>Telegram</div>
          </a>
        </div>

        {/* ССЫЛКИ — для тех кто хочет почитать */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-px bg-white/7" />
          <span className="text-white/25 text-[10px] font-bold uppercase tracking-wider">Хочу узнать подробнее</span>
          <div className="flex-1 h-px bg-white/7" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Калькулятор", icon: "Calculator", href: "/calc" },
            { label: "Тарифы",      icon: "Car",         href: "/tariffs" },
            { label: "Отзывы",      icon: "Star",        href: "/reviews" },
          ].map(l => (
            <a key={l.href} href={l.href}
              className="flex flex-col items-center gap-1.5 rounded-2xl py-3 active:scale-[0.97] transition-transform"
              style={{ background: "#111018", border: "1px solid rgba(255,255,255,0.07)" }}>
              <Icon name={l.icon as "Car"} size={18} className="text-white/40" />
              <span className="text-white/45 text-[11px] font-semibold text-center leading-tight">{l.label}</span>
            </a>
          ))}
        </div>

      </div>

      {/* НИЖНЯЯ ПАНЕЛЬ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-3" style={{ background: "linear-gradient(to top,#09090e 70%,transparent)" }}>
        <div className="max-w-sm mx-auto grid grid-cols-3 gap-2">
          <a href={PHONE_HREF} onClick={() => ymGoal("bottom_phone")}
            className="flex flex-col items-center justify-center rounded-2xl py-3 gap-1 active:scale-[0.97] transition-transform"
            style={{ background: "#F5A800", boxShadow: "0 4px 20px rgba(245,168,0,0.4)" }}>
            <Icon name="Phone" size={18} className="text-[#09090e]" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#09090e", fontWeight: 800, textTransform: "uppercase" }}>Звонок</span>
          </a>
          <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("bottom_max")}
            className="flex flex-col items-center justify-center rounded-2xl py-3 gap-1 active:scale-[0.97] transition-transform"
            style={{ background: "linear-gradient(135deg,#002d60,#004aad)", border: "1px solid rgba(0,119,255,0.4)", boxShadow: "0 4px 16px rgba(0,100,255,0.25)" }}>
            <img src={MAX_LOGO} alt="MAX" className="h-5 object-contain" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>MAX</span>
          </a>
          <a href={TG_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("bottom_tg")}
            className="flex flex-col items-center justify-center rounded-2xl py-3 gap-1 active:scale-[0.97] transition-transform"
            style={{ background: "linear-gradient(135deg,#0a3d54,#0f6090)", border: "1px solid rgba(34,158,217,0.3)" }}>
            <Icon name="Send" size={18} className="text-[#4fc3f7]" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>Telegram</span>
          </a>
        </div>
      </div>
    </div>
  );
}
