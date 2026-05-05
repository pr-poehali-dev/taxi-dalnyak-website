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
          <div className="text-sm text-gray-500 mt-1">12 000+ поездок · договор · ИП</div>
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
    if (from && to) return { top: `Устали искать такси ${from} – ${to}?`, bottom: "Вот оно." };
    if (from) return { top: `Такси из ${from}?`, bottom: "Вот оно." };
    if (to) return { top: `Такси в ${to}?`, bottom: "Вот оно." };
    return { top: "Устали искать такси?", bottom: "Вот оно." };
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

      <div className="min-h-[100dvh] w-full bg-white text-gray-900 flex flex-col overflow-hidden pb-24 sm:pb-0">
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

        {/* ── ЗАГОЛОВОК (жёлтая полоса) ── */}
        <div className="bg-[#F5A800] px-4 py-3 sm:py-4">
          <h1 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: "clamp(18px,5vw,34px)", lineHeight: 1.1, textTransform: "uppercase", color: "#1a1a2e", letterSpacing: "-0.01em" }}>
            {headline.top}
          </h1>
        </div>

        {/* ── ОСНОВНОЙ БЛОК: машина + левая колонка ── */}
        <div className="flex-1 relative bg-gradient-to-b from-[#e8f4fd] via-white to-white overflow-hidden">

          {/* машина справа */}
          <div className="absolute right-0 bottom-0 w-[62%] sm:w-[52%] h-full flex items-end pointer-events-none select-none">
            <img
              src={CAR_IMG}
              alt="Такси межгород"
              className="w-full object-cover object-left-bottom"
              style={{ maskImage: "linear-gradient(to left, black 60%, transparent 100%)", WebkitMaskImage: "linear-gradient(to left, black 60%, transparent 100%)" }}
            />
          </div>

          {/* левая колонка */}
          <div className="relative z-10 flex flex-col gap-4 px-4 pt-5 pb-6 max-w-[58%] sm:max-w-[50%]">

            {/* большой слоган */}
            <div style={{ fontFamily: "Oswald" }}>
              <div className="text-[#1a1a2e] font-black uppercase" style={{ fontSize: "clamp(32px,9vw,68px)", lineHeight: 0.95 }}>
                {headline.bottom}
              </div>
            </div>

            {/* УТП-строка */}
            <div className="bg-[#1a1a2e] rounded-xl px-3 py-2.5 shadow-lg">
              <div className="text-[#F5A800] font-black uppercase" style={{ fontFamily: "Oswald", fontSize: "clamp(11px,3vw,15px)", lineHeight: 1.4 }}>
                Фикс цена · подача от 30 мин · без предоплаты
              </div>
            </div>

            {/* метки доверия */}
            <div className="flex flex-col gap-1.5 text-[11px] sm:text-xs text-gray-700">
              <div className="flex items-center gap-1.5">
                <Icon name="Star" size={14} className="text-[#F5A800] fill-[#F5A800] shrink-0" />
                <span><b>4,9</b> · 1 200+ поездок</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="ShieldCheck" size={14} className="text-green-600 shrink-0" />
                <span>Работаем по договору · ИП</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Icon name="CalendarCheck" size={14} className="text-blue-500 shrink-0" />
                <span>На рынке с 2014 года</span>
              </div>
            </div>

          </div>
        </div>

        {/* ── НИЖНИЙ БЛОК: кнопки ── */}
        <div className="bg-[#1a1a2e] px-4 py-4 flex flex-col gap-2.5 sm:flex-row sm:gap-3 sm:items-center sm:justify-between">

          {/* телефон и иконки */}
          <div className="flex items-center gap-3">
            <a href={PHONE_HREF} className="flex items-center gap-1.5 bg-[#F5A800]/20 border border-[#F5A800]/40 rounded-full p-2.5">
              <Icon name="Phone" size={18} className="text-[#F5A800]" />
            </a>
            <a href={TG_HREF} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-[#229ED9]/20 border border-[#229ED9]/40 rounded-full p-2.5">
              <Icon name="Send" size={18} className="text-[#229ED9]" />
            </a>
            <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full p-1.5">
              <img src={MAX_LOGO} alt="МАКС" className="w-6 h-6 rounded-full object-cover" />
            </a>
            <a href={PHONE_HREF} style={{ fontFamily: "Oswald", fontSize: "clamp(18px,5vw,28px)" }} className="font-black text-white tracking-tight hover:text-[#F5A800] transition">
              {PHONE}
            </a>
          </div>

          {/* главная кнопка */}
          <a
            href={PHONE_HREF}
            className="cta-pulse flex items-center justify-center gap-2 bg-[#F5A800] hover:bg-amber-400 text-[#1a1a2e] font-black py-3.5 px-6 rounded-2xl shadow-xl active:scale-[0.97] transition sm:min-w-[200px]"
            style={{ fontFamily: "Oswald", fontSize: "clamp(14px,4vw,18px)", textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            <Icon name="PhoneCall" size={20} />
            Позвонить сейчас
          </a>
        </div>

        {/* ── МОБИЛЬНЫЙ STICKY СНИЗУ ── */}
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1a1a2e] border-t border-[#F5A800]/30 px-3 py-2.5 flex gap-2 shadow-[0_-4px_24px_rgba(0,0,0,0.4)]">
          <a
            href={PHONE_HREF}
            className="cta-pulse flex-[2] flex items-center justify-center gap-2 bg-[#F5A800] active:bg-amber-400 text-[#1a1a2e] font-black text-sm py-3.5 rounded-xl active:scale-[0.97] transition"
            style={{ fontFamily: "Oswald", textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            <Icon name="PhoneCall" size={17} />
            Позвонить · {PHONE}
          </a>
          <a
            href={TG_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 bg-[#229ED9] text-white font-bold text-sm py-3.5 px-4 rounded-xl active:scale-[0.97] transition"
            style={{ fontFamily: "Oswald" }}
          >
            <Icon name="Send" size={17} />
          </a>
        </div>
      </div>
    </>
  );
}
