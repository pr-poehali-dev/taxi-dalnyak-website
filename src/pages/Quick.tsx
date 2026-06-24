import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/components/ui/icon";

const LOGO     = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/3a499542-747a-49d2-808e-4c137548c76e.jpg";
const MAX_LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/cf5e3e58-7d83-4d19-8c48-f91922395adf.png";
const CAR_IMG  = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/091d3d1c-1649-4d9e-8958-1a624bf8f371.jpg";
const REVIEW_1 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/b0eb5050-a05a-4647-8442-4b839d45161f.jpg";
const REVIEW_2 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/fedc4281-a106-4024-9369-8a03712c92a3.jpg";
const REVIEW_3 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/ac322d91-fd27-4c11-b86f-f28e85ec3df0.jpg";

const PHONE      = "+7 (931) 009-81-76";
const PHONE_HREF = "tel:+79310098176";
const VK_HREF    = "https://vk.com/dalnyack";
const TG_HREF    = "https://t.me/Mezhgorod1816";
const MAX_HREF   = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";

const NAVY   = "#0a0f1e";
const CARD   = "#131b2e";
const BORDER = "rgba(201,168,76,0.18)";
const GOLD   = "#c9a84c";
const GOLD2  = "#e8c96a";

const CITIES = [
  "Москва","Санкт-Петербург","Белгород","Брянск","Владимир",
  "Воронеж","Калуга","Кострома","Курск","Липецк",
  "Рязань","Тамбов","Тверь","Тула","Ярославль",
  "Вологда","Нижний Новгород","Ижевск","Новосибирск",
  "Омск","Екатеринбург","Тюмень","Челябинск",
  "Богучарский р-н","Тоцкий р-н","Новые территории",
];

const REVIEWS = [
  { name: "Валерия", route: "Москва – Новомичуринск", img: REVIEW_1, text: "Очень переживала — зимой с ребёнком, первый раз на такое расстояние. Но всё прошло замечательно! Машину нашли быстро, водитель — замечательный человек. Довёз идеально!" },
  { name: "Ирина",   route: "Лен. область – СПб",     img: REVIEW_3, text: "Позвонила в две компании — ничего не нашли. На третий раз нашла Такси Дальняк. Водитель очень вежливый, машина в идеальном состоянии." },
  { name: "Евгений", route: "Межгород по России",      img: REVIEW_2, text: "Рекомендую! Удобная и быстрая доставка, комфортабельный авто. Пацаны отвечают за время, комфорт и стоимость. От всей семьи — Спасибо!" },
];

const TARIFFS = [
  { id: "standart",    name: "Стандарт",  desc: "Рио · Поло · Солярис",   seats: 4, luggage: "1–2 сумки",    img: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/39d043f8-acde-4a27-a69c-ebe03e8bd403.jpg",   badge: "",           color: "#F5A800" },
  { id: "comfort",     name: "Комфорт",   desc: "Хавал Джулиан 2025",     seats: 4, luggage: "2–3 сумки",    img: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/238966ba-ee86-4f06-bc36-0872f043ebfb.jpg",   badge: "Популярный", color: "#22D3EE" },
  { id: "comfortplus", name: "Комфорт+",  desc: "Toyota Camry 70 кузов",  seats: 4, luggage: "3–4 сумки",    img: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/38f8c2aa-ebc6-4a58-bedb-3322efbce272.jpg", badge: "Бизнес",     color: "#A78BFA" },
  { id: "minivan",     name: "Минивэн",   desc: "Hyundai Staria 2022",    seats: 7, luggage: "Много багажа", img: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/92a14984-9eac-4b0c-aa50-8c49af1c12b7.jpg", badge: "Группа",     color: "#34D399" },
];

function calcPrice(km: number): { min: number; max: number } | null {
  if (!km || km <= 0) return null;
  const rate = km <= 200 ? 30 : km <= 500 ? 27 : 26;
  const minP = Math.round(km * rate * 1.15 / 100) * 100;
  return { min: minP, max: Math.round(minP * 1.12 / 100) * 100 };
}

function PriceCalc() {
  const [km, setKm]     = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo]     = useState("");
  const price = useMemo(() => calcPrice(parseInt(km.replace(/\D/g, ""), 10)), [km]);
  const GOLD = "#c9a84c"; const GOLD2 = "#e8c96a";
  const VK_HREF2   = "https://vk.com/dalnyack";
  const PHONE_HREF2 = "tel:+79310098176";
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(201,168,76,0.2)" }}>
      <div className="px-5 pt-4 pb-3 flex items-center gap-2.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
          <Icon name="Calculator" size={15} style={{ color: "#0a0f1e" }} />
        </div>
        <div>
          <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Рассчитать стоимость</div>
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10 }}>Фиксированная цена · Без сюрпризов</div>
        </div>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 4 }}>Откуда</label>
            <input value={from} onChange={e => setFrom(e.target.value)} placeholder="Ваш город"
              className="w-full rounded-xl px-3 py-2.5 text-white text-[13px] placeholder-white/20 focus:outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
          </div>
          <div>
            <label style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 4 }}>Куда</label>
            <input value={to} onChange={e => setTo(e.target.value)} placeholder="Город назначения"
              className="w-full rounded-xl px-3 py-2.5 text-white text-[13px] placeholder-white/20 focus:outline-none"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
          </div>
        </div>
        <div>
          <label style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: 4 }}>Расстояние в км</label>
          <input value={km} onChange={e => setKm(e.target.value.replace(/\D/g, ""))} placeholder="Например, 400 км"
            inputMode="numeric"
            className="w-full rounded-xl px-3 py-2.5 text-white text-[13px] placeholder-white/20 focus:outline-none"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }} />
          <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, marginTop: 4 }}>Расстояние можно уточнить в Яндекс.Картах</div>
        </div>
        {price ? (
          <div className="rounded-xl px-4 py-3.5" style={{ background: `linear-gradient(135deg,rgba(201,168,76,0.12),rgba(201,168,76,0.06))`, border: `1px solid rgba(201,168,76,0.3)` }}>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Стоимость поездки</div>
            <div style={{ fontFamily: "Oswald", color: GOLD2, fontSize: 28, fontWeight: 900, lineHeight: 1 }}>от {price.min.toLocaleString("ru")} ₽</div>
            <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 4 }}>{from && to ? `${from} → ${to} · ` : ""}{km} км · фиксированная цена</div>
          </div>
        ) : (
          <div className="rounded-xl px-4 py-3 text-center" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>Введите расстояние — цена появится сразу</span>
          </div>
        )}
        {price && (
          <div className="grid grid-cols-2 gap-2">
            <a href={VK_HREF2} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 font-bold text-[12px] uppercase transition-transform hover:scale-[1.02] active:scale-[0.97]"
              style={{ fontFamily: "Oswald", background: "linear-gradient(135deg,#1a3a6b,#2456a4)", color: "#fff" }}>
              <Icon name="Users" size={13} /> ВКонтакте
            </a>
            <a href={PHONE_HREF2}
              className="flex items-center justify-center gap-1.5 rounded-xl py-2.5 font-bold text-[12px] uppercase transition-transform hover:scale-[1.02] active:scale-[0.97]"
              style={{ fontFamily: "Oswald", background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#0a0f1e" }}>
              <Icon name="Phone" size={13} /> Позвонить
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

const STATS = [
  { value: "12+",  label: "лет на рынке" },
  { value: "50k+", label: "поездок" },
  { value: "30+",  label: "городов" },
  { value: "4.9",  label: "рейтинг" },
];

const FEATURES = [
  { icon: "BadgeCheck", title: "Фиксированная цена",    desc: "Называем стоимость до поездки — никаких счётчиков и сюрпризов в дороге" },
  { icon: "Car",        title: "Авто не старше 10 лет", desc: "Комфортные автомобили, проверенные перед каждым рейсом" },
  { icon: "Shield",     title: "Работаем с 2014 года",  desc: "10+ лет на рынке межгородных перевозок — тысячи довольных клиентов" },
  { icon: "Clock",      title: "Круглосуточно",         desc: "Диспетчер отвечает 24/7, принимаем заказы в любое время" },
  { icon: "MapPin",     title: "30+ городов",           desc: "Выезды из Москвы, СПб, Воронежа, Екатеринбурга и других регионов" },
];

function getStartCount() {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return 847 + (seed % 60);
}

function ymGoal(goal: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).ym?.(98584604, "reachGoal", goal);
}

function ymLead(channel: string) {
  ymGoal("lead");
  ymGoal(`lead_${channel}`);
}

const CITY_NOMINATIVE: Record<string, string> = {
  "москвы":"Москва","москву":"Москва","москве":"Москва",
  "питера":"Санкт-Петербург","питере":"Санкт-Петербург","питер":"Санкт-Петербург",
  "петербурга":"Санкт-Петербург","петербурге":"Санкт-Петербург","петербург":"Санкт-Петербург",
  "казани":"Казань","казань":"Казань",
  "саратова":"Саратов","саратове":"Саратов","саратов":"Саратов",
  "воронежа":"Воронеж","воронеже":"Воронеж","воронеж":"Воронеж",
  "краснодара":"Краснодар","краснодаре":"Краснодар","краснодар":"Краснодар",
  "екатеринбурга":"Екатеринбург","екатеринбурге":"Екатеринбург","екатеринбург":"Екатеринбург",
  "новосибирска":"Новосибирск","новосибирске":"Новосибирск","новосибирск":"Новосибирск",
  "самары":"Самара","самаре":"Самара","самара":"Самара",
  "нижнего новгорода":"Нижний Новгород","нижнем новгороде":"Нижний Новгород","нижний новгород":"Нижний Новгород",
  "уфы":"Уфа","уфе":"Уфа","уфа":"Уфа",
  "ростова":"Ростов-на-Дону","ростове":"Ростов-на-Дону","ростов":"Ростов-на-Дону",
  "перми":"Пермь","пермь":"Пермь",
  "волгограда":"Волгоград","волгограде":"Волгоград","волгоград":"Волгоград",
  "омска":"Омск","омске":"Омск","омск":"Омск",
  "тюмени":"Тюмень","тюмень":"Тюмень",
  "челябинска":"Челябинск","челябинске":"Челябинск","челябинск":"Челябинск",
  "красноярска":"Красноярск","красноярске":"Красноярск","красноярск":"Красноярск",
  "пензы":"Пенза","пензе":"Пенза","пенза":"Пенза",
  "тольятти":"Тольятти","тамбова":"Тамбов","тамбове":"Тамбов","тамбов":"Тамбов",
  "липецка":"Липецк","липецке":"Липецк","липецк":"Липецк",
  "рязани":"Рязань","рязань":"Рязань",
  "ярославля":"Ярославль","ярославле":"Ярославль","ярославль":"Ярославль",
  "иркутска":"Иркутск","иркутске":"Иркутск","иркутск":"Иркутск",
  "хабаровска":"Хабаровск","хабаровске":"Хабаровск","хабаровск":"Хабаровск",
  "владивостока":"Владивосток","владивостоке":"Владивосток","владивосток":"Владивосток",
  "барнаула":"Барнаул","барнауле":"Барнаул","барнаул":"Барнаул",
  "ульяновска":"Ульяновск","ульяновске":"Ульяновск","ульяновск":"Ульяновск",
  "ижевска":"Ижевск","ижевске":"Ижевск","ижевск":"Ижевск",
  "чебоксар":"Чебоксары","чебоксарах":"Чебоксары","чебоксары":"Чебоксары",
  "кирова":"Киров","кирове":"Киров","киров":"Киров",
  "оренбурга":"Оренбург","оренбурге":"Оренбург","оренбург":"Оренбург",
  "тулы":"Тула","туле":"Тула","тула":"Тула",
  "астрахани":"Астрахань","астрахань":"Астрахань",
  "белгорода":"Белгород","белгороде":"Белгород","белгород":"Белгород",
  "брянска":"Брянск","брянске":"Брянск","брянск":"Брянск",
  "калуги":"Калуга","калуге":"Калуга","калуга":"Калуга",
  "курска":"Курск","курске":"Курск","курск":"Курск",
  "орла":"Орёл","орле":"Орёл","орёл":"Орёл","орел":"Орёл",
  "смоленска":"Смоленск","смоленске":"Смоленск","смоленск":"Смоленск",
  "твери":"Тверь","тверь":"Тверь",
  "владимира":"Владимир","владимире":"Владимир","владимир":"Владимир",
  "иваново":"Иваново","иванова":"Иваново",
  "костромы":"Кострома","костроме":"Кострома","кострома":"Кострома",
  "вологды":"Вологда","вологде":"Вологда","вологда":"Вологда",
  "архангельска":"Архангельск","архангельске":"Архангельск","архангельск":"Архангельск",
  "мурманска":"Мурманск","мурманске":"Мурманск","мурманск":"Мурманск",
  "петрозаводска":"Петрозаводск","петрозаводске":"Петрозаводск","петрозаводск":"Петрозаводск",
};

function toNominative(word: string): string {
  const key = word.toLowerCase().trim();
  if (CITY_NOMINATIVE[key]) return CITY_NOMINATIVE[key];
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  // универсальный fallback: убираем окончания родительного/предложного падежа
  if (key.endsWith("ска")) return cap(key.replace(/ска$/, "ск"));
  if (key.endsWith("ске")) return cap(key.replace(/ске$/, "ск"));
  if (key.endsWith("ска")) return cap(key.replace(/ска$/, "ск"));
  if (key.endsWith("га")) return cap(key.replace(/га$/, "г"));
  if (key.endsWith("ге")) return cap(key.replace(/ге$/, "г"));
  if (key.endsWith("ни")) return cap(key.replace(/ни$/, "нь"));
  if (key.endsWith("ри")) return cap(key.replace(/ри$/, "рь"));
  if (key.endsWith("ли")) return cap(key.replace(/ли$/, "ль"));
  return cap(key);
}

function parseCities(term: string): { from: string; to: string } | null {
  if (!term) return null;
  const t = decodeURIComponent(term).replace(/\+/g, " ").toLowerCase().trim();
  const fromMatch = t.match(/из\s+([а-яё]+(?:[\s-][а-яё]+)?)/);
  const toMatch   = t.match(/(?:^|\s)(?:в|до)\s+([а-яё]+(?:[\s-][а-яё]+)?)/);
  if (fromMatch?.[1] && toMatch?.[1]) {
    return { from: toNominative(fromMatch[1].trim()), to: toNominative(toMatch[1].trim()) };
  }
  return null;
}

export default function Quick() {
  const [pulse, setPulse]       = useState(false);
  const [count, setCount]       = useState(getStartCount());
  const [mins, setMins]         = useState(7);
  const [scrolled, setScrolled] = useState(false);
  const [utmCities, setUtmCities] = useState<{ from: string; to: string } | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showIosHint, setShowIosHint]     = useState(false);
  const [isInstalled, setIsInstalled]     = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const p2 = new URLSearchParams(window.location.search);
    const term = p2.get("utm_term") || "";
    const cities = parseCities(term);
    if (cities) {
      setUtmCities(cities);
      document.title = `Такси ${cities.from} – ${cities.to} | Дальняк`;
    } else {
      document.title = "Такси для дальних поездок от 200 км — Дальняк";
    }
    const p = setInterval(() => setPulse(v => !v), 1800);
    const c = setInterval(() => { setCount(n => n + 1); setMins(Math.floor(Math.random() * 9) + 2); }, (Math.random() * 4 + 3) * 60000);
    const m = setInterval(() => setMins(v => v >= 40 ? 4 : v + 1), 60000);
    const standalone = window.matchMedia("(display-mode: standalone)").matches
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      || (window.navigator as any).standalone === true;
    if (standalone) setIsInstalled(true);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onPrompt = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => setIsInstalled(true));
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => {
      clearInterval(p); clearInterval(c); clearInterval(m);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  async function handleInstall() {
    ymGoal("install_click");
    if (installPrompt) { installPrompt.prompt(); await installPrompt.userChoice; setInstallPrompt(null); return; }
    setShowIosHint(true);
  }



  return (
    <div className="min-h-screen flex flex-col" style={{ background: NAVY, fontFamily: "Inter, sans-serif" }}>

      {/* ══════════════════════════════════════
          HERO — полноэкранный фон
      ══════════════════════════════════════ */}
      <div ref={heroRef} className="relative w-full overflow-hidden" style={{ minHeight: "100svh" }}>
        <img src={CAR_IMG} alt="Такси для дальних поездок"
          fetchPriority="high"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: "center 45%" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(160deg,rgba(10,15,30,0.88) 0%,rgba(10,15,30,0.5) 40%,rgba(10,15,30,0.93) 100%)" }} />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom,rgba(10,15,30,0) 50%,${NAVY} 100%)` }} />

        {/* ══════════════════════════════════════
            ХЕДЕР — общий для мобилки и десктопа
        ══════════════════════════════════════ */}
        <div className="relative z-20">
          <div className={`transition-all duration-300 ${scrolled ? "py-2 shadow-2xl" : "py-4"}`}
            style={{ background: scrolled ? "rgba(10,15,30,0.95)" : "transparent", backdropFilter: scrolled ? "blur(12px)" : "blur(0px)" }}>
            <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={LOGO} alt="" className="w-10 h-10 rounded-xl object-cover"
                  style={{ border: `1.5px solid ${GOLD}`, boxShadow: `0 0 12px rgba(201,168,76,0.3)` }} />
                <div>
                  <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 16, color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Такси Дальняк
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full transition-opacity duration-700 ${pulse ? "opacity-100" : "opacity-20"}`}
                      style={{ background: "#4ade80" }} />
                    <span style={{ color: "#4ade80", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>На связи 24/7</span>
                  </div>
                </div>
              </div>
              {/* десктоп — показываем телефон + кнопки */}
              <div className="hidden md:flex items-center gap-4">
                <div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontWeight: 600 }}>Диспетчер круглосуточно</div>
                  <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 20, color: "#fff" }}>{PHONE}</div>
                </div>
                <a href={PHONE_HREF} onClick={() => ymGoal("header_phone")}
                  className="flex items-center gap-2 rounded-xl px-5 py-3 transition-transform hover:scale-105"
                  style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow: "0 2px 16px rgba(201,168,76,0.4)" }}>
                  <Icon name="Phone" size={15} style={{ color: NAVY }} />
                  <span style={{ fontFamily: "Oswald", fontSize: 14, color: NAVY, fontWeight: 800, textTransform: "uppercase" }}>Позвонить</span>
                </a>
                <a href={VK_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("header_vk")}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 transition-transform hover:scale-105"
                  style={{ background: "linear-gradient(135deg,#1a3a6b,#2456a4)" }}>
                  <Icon name="Users" size={15} className="text-white" />
                  <span style={{ fontFamily: "Oswald", fontSize: 14, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>ВКонтакте</span>
                </a>
              </div>
              {/* мобилка — только кнопка звонка */}
              <a href={PHONE_HREF} onClick={() => ymGoal("header_phone")}
                className="md:hidden flex items-center gap-1.5 rounded-xl px-3 py-2 active:scale-95 transition-transform"
                style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow: "0 2px 12px rgba(201,168,76,0.4)" }}>
                <Icon name="Phone" size={13} style={{ color: NAVY }} />
                <span style={{ fontFamily: "Oswald", fontSize: 12, color: NAVY, fontWeight: 800, textTransform: "uppercase" }}>Звонок</span>
              </a>
            </div>
          </div>
        </div>

        {/* ── HERO КОНТЕНТ ── */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col" style={{ minHeight: "calc(100svh - 68px)", paddingTop: 20 }}>

          {/* бейдж */}
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 mb-6 self-start"
            style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.3)" }}>
            <div className="flex -space-x-1.5">
              {[REVIEW_1, REVIEW_2, REVIEW_3].map((img, i) => (
                <img key={i} src={img} alt="" loading="lazy" className="w-5 h-5 rounded-full object-cover" style={{ border: `1.5px solid ${NAVY}` }} />
              ))}
            </div>
            <span style={{ color: GOLD2, fontSize: 11, fontWeight: 700 }}>{count.toLocaleString("ru")} поездок сегодня</span>
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>· последняя {mins} мин назад</span>
          </div>

          {/* ── ДВУХКОЛОНОЧНАЯ СЕТКА на десктопе ── */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-16 flex-1">

            {/* Левая колонка — текст */}
            <div className="flex-1 md:max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px w-12" style={{ background: `linear-gradient(to right,${GOLD},transparent)` }} />
                <span style={{ color: GOLD, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em" }}>
                  Межгород · Россия · С 2014 года
                </span>
              </div>

              {/* ГЛАВНЫЙ ЗАГОЛОВОК */}
              <h1 style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: "clamp(32px,5vw,66px)", lineHeight: 0.95, color: "#fff", textTransform: "uppercase", letterSpacing: "-0.01em" }}>
                {utmCities ? (
                  <>
                    Заказать такси<br />
                    из <span style={{ color: GOLD }}>{utmCities.from}</span><br />
                    в <span style={{ color: GOLD }}>{utmCities.to}</span>
                  </>
                ) : (
                  <>
                    Заказать такси<br />
                    из города в город<br />
                    <span style={{ color: GOLD }}>от 200 км</span>
                  </>
                )}
              </h1>

              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "clamp(13px,1.2vw,16px)", marginTop: 18, lineHeight: 1.7, maxWidth: 480 }}>
                Заказать такси из города в город по фиксированной цене.<br />
                Новые авто, опытные водители, круглосуточный диспетчер.
              </p>

              {/* статистика */}
              <div className="grid grid-cols-4 gap-3 mt-7 mb-7 md:max-w-lg">
                {STATS.map(s => (
                  <div key={s.value} className="flex flex-col items-center rounded-2xl py-3 px-1"
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <span style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: "clamp(16px,2vw,22px)", color: GOLD, lineHeight: 1 }}>{s.value}</span>
                    <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 9, textAlign: "center", marginTop: 2, lineHeight: 1.2 }}>{s.label}</span>
                  </div>
                ))}
              </div>

              {/* кнопки */}
              <div className="space-y-3 md:max-w-lg">
                <a href={PHONE_HREF} onClick={() => { ymGoal("hero_phone"); ymLead("phone"); }}
                  className="flex items-center justify-center gap-3 w-full rounded-2xl py-5 transition-transform hover:scale-[1.02] active:scale-[0.97]"
                  style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow: "0 8px 32px rgba(201,168,76,0.45)" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(10,15,30,0.2)" }}>
                    <Icon name="PhoneCall" size={18} style={{ color: NAVY }} />
                  </div>
                  <div className="text-left">
                    <div style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: "clamp(17px,2vw,22px)", color: NAVY, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                      Позвонить сейчас
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(10,15,30,0.6)", fontWeight: 600 }}>{PHONE}</div>
                  </div>
                </a>

                <div className="grid grid-cols-3 gap-3">
                  <a href={TG_HREF} target="_blank" rel="noopener noreferrer" onClick={() => { ymGoal("hero_tg"); ymLead("tg"); }}
                    className="flex flex-col items-center justify-center rounded-2xl py-4 gap-1.5 transition-transform hover:scale-[1.02] active:scale-[0.97]"
                    style={{ background: "linear-gradient(135deg,#0e6da8,#1a8fc2)", border: "1px solid rgba(26,143,194,0.5)" }}>
                    <Icon name="Send" size={22} className="text-white" />
                    <span style={{ fontFamily: "Oswald", fontSize: 13, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>Telegram</span>
                  </a>
                  <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" onClick={() => { ymGoal("hero_max"); ymLead("max"); }}
                    className="relative flex flex-col items-center justify-center rounded-2xl py-4 gap-1.5 transition-transform hover:scale-[1.02] active:scale-[0.97] overflow-hidden"
                    style={{ background: "linear-gradient(135deg,#001a3d,#003080)", border: "1px solid rgba(0,90,210,0.4)" }}>
                    <div className="absolute top-1.5 right-1.5 rounded-full px-1.5 py-0.5"
                      style={{ background: GOLD, fontSize: 8, color: NAVY, fontWeight: 800, textTransform: "uppercase" }}>
                      топ
                    </div>
                    <img src={MAX_LOGO} alt="MAX" className="h-6 object-contain" />
                    <span style={{ fontFamily: "Oswald", fontSize: 13, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>MAX</span>
                  </a>
                  <a href={VK_HREF} target="_blank" rel="noopener noreferrer" onClick={() => { ymGoal("hero_vk"); ymLead("vk"); }}
                    className="flex flex-col items-center justify-center rounded-2xl py-4 gap-1.5 transition-transform hover:scale-[1.02] active:scale-[0.97]"
                    style={{ background: "linear-gradient(135deg,#1a3a6b,#2456a4)", border: "1px solid rgba(36,86,164,0.5)" }}>
                    <Icon name="Users" size={22} className="text-white" />
                    <span style={{ fontFamily: "Oswald", fontSize: 13, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>ВКонтакте</span>
                  </a>
                </div>
              </div>

              {/* PWA — только мобилка */}
              {!isInstalled && (
                <button onClick={handleInstall}
                  className="md:hidden flex items-center gap-3 w-full rounded-2xl px-4 py-3 mt-3 active:scale-[0.97] transition-transform"
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                    <Icon name="Download" size={15} style={{ color: NAVY }} />
                  </div>
                  <div className="flex-1 text-left">
                    <div style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>Добавить на главный экран</div>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>Как приложение — в один тап</div>
                  </div>
                  <Icon name="ChevronRight" size={14} style={{ color: GOLD }} />
                </button>
              )}
            </div>

            {/* Правая колонка — преимущества (только десктоп) */}
            <div className="hidden md:flex flex-col gap-3 w-80 shrink-0">
              {FEATURES.map((f, idx) => (
                <div key={f.title} className="flex gap-4 rounded-2xl p-4"
                  style={{ background: CARD, border: idx === 0 ? "1px solid rgba(201,168,76,0.4)" : BORDER }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: "linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05))", border: BORDER }}>
                    <Icon name={f.icon as "Car"} size={18} style={{ color: GOLD }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 14, color: "#fff" }}>{f.title}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 2, lineHeight: 1.5 }}>{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* стрелка вниз */}
          <div className="flex justify-center py-6">
            <div className="flex flex-col items-center gap-1 animate-bounce">
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.15em" }}>листай</span>
              <Icon name="ChevronDown" size={16} style={{ color: GOLD, opacity: 0.6 }} />
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          СЕКЦИЯ: ПРЕИМУЩЕСТВА (мобилка)
      ══════════════════════════════════════ */}
      <div className="md:hidden" style={{ background: NAVY }}>
        <div className="max-w-sm mx-auto px-4 py-10">
          <div className="text-center mb-6">
            <div style={{ color: GOLD, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em" }} className="mb-2">Почему выбирают нас</div>
            <h2 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 26, color: "#fff", textTransform: "uppercase" }}>Честно и надёжно</h2>
          </div>
          <div className="space-y-3">
            {FEATURES.map((f, idx) => (
              <div key={f.title} className="flex gap-4 rounded-2xl p-4"
                style={{ background: CARD, border: idx === 0 ? "1px solid rgba(201,168,76,0.4)" : BORDER }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: "linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05))", border: BORDER }}>
                  <Icon name={f.icon as "Car"} size={18} style={{ color: GOLD }} />
                </div>
                <div>
                  <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 15, color: "#fff" }}>{f.title}</div>
                  <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2, lineHeight: 1.5 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          СЕКЦИЯ: ПРЕИМУЩЕСТВА (десктоп — доп. строка)
      ══════════════════════════════════════ */}
      <div className="hidden md:block" style={{ background: NAVY }}>
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <div style={{ color: GOLD, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em" }} className="mb-2">Почему нам доверяют</div>
            <h2 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 40, color: "#fff", textTransform: "uppercase" }}>
              Такси для дальних поездок — надёжно и честно
            </h2>
          </div>
          <div className="grid grid-cols-5 gap-4">
            {FEATURES.map((f, idx) => (
              <div key={f.title} className="flex flex-col items-center text-center gap-3 rounded-2xl p-5"
                style={{ background: CARD, border: idx === 0 ? "1px solid rgba(201,168,76,0.4)" : BORDER }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg,rgba(201,168,76,0.15),rgba(201,168,76,0.05))", border: BORDER }}>
                  <Icon name={f.icon as "Car"} size={22} style={{ color: GOLD }} />
                </div>
                <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 15, color: "#fff" }}>{f.title}</div>
                <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          СЕКЦИЯ: ВАЖНО ЗНАТЬ
      ══════════════════════════════════════ */}
      <div style={{ background: NAVY }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 pb-0 pt-2">
          <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
            <div className="flex items-center gap-2 mb-3">
              <Icon name="AlertCircle" size={13} style={{ color: "rgba(255,255,255,0.25)" }} />
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>Важно знать</span>
            </div>
            <div className="space-y-2">
              {[
                { ok: false, text: "Поездками с попутчиками мы не занимаемся" },
                { ok: false, text: "Маршруты по городу мы не выполняем" },
                { ok: true,  text: "Работаем только на дальних маршрутах — от 200 км" },
              ].map(item => (
                <div key={item.text} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                    style={{ background: item.ok ? "rgba(74,222,128,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${item.ok ? "rgba(74,222,128,0.3)" : "rgba(239,68,68,0.3)"}` }}>
                    <Icon name={item.ok ? "Check" : "X"} size={10} style={{ color: item.ok ? "#4ade80" : "#ef4444" }} />
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 1.5 }}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          СЕКЦИЯ: ДИСПЕТЧЕР
      ══════════════════════════════════════ */}
      <div style={{ background: NAVY }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-5 pb-0">
          <div className="rounded-2xl p-5" style={{ background: `linear-gradient(135deg,rgba(201,168,76,0.08),rgba(201,168,76,0.03))`, border: `1px solid rgba(201,168,76,0.2)` }}>
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                <Icon name="Headphones" size={20} style={{ color: NAVY }} />
              </div>
              <div>
                <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: 15, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>
                  Диспетчер <span style={{ color: GOLD }}>Алексей</span> — на связи 24/7
                </div>
                <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.7 }}>
                  Если вам необходимо уехать далеко в другой город — Алексей с радостью{" "}
                  <span style={{ color: "rgba(255,255,255,0.9)" }}>назначит машину</span>,{" "}
                  <span style={{ color: "rgba(255,255,255,0.9)" }}>просчитает стоимость маршрута</span>{" "}
                  и ответит на все дополнительные вопросы.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          СЕКЦИЯ: УТП
      ══════════════════════════════════════ */}
      <div style={{ background: NAVY }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-5 pb-0">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: "Zap",         text: "Срочная подача" },
              { icon: "Calendar",    text: "Предзаказ без брони" },
              { icon: "Receipt",     text: "Чек самозанятого" },
              { icon: "ShieldCheck", text: "Работаем с 2014 года" },
            ].map(item => (
              <div key={item.text} className="flex items-start gap-2.5 rounded-2xl px-4 py-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <Icon name={item.icon as "Zap"} size={15} style={{ color: GOLD, flexShrink: 0, marginTop: 1 }} />
                <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          СЕКЦИЯ: РЕЙТИНГИ
      ══════════════════════════════════════ */}
      <div style={{ background: NAVY }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-5 pb-0">
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "Яндекс Карты", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#fff"/><circle cx="12" cy="9" r="2.5" fill="#ff4433"/></svg>, bg: "linear-gradient(135deg,#ff4433,#ff6b35)", note: "Такси в другой город · без попутчиков" },
              { name: "2ГИС", icon: <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 10, fontWeight: 900 }}>2ГИС</span>, bg: "linear-gradient(135deg,#00b956,#008f42)", note: "Межгородские перевозки от 200 км" },
            ].map(r => (
              <div key={r.name} className="rounded-2xl px-4 py-4 flex flex-col gap-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: r.bg }}>{r.icon}</div>
                  <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{r.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 26, fontWeight: 900, lineHeight: 1 }}>4.8</span>
                  <div className="flex gap-0.5 mt-0.5">
                    {[1,2,3,4].map(i => <Icon key={i} name="Star" size={12} style={{ color: GOLD }} className="fill-[#c9a84c]" />)}
                    <div className="relative" style={{ width: 12, height: 12, overflow: "hidden" }}>
                      <Icon name="Star" size={12} style={{ color: "rgba(255,255,255,0.12)", position: "absolute" }} />
                      <div style={{ width: "80%", overflow: "hidden", position: "absolute" }}>
                        <Icon name="Star" size={12} style={{ color: GOLD }} className="fill-[#c9a84c]" />
                      </div>
                    </div>
                  </div>
                </div>
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>{r.note}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          СЕКЦИЯ: КАЛЬКУЛЯТОР
      ══════════════════════════════════════ */}
      <div style={{ background: NAVY }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-5 pb-0">
          <PriceCalc />
        </div>
      </div>

      {/* ══════════════════════════════════════
          СЕКЦИЯ: АВТОПАРК
      ══════════════════════════════════════ */}
      <div style={{ background: NAVY }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-8 pb-0">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
            <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Наш автопарк</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {TARIFFS.map(t => (
              <div key={t.id} className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "1/1.1" }}>
                <img src={t.img} alt={t.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(5,8,18,0.97) 0%,rgba(5,8,18,0.35) 55%,rgba(5,8,18,0.05) 100%)" }} />
                <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: `linear-gradient(to right,${t.color},transparent)` }} />
                {t.badge && (
                  <div className="absolute top-3 right-3">
                    <span className="text-[9px] font-black uppercase tracking-wide px-2 py-1 rounded-lg"
                      style={{ background: `${t.color}22`, border: `1px solid ${t.color}55`, color: t.color }}>
                      {t.badge}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1.1 }}>{t.name}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, marginTop: 2 }}>{t.desc}</div>
                  <div className="flex items-center gap-2 mt-2">
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>👤 {t.seats}</span>
                    <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 10 }}>🧳 {t.luggage}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl px-4 py-3 flex items-center gap-2" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
            <Icon name="Info" size={13} style={{ color: "rgba(255,255,255,0.25)" }} />
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>Стоимость фиксируется до поездки — цена одинакова для всех тарифов на одном маршруте</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          СЕКЦИЯ: ГОРОДА
      ══════════════════════════════════════ */}
      <div style={{ background: `linear-gradient(180deg,${NAVY} 0%,#080d1a 100%)` }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
          <div className="text-center mb-6">
            <div style={{ color: GOLD, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em" }} className="mb-2">Geography</div>
            <h2 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: "clamp(22px,3vw,34px)", color: "#fff", textTransform: "uppercase" }}>Города присутствия</h2>
          </div>
          <div className="rounded-2xl p-5" style={{ background: CARD, border: BORDER }}>
            <div className="flex flex-wrap gap-2">
              {CITIES.map(city => (
                <span key={city} className="rounded-full px-3 py-1 text-[11px] font-semibold"
                  style={city === "Новые территории"
                    ? { background: "rgba(201,168,76,0.15)", border: "1px solid rgba(201,168,76,0.4)", color: GOLD2 }
                    : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
                  {city}
                </span>
              ))}
            </div>
            <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>Не нашли свой город? Уточните у диспетчера — выезжаем откуда угодно</span>
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          СЕКЦИЯ: НАВИГАЦИЯ
      ══════════════════════════════════════ */}
      <div style={{ background: "#080d1a" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-6">
          {/* КПП-баннер */}
          <a href="/kpp"
            className="flex items-center gap-4 w-full rounded-2xl px-5 py-4 mb-4 transition-transform hover:scale-[1.01] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg,#0d1018 0%,#121620 100%)", border: `1px solid rgba(201,168,76,0.25)`, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right,${GOLD},${GOLD2},transparent)` }} />
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg,rgba(201,168,76,0.2),rgba(201,168,76,0.08))`, border: `1px solid rgba(201,168,76,0.2)` }}>
              <Icon name="MapPin" size={20} style={{ color: GOLD }} />
            </div>
            <div className="flex-1">
              <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: "clamp(14px,2vw,17px)", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.03em", lineHeight: 1.1 }}>
                Поездка до КПП
              </div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, marginTop: 3 }}>
                Машина точно приедет · 24/7 · Без лишних вопросов
              </div>
            </div>
            <Icon name="ChevronRight" size={18} style={{ color: GOLD, flexShrink: 0 }} />
          </a>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Калькулятор", icon: "Calculator", href: "/calc",   sub: "Узнай цену" },
              { label: "Тарифы",      icon: "Car",        href: "/tariffs", sub: "Наши авто" },
              { label: "Отзывы",      icon: "Star",       href: "/reviews", sub: "11+ отзывов" },
            ].map(l => (
              <a key={l.href} href={l.href}
                className="flex flex-col items-center gap-1.5 rounded-2xl py-5 transition-transform hover:scale-[1.02] active:scale-[0.97]"
                style={{ background: CARD, border: BORDER }}>
                <Icon name={l.icon as "Car"} size={22} style={{ color: GOLD }} />
                <span style={{ fontFamily: "Oswald", fontSize: "clamp(13px,1.5vw,16px)", color: "#fff", fontWeight: 700, textTransform: "uppercase" }}>{l.label}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>{l.sub}</span>
              </a>
            ))}
          </div>

          {/* РЕГИОНАЛЬНЫЕ ПОСАДОЧНЫЕ СТРАНИЦЫ */}
          <div className="mt-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
              <div className="flex items-center gap-1.5">
                <Icon name="Globe" size={12} style={{ color: GOLD }} />
                <span style={{ color: GOLD, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em" }}>Ваш город</span>
              </div>
              <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.06)" }} />
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "Москва и МО",     href: "/moskva" },
                { label: "Белгород",        href: "/belgorod" },
                { label: "Богучары",        href: "/boguchar" },
                { label: "Воронеж",         href: "/voronezh" },
                { label: "Курск",           href: "/kursk" },
                { label: "Рязань",          href: "/ryazan" },
                { label: "Санкт-Петербург", href: "/spb" },
                { label: "Нижний Новгород", href: "/nizhniy" },
                { label: "Ижевск",          href: "/izhevsk" },
                { label: "Краснодар",       href: "/krasnodar" },
                { label: "Ростов-на-Дону",  href: "/rostov" },
                { label: "Ставрополь",      href: "/stavropol" },
                { label: "Новосибирск",     href: "/novosibirsk" },
                { label: "Тюмень",          href: "/tyumen" },
                { label: "Челябинск",       href: "/chelyabinsk" },
                { label: "Екатеринбург",    href: "/ekaterinburg" },
              ].map(r => (
                <a key={r.href} href={r.href}
                  className="rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all hover:scale-[1.03] active:scale-[0.97]"
                  style={{ background: "rgba(201,168,76,0.08)", border: "1px solid rgba(201,168,76,0.2)", color: "rgba(255,255,255,0.65)" }}>
                  {r.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          СЕКЦИЯ: ОТЗЫВЫ
      ══════════════════════════════════════ */}
      <div style={{ background: "#080d1a" }}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 pb-36 md:pb-20 pt-8">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
            <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Отзывы пассажиров</span>
            <div className="flex-1" />
            <a href="/reviews" className="flex items-center gap-1 rounded-xl px-3 py-2 transition-opacity hover:opacity-80"
              style={{ background: "rgba(201,168,76,0.1)", border: BORDER }}>
              <span style={{ color: GOLD, fontSize: 12, fontWeight: 700 }}>Все отзывы</span>
              <Icon name="ChevronRight" size={13} style={{ color: GOLD }} />
            </a>
          </div>
          <div className="space-y-4">
            {REVIEWS.map(r => (
              <div key={r.name} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <img src={r.img} alt={r.name} loading="lazy" className="w-full block" />
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                      <div style={{ color: GOLD, fontSize: 11, marginTop: 1 }}>{r.route}</div>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => <Icon key={i} name="Star" size={13} style={{ color: GOLD }} className="fill-[#c9a84c]" />)}
                    </div>
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.7 }}>{r.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          НИЖНЯЯ ПАНЕЛЬ — мобилка
      ══════════════════════════════════════ */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-3"
        style={{ background: `linear-gradient(to top,${NAVY} 65%,transparent)` }}>
        <a href={PHONE_HREF} onClick={() => { ymGoal("bottom_phone"); ymLead("phone"); }}
          className="flex items-center justify-center gap-3 w-full rounded-2xl py-4 mb-2.5 active:scale-[0.97] transition-transform"
          style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow: "0 4px 24px rgba(201,168,76,0.5)" }}>
          <Icon name="Phone" size={18} style={{ color: NAVY }} />
          <div style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 18, color: NAVY, textTransform: "uppercase" }}>Позвонить диспетчеру</div>
        </a>
        <div className="grid grid-cols-3 gap-2">
          <a href={TG_HREF} target="_blank" rel="noopener noreferrer" onClick={() => { ymGoal("bottom_tg"); ymLead("tg"); }}
            className="flex items-center justify-center gap-1.5 rounded-2xl py-3 active:scale-[0.97] transition-transform"
            style={{ background: "linear-gradient(135deg,#0e6da8,#1a8fc2)", border: "1px solid rgba(26,143,194,0.5)" }}>
            <Icon name="Send" size={15} className="text-white" />
            <span style={{ fontFamily: "Oswald", fontSize: 13, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>Telegram</span>
          </a>
          <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" onClick={() => { ymGoal("bottom_max"); ymLead("max"); }}
            className="flex items-center justify-center gap-1.5 rounded-2xl py-3 active:scale-[0.97] transition-transform"
            style={{ background: "linear-gradient(135deg,#001a3d,#003080)", border: "1px solid rgba(0,80,200,0.4)" }}>
            <img src={MAX_LOGO} alt="MAX" className="h-5 object-contain" />
            <span style={{ fontFamily: "Oswald", fontSize: 13, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>MAX</span>
          </a>
          <a href={VK_HREF} target="_blank" rel="noopener noreferrer" onClick={() => { ymGoal("bottom_vk"); ymLead("vk"); }}
            className="flex items-center justify-center gap-1.5 rounded-2xl py-3 active:scale-[0.97] transition-transform"
            style={{ background: "linear-gradient(135deg,#1a3a6b,#2456a4)", border: "1px solid rgba(36,86,164,0.5)" }}>
            <Icon name="Users" size={15} className="text-white" />
            <span style={{ fontFamily: "Oswald", fontSize: 13, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>ВКонтакте</span>
          </a>
        </div>
      </div>

      {/* ══════════════════════════════════════
          НИЖНЯЯ ПАНЕЛЬ — десктоп (footer)
      ══════════════════════════════════════ */}
      <div className="hidden md:block" style={{ background: "#050810", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="" className="w-10 h-10 rounded-xl object-cover" style={{ border: `1.5px solid ${GOLD}` }} />
            <div>
              <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 15, color: "#fff", textTransform: "uppercase" }}>Такси Дальняк</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>Такси для дальних поездок от 200 км · С 2014 года</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 22, color: "#fff" }}>{PHONE}</div>
            <a href={PHONE_HREF} onClick={() => ymGoal("footer_phone")}
              className="flex items-center gap-2 rounded-xl px-5 py-3 transition-transform hover:scale-105"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
              <Icon name="Phone" size={15} style={{ color: NAVY }} />
              <span style={{ fontFamily: "Oswald", fontSize: 14, color: NAVY, fontWeight: 800, textTransform: "uppercase" }}>Позвонить</span>
            </a>
            <a href={TG_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("footer_tg")}
              className="flex items-center gap-2 rounded-xl px-4 py-3 transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg,#0e6da8,#1a8fc2)" }}>
              <Icon name="Send" size={15} className="text-white" />
              <span style={{ fontFamily: "Oswald", fontSize: 14, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>Telegram</span>
            </a>
            <a href={VK_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("footer_vk")}
              className="flex items-center gap-2 rounded-xl px-4 py-3 transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg,#1a3a6b,#2456a4)" }}>
              <Icon name="Users" size={15} className="text-white" />
              <span style={{ fontFamily: "Oswald", fontSize: 14, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>ВКонтакте</span>
            </a>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          МОДАЛКА iOS
      ══════════════════════════════════════ */}
      {showIosHint && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-6"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowIosHint(false)}>
          <div className="max-w-sm w-full rounded-3xl p-5"
            style={{ background: CARD, border: "1px solid rgba(201,168,76,0.3)" }}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 16, color: "#fff", textTransform: "uppercase" }}>Установка на iPhone</div>
              <button onClick={() => setShowIosHint(false)} style={{ color: "rgba(255,255,255,0.4)" }}>
                <Icon name="X" size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {[
                { n: "1", text: "Нажмите кнопку «Поделиться»",    icon: "Share" },
                { n: "2", text: "Выберите «На экран Домой»",       icon: "SquarePlus" },
                { n: "3", text: "Нажмите «Добавить» — готово!",    icon: "Check" },
              ].map(s => (
                <div key={s.n} className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                  style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                    <span style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 13, color: NAVY }}>{s.n}</span>
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 13 }}>{s.text}</span>
                  <Icon name={s.icon as "Share"} size={15} style={{ color: GOLD, marginLeft: "auto", flexShrink: 0 }} />
                </div>
              ))}
            </div>
            <button onClick={() => setShowIosHint(false)}
              className="w-full mt-4 rounded-2xl py-3 transition-transform active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, fontFamily: "Oswald", fontWeight: 800, fontSize: 15, color: NAVY, textTransform: "uppercase" }}>
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
}