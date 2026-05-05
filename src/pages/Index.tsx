import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";

const CAR_BG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/c9beeef8-2aa7-49f3-b8b4-e8937eae11a5.jpg";
const LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/eed871f1-fcfc-4342-ba10-6d3337b98fe4.jpg";
const MAX_LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/c12972fd-7c56-4a6f-9266-e44e65c003fa.jpeg";

const PHONE = "8 (995) 645-51-25";
const PHONE_HREF = "tel:+79956455125";
const TG_HREF = "https://t.me/Mezhgorod1816";
const MAX_HREF = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";

const STOP = new Set([
  "такси", "taxi", "заказать", "заказ", "вызвать", "вызов", "поездка", "поездку",
  "трансфер", "межгород", "междугороднее", "недорого", "дешево", "цена", "стоимость",
  "номер", "телефон", "круглосуточно", "онлайн", "сайт",
  "из", "в", "во", "до", "со", "с", "на", "по", "и", "от", "к", "ко",
]);

const KEEP = new Set(["москва", "уфа", "анапа", "ялта", "сочи", "тверь", "пермь", "тула", "рязань", "казань", "самара", "пенза", "элиста"]);

function normCity(w: string): string {
  if (w.length <= 3) return w;
  if (KEEP.has(w)) return w;
  if (w.startsWith("москв")) return "москва";
  if (w.startsWith("ростов")) return "ростов";
  if (w.startsWith("воронеж")) return "воронеж";
  if (w.startsWith("краснодар")) return "краснодар";
  if (w.startsWith("ставропол")) return "ставрополь";
  if (w.startsWith("волгоград")) return "волгоград";
  if (w.startsWith("саратов")) return "саратов";
  if (w.startsWith("астрахан")) return "астрахань";
  if (w.startsWith("новочеркасск")) return "новочеркасск";
  if (w.startsWith("таганрог")) return "таганрог";
  if (w.startsWith("шахт")) return "шахты";
  if (w.startsWith("сочи")) return "сочи";
  if (w.startsWith("анап")) return "анапа";
  if (w.startsWith("геленджик")) return "геленджик";
  if (w.startsWith("новороссийск")) return "новороссийск";
  if (w.startsWith("пятигорск")) return "пятигорск";
  if (w.startsWith("кисловодск")) return "кисловодск";
  if (w.startsWith("минеральн")) return "минеральные воды";
  if (w.startsWith("махачкал")) return "махачкала";
  if (w.startsWith("грозн")) return "грозный";
  if (w.startsWith("нальчик")) return "нальчик";
  if (w.startsWith("владикавказ")) return "владикавказ";
  if (w.startsWith("санкт") || w.startsWith("питер") || w.startsWith("петербург")) return "санкт-петербург";
  const sufs = ["ского", "ская", "скую", "ский", "ское", "ому", "ему", "ого", "его", "ой", "ей", "ом", "ами", "ями", "ах", "ях", "ы", "и", "у", "ю", "е", "а", "я"];
  for (const s of sufs) {
    if (w.length - s.length >= 3 && w.endsWith(s)) return w.slice(0, -s.length);
  }
  return w;
}

function tcase(w: string): string {
  return w.split(/[-\s]/).map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p)).join(w.includes("-") ? "-" : " ");
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

  return { from: from ? tcase(from) : "", to: to ? tcase(to) : "" };
}

export default function Index() {
  const [route, setRoute] = useState<{ from: string; to: string }>({ from: "", to: "" });

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const term = p.get("utm_term") || p.get("keyword") || "";
    setRoute(parseRoute(term));
  }, []);

  const headline = useMemo(() => {
    if (route.from && route.to) return { top: "Заказать такси", bottom: `${route.from} — ${route.to}` };
    if (route.from) return { top: "Заказать такси", bottom: `из ${route.from}` };
    if (route.to) return { top: "Заказать такси", bottom: `в ${route.to}` };
    return { top: "Заказать такси", bottom: "межгород" };
  }, [route]);

  useEffect(() => {
    const parts: string[] = ["Заказать такси"];
    if (route.from && route.to) parts.push(`${route.from} — ${route.to}`);
    else if (route.from) parts.push(`из ${route.from}`);
    else if (route.to) parts.push(`в ${route.to}`);
    else parts.push("межгород");
    document.title = `${parts.join(" ")} | Такси Дальняк`;
  }, [route]);

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#0a0a0a] text-white">
      <img src={CAR_BG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/65 to-black" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/40" />

      <div className="pointer-events-none absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-amber-400/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-amber-500/10 blur-3xl" />

      <div className="relative z-10 min-h-[100dvh] flex flex-col">
        <header className="px-5 pt-6 sm:pt-8 flex items-center gap-3">
          <img src={LOGO} alt="Дальняк" className="w-11 h-11 rounded-xl object-cover ring-1 ring-white/10" />
          <div className="leading-tight">
            <div className="text-[11px] uppercase tracking-[0.25em] text-amber-300/80 font-bold" style={{ fontFamily: "Oswald" }}>Такси</div>
            <div className="text-lg font-black uppercase tracking-wider" style={{ fontFamily: "Oswald" }}>Дальняк</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-[11px] text-white/60 border border-white/15 rounded-full px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Онлайн 24/7</span>
          </div>
        </header>

        <main className="flex-1 flex flex-col justify-center px-5 py-10">
          <div className="max-w-xl mx-auto w-full text-center">
            <div className="inline-flex items-center gap-2 border border-amber-300/30 bg-amber-300/5 rounded-full px-4 py-1.5 mb-5">
              <Icon name="MapPin" size={13} className="text-amber-300" />
              <span className="text-[11px] sm:text-xs uppercase tracking-widest text-amber-200 font-bold">Вся Россия · Новые территории</span>
            </div>

            <h1 className="font-black uppercase leading-[0.95] tracking-tight" style={{ fontFamily: "Oswald", fontSize: "clamp(44px, 11vw, 88px)" }}>
              <span className="block text-white drop-shadow-2xl">{headline.top}</span>
              <span className="block text-amber-300 drop-shadow-2xl">{headline.bottom}</span>
            </h1>

            <p className="mt-5 text-white/75 text-sm sm:text-base max-w-md mx-auto">
              Фиксированная цена · водитель со стажем · поддержка в пути 24/7
            </p>

            <div className="mt-8 flex flex-col gap-3 max-w-sm mx-auto">
              <a
                href={MAX_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-3 bg-white text-[#0a0a0a] font-bold text-base py-4 rounded-2xl shadow-xl shadow-black/40 hover:bg-amber-300 active:scale-[0.98] transition"
                style={{ fontFamily: "Oswald" }}
              >
                <img src={MAX_LOGO} alt="" className="w-6 h-6 rounded-md object-cover" />
                <span className="uppercase tracking-wide">Написать в МАКС</span>
                <Icon name="ArrowRight" size={16} className="opacity-50 group-hover:translate-x-1 transition" />
              </a>

              <a
                href={TG_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-center gap-3 bg-[#229ED9] hover:bg-[#2eaee9] text-white font-bold text-base py-4 rounded-2xl shadow-xl shadow-[#229ED9]/30 active:scale-[0.98] transition"
                style={{ fontFamily: "Oswald" }}
              >
                <Icon name="Send" size={18} />
                <span className="uppercase tracking-wide">Написать в Telegram</span>
                <Icon name="ArrowRight" size={16} className="opacity-60 group-hover:translate-x-1 transition" />
              </a>

              <a
                href={PHONE_HREF}
                className="group flex items-center justify-center gap-3 border border-white/20 bg-white/5 backdrop-blur-sm text-white font-bold text-base py-4 rounded-2xl hover:bg-white/10 active:scale-[0.98] transition"
                style={{ fontFamily: "Oswald" }}
              >
                <Icon name="Phone" size={17} className="text-amber-300" />
                <span className="tracking-wide">{PHONE}</span>
              </a>
            </div>
          </div>
        </main>

        <footer className="px-5 pb-6 text-center text-[11px] text-white/40">
          © {new Date().getFullYear()} Такси «Дальняк» · Межгород по всей России
        </footer>
      </div>
    </div>
  );
}