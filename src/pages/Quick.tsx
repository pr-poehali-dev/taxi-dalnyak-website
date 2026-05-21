import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";

const LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/3a499542-747a-49d2-808e-4c137548c76e.jpg";
const MAX_LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/cf5e3e58-7d83-4d19-8c48-f91922395adf.png";
const CAR_IMG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/091d3d1c-1649-4d9e-8958-1a624bf8f371.jpg";
const REVIEW_1 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/b0eb5050-a05a-4647-8442-4b839d45161f.jpg";
const REVIEW_2 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/fedc4281-a106-4024-9369-8a03712c92a3.jpg";
const REVIEW_3 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/ac322d91-fd27-4c11-b86f-f28e85ec3df0.jpg";

const PHONE = "8 (995) 645-51-25";
const PHONE_HREF = "tel:+79956455125";
const TG_HREF = "https://t.me/Mezhgorod1816";
const MAX_HREF = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";

const TARIFFS = [
  { name: "Стандарт", desc: "Рио · Поло · Солярис", seats: 4, color: "#F5A800" },
  { name: "Комфорт", desc: "Хавал Джулиан 2025", seats: 4, color: "#22D3EE", badge: "Популярный" },
  { name: "Комфорт+", desc: "Toyota Camry 70", seats: 4, color: "#A78BFA", badge: "Бизнес" },
  { name: "Минивэн", desc: "Hyundai Staria 2022", seats: 7, color: "#34D399", badge: "Группа" },
];

const REVIEWS = [
  { name: "Валерия", route: "Москва – Новомичуринск", text: "Очень переживала — зимой с ребёнком, первый раз на такое расстояние. Всё прошло замечательно! Водитель Иван — замечательный человек. Довёз идеально!", img: REVIEW_1 },
  { name: "Ирина", route: "ЛО Кировский р-н – СПб", text: "Позвонила в две компании — ничего не нашли. Нашла Такси Дальняк через Telegram. Водитель очень вежливый, машина в идеальном состоянии.", img: REVIEW_3 },
  { name: "Евгений", route: "Межгород по России", text: "Рекомендую! Удобная и быстрая доставка, комфортабельный авто. Пацаны отвечают за время, комфорт и стоимость. Спасибо!", img: REVIEW_2 },
];

function ymGoal(goal: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).ym?.(98584604, "reachGoal", goal);
}

function calcPrice(km: number) {
  if (!km || km <= 0) return null;
  const rate = km <= 200 ? 30 : km <= 500 ? 27 : 26;
  const price = Math.round(km * rate * 1.15 / 100) * 100;
  return price;
}

export default function Quick() {
  const [pulse, setPulse] = useState(false);
  const [activeTab, setActiveTab] = useState<"main" | "calc" | "reviews" | "tariffs">("main");
  const [km, setKm] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const calcRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const tariffsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Такси Дальняк — Межгород по России";
    const t = setInterval(() => setPulse(p => !p), 2000);
    return () => clearInterval(t);
  }, []);

  const price = calcPrice(parseInt(km, 10));

  const tgMsg = price
    ? encodeURIComponent(`Хочу заказать такси${from ? ` из ${from}` : ""}${to ? ` в ${to}` : ""}, ~${km} км. Стоимость по расчёту от ${price.toLocaleString("ru")} ₽`)
    : encodeURIComponent("Хочу заказать межгородное такси");

  function scrollTo(ref: React.RefObject<HTMLDivElement>, tab: typeof activeTab) {
    setActiveTab(tab);
    setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: "#0a0a0f" }}>

      {/* фон */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src={CAR_IMG} alt="" className="w-full h-full object-cover opacity-[0.12]" style={{ objectPosition: "center 40%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(10,10,15,0.5) 0%, rgba(10,10,15,0.9) 60%, #0a0a0f 100%)" }} />
      </div>

      <div className="relative z-10 flex flex-col max-w-sm mx-auto w-full px-4 pt-8 pb-28">

        {/* шапка */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="Дальняк" className="w-11 h-11 rounded-2xl object-cover ring-2 ring-[#F5A800]/40" />
            <div>
              <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 17, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Такси Дальняк
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full bg-green-400 transition-opacity duration-700 ${pulse ? "opacity-100" : "opacity-30"}`} />
                <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider">Диспетчер на связи</span>
              </div>
            </div>
          </div>
        </div>

        {/* НАВИГАЦИЯ */}
        <div className="flex gap-2 mb-7 overflow-x-auto scrollbar-hide pb-1">
          {([
            { id: "main", label: "Заказать", icon: "Phone" },
            { id: "calc", label: "Калькулятор", icon: "Calculator" },
            { id: "tariffs", label: "Тарифы", icon: "Car" },
            { id: "reviews", label: "Отзывы", icon: "Star" },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "calc") scrollTo(calcRef, "calc");
                else if (tab.id === "reviews") scrollTo(reviewsRef, "reviews");
                else if (tab.id === "tariffs") scrollTo(tariffsRef, "tariffs");
                else setActiveTab("main");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide whitespace-nowrap border transition-all ${
                activeTab === tab.id
                  ? "bg-[#F5A800] text-[#0a0a0f] border-[#F5A800]"
                  : "bg-white/5 text-white/50 border-white/10"
              }`}
            >
              <Icon name={tab.icon as "Phone"} size={11} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ЗАГОЛОВОК */}
        <div className="mb-6">
          <div className="text-[#F5A800] text-[10px] font-bold uppercase tracking-[0.25em] mb-2">
            Межгород · от 200 км · по всей России
          </div>
          <h1 style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: "clamp(34px,10vw,50px)", lineHeight: 1.05, color: "#fff", textTransform: "uppercase" }}>
            Заказать такси<br />
            <span style={{ color: "#F5A800" }}>из города в город</span>
          </h1>
          <p className="text-white/45 text-[13px] mt-2.5 leading-relaxed">
            Звони или пиши — ответим сразу,<br />назовём цену и запишем
          </p>
        </div>

        {/* бейджи */}
        <div className="flex gap-2 mb-7 flex-wrap">
          {[
            { icon: "Zap", text: "Срочная подача" },
            { icon: "ShieldCheck", text: "С 2014 года" },
            { icon: "MapPin", text: "Вся Россия" },
          ].map(item => (
            <div key={item.text} className="flex items-center gap-1.5 bg-white/5 rounded-full px-3 py-1.5 border border-white/8">
              <Icon name={item.icon as "Zap"} size={11} className="text-[#F5A800]" />
              <span className="text-white/65 text-[11px] font-semibold">{item.text}</span>
            </div>
          ))}
        </div>

        {/* КНОПКА ПОЗВОНИТЬ */}
        <a
          href={PHONE_HREF}
          onClick={() => ymGoal("quick_phone_click")}
          className="relative flex flex-col items-center justify-center w-full rounded-3xl py-6 mb-3 active:scale-[0.97] transition-transform select-none overflow-hidden"
          style={{ background: "linear-gradient(135deg,#F5A800 0%,#ffba00 100%)", boxShadow: "0 0 40px rgba(245,168,0,0.4), 0 4px 20px rgba(0,0,0,0.4)" }}
        >
          <div className="absolute inset-0 rounded-3xl" style={{ boxShadow: pulse ? "0 0 0 10px rgba(245,168,0,0.12)" : "0 0 0 0px rgba(245,168,0,0)", transition: "box-shadow 0.8s ease" }} />
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-black/20 flex items-center justify-center">
              <Icon name="PhoneCall" size={22} className="text-[#0a0a0f]" />
            </div>
            <div style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 28, color: "#0a0a0f", textTransform: "uppercase", letterSpacing: "0.02em" }}>
              Позвонить
            </div>
          </div>
          <div className="text-[#0a0a0f]/65 text-[13px] font-bold">{PHONE}</div>
        </a>

        {/* разделитель */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-white/8" />
          <span className="text-white/25 text-[10px] font-bold uppercase tracking-wider">или напиши</span>
          <div className="flex-1 h-px bg-white/8" />
        </div>

        {/* MAX + TG */}
        <div className="grid grid-cols-2 gap-3 mb-8">
          <a
            href={MAX_HREF}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => ymGoal("quick_max_click")}
            className="relative flex flex-col items-center justify-center rounded-2xl py-5 gap-2 active:scale-[0.97] transition-transform border border-[#0077FF]/40"
            style={{ background: "linear-gradient(135deg,#003d80 0%,#0055bb 100%)", boxShadow: "0 4px 20px rgba(0,119,255,0.25)" }}
          >
            <div className="absolute top-2 right-2">
              <span className="text-[9px] font-bold text-white/60 uppercase tracking-wider bg-white/10 rounded-full px-1.5 py-0.5">Чаще пишут</span>
            </div>
            <img src={MAX_LOGO} alt="MAX" className="h-7 object-contain" />
            <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 15, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Написать
            </div>
          </a>
          <a
            href={TG_HREF}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => ymGoal("quick_tg_click")}
            className="flex flex-col items-center justify-center rounded-2xl py-5 gap-2 active:scale-[0.97] transition-transform border border-[#229ED9]/30"
            style={{ background: "linear-gradient(135deg,#0d4f6e 0%,#1278a0 100%)", boxShadow: "0 4px 20px rgba(34,158,217,0.15)" }}
          >
            <Icon name="Send" size={26} className="text-[#229ED9]" />
            <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 15, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Telegram
            </div>
          </a>
        </div>

        {/* ═══ КАЛЬКУЛЯТОР ═══ */}
        <div ref={calcRef} className="mb-8 scroll-mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Calculator" size={14} className="text-[#F5A800]" />
            <span style={{ fontFamily: "Oswald" }} className="text-white font-bold uppercase tracking-wide text-sm">Калькулятор стоимости</span>
          </div>
          <div className="rounded-2xl border border-[#F5A800]/20 overflow-hidden" style={{ background: "linear-gradient(135deg,#1a1610 0%,#12100a 100%)" }}>
            <div className="px-4 pt-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-white/35 text-[10px] font-bold uppercase tracking-wider block mb-1">Откуда</label>
                  <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Москва"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-[13px] placeholder-white/20 focus:outline-none focus:border-[#F5A800]/50" />
                </div>
                <div>
                  <label className="text-white/35 text-[10px] font-bold uppercase tracking-wider block mb-1">Куда</label>
                  <input value={to} onChange={e => setTo(e.target.value)} placeholder="Краснодар"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-[13px] placeholder-white/20 focus:outline-none focus:border-[#F5A800]/50" />
                </div>
              </div>
              <div>
                <label className="text-white/35 text-[10px] font-bold uppercase tracking-wider block mb-1">Расстояние (км)</label>
                <input value={km} onChange={e => setKm(e.target.value.replace(/\D/g, ""))} placeholder="Например, 350" inputMode="numeric"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-[13px] placeholder-white/20 focus:outline-none focus:border-[#F5A800]/50" />
                <div className="text-white/20 text-[10px] mt-1">Расстояние по трассе — Яндекс.Карты</div>
              </div>

              {price ? (
                <>
                  <div className="rounded-xl bg-[#F5A800]/10 border border-[#F5A800]/30 px-4 py-3">
                    <div className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-1">Стоимость поездки</div>
                    <div className="text-[#F5A800] font-black text-2xl" style={{ fontFamily: "Oswald" }}>
                      от {price.toLocaleString("ru")} ₽
                    </div>
                    <div className="text-white/30 text-[11px] mt-0.5">
                      {from && to ? `${from} → ${to} · ` : ""}{km} км · тариф Стандарт
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <a href={`${TG_HREF}?text=${tgMsg}`} target="_blank" rel="noopener noreferrer"
                      onClick={() => ymGoal("calc_tg_click")}
                      className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-white text-[12px] font-bold uppercase"
                      style={{ background: "#229ED9" }}>
                      <Icon name="Send" size={12} /> Telegram
                    </a>
                    <a href={PHONE_HREF} onClick={() => ymGoal("calc_phone_click")}
                      className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[#0a0a0f] text-[12px] font-bold uppercase"
                      style={{ background: "#F5A800" }}>
                      <Icon name="Phone" size={12} /> Позвонить
                    </a>
                  </div>
                </>
              ) : (
                <div className="rounded-xl bg-white/3 border border-white/8 px-4 py-3 text-center text-white/25 text-[12px]">
                  Введите расстояние — цена появится сразу
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ═══ ТАРИФЫ ═══ */}
        <div ref={tariffsRef} className="mb-8 scroll-mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Car" size={14} className="text-[#F5A800]" />
            <span style={{ fontFamily: "Oswald" }} className="text-white font-bold uppercase tracking-wide text-sm">Тарифы</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TARIFFS.map(t => (
              <div key={t.name} className="rounded-2xl border border-white/8 bg-white/3 px-3 py-3">
                {t.badge && (
                  <span className="text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 mb-2 inline-block"
                    style={{ background: `${t.color}20`, color: t.color }}>
                    {t.badge}
                  </span>
                )}
                <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 15, color: "#fff" }}>{t.name}</div>
                <div className="text-white/40 text-[11px] mt-0.5">{t.desc}</div>
                <div className="flex items-center gap-1 mt-2">
                  <Icon name="Users" size={11} style={{ color: t.color }} />
                  <span className="text-[11px] font-semibold" style={{ color: t.color }}>{t.seats} места</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2 bg-[#F5A800]/8 border border-[#F5A800]/15 rounded-xl px-3 py-2">
            <Icon name="Tag" size={12} className="text-[#F5A800] shrink-0" />
            <span className="text-[#F5A800] text-[11px] font-bold">Фиксированная стоимость — без счётчика</span>
          </div>
        </div>

        {/* ═══ ОТЗЫВЫ ═══ */}
        <div ref={reviewsRef} className="mb-4 scroll-mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Star" size={14} className="text-[#F5A800]" />
            <span style={{ fontFamily: "Oswald" }} className="text-white font-bold uppercase tracking-wide text-sm">Отзывы</span>
          </div>
          <div className="space-y-3">
            {REVIEWS.map(r => (
              <div key={r.name} className="rounded-2xl border border-white/8 bg-white/3 px-4 py-3">
                <div className="flex items-center gap-3 mb-2">
                  <img src={r.img} alt={r.name} className="w-9 h-9 rounded-xl object-cover" />
                  <div>
                    <div className="text-white text-[13px] font-bold">{r.name}</div>
                    <div className="text-white/35 text-[10px]">{r.route}</div>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Icon key={i} name="Star" size={10} className="text-[#F5A800]" />
                    ))}
                  </div>
                </div>
                <p className="text-white/55 text-[12px] leading-relaxed">«{r.text}»</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* НИЖНЯЯ ПАНЕЛЬ — ФИКСИРОВАННАЯ */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pt-2" style={{ background: "linear-gradient(to top, #0a0a0f 80%, transparent)" }}>
        <div className="max-w-sm mx-auto grid grid-cols-3 gap-2">
          <a href={PHONE_HREF} onClick={() => ymGoal("bottom_phone_click")}
            className="flex flex-col items-center justify-center rounded-2xl py-3 gap-1 active:scale-[0.97] transition-transform"
            style={{ background: "#F5A800" }}>
            <Icon name="Phone" size={18} className="text-[#0a0a0f]" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#0a0a0f", fontWeight: 800, textTransform: "uppercase" }}>Звонок</span>
          </a>
          <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("bottom_max_click")}
            className="flex flex-col items-center justify-center rounded-2xl py-3 gap-1 active:scale-[0.97] transition-transform border border-[#0077FF]/40"
            style={{ background: "linear-gradient(135deg,#003d80,#0055bb)" }}>
            <img src={MAX_LOGO} alt="MAX" className="h-5 object-contain" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>MAX</span>
          </a>
          <a href={TG_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("bottom_tg_click")}
            className="flex flex-col items-center justify-center rounded-2xl py-3 gap-1 active:scale-[0.97] transition-transform border border-[#229ED9]/30"
            style={{ background: "linear-gradient(135deg,#0d4f6e,#1278a0)" }}>
            <Icon name="Send" size={18} className="text-[#229ED9]" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>Telegram</span>
          </a>
        </div>
      </div>

    </div>
  );
}
