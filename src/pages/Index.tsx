import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";

const CAR_IMG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/091d3d1c-1649-4d9e-8958-1a624bf8f371.jpg";
const LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/3a499542-747a-49d2-808e-4c137548c76e.jpg";
const MAX_LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/c12972fd-7c56-4a6f-9266-e44e65c003fa.jpeg";

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

function Splash({ visible }: { visible: boolean }) {
  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
      <div className="flex flex-col items-center gap-4 text-center px-6">
        <img src={LOGO} alt="Такси Дальняк" className="w-28 h-28 rounded-2xl object-cover shadow-xl" />
        <div style={{ fontFamily: "Oswald" }}>
          <div className="text-[12px] uppercase tracking-[0.4em] text-[#F5A800] font-bold">Такси Дальняк</div>
          <div className="text-2xl font-black uppercase text-gray-900 mt-1">Надёжно с 2014 года</div>
          <div className="text-sm text-gray-500 mt-1">12 000+ поездок · договор</div>
        </div>
        <div className="w-40 h-[3px] bg-gray-100 rounded-full overflow-hidden mt-1">
          <div className="h-full bg-[#F5A800] splash-bar" />
        </div>
      </div>
      <style>{`
        @keyframes splashBar { from { transform:translateX(-100%) } to { transform:translateX(0) } }
        .splash-bar { animation: splashBar 1.1s ease-out forwards; }
      `}</style>
    </div>
  );
}

export default function Index() {
  const [route, setRoute] = useState<{ from: string; to: string }>({ from: "", to: "" });
  const [splash, setSplash] = useState(true);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const term = p.get("utm_term") || p.get("keyword") || "";
    setRoute(parseRoute(term));
    const t = setTimeout(() => setSplash(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const { from, to } = route;

  const headline = useMemo(() => {
    if (from && to) return `Устали искать такси ${from} – ${to}? Вот оно: фикс. цена, подача от 30 минут`;
    if (from) return `Устали искать такси из ${from}? Вот оно: фикс. цена, подача от 30 минут`;
    if (to) return `Устали искать такси в ${to}? Вот оно: фикс. цена, подача от 30 минут`;
    return "Устали искать такси? Вот оно: фикс. цена, подача от 30 минут";
  }, [from, to]);

  const routeLabel = useMemo(() => {
    if (from && to) return `${from} – ${to}`;
    if (from) return `из ${from}`;
    if (to) return `в ${to}`;
    return "межгород";
  }, [from, to]);

  useEffect(() => {
    document.title = `Такси ${routeLabel} — фикс цена, без предоплаты | Дальняк`;
  }, [routeLabel]);

  return (
    <>
      <Splash visible={splash} />

      <div className="min-h-[100dvh] w-full bg-white text-gray-900 flex flex-col overflow-hidden">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;600;700;800&display=swap');
          @keyframes ctaPulse {
            0%,100% { box-shadow: 0 6px 24px rgba(245,168,0,0.5), 0 0 0 0 rgba(245,168,0,0.4); }
            50%      { box-shadow: 0 6px 24px rgba(245,168,0,0.7), 0 0 0 12px rgba(245,168,0,0); }
          }
          .cta-pulse { animation: ctaPulse 2.2s ease-out infinite; }
        `}</style>

        {/* ── ШАПКА ── */}
        <div className="bg-[#1a1a2e] px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="Такси Дальняк" className="w-11 h-11 rounded-xl object-cover ring-2 ring-[#F5A800]/60" />
            <div style={{ fontFamily: "Oswald" }}>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#F5A800] font-bold leading-none">Такси</div>
              <div className="text-xl font-black uppercase text-white tracking-wide leading-none mt-0.5">Дальняк</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 bg-green-500/20 border border-green-400/40 rounded-full px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-300 text-[11px] font-bold uppercase tracking-wide">Свободно</span>
          </div>
        </div>

        {/* ── ЖЁЛТАЯ ПОЛОСА — ВЕСЬ ЗАГОЛОВОК ── */}
        <div className="bg-[#F5A800] px-4 py-3 sm:py-4">
          <h1 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: "clamp(16px,4.5vw,30px)", lineHeight: 1.15, textTransform: "uppercase", color: "#1a1a2e", letterSpacing: "-0.01em" }}>
            {headline}
          </h1>
        </div>

        {/* ── ОСНОВНОЙ БЛОК ── */}
        <div className="flex-1 relative overflow-hidden" style={{ minHeight: "300px" }}>

          {/* фото машины — на весь блок */}
          <img
            src={CAR_IMG}
            alt="Такси межгород"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />

          {/* затемнение слева для читабельности текста */}
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, rgba(26,26,46,0.85) 0%, rgba(26,26,46,0.5) 45%, transparent 75%)" }} />

          {/* логотип на машине — правый нижний угол */}
          <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-[#1a1a2e]/80 backdrop-blur-sm rounded-xl px-3 py-2 border border-[#F5A800]/40">
            <img src={LOGO} alt="Такси Дальняк" className="w-9 h-9 rounded-lg object-cover" />
            <div style={{ fontFamily: "Oswald" }}>
              <div className="text-[9px] uppercase tracking-[0.3em] text-[#F5A800] font-bold leading-none">Такси</div>
              <div className="text-base font-black uppercase text-white leading-none mt-0.5">Дальняк</div>
            </div>
          </div>

          {/* левая колонка с УТП */}
          <div className="relative z-10 flex flex-col gap-3 px-4 pt-5 pb-6 max-w-[55%] sm:max-w-[45%]">

            {/* УТП-плашка */}
            <div className="bg-[#F5A800] rounded-xl px-3 py-3 shadow-lg">
              <div className="text-[#1a1a2e] font-black uppercase" style={{ fontFamily: "Oswald", fontSize: "clamp(12px,3.2vw,17px)", lineHeight: 1.4 }}>
                Фикс цена · подача от 30 мин · без предоплаты
              </div>
            </div>

            {/* метки доверия */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 bg-[#1a1a2e]/70 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
                <Icon name="Star" size={14} className="text-[#F5A800] fill-[#F5A800] shrink-0" />
                <span className="text-white font-bold text-[11px]">4,9 · 1 200+ поездок</span>
              </div>
              <div className="flex items-center gap-2 bg-[#1a1a2e]/70 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
                <Icon name="ShieldCheck" size={14} className="text-green-400 shrink-0" />
                <span className="text-white font-bold text-[11px]">Работаем по договору</span>
              </div>
              <div className="flex items-center gap-2 bg-[#1a1a2e]/70 backdrop-blur-sm rounded-lg px-2.5 py-1.5">
                <Icon name="CalendarCheck" size={14} className="text-blue-400 shrink-0" />
                <span className="text-white font-bold text-[11px]">На рынке с 2014 года</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── НИЖНИЙ БЛОК: 3 кнопки одинакового размера ── */}
        <div className="bg-[#1a1a2e] px-3 py-3 grid grid-cols-3 gap-2">

          {/* Позвонить */}
          <a
            href={PHONE_HREF}
            className="cta-pulse flex flex-col items-center justify-center gap-1 bg-[#F5A800] hover:bg-amber-400 active:scale-[0.97] text-[#1a1a2e] font-black py-3.5 rounded-2xl transition"
            style={{ fontFamily: "Oswald" }}
          >
            <Icon name="PhoneCall" size={22} />
            <span className="text-xs uppercase tracking-wide leading-none">Позвонить</span>
            <span className="text-[10px] font-bold leading-none opacity-80">{PHONE}</span>
          </a>

          {/* Telegram */}
          <a
            href={TG_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 bg-[#229ED9] hover:bg-sky-400 active:scale-[0.97] text-white font-black py-3.5 rounded-2xl transition"
            style={{ fontFamily: "Oswald" }}
          >
            <Icon name="Send" size={22} />
            <span className="text-xs uppercase tracking-wide leading-none">Telegram</span>
          </a>

          {/* МАКС */}
          <a
            href={MAX_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center gap-1 bg-[#0077FF] hover:bg-blue-500 active:scale-[0.97] text-white font-black py-3.5 rounded-2xl transition"
            style={{ fontFamily: "Oswald" }}
          >
            <img src={MAX_LOGO} alt="МАКС" className="w-7 h-7 rounded-full object-cover" />
            <span className="text-xs uppercase tracking-wide leading-none">МАКС</span>
          </a>

        </div>
      </div>
    </>
  );
}
