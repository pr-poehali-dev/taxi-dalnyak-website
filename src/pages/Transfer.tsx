import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

declare global { interface Window { ym?: (id: number, action: string, goal: string) => void; } }

const LOGO     = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/3a499542-747a-49d2-808e-4c137548c76e.jpg";
const MAX_LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/cf5e3e58-7d83-4d19-8c48-f91922395adf.png";
const HERO_CAR = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/dcda6258-21cd-407d-a1ec-0bb7c13f348b.jpg";

const PHONE      = "+7 (995) 645-51-25";
const PHONE_HREF = "tel:+79956455125";
const VK_HREF    = "https://vk.com/dalnyack";
const TG_HREF    = "https://t.me/Mezhgorod1816";
const MAX_HREF   = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";

const INK    = "#0c1015";
const PANEL  = "#161b23";
const LINE   = "rgba(255,255,255,0.08)";
const FLAME  = "#FF7A29";
const FLAME2 = "#FFC13B";

function ymGoal(goal: string) {
  if (typeof window.ym === "function") window.ym(108400932, "reachGoal", goal);
}
function ymLead(channel: string) { ymGoal("lead"); ymGoal(`lead_${channel}`); }

const STEPS = [
  { n: "01", title: "Оставляете заявку", desc: "Звоните или пишете в мессенджер — говорите откуда и куда нужно ехать", icon: "MessageCircleMore" },
  { n: "02", title: "Бронируете авто",   desc: "Вносите предоплату 30% от стоимости поездки — бронь подтверждена", icon: "CalendarCheck2" },
  { n: "03", title: "Едете с комфортом", desc: "Автомобиль подан точно в срок — остаток оплаты по факту поездки", icon: "Car" },
];

const GUARANTEE = [
  { icon: "Percent",        title: "Предоплата 30%",       desc: "Вносится при бронировании — фиксирует машину и время подачи именно для вас", tone: "neutral" },
  { icon: "RotateCcw",      title: "Отказ за 4 часа",      desc: "Передумали не позднее чем за 4 часа до выезда — предоплата возвращается полностью", tone: "good" },
  { icon: "BadgeDollarSign",title: "Наша ответственность", desc: "Не нашли машину за час до выезда — возвращаем 100% предоплаты и платим компенсацию 50% сверху", tone: "flame" },
];

const CITIES = [
  "Москва","Санкт-Петербург","Белгород","Брянск","Владимир",
  "Воронеж","Калуга","Кострома","Курск","Липецк",
  "Рязань","Тамбов","Тверь","Тула","Ярославль",
  "Вологда","Нижний Новгород","Ижевск","Новосибирск",
  "Омск","Екатеринбург","Тюмень","Челябинск",
  "Богучарский р-н","Тоцкий р-н","Новые территории",
];

const FLEET = [
  { id: "standart",    name: "Стандарт",  desc: "Рио · Поло · Солярис",   seats: "4 места",  img: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/39d043f8-acde-4a27-a69c-ebe03e8bd403.jpg" },
  { id: "comfort",     name: "Комфорт",   desc: "Хавал Джулиан 2025",     seats: "4 места",  img: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/238966ba-ee86-4f06-bc36-0872f043ebfb.jpg" },
  { id: "comfortplus", name: "Комфорт+",  desc: "Toyota Camry 70 кузов",  seats: "4 места",  img: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/38f8c2aa-ebc6-4a58-bedb-3322efbce272.jpg" },
  { id: "minivan",     name: "Минивэн",   desc: "Hyundai Staria 2022",    seats: "7 мест",   img: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/92a14984-9eac-4b0c-aa50-8c49af1c12b7.jpg" },
];

const REVIEWS = [
  { name: "Валерия", route: "Москва – Новомичуринск", text: "Очень переживала — зимой с ребёнком, первый раз на такое расстояние. Но всё прошло замечательно! Машину нашли быстро, водитель — замечательный человек." },
  { name: "Ирина",   route: "Лен. область – СПб",     text: "Позвонила в две компании — ничего не нашли. На третий раз нашла Такси Дальняк. Водитель очень вежливый, машина в идеальном состоянии." },
  { name: "Евгений", route: "Межгород по России",     text: "Рекомендую! Удобная и быстрая доставка, комфортабельный авто. Ребята отвечают за время, комфорт и стоимость." },
];

function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return scrolled;
}

export default function Transfer() {
  const scrolled = useScrolled();

  useEffect(() => {
    document.title = "Деловые поездки и командировки в другой город — Дальняк";
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: INK, fontFamily: "Inter, sans-serif" }}>

      {/* ══ ХЕДЕР ══ */}
      <div className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? "py-2.5 shadow-2xl" : "py-4"}`}
        style={{ background: scrolled ? "rgba(12,16,21,0.96)" : "transparent", backdropFilter: "blur(10px)", borderBottom: scrolled ? `1px solid ${LINE}` : "none" }}>
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="" loading="lazy" className="w-9 h-9 rounded-xl object-cover" style={{ border: `1.5px solid ${FLAME}` }} />
            <span style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 15, color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em" }}>Такси Дальняк</span>
          </div>
          <a href={PHONE_HREF} onClick={() => { ymGoal("t_header_call"); ymLead("phone"); }}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-transform hover:scale-105"
            style={{ background: `linear-gradient(135deg,${FLAME},${FLAME2})` }}>
            <Icon name="Phone" size={14} style={{ color: INK }} />
            <span className="hidden sm:inline" style={{ fontFamily: "Oswald", fontSize: 13, color: INK, fontWeight: 800 }}>{PHONE}</span>
            <span className="sm:hidden" style={{ fontFamily: "Oswald", fontSize: 13, color: INK, fontWeight: 800, textTransform: "uppercase" }}>Звонок</span>
          </a>
        </div>
      </div>

      {/* ══ HERO — сплит-макет ══ */}
      <div className="relative">
        <div className="max-w-6xl mx-auto px-5 pt-8 md:pt-14 pb-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-5" style={{ background: "rgba(255,122,41,0.1)", border: `1px solid rgba(255,122,41,0.3)` }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#4ade80" }} />
              <span style={{ color: FLAME2, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Диспетчер на связи 24/7</span>
            </div>

            <h1 style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: "clamp(28px,4.2vw,46px)", lineHeight: 1.05, color: "#fff", textTransform: "uppercase" }}>
              Деловые поездки<br />и командировки<br />в другой город
            </h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: "clamp(14px,1.8vw,18px)", color: FLAME, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                Трансфер для организаций
              </span>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: "clamp(14px,1.8vw,18px)", fontWeight: 700 }}>/</span>
              <a href="/kpp" onClick={() => ymGoal("t_hero_kpp")}
                style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: "clamp(14px,1.8vw,18px)", color: FLAME, textTransform: "uppercase", letterSpacing: "0.02em", textDecoration: "underline", textUnderlineOffset: 3 }}>
                Трансфер до КПП
              </a>
            </div>

            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.7, marginTop: 18, maxWidth: 460 }}>
              Межгородние поездки от 200 км по фиксированной цене. Работаем по договору, предоставляем отчётные документы для бухгалтерии.
            </p>

            <div className="flex flex-col gap-3 mt-7">
              <a href={PHONE_HREF} onClick={() => { ymGoal("t_hero_call"); ymLead("phone"); }}
                className="flex items-center justify-center gap-2.5 w-full rounded-2xl px-7 py-4 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: `linear-gradient(135deg,${FLAME},${FLAME2})`, boxShadow: "0 8px 30px rgba(255,122,41,0.4)" }}>
                <Icon name="PhoneCall" size={18} style={{ color: INK }} />
                <span style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 15, color: INK, textTransform: "uppercase" }}>Забронировать авто</span>
              </a>
              <div className="grid grid-cols-2 gap-3">
                <a href={TG_HREF} target="_blank" rel="noopener noreferrer" onClick={() => { ymGoal("t_hero_tg"); ymLead("tg"); }}
                  className="flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${LINE}` }}>
                  <Icon name="Send" size={16} style={{ color: "#fff" }} />
                  <span style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 14, color: "#fff", textTransform: "uppercase" }}>Telegram</span>
                </a>
                <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" onClick={() => { ymGoal("t_hero_max"); ymLead("max"); }}
                  className="flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${LINE}` }}>
                  <img src={MAX_LOGO} alt="MAX" loading="lazy" className="h-4 object-contain" />
                  <span style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 14, color: "#fff", textTransform: "uppercase" }}>MAX</span>
                </a>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 mt-7">
              {[["12+","лет на рынке"],["50k+","поездок"],["30+","городов"],["4.9","рейтинг"]].map(([v,l]) => (
                <div key={l}>
                  <span style={{ fontFamily: "Oswald", color: FLAME, fontWeight: 900, fontSize: 22 }}>{v}</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginLeft: 6 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative rounded-3xl overflow-hidden" style={{ aspectRatio: "4/3", border: `1px solid ${LINE}` }}>
            <img src={HERO_CAR} alt="Автомобиль на трассе" loading="eager" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(12,16,21,0.7) 0%,transparent 45%)" }} />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl px-4 py-3 flex items-center gap-3"
              style={{ background: "rgba(12,16,21,0.85)", backdropFilter: "blur(8px)", border: `1px solid ${LINE}` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg,${FLAME},${FLAME2})` }}>
                <Icon name="ShieldCheck" size={17} style={{ color: INK }} />
              </div>
              <div>
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>Гарантия 100% подачи</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Или полный возврат + компенсация</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ КАК ЭТО РАБОТАЕТ ══ */}
      <div style={{ background: PANEL, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
        <div className="max-w-6xl mx-auto px-5 py-14">
          <div className="text-center mb-10">
            <div style={{ color: FLAME, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em" }} className="mb-2">Процесс</div>
            <h2 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", color: "#fff", textTransform: "uppercase" }}>Как проходит бронирование</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((s, i) => (
              <div key={s.n} className="relative rounded-2xl p-6" style={{ background: INK, border: `1px solid ${LINE}` }}>
                <div style={{ fontFamily: "Oswald", color: "rgba(255,122,41,0.25)", fontSize: 48, fontWeight: 900, position: "absolute", top: 8, right: 16 }}>{s.n}</div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(255,122,41,0.12)" }}>
                  <Icon name={s.icon as "Car"} size={20} style={{ color: FLAME }} />
                </div>
                <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: 17, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>{s.title}</div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.65 }}>{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <Icon name="ChevronRight" size={18} className="hidden md:block" style={{ color: "rgba(255,122,41,0.4)", position: "absolute", top: "50%", right: -28, transform: "translateY(-50%)" }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ ГЛАВНАЯ ГАРАНТИЯ ══ */}
      <div style={{ background: INK }}>
        <div className="max-w-6xl mx-auto px-5 py-14">
          <div className="rounded-3xl p-6 md:p-10 relative overflow-hidden" style={{ background: `linear-gradient(135deg,#1a1206,#221806)`, border: `1.5px solid ${FLAME}` }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(to right,${FLAME},${FLAME2},${FLAME})` }} />
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg,${FLAME},${FLAME2})`, boxShadow: "0 4px 24px rgba(255,122,41,0.5)" }}>
                <Icon name="ShieldCheck" size={28} style={{ color: INK }} />
              </div>
              <div>
                <div style={{ color: FLAME, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em" }}>Главное преимущество</div>
                <h2 style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: "clamp(20px,3vw,30px)", color: "#fff", textTransform: "uppercase" }}>Гарантируем 100% подачу автомобиля</h2>
              </div>
            </div>

            <div className="relative">
              <div className="hidden md:block absolute left-0 right-0" style={{ top: 22, height: 2, background: "rgba(255,255,255,0.1)" }} />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {GUARANTEE.map((g, i) => (
                  <div key={g.title} className="relative">
                    <div className="hidden md:flex w-11 h-11 rounded-full items-center justify-center mb-4 relative z-10"
                      style={{ background: g.tone === "flame" ? `linear-gradient(135deg,${FLAME},${FLAME2})` : INK, border: g.tone === "flame" ? "none" : `2px solid ${g.tone === "good" ? "#4ade80" : "rgba(255,255,255,0.2)"}` }}>
                      <span style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 15, color: g.tone === "flame" ? INK : "#fff" }}>{i + 1}</span>
                    </div>
                    <div className="rounded-2xl p-4" style={{ background: g.tone === "flame" ? "rgba(255,122,41,0.1)" : "rgba(255,255,255,0.04)", border: `1px solid ${g.tone === "flame" ? "rgba(255,122,41,0.3)" : "rgba(255,255,255,0.08)"}` }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Icon name={g.icon as "Percent"} size={16} style={{ color: g.tone === "good" ? "#4ade80" : FLAME }} />
                        <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 14, fontWeight: 700, textTransform: "uppercase" }}>{g.title}</span>
                      </div>
                      <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 12.5, lineHeight: 1.6 }}>{g.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 mt-7 pt-6" style={{ borderTop: `1px solid ${LINE}` }}>
              <Icon name="Sparkles" size={14} style={{ color: FLAME, flexShrink: 0 }} />
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12.5 }}>Так мы гарантируем, что автомобиль будет подан к нужному времени — либо вы ничего не теряете</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══ АВТОПАРК ══ */}
      <div style={{ background: PANEL, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
        <div className="max-w-6xl mx-auto px-5 py-14">
          <div className="flex items-center justify-between mb-8">
            <div>
              <div style={{ color: FLAME, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em" }} className="mb-2">Автопарк</div>
              <h2 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", color: "#fff", textTransform: "uppercase" }}>Выберите класс авто</h2>
            </div>
            <a href="/tariffs" className="hidden sm:flex items-center gap-1 rounded-xl px-4 py-2.5" style={{ background: "rgba(255,122,41,0.1)", border: `1px solid rgba(255,122,41,0.25)` }}>
              <span style={{ color: FLAME, fontSize: 13, fontWeight: 700 }}>Все тарифы</span>
              <Icon name="ChevronRight" size={14} style={{ color: FLAME }} />
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FLEET.map(car => (
              <div key={car.id} className="rounded-2xl overflow-hidden" style={{ background: INK, border: `1px solid ${LINE}` }}>
                <div className="relative" style={{ aspectRatio: "1/0.85" }}>
                  <img src={car.img} alt={car.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                </div>
                <div className="p-3.5">
                  <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: 14, fontWeight: 700, textTransform: "uppercase" }}>{car.name}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2 }}>{car.desc}</div>
                  <div className="flex items-center gap-1 mt-2">
                    <Icon name="Users" size={11} style={{ color: FLAME }} />
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{car.seats}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ ГОРОДА ══ */}
      <div style={{ background: INK }}>
        <div className="max-w-6xl mx-auto px-5 py-14">
          <div className="text-center mb-8">
            <div style={{ color: FLAME, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em" }} className="mb-2">География</div>
            <h2 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", color: "#fff", textTransform: "uppercase" }}>Города присутствия</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
            {CITIES.map(c => (
              <span key={c} className="rounded-full px-3.5 py-2 text-[12px] font-semibold"
                style={c === "Новые территории"
                  ? { background: "rgba(255,122,41,0.15)", border: "1px solid rgba(255,122,41,0.4)", color: FLAME2 }
                  : { background: PANEL, border: `1px solid ${LINE}`, color: "rgba(255,255,255,0.65)" }}>
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ══ ОТЗЫВЫ ══ */}
      <div style={{ background: PANEL, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
        <div className="max-w-6xl mx-auto px-5 py-14">
          <div className="text-center mb-8">
            <div style={{ color: FLAME, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.25em" }} className="mb-2">Отзывы</div>
            <h2 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", color: "#fff", textTransform: "uppercase" }}>Что говорят пассажиры</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {REVIEWS.map(r => (
              <div key={r.name} className="rounded-2xl p-5 flex flex-col" style={{ background: INK, border: `1px solid ${LINE}` }}>
                <Icon name="Quote" size={22} style={{ color: "rgba(255,122,41,0.35)", marginBottom: 10 }} />
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 13.5, lineHeight: 1.7, flex: 1 }}>{r.text}</p>
                <div className="flex items-center gap-3 mt-5 pt-4" style={{ borderTop: `1px solid ${LINE}` }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg,${FLAME},${FLAME2})` }}>
                    <span style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 15, color: INK }}>{r.name.charAt(0)}</span>
                  </div>
                  <div className="flex-1">
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 13.5 }}>{r.name}</div>
                    <div style={{ color: FLAME, fontSize: 11 }}>{r.route}</div>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    {[1,2,3,4,5].map(i => <Icon key={i} name="Star" size={11} style={{ color: FLAME }} className="fill-[#FF7A29]" />)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ ДЛЯ ЮРИДИЧЕСКИХ ЛИЦ ══ */}
      <div style={{ background: INK }}>
        <div className="max-w-6xl mx-auto px-5 py-14">
          <div className="rounded-3xl p-6 md:p-9 relative overflow-hidden" style={{ background: `linear-gradient(135deg,#141822,#0f1319)`, border: `1.5px solid rgba(255,122,41,0.35)` }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(to right,${FLAME},${FLAME2},${FLAME})` }} />

            <div className="flex flex-col md:flex-row md:items-center gap-6 mb-7">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg,${FLAME},${FLAME2})`, boxShadow: "0 4px 24px rgba(255,122,41,0.4)" }}>
                  <Icon name="Briefcase" size={26} style={{ color: INK }} />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 mb-1.5" style={{ background: "rgba(255,122,41,0.15)", border: "1px solid rgba(255,122,41,0.35)" }}>
                    <span style={{ color: FLAME2, fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>Для бизнеса</span>
                  </div>
                  <h2 style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: "clamp(19px,2.5vw,26px)", color: "#fff", textTransform: "uppercase", lineHeight: 1.15 }}>
                    Работаем с юридическими лицами и ИП
                  </h2>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-7">
              <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${LINE}` }}>
                <Icon name="FileSignature" size={18} style={{ color: FLAME, flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>Заключаем договор</div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11.5, marginTop: 2, lineHeight: 1.5 }}>Официальное сотрудничество с компанией</div>
                </div>
              </div>
              <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${LINE}` }}>
                <Icon name="Receipt" size={18} style={{ color: FLAME, flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>Отчётные документы</div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11.5, marginTop: 2, lineHeight: 1.5 }}>Для бухгалтерии и командировочных расходов</div>
                </div>
              </div>
              <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${LINE}` }}>
                <Icon name="Users" size={18} style={{ color: FLAME, flexShrink: 0, marginTop: 1 }} />
                <div>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>Корпоративные поездки</div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 11.5, marginTop: 2, lineHeight: 1.5 }}>Командировки и встречи сотрудников</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl p-4 mb-6" style={{ background: "rgba(0,0,0,0.2)", border: `1px solid ${LINE}` }}>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Реквизиты</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1.5" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.9 }}>
                <div>ИП Гузаеров А. Л.</div>
                <div>ИНН 183209197326</div>
                <div>ОГРНИП 326180000068152</div>
                <div>Завьяловский р-н, г. Ижевск, ул. Баранова, 81</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a href="mailto:guzaerov.alex@yandex.ru" onClick={() => ymGoal("t_b2b_email")}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-transform hover:scale-105"
                style={{ background: "rgba(255,255,255,0.06)", border: `1px solid ${LINE}` }}>
                <Icon name="Mail" size={14} style={{ color: FLAME }} />
                <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 12.5, fontWeight: 600 }}>guzaerov.alex@yandex.ru</span>
              </a>
              <a href={PHONE_HREF} onClick={() => { ymGoal("t_b2b_call"); ymLead("phone"); }}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 transition-transform hover:scale-105"
                style={{ background: `linear-gradient(135deg,${FLAME},${FLAME2})` }}>
                <Icon name="Phone" size={14} style={{ color: INK }} />
                <span style={{ color: INK, fontSize: 12.5, fontWeight: 800, textTransform: "uppercase" }}>Коммерческое предложение</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ══ ФУТЕР ══ */}
      <div className="mt-auto" style={{ background: "#080a0d", borderTop: `1px solid ${LINE}` }}>
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="" loading="lazy" className="w-10 h-10 rounded-xl object-cover" style={{ border: `1.5px solid ${FLAME}` }} />
            <div>
              <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 15, color: "#fff", textTransform: "uppercase" }}>Такси Дальняк</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>Трансфер для дальних поездок · Гарантия подачи авто</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href={PHONE_HREF} onClick={() => ymGoal("t_footer_call")}
              className="flex items-center gap-2 rounded-xl px-5 py-3 transition-transform hover:scale-105"
              style={{ background: `linear-gradient(135deg,${FLAME},${FLAME2})` }}>
              <Icon name="Phone" size={15} style={{ color: INK }} />
              <span style={{ fontFamily: "Oswald", fontSize: 14, color: INK, fontWeight: 800 }}>{PHONE}</span>
            </a>
            <a href={TG_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("t_footer_tg")}
              className="flex items-center gap-2 rounded-xl px-4 py-3 transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg,#0e6da8,#1a8fc2)" }}>
              <Icon name="Send" size={15} className="text-white" />
            </a>
            <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("t_footer_max")}
              className="flex items-center gap-2 rounded-xl px-4 py-3 transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg,#001a3d,#003080)" }}>
              <img src={MAX_LOGO} alt="MAX" loading="lazy" className="h-4 object-contain" />
            </a>
            <a href={VK_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("t_footer_vk")}
              className="flex items-center gap-2 rounded-xl px-4 py-3 transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg,#1a3a6b,#2456a4)" }}>
              <Icon name="Users" size={15} className="text-white" />
            </a>
          </div>
        </div>
      </div>

      {/* ══ МОБИЛЬНАЯ ПРИЛИПАЮЩАЯ ПАНЕЛЬ ══ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 px-4 pb-4 pt-2" style={{ background: `linear-gradient(to top,${INK} 70%,transparent)` }}>
        <a href={PHONE_HREF} onClick={() => { ymGoal("t_mobile_call"); ymLead("phone"); }}
          className="flex items-center justify-center gap-2.5 w-full rounded-2xl py-4 active:scale-[0.97] transition-transform"
          style={{ background: `linear-gradient(135deg,${FLAME},${FLAME2})`, boxShadow: "0 4px 24px rgba(255,122,41,0.5)" }}>
          <Icon name="Phone" size={18} style={{ color: INK }} />
          <span style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 16, color: INK, textTransform: "uppercase" }}>Забронировать авто</span>
        </a>
      </div>
      <div className="md:hidden" style={{ height: 88 }} />
    </div>
  );
}