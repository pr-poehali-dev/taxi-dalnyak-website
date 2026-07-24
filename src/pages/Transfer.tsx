import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { parseRoute, toGenitive, type RouteResult } from "@/lib/cityRoute";

declare global { interface Window { ym?: (id: number, action: string, goal: string) => void; } }

const LOGO     = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/3a499542-747a-49d2-808e-4c137548c76e.jpg";
const MAX_LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/cf5e3e58-7d83-4d19-8c48-f91922395adf.png";
const HERO_CAR = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/dcda6258-21cd-407d-a1ec-0bb7c13f348b.jpg";

const REVIEW_1 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/b0eb5050-a05a-4647-8442-4b839d45161f.jpg";
const REVIEW_2 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/fedc4281-a106-4024-9369-8a03712c92a3.jpg";
const REVIEW_3 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/ac322d91-fd27-4c11-b86f-f28e85ec3df0.jpg";

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
  { n: "01", title: "Называете маршрут",   desc: "Говорите город отправления и город назначения — куда нужно ехать", icon: "MessageCircleMore" },
  { n: "02", title: "Рассчитываем цену",   desc: "Сразу называем точную фиксированную стоимость поездки", icon: "Calculator" },
  { n: "03", title: "Ищем машину",         desc: "Подбираем свободный автомобиль и водителя под ваш маршрут", icon: "Search" },
  { n: "04", title: "Присылаем СМС",       desc: "Как только машина назначена — приходит СМС с данными авто и водителя", icon: "MessageSquareText" },
  { n: "05", title: "Вы едете",            desc: "Водитель подаёт автомобиль точно в срок, комфортно доезжаете до места", icon: "Car" },
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
  { name: "Валерия", route: "Москва – Новомичуринск",   img: REVIEW_1 },
  { name: "Ирина",   route: "Лен. область – СПб",       img: REVIEW_3 },
  { name: "Евгений", route: "Межгород по России",       img: REVIEW_2 },
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
  const [route, setRoute] = useState<RouteResult | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const term = params.get("utm_term") || params.get("utm_content") || "";
    const r = parseRoute(term);
    setRoute(r);

    if (r?.from && r?.to) {
      document.title = `Такси ${r.from} — ${r.to}${r.price ? ` от ${r.price.min.toLocaleString("ru")} ₽` : ""} — Дальняк`;
    } else if (r?.to) {
      document.title = `Заказать такси до ${r.to} — Дальняк`;
    } else {
      document.title = "Заказать такси из города в город от 200 км — Дальняк";
    }
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
              {route?.from && route?.to ? (
                <>Заказать такси<br />{route.from} <span style={{ color: FLAME }}>—</span> {route.to}</>
              ) : route?.to ? (
                <>Заказать такси<br />до города <span style={{ color: FLAME }}>{route.to}</span></>
              ) : (
                <>Заказать такси<br />из города в город<br /><span style={{ color: FLAME }}>от 200 км</span></>
              )}
            </h1>

            {route?.km && route?.price ? (
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: "rgba(255,122,41,0.12)", border: `1px solid rgba(255,122,41,0.3)` }}>
                  <Icon name="Route" size={13} style={{ color: FLAME }} />
                  <span style={{ color: "#fff", fontSize: 12.5, fontWeight: 700 }}>≈ {route.km.toLocaleString("ru")} км</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: "rgba(255,122,41,0.12)", border: `1px solid rgba(255,122,41,0.3)` }}>
                  <Icon name="Wallet" size={13} style={{ color: FLAME }} />
                  <span style={{ color: "#fff", fontSize: 12.5, fontWeight: 700 }}>от {route.price.min.toLocaleString("ru")} ₽</span>
                </div>
                <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5" style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.3)" }}>
                  <Icon name="Clock" size={13} style={{ color: "#4ade80" }} />
                  <span style={{ color: "#fff", fontSize: 12.5, fontWeight: 700 }}>подача 15–30 мин</span>
                </div>
              </div>
            ) : null}

            <div className="flex items-center gap-2 mt-3 flex-wrap">
              <a href="/kpp" onClick={() => ymGoal("t_hero_kpp")}
                style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: "clamp(14px,1.8vw,18px)", color: FLAME, textTransform: "uppercase", letterSpacing: "0.02em", textDecoration: "underline", textUnderlineOffset: 3 }}>
                Трансфер до КПП
              </a>
            </div>

            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 15, lineHeight: 1.7, marginTop: 18, maxWidth: 460 }}>
              {route?.from && route?.to
                ? `Едем из ${toGenitive(route.from)} в ${route.to} по фиксированной цене. Работаем по договору, предоставляем отчётные документы для бухгалтерии.`
                : "Межгородние поездки от 200 км по фиксированной цене. Работаем по договору, предоставляем отчётные документы для бухгалтерии."}
            </p>

            <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 mt-4" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}>
              <Icon name="Ban" size={13} style={{ color: "#f87171", flexShrink: 0 }} />
              <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12.5 }}>Короткие поездки по городу и с попутчиками — <span style={{ color: "#f87171", fontWeight: 700 }}>не обслуживаем</span></span>
            </div>

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
              {[["12+","лет на рынке"],["50k+","поездок"],["30+","городов"]].map(([v,l]) => (
                <div key={l}>
                  <span style={{ fontFamily: "Oswald", color: FLAME, fontWeight: 900, fontSize: 22 }}>{v}</span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginLeft: 6 }}>{l}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mt-5 max-w-md">
              {[
                { name: "Яндекс Карты", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#fff"/><circle cx="12" cy="9" r="2.5" fill="#ff4433"/></svg>, bg: "linear-gradient(135deg,#ff4433,#ff6b35)" },
                { name: "2ГИС",        icon: <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 10, fontWeight: 900 }}>2ГИС</span>,       bg: "linear-gradient(135deg,#00b956,#008f42)" },
              ].map(r => (
                <div key={r.name} className="rounded-2xl px-3.5 py-3 flex flex-col gap-1.5" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${LINE}` }}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: r.bg }}>{r.icon}</div>
                    <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em" }}>{r.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 22, fontWeight: 900, lineHeight: 1 }}>4.8</span>
                    <div className="flex gap-0.5">
                      {[1,2,3,4].map(i => <Icon key={i} name="Star" size={11} style={{ color: FLAME }} className="fill-[#FF7A29]" />)}
                      <Icon name="Star" size={11} style={{ color: "rgba(255,255,255,0.15)" }} />
                    </div>
                  </div>
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
                <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>Работаем с 2014 года</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>Опытные водители, новые автомобили</div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-5 pb-10">
          <div className="rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6" style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${LINE}` }}>
            <div className="flex items-center gap-2 shrink-0">
              <Icon name="AlertCircle" size={14} style={{ color: "rgba(255,255,255,0.3)" }} />
              <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>Важно знать</span>
            </div>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              <div className="flex items-center gap-2">
                <div className="w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)" }}>
                  <Icon name="X" size={9} style={{ color: "#f87171" }} />
                </div>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12.5 }}>Короткие поездки по городу не обслуживаем</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)" }}>
                  <Icon name="X" size={9} style={{ color: "#f87171" }} />
                </div>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12.5 }}>Поездки с попутчиками не выполняем</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.35)" }}>
                  <Icon name="Check" size={9} style={{ color: "#4ade80" }} />
                </div>
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12.5, fontWeight: 600 }}>Работаем только на дальних маршрутах — от 200 км</span>
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
            <h2 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: "clamp(24px,3vw,34px)", color: "#fff", textTransform: "uppercase" }}>Как проходит заказ</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-5">
            {STEPS.map(s => (
              <div key={s.n} className="relative rounded-2xl p-6" style={{ background: INK, border: `1px solid ${LINE}` }}>
                <div style={{ fontFamily: "Oswald", color: "rgba(255,122,41,0.25)", fontSize: 40, fontWeight: 900, position: "absolute", top: 8, right: 16 }}>{s.n}</div>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: "rgba(255,122,41,0.12)" }}>
                  <Icon name={s.icon as "Car"} size={20} style={{ color: FLAME }} />
                </div>
                <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: 16, fontWeight: 700, textTransform: "uppercase", marginBottom: 6 }}>{s.title}</div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12.5, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
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
              <div key={r.name} className="rounded-2xl overflow-hidden flex flex-col" style={{ background: INK, border: `1px solid ${LINE}` }}>
                <img src={r.img} alt={r.name} loading="lazy" className="w-full block" />
                <div className="p-4 flex items-center justify-between">
                  <div>
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
                <div>ОГРНИП 326180000068152</div>
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
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>Трансфер для дальних поездок от 200 км</div>
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