import { useEffect, useRef, useState } from "react";
import Icon from "@/components/ui/icon";

const LOGO     = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/3a499542-747a-49d2-808e-4c137548c76e.jpg";
const MAX_LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/cf5e3e58-7d83-4d19-8c48-f91922395adf.png";
const CAR_IMG  = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/091d3d1c-1649-4d9e-8958-1a624bf8f371.jpg";

const PHONE     = "8 (995) 645-51-25";
const PHONE_HREF = "tel:+79956455125";
const TG_HREF   = "https://t.me/Mezhgorod1816";
const MAX_HREF  = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";

const REVIEW_1 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/b0eb5050-a05a-4647-8442-4b839d45161f.jpg";
const REVIEW_2 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/fedc4281-a106-4024-9369-8a03712c92a3.jpg";
const REVIEW_3 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/ac322d91-fd27-4c11-b86f-f28e85ec3df0.jpg";

const TARIFFS = [
  { name: "Стандарт",  desc: "Рио · Поло · Солярис",   seats: 4, color: "#F5A800" },
  { name: "Комфорт",   desc: "Хавал Джулиан 2025",      seats: 4, color: "#22D3EE", badge: "Популярный" },
  { name: "Комфорт+",  desc: "Toyota Camry 70",          seats: 4, color: "#A78BFA", badge: "Бизнес" },
  { name: "Минивэн",   desc: "Hyundai Staria 2022",      seats: 7, color: "#34D399", badge: "Группа" },
];

const REVIEWS = [
  {
    name: "Валерия", route: "Москва – Новомичуринск",
    text: "Очень переживала — зимой с ребёнком, первый раз на такое расстояние. Всё прошло замечательно! Водитель Иван — замечательный человек. Довёз идеально!",
    img: REVIEW_1,
  },
  {
    name: "Ирина", route: "ЛО Кировский р-н – СПб",
    text: "Позвонила в две компании — ничего не нашли. Нашла Такси Дальняк через Telegram. Водитель очень вежливый, машина в идеальном состоянии.",
    img: REVIEW_3,
  },
  {
    name: "Евгений", route: "Межгород по России",
    text: "Рекомендую! Удобная и быстрая доставка, комфортабельный авто. Пацаны отвечают за время, комфорт и стоимость. Спасибо!",
    img: REVIEW_2,
  },
];

// Стартовая база «пассажиров за сегодня» — случайное число чтобы каждый раз выглядело живо
function getStartCount() {
  const now = new Date();
  // детерминировано по дате — один день = одно число, не скачет при перезагрузке
  const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  return 12 + (seed % 19); // от 12 до 30
}

function ymGoal(goal: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).ym?.(98584604, "reachGoal", goal);
}

function calcPrice(km: number) {
  if (!km || km <= 0) return null;
  const rate = km <= 200 ? 30 : km <= 500 ? 27 : 26;
  return Math.round(km * rate * 1.15 / 100) * 100;
}

export default function Quick() {
  const [pulse, setPulse]       = useState(false);
  const [activeTab, setActiveTab] = useState<"main" | "calc" | "reviews" | "tariffs">("main");
  const [km, setKm]             = useState("");
  const [from, setFrom]         = useState("");
  const [to, setTo]             = useState("");
  const [passengerCount, setPassengerCount] = useState(getStartCount());
  const [minutesAgo, setMinutesAgo]         = useState(7);

  const calcRef    = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const tariffsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.title = "Такси Дальняк — Межгород по России";

    // пульс кнопки
    const pulseT = setInterval(() => setPulse(p => !p), 2000);

    // счётчик пассажиров: раз в 2–5 минут +1
    const counterT = setInterval(() => {
      setPassengerCount(n => n + 1);
      setMinutesAgo(Math.floor(Math.random() * 11) + 2); // 2–12 минут
    }, (Math.random() * 3 + 2) * 60 * 1000);

    // минуты тикают каждую минуту
    const minT = setInterval(() => {
      setMinutesAgo(m => {
        const next = m + 1;
        return next > 40 ? 5 : next; // сбрасываем если давно
      });
    }, 60 * 1000);

    return () => { clearInterval(pulseT); clearInterval(counterT); clearInterval(minT); };
  }, []);

  const price = calcPrice(parseInt(km, 10));
  const tgMsg = price
    ? encodeURIComponent(`Хочу заказать такси${from ? ` из ${from}` : ""}${to ? ` в ${to}` : ""}, ~${km} км. По расчёту от ${price.toLocaleString("ru")} ₽`)
    : encodeURIComponent("Хочу заказать межгородное такси");

  function navTo(ref: React.RefObject<HTMLDivElement>, tab: typeof activeTab) {
    setActiveTab(tab);
    setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: "#09090e" }}>

      {/* фон — авто */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src={CAR_IMG} alt="" className="w-full h-full object-cover opacity-[0.13]" style={{ objectPosition: "center 38%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom,rgba(9,9,14,0.45) 0%,rgba(9,9,14,0.88) 55%,#09090e 100%)" }} />
      </div>

      <div className="relative z-10 flex flex-col max-w-sm mx-auto w-full px-4 pt-8 pb-32">

        {/* ── ШАПКА ── */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="Дальняк" className="w-11 h-11 rounded-2xl object-cover" style={{ boxShadow: "0 0 0 2px rgba(245,168,0,0.5)" }} />
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
        </div>

        {/* ── ЖИВОЙ СЧЁТЧИК ── */}
        <div className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/3 px-4 py-3 mb-5">
          <div className="flex -space-x-2">
            {[REVIEW_1, REVIEW_2, REVIEW_3].map((img, i) => (
              <img key={i} src={img} alt="" className="w-7 h-7 rounded-full object-cover border-2 border-[#09090e]" />
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-white font-black text-[15px]" style={{ fontFamily: "Oswald" }}>{passengerCount} пассажира</span>
            <span className="text-white/45 text-[12px]"> сегодня доехали с нами</span>
          </div>
          <div className="text-right shrink-0">
            <div className="text-white/30 text-[10px]">последний</div>
            <div className="text-[#F5A800] text-[11px] font-bold">{minutesAgo} мин назад</div>
          </div>
        </div>

        {/* ── НАВИГАЦИЯ ── */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {([
            { id: "main",    label: "Заказать",     icon: "Phone" },
            { id: "calc",    label: "Калькулятор",  icon: "Calculator" },
            { id: "tariffs", label: "Тарифы",       icon: "Car" },
            { id: "reviews", label: "Отзывы",       icon: "Star" },
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === "calc")    navTo(calcRef,    "calc");
                else if (tab.id === "reviews") navTo(reviewsRef, "reviews");
                else if (tab.id === "tariffs") navTo(tariffsRef, "tariffs");
                else setActiveTab("main");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wide whitespace-nowrap border transition-all shrink-0 ${
                activeTab === tab.id
                  ? "text-[#09090e] border-[#F5A800]"
                  : "bg-white/5 text-white/50 border-white/10"
              }`}
              style={activeTab === tab.id ? { background: "#F5A800" } : {}}
            >
              <Icon name={tab.icon as "Phone"} size={11} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── ЗАГОЛОВОК ── */}
        <div className="mb-6">
          <div className="text-[#F5A800] text-[10px] font-black uppercase tracking-[0.28em] mb-2">
            Межгород · от 200 км · Россия и Новые территории
          </div>
          <h1 style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: "clamp(32px,9.5vw,48px)", lineHeight: 1.05, color: "#fff", textTransform: "uppercase" }}>
            Заказать такси<br />
            <span style={{ color: "#F5A800" }}>из города в город</span>
          </h1>
          <p className="text-white/50 text-[13px] mt-2 leading-relaxed">
            Звони или пиши — ответим сразу, назовём цену
          </p>
        </div>

        {/* ── ТРИ ФАКТА — почему это не попутка ── */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          {[
            { top: "Лицензия", bot: "и страховка", icon: "BadgeCheck" },
            { top: "Новые авто", bot: "2022–2025 г.", icon: "Car" },
            { top: "12 лет", bot: "на рынке", icon: "Trophy" },
          ].map(item => (
            <div key={item.top} className="flex flex-col items-center rounded-2xl py-3 px-2 gap-1"
              style={{ background: "#161520", border: "1px solid rgba(245,168,0,0.2)" }}>
              <Icon name={item.icon as "Car"} size={18} className="text-[#F5A800] mb-0.5" />
              <span style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 13, color: "#fff", textAlign: "center", lineHeight: 1.1 }}>{item.top}</span>
              <span className="text-white/40 text-[10px] text-center leading-tight">{item.bot}</span>
            </div>
          ))}
        </div>

        {/* ── БЕЙДЖИ ── */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { icon: "Zap",         text: "Срочная подача", accent: false },
            { icon: "ShieldCheck", text: "С 2014 года",    accent: false },
            { icon: "MapPin",      text: "Вся Россия",     accent: false },
            { icon: "Flag",        text: "Новые территории", accent: true },
          ].map(item => (
            <div
              key={item.text}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 border"
              style={item.accent
                ? { background: "rgba(245,168,0,0.12)", borderColor: "rgba(245,168,0,0.35)" }
                : { background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.08)" }
              }
            >
              <Icon name={item.icon as "Zap"} size={11} className="text-[#F5A800]" />
              <span className={`text-[11px] font-semibold ${item.accent ? "text-[#F5A800]" : "text-white/65"}`}>{item.text}</span>
            </div>
          ))}
        </div>

        {/* ── СТРОКА-ЯКОРЬ: не попутка ── */}
        <div className="flex items-center gap-2 mb-3 px-1">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
          <span className="text-white/35 text-[11px] font-semibold tracking-wide">Такси. Не попутка. Не доставка.</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.07)" }} />
        </div>

        {/* ── КНОПКА ПОЗВОНИТЬ ── */}
        <a
          href={PHONE_HREF}
          onClick={() => ymGoal("quick_phone_click")}
          className="relative flex flex-col items-center justify-center w-full rounded-3xl py-6 mb-3 active:scale-[0.97] transition-transform select-none overflow-hidden"
          style={{
            background: "linear-gradient(135deg,#F5A800 0%,#ffba00 100%)",
            boxShadow: "0 0 50px rgba(245,168,0,0.5), 0 6px 24px rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="absolute inset-0 rounded-3xl"
            style={{ boxShadow: pulse ? "0 0 0 12px rgba(245,168,0,0.1)" : "0 0 0 0px rgba(245,168,0,0)", transition: "box-shadow 0.8s ease" }}
          />
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-black/20 flex items-center justify-center">
              <Icon name="PhoneCall" size={22} className="text-[#09090e]" />
            </div>
            <div style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 30, color: "#09090e", textTransform: "uppercase", letterSpacing: "0.02em" }}>
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

        {/* ── MAX + TG ── */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          <a
            href={MAX_HREF}
            target="_blank" rel="noopener noreferrer"
            onClick={() => ymGoal("quick_max_click")}
            className="relative flex flex-col items-center justify-center rounded-2xl py-5 gap-2 active:scale-[0.97] transition-transform"
            style={{ background: "linear-gradient(135deg,#002d60 0%,#004aad 100%)", border: "1px solid rgba(0,119,255,0.45)", boxShadow: "0 4px 24px rgba(0,119,255,0.3)" }}
          >
            <div className="absolute top-2 right-2 bg-[#F5A800] rounded-full px-1.5 py-0.5">
              <span className="text-[8px] font-black text-[#09090e] uppercase tracking-wide">Чаще пишут</span>
            </div>
            <img src={MAX_LOGO} alt="MAX" className="h-7 object-contain" />
            <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 15, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Написать в MAX
            </div>
          </a>
          <a
            href={TG_HREF}
            target="_blank" rel="noopener noreferrer"
            onClick={() => ymGoal("quick_tg_click")}
            className="flex flex-col items-center justify-center rounded-2xl py-5 gap-2 active:scale-[0.97] transition-transform"
            style={{ background: "linear-gradient(135deg,#0a3d54 0%,#0f6090 100%)", border: "1px solid rgba(34,158,217,0.3)", boxShadow: "0 4px 24px rgba(34,158,217,0.15)" }}
          >
            <Icon name="Send" size={26} className="text-[#4fc3f7]" />
            <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 15, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Telegram
            </div>
          </a>
        </div>

        {/* ── КАЛЬКУЛЯТОР ── */}
        <div ref={calcRef} className="mb-10 scroll-mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Calculator" size={14} className="text-[#F5A800]" />
            <span style={{ fontFamily: "Oswald" }} className="text-white font-bold uppercase tracking-wide text-sm">Калькулятор стоимости</span>
          </div>
          <div className="rounded-2xl overflow-hidden" style={{ background: "#111018", border: "1px solid rgba(245,168,0,0.18)" }}>
            <div className="px-4 pt-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-white/30 text-[10px] font-bold uppercase tracking-wider block mb-1">Откуда</label>
                  <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Москва"
                    className="w-full rounded-xl px-3 py-2 text-white text-[13px] placeholder-white/15 focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }} />
                </div>
                <div>
                  <label className="text-white/30 text-[10px] font-bold uppercase tracking-wider block mb-1">Куда</label>
                  <input value={to} onChange={e => setTo(e.target.value)} placeholder="Краснодар"
                    className="w-full rounded-xl px-3 py-2 text-white text-[13px] placeholder-white/15 focus:outline-none"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }} />
                </div>
              </div>
              <div>
                <label className="text-white/30 text-[10px] font-bold uppercase tracking-wider block mb-1">Расстояние (км)</label>
                <input value={km} onChange={e => setKm(e.target.value.replace(/\D/g, ""))} placeholder="Например, 350" inputMode="numeric"
                  className="w-full rounded-xl px-3 py-2 text-white text-[13px] placeholder-white/15 focus:outline-none"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)" }} />
                <div className="text-white/18 text-[10px] mt-1">Расстояние по трассе — Яндекс.Карты</div>
              </div>

              {price ? (
                <>
                  <div className="rounded-xl px-4 py-3" style={{ background: "rgba(245,168,0,0.09)", border: "1px solid rgba(245,168,0,0.28)" }}>
                    <div className="text-white/35 text-[10px] font-bold uppercase tracking-wider mb-1">Стоимость поездки</div>
                    <div style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 26, color: "#F5A800" }}>
                      от {price.toLocaleString("ru")} ₽
                    </div>
                    <div className="text-white/28 text-[11px] mt-0.5">
                      {from && to ? `${from} → ${to} · ` : ""}{km} км · тариф Стандарт · фикс. цена
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <a href={`${TG_HREF}?text=${tgMsg}`} target="_blank" rel="noopener noreferrer"
                      onClick={() => ymGoal("calc_tg_click")}
                      className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-white text-[12px] font-bold uppercase"
                      style={{ background: "#1a8abf" }}>
                      <Icon name="Send" size={12} /> Telegram
                    </a>
                    <a href={PHONE_HREF} onClick={() => ymGoal("calc_phone_click")}
                      className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-[#09090e] text-[12px] font-bold uppercase"
                      style={{ background: "#F5A800" }}>
                      <Icon name="Phone" size={12} /> Позвонить
                    </a>
                  </div>
                </>
              ) : (
                <div className="rounded-xl px-4 py-3 text-center text-white/22 text-[12px]" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  Введите расстояние — цена появится сразу
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── ТАРИФЫ ── */}
        <div ref={tariffsRef} className="mb-10 scroll-mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Car" size={14} className="text-[#F5A800]" />
            <span style={{ fontFamily: "Oswald" }} className="text-white font-bold uppercase tracking-wide text-sm">Тарифы</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {TARIFFS.map(t => (
              <div key={t.name} className="rounded-2xl px-3 py-3" style={{ background: "#111018", border: "1px solid rgba(255,255,255,0.07)" }}>
                {t.badge && (
                  <span className="text-[9px] font-bold uppercase tracking-wider rounded-full px-2 py-0.5 mb-2 inline-block"
                    style={{ background: `${t.color}1a`, color: t.color }}>
                    {t.badge}
                  </span>
                )}
                <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 15, color: "#fff" }}>{t.name}</div>
                <div className="text-white/38 text-[11px] mt-0.5">{t.desc}</div>
                <div className="flex items-center gap-1 mt-2">
                  <Icon name="Users" size={11} style={{ color: t.color }} />
                  <span className="text-[11px] font-semibold" style={{ color: t.color }}>{t.seats} места</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2.5" style={{ background: "rgba(245,168,0,0.07)", border: "1px solid rgba(245,168,0,0.18)" }}>
            <Icon name="Tag" size={12} className="text-[#F5A800] shrink-0" />
            <span className="text-[#F5A800] text-[11px] font-bold">Фиксированная стоимость — без счётчика и сюрпризов</span>
          </div>
        </div>

        {/* ── ОТЗЫВЫ ── */}
        <div ref={reviewsRef} className="mb-4 scroll-mt-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="Star" size={14} className="text-[#F5A800]" />
            <span style={{ fontFamily: "Oswald" }} className="text-white font-bold uppercase tracking-wide text-sm">Отзывы пассажиров</span>
          </div>
          <div className="space-y-4">
            {REVIEWS.map(r => (
              <div key={r.name} className="rounded-2xl overflow-hidden" style={{ background: "#111018", border: "1px solid rgba(255,255,255,0.07)" }}>
                {/* большое фото вверху */}
                <div className="relative w-full" style={{ height: 160 }}>
                  <img src={r.img} alt={r.name} className="w-full h-full object-cover" />
                  {/* градиент снизу фото */}
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 40%, #111018 100%)" }} />
                  {/* имя поверх фото */}
                  <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                    <div>
                      <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 16, color: "#fff" }}>{r.name}</div>
                      <div className="text-white/50 text-[10px]">{r.route}</div>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => <Icon key={i} name="Star" size={11} className="text-[#F5A800]" />)}
                    </div>
                  </div>
                </div>
                {/* текст отзыва */}
                <div className="px-4 py-3">
                  <p className="text-white/60 text-[12.5px] leading-relaxed">«{r.text}»</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── НИЖНЯЯ ПАНЕЛЬ — ФИКСИРОВАННАЯ ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-3" style={{ background: "linear-gradient(to top,#09090e 70%,transparent)" }}>
        <div className="max-w-sm mx-auto grid grid-cols-3 gap-2">
          <a href={PHONE_HREF} onClick={() => ymGoal("bottom_phone_click")}
            className="flex flex-col items-center justify-center rounded-2xl py-3 gap-1 active:scale-[0.97] transition-transform"
            style={{ background: "#F5A800", boxShadow: "0 4px 20px rgba(245,168,0,0.4)" }}>
            <Icon name="Phone" size={18} className="text-[#09090e]" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#09090e", fontWeight: 800, textTransform: "uppercase" }}>Звонок</span>
          </a>
          <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("bottom_max_click")}
            className="flex flex-col items-center justify-center rounded-2xl py-3 gap-1 active:scale-[0.97] transition-transform"
            style={{ background: "linear-gradient(135deg,#002d60,#004aad)", border: "1px solid rgba(0,119,255,0.4)", boxShadow: "0 4px 16px rgba(0,100,255,0.25)" }}>
            <img src={MAX_LOGO} alt="MAX" className="h-5 object-contain" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>MAX</span>
          </a>
          <a href={TG_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("bottom_tg_click")}
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