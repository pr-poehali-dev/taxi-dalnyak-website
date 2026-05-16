import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";

const CAR_IMG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/091d3d1c-1649-4d9e-8958-1a624bf8f371.jpg";
const LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/3a499542-747a-49d2-808e-4c137548c76e.jpg";
const MAX_LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/cf5e3e58-7d83-4d19-8c48-f91922395adf.png";

const TARIFFS = [
  {
    id: "standart",
    name: "Стандарт",
    desc: "Рио · Поло · Солярис",
    seats: 4,
    luggage: "1–2 сумки",
    img: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/39d043f8-acde-4a27-a69c-ebe03e8bd403.jpg",
    badge: "",
    color: "#F5A800",
  },
  {
    id: "comfort",
    name: "Комфорт",
    desc: "Хавал Джулиан 2025",
    seats: 4,
    luggage: "2–3 сумки",
    img: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/238966ba-ee86-4f06-bc36-0872f043ebfb.jpg",
    badge: "Популярный",
    color: "#22D3EE",
  },
  {
    id: "comfortplus",
    name: "Комфорт+",
    desc: "Toyota Camry 70 кузов",
    seats: 4,
    luggage: "3–4 сумки",
    img: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/38f8c2aa-ebc6-4a58-bedb-3322efbce272.jpg",
    badge: "Бизнес",
    color: "#A78BFA",
  },
  {
    id: "minivan",
    name: "Минивэн",
    desc: "Hyundai Staria 2022",
    seats: 7,
    luggage: "Много багажа",
    img: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/92a14984-9eac-4b0c-aa50-8c49af1c12b7.jpg",
    badge: "Группа",
    color: "#34D399",
  },
];

const ROUTES = [
  "Донецк – Череповец","Тюмень – Челябинск","Питер – Кострома","Курск – Псков",
  "Кириловка – Москва","Адлер – Севастополь","Ковров – Менделеевск","Чебаркуль – Екатеринбург",
  "Тамбов – Волгоград","Чебоксары – Питер","Ростов – Симферополь","Таганрог – Краснодар",
  "Белгород – Ростов","Ярославль – Питер","Екатеринбург – Донецк","Воронеж – Домодедово",
];

const REVIEW_1 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/b0eb5050-a05a-4647-8442-4b839d45161f.jpg";
const REVIEW_2 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/fedc4281-a106-4024-9369-8a03712c92a3.jpg";
const REVIEW_3 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/ac322d91-fd27-4c11-b86f-f28e85ec3df0.jpg";

const PHONE = "8 (995) 645-51-25";
const PHONE_HREF = "tel:+79956455125";
const TG_HREF = "https://t.me/Mezhgorod1816";
const MAX_HREF = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";

const STOP = new Set([
  "такси","taxi","заказать","заказ","вызвать","вызов","поездка","поездку",
  "трансфер","межгород","междугороднее","недорого","дешево","цена","стоимость",
  "номер","телефон","круглосуточно","онлайн","сайт",
  "из","в","во","до","со","с","на","по","и","от","к","ко",
]);

const CITIES: { stem: string; nom: string }[] = [
  { stem: "москв", nom: "Москва" },
  { stem: "питер", nom: "Санкт-Петербург" },
  { stem: "санкт", nom: "Санкт-Петербург" },
  { stem: "петербург", nom: "Санкт-Петербург" },
  { stem: "ростов", nom: "Ростов" },
  { stem: "воронеж", nom: "Воронеж" },
  { stem: "краснодар", nom: "Краснодар" },
  { stem: "ставропол", nom: "Ставрополь" },
  { stem: "волгоград", nom: "Волгоград" },
  { stem: "саратов", nom: "Саратов" },
  { stem: "самар", nom: "Самара" },
  { stem: "казан", nom: "Казань" },
  { stem: "уф", nom: "Уфа" },
  { stem: "пенз", nom: "Пенза" },
  { stem: "перм", nom: "Пермь" },
  { stem: "твер", nom: "Тверь" },
  { stem: "тул", nom: "Тула" },
  { stem: "рязан", nom: "Рязань" },
  { stem: "ижевск", nom: "Ижевск" },
  { stem: "ижевс", nom: "Ижевск" },
  { stem: "сарапул", nom: "Сарапул" },
  { stem: "элист", nom: "Элиста" },
  { stem: "астрахан", nom: "Астрахань" },
  { stem: "новочеркасск", nom: "Новочеркасск" },
  { stem: "таганрог", nom: "Таганрог" },
  { stem: "шахт", nom: "Шахты" },
  { stem: "сочи", nom: "Сочи" },
  { stem: "анап", nom: "Анапа" },
  { stem: "ялт", nom: "Ялта" },
  { stem: "геленджик", nom: "Геленджик" },
  { stem: "новороссийск", nom: "Новороссийск" },
  { stem: "пятигорск", nom: "Пятигорск" },
  { stem: "кисловодск", nom: "Кисловодск" },
  { stem: "минеральн", nom: "Минеральные Воды" },
  { stem: "махачкал", nom: "Махачкала" },
  { stem: "грозн", nom: "Грозный" },
  { stem: "нальчик", nom: "Нальчик" },
  { stem: "владикавказ", nom: "Владикавказ" },
  { stem: "новомичуринск", nom: "Новомичуринск" },
];

function normCity(w: string): string {
  if (!w) return w;
  const wl = w.toLowerCase();
  for (const c of CITIES) {
    if (wl.startsWith(c.stem)) return c.nom;
  }
  return w.charAt(0).toUpperCase() + w.slice(1);
}

function parseRoute(term: string): { from: string; to: string } {
  if (!term) return { from: "", to: "" };
  let t = decodeURIComponent(term).toLowerCase().trim();
  if (!t || t.startsWith("{") || t.endsWith("}")) return { from: "", to: "" };
  t = t.replace(/[+_]/g, " ").replace(/[^a-zа-яё\s-]/gi, " ");
  const tokens = t.split(/\s+/).filter(Boolean);

  let from = "", to = "";
  for (let i = 0; i < tokens.length - 1; i++) {
    const cur = tokens[i], nxt = tokens[i + 1];
    if (!nxt || STOP.has(nxt)) continue;
    if (!from && (cur === "из" || cur === "от" || cur === "с" || cur === "со")) from = normCity(nxt);
    if (!to && (cur === "в" || cur === "во" || cur === "до" || cur === "к" || cur === "ко")) to = normCity(nxt);
  }

  const cleaned = tokens.filter((x) => x.length >= 2 && !STOP.has(x)).map(normCity);
  const uniq: string[] = [];
  for (const w of cleaned) if (!uniq.includes(w)) uniq.push(w);
  if (!from && uniq[0]) from = uniq[0];
  if (!to && uniq[1]) to = uniq[1];

  return { from, to };
}

const reviews = [
  {
    name: "Валерия",
    route: "Москва – Новомичуринск",
    text: "Очень переживала — зимой с ребёнком, первый раз на такое расстояние. Но всё прошло замечательно! Машину нашли быстро, водитель Иван — замечательный человек. Довёз идеально!",
    img: REVIEW_1,
  },
  {
    name: "Ирина",
    route: "ЛО Кировский р-н – Санкт-Петербург",
    text: "Позвонила в две компании — ничего не нашли. На третий раз нашла Такси Дальняк через Telegram. Водитель очень вежливый, машина в идеальном состоянии.",
    img: REVIEW_3,
  },
  {
    name: "Евгений",
    route: "Межгород по России",
    text: "Рекомендую! Удобная и быстрая доставка, комфортабельный авто. Пацаны отвечают за время, комфорт и стоимость. От всей семьи — Спасибо, друзья!",
    img: REVIEW_2,
  },
];

function Splash({ visible }: { visible: boolean }) {
  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0f0f1a] transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className="flex flex-col items-center gap-4 text-center px-6">
        <img src={LOGO} alt="Такси Дальняк" className="w-24 h-24 rounded-2xl object-cover shadow-2xl ring-4 ring-[#F5A800]/40" />
        <div style={{ fontFamily: "Oswald" }}>
          <div className="text-[11px] uppercase tracking-[0.4em] text-[#F5A800] font-bold">Такси</div>
          <div className="text-3xl font-black uppercase text-white mt-0.5">Дальняк</div>
          <div className="text-sm text-white/40 mt-1">С нами вы доедете</div>
        </div>
        <div className="w-40 h-[3px] bg-white/10 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-[#F5A800] splash-bar" />
        </div>
      </div>
      <style>{`
        @keyframes splashBar { from { transform:translateX(-100%) } to { transform:translateX(0) } }
        .splash-bar { animation: splashBar 1.0s ease-out forwards; }
      `}</style>
    </div>
  );
}

declare global { interface Window { ym?: (id: number, action: string, goal: string, params?: Record<string, string>) => void; } }

function ymGoal(goal: string, params: Record<string, string>) {
  if (typeof window.ym === "function") window.ym(108400932, "reachGoal", goal, params);
}

function buildTgUrl(base: string, utmSource: string, utmMedium: string, utmCampaign: string, utmContent: string) {
  const params = new URLSearchParams({
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: utmCampaign,
    utm_content: utmContent,
  });
  return `${base}?start=${encodeURIComponent(params.toString())}`;
}

export default function Index() {
  const [route, setRoute] = useState<{ from: string; to: string }>({ from: "", to: "" });
  const [splash, setSplash] = useState(true);
  const [utmParams, setUtmParams] = useState({ source: "direct", medium: "none", campaign: "none", term: "", content: "none" });

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const term = p.get("utm_term") || p.get("keyword") || "";
    setRoute(parseRoute(term));
    setUtmParams({
      source:   p.get("utm_source")   || "direct",
      medium:   p.get("utm_medium")   || "none",
      campaign: p.get("utm_campaign") || "none",
      term:     term,
      content:  p.get("utm_content")  || "none",
    });
    const t = setTimeout(() => setSplash(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const { from, to } = route;

  const headline = useMemo(() => {
    if (from && to) return `Такси ${from} – ${to}`;
    if (from) return `Такси из ${from}`;
    if (to) return `Такси в ${to}`;
    return "Межгородное такси по России";
  }, [from, to]);

  const routeLabel = useMemo(() => {
    if (from && to) return `${from} – ${to}`;
    if (from) return `из ${from}`;
    if (to) return `в ${to}`;
    return "Вся Россия и новые территории";
  }, [from, to]);

  useEffect(() => {
    document.title = `${headline} — Такси Дальняк`;
  }, [headline]);

  const phoneHref = useMemo(() => {
    const p = new URLSearchParams({
      utm_source: utmParams.source,
      utm_medium: utmParams.medium,
      utm_campaign: utmParams.campaign,
      utm_content: "call_button",
      utm_term: utmParams.term,
    });
    // для tel: UTM не нужны, но фиксируем клик через data-атрибут
    // реальный трекинг — через Яндекс.Метрику цель "phone_click"
    return PHONE_HREF;
  }, [utmParams]);

  const tgHref = useMemo(() => {
    return buildTgUrl(
      TG_HREF,
      utmParams.source,
      utmParams.medium,
      utmParams.campaign,
      "tg_button",
    );
  }, [utmParams]);

  const maxHref = useMemo(() => {
    const u = new URL(MAX_HREF);
    u.searchParams.set("utm_source", utmParams.source);
    u.searchParams.set("utm_medium", utmParams.medium);
    u.searchParams.set("utm_campaign", utmParams.campaign);
    u.searchParams.set("utm_content", "max_button");
    u.searchParams.set("utm_term", utmParams.term);
    return u.toString();
  }, [utmParams]);

  return (
    <>
      <Splash visible={splash} />

      <div className="min-h-[100dvh] w-full bg-[#0f0f1a] text-white flex flex-col">
        <style>{`
          @keyframes ctaPulse {
            0%,100% { box-shadow: 0 4px 20px rgba(245,168,0,0.4), 0 0 0 0 rgba(245,168,0,0.3); }
            50%      { box-shadow: 0 4px 20px rgba(245,168,0,0.7), 0 0 0 10px rgba(245,168,0,0); }
          }
          .cta-pulse { animation: ctaPulse 2.4s ease-out infinite; }
        `}</style>

        {/* ШАПКА */}
        <div className="bg-[#1a1a2e] px-4 py-3 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="Такси Дальняк" className="w-10 h-10 rounded-xl object-cover ring-2 ring-[#F5A800]/50" />
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

        {/* ФОТО МАШИНЫ */}
        <div className="relative overflow-hidden" style={{ minHeight: "48vw", maxHeight: "380px" }}>
          <img
            src={CAR_IMG}
            alt="Такси межгород"
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0f0f1a 0%, rgba(15,15,26,0.5) 50%, transparent 100%)" }} />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(15,15,26,0.6) 0%, transparent 55%)" }} />
          {/* логотип на машине */}
          <div className="absolute bottom-3 right-3 flex items-center gap-2 bg-[#0f0f1a]/80 backdrop-blur-md rounded-xl px-2.5 py-1.5 border border-[#F5A800]/25">
            <img src={LOGO} alt="" className="w-7 h-7 rounded-lg object-cover" />
            <div style={{ fontFamily: "Oswald" }}>
              <div className="text-[8px] uppercase tracking-[0.3em] text-[#F5A800] leading-none">Такси</div>
              <div className="text-[13px] font-black uppercase text-white leading-none mt-0.5">Дальняк</div>
            </div>
          </div>
        </div>

        {/* ГЛАВНЫЙ БЛОК */}
        <div className="px-4 pt-5 pb-3">
          {/* маршрут-бейдж */}
          <div className="inline-flex items-center gap-1.5 bg-[#F5A800]/15 border border-[#F5A800]/30 rounded-full px-3 py-1 mb-3">
            <Icon name="MapPin" size={12} className="text-[#F5A800] shrink-0" />
            <span className="text-[#F5A800] text-[11px] font-bold uppercase tracking-wide">{routeLabel}</span>
          </div>

          {/* заголовок */}
          <h1 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: "clamp(24px,7vw,44px)", lineHeight: 1.05, textTransform: "uppercase", color: "#fff" }}>
            {headline}
          </h1>

          {/* главный слоган */}
          <div className="mt-2 mb-4">
            <div style={{ fontFamily: "Oswald", fontSize: "clamp(17px,4.5vw,26px)", fontWeight: 700, color: "#F5A800", lineHeight: 1.15 }}>
              С нами вы доедете.
            </div>
            <div className="text-white/45 text-sm mt-0.5 italic">За других не отвечаем.</div>
          </div>

          {/* УТП 2×2 */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {[
              { icon: "Zap",         text: "Срочная подача" },
              { icon: "Calendar",    text: "Предзаказ без оплаты брони" },
              { icon: "Receipt",     text: "Чек самозанятого" },
              { icon: "ShieldCheck", text: "Работаем с 2014 года" },
            ].map((item) => (
              <div key={item.text} className="flex items-start gap-2 bg-[#1a1a2e] rounded-xl px-3 py-2.5 border border-white/5">
                <Icon name={item.icon as "Zap"} size={14} className="text-[#F5A800] shrink-0 mt-0.5" />
                <span className="text-white text-[11px] font-semibold leading-tight">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ТАРИФЫ */}
        <div className="px-4 pb-6">
          <div className="flex items-center gap-2 mb-4">
            <Icon name="Car" size={15} className="text-[#F5A800]" />
            <span style={{ fontFamily: "Oswald" }} className="text-white font-bold uppercase tracking-wide text-sm">Наш автопарк</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {TARIFFS.map((t) => (
              <div key={t.id} className="relative rounded-2xl overflow-hidden flex flex-col" style={{ aspectRatio: "1/1.05" }}>
                {/* фото на весь фон */}
                <img
                  src={t.img}
                  alt={t.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                {/* градиент снизу */}
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(10,10,20,0.97) 0%, rgba(10,10,20,0.5) 52%, rgba(10,10,20,0.1) 100%)" }} />
                {/* цветная полоска сверху */}
                <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: t.color }} />
                {/* бейдж */}
                {t.badge && (
                  <div className="absolute top-3 right-3">
                    <span className="text-[9px] font-black uppercase tracking-wide px-2 py-1 rounded-full backdrop-blur-sm" style={{ background: `${t.color}30`, color: t.color, border: `1px solid ${t.color}50` }}>{t.badge}</span>
                  </div>
                )}
                {/* текст снизу */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <div style={{ fontFamily: "Oswald", color: t.color, fontSize: "16px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", lineHeight: 1 }}>{t.name}</div>
                  <div className="text-white/70 text-[10px] leading-snug mt-0.5">{t.desc}</div>
                  <div className="flex items-center gap-2.5 mt-2">
                    <span className="flex items-center gap-1 text-white/50 text-[10px]">
                      <Icon name="Users" size={10} className="shrink-0" />{t.seats} пасс.
                    </span>
                    <span className="flex items-center gap-1 text-white/50 text-[10px]">
                      <Icon name="Briefcase" size={10} className="shrink-0" />{t.luggage}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 bg-[#F5A800]/10 border border-[#F5A800]/20 rounded-xl px-3 py-2.5 flex items-center gap-2">
            <Icon name="Tag" size={14} className="text-[#F5A800] shrink-0" />
            <span className="text-[#F5A800] text-[11.5px] font-bold">Фиксированная стоимость — без счётчика и сюрпризов</span>
          </div>
        </div>

        {/* БАННЕР ДЛЯ ВОЕННЫХ */}
        <div className="px-4 pb-6">
          <a
            href="/voennye"
            className="relative flex items-center gap-4 rounded-2xl overflow-hidden border border-white/10 active:scale-[0.98] transition-transform"
            style={{ background: "linear-gradient(120deg, #0f1a0f 0%, #1a2a0a 50%, #0f1a0f 100%)" }}
          >
            {/* зелёная полоска слева */}
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-[#4ade80] via-[#22c55e] to-[#4ade80]" />
            {/* мигающая точка */}
            <div className="absolute top-3 right-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-[10px] font-bold uppercase tracking-wider">Спецраздел</span>
            </div>
            <div className="pl-5 pr-4 py-4 flex items-center gap-3 w-full">
              <div className="w-11 h-11 rounded-xl bg-green-500/15 border border-green-500/25 flex items-center justify-center shrink-0">
                <Icon name="Shield" size={22} className="text-green-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div style={{ fontFamily: "Oswald", fontSize: "16px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", color: "#fff", lineHeight: 1.1 }}>
                  Едешь из зоны СВО?
                </div>
                <div className="text-green-400/80 text-[11px] mt-0.5 font-semibold">Специальные условия для военных →</div>
              </div>
              <Icon name="ChevronRight" size={18} className="text-white/30 shrink-0" />
            </div>
          </a>
        </div>

        {/* МАРШРУТЫ */}
        <div className="px-4 pb-6">
          <div className="flex items-center gap-2 mb-1">
            <Icon name="Route" size={15} className="text-[#F5A800]" />
            <span style={{ fontFamily: "Oswald" }} className="text-white font-bold uppercase tracking-wide text-sm">Выполненные рейсы</span>
          </div>
          <p className="text-white/40 text-[11px] mb-3 italic">Это лишь малая часть поездок — каждый день новый маршрут</p>
          <div className="flex flex-wrap gap-2">
            {ROUTES.map((r) => (
              <span key={r} className="flex items-center gap-1 bg-[#1a1a2e] border border-white/8 rounded-full px-3 py-1.5 text-[11px] text-white/70 font-semibold">
                <Icon name="MapPin" size={10} className="text-[#F5A800] shrink-0" />{r}
              </span>
            ))}
          </div>
        </div>

        {/* НАС РЕКОМЕНДУЮТ */}
        <div className="px-4 pb-6">
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#141422] rounded-2xl border border-[#F5A800]/15 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Icon name="ThumbsUp" size={16} className="text-[#F5A800]" />
              <span style={{ fontFamily: "Oswald" }} className="text-[#F5A800] font-bold uppercase tracking-wide text-sm">Нас рекомендуют</span>
            </div>
            <p className="text-white/80 text-[12.5px] leading-relaxed mb-3">
              Нас выбирают <span className="text-white font-bold">не из-за цены</span> — а из-за <span className="text-[#F5A800] font-bold">фиксированной стоимости</span> и умения решить задачу.
            </p>
            <p className="text-white/60 text-[12px] leading-relaxed mb-3">
              Мы не просто перевозим пассажиров — мы помогаем людям качественно получить услугу. Об этом говорят наши отзывы и постоянные клиенты, которые обращаются снова и снова.
            </p>
            <div className="flex items-center gap-3 pt-2 border-t border-white/8">
              <div className="flex gap-0.5">
                {[1,2,3,4,5].map(i => <Icon key={i} name="Star" size={12} className="text-[#F5A800] fill-[#F5A800]" />)}
              </div>
              <span className="text-white/50 text-[11px]">Работаем с 2014 года · Тысячи довольных пассажиров</span>
            </div>
          </div>
        </div>

        {/* ОТЗЫВЫ */}
        <div className="px-4 pb-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex gap-0.5">
              {[1,2,3,4,5].map(i => <Icon key={i} name="Star" size={13} className="text-[#F5A800] fill-[#F5A800]" />)}
            </div>
            <span style={{ fontFamily: "Oswald" }} className="text-white/70 font-bold uppercase tracking-wide text-xs">Реальные отзывы пассажиров</span>
          </div>

          <div className="flex flex-col gap-3">
            {reviews.map((r) => (
              <div key={r.name} className="bg-[#1a1a2e] rounded-2xl overflow-hidden border border-white/5 flex gap-0">
                <img
                  src={r.img}
                  alt={`Отзыв ${r.name}`}
                  loading="lazy"
                  className="w-[90px] shrink-0 object-cover object-top self-stretch"
                />
                <div className="flex flex-col justify-between p-3 min-w-0">
                  <div>
                    <div className="flex gap-0.5 mb-1.5">
                      {[1,2,3,4,5].map(i => <Icon key={i} name="Star" size={10} className="text-[#F5A800] fill-[#F5A800]" />)}
                    </div>
                    <p className="text-white/75 text-[11.5px] leading-snug line-clamp-4">{r.text}</p>
                  </div>
                  <div className="mt-2">
                    <div className="text-white font-bold text-xs">{r.name}</div>
                    <div className="text-[#F5A800] text-[10px]">{r.route}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* КНОПКИ — sticky внизу */}
        <div className="sticky bottom-0 bg-[#1a1a2e] border-t border-white/10 px-3 py-3 shadow-[0_-8px_32px_rgba(0,0,0,0.6)]">

          {/* большая кнопка позвонить */}
          <a
            href={phoneHref}
            onClick={() => ymGoal("phone_click", { utm_source: utmParams.source, utm_medium: utmParams.medium, utm_campaign: utmParams.campaign })}
            className="cta-pulse flex items-center justify-center gap-3 w-full bg-[#F5A800] hover:bg-amber-400 active:scale-[0.98] text-[#1a1a2e] font-black py-4 rounded-2xl transition mb-2"
            style={{ fontFamily: "Oswald" }}
          >
            <Icon name="PhoneCall" size={24} />
            <div className="flex flex-col items-start leading-none">
              <span style={{ fontSize: "clamp(16px,4.5vw,20px)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Позвонить</span>
              <span className="text-[12px] font-bold opacity-70 mt-0.5">{PHONE}</span>
            </div>
          </a>

          {/* две кнопки мессенджеров */}
          <div className="grid grid-cols-2 gap-2">
            <a
              href={tgHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => ymGoal("telegram_click", { utm_source: utmParams.source, utm_medium: utmParams.medium, utm_campaign: utmParams.campaign })}
              className="flex items-center justify-center gap-2 bg-[#229ED9] hover:bg-sky-400 active:scale-95 text-white font-black py-3.5 rounded-2xl transition"
              style={{ fontFamily: "Oswald" }}
            >
              <Icon name="Send" size={20} />
              <span style={{ fontSize: "clamp(13px,3.5vw,16px)", textTransform: "uppercase", letterSpacing: "0.04em" }}>Telegram</span>
            </a>

            <a
              href={maxHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => ymGoal("max_click", { utm_source: utmParams.source, utm_medium: utmParams.medium, utm_campaign: utmParams.campaign })}
              className="flex items-center justify-center gap-2 bg-[#0077FF] hover:bg-blue-500 active:scale-95 text-white font-black py-3.5 rounded-2xl transition"
              style={{ fontFamily: "Oswald" }}
            >
              <img src={MAX_LOGO} alt="МАКС" className="w-6 h-6 rounded-full object-cover shrink-0" />
              <span style={{ fontSize: "clamp(13px,3.5vw,16px)", textTransform: "uppercase", letterSpacing: "0.04em" }}>МАКС</span>
            </a>
          </div>

        </div>
      </div>
    </>
  );
}