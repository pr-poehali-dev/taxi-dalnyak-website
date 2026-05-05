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

const CITIES: { stem: string; nom: string }[] = [
  { stem: "москв", nom: "москва" },
  { stem: "питер", nom: "санкт-петербург" },
  { stem: "санкт", nom: "санкт-петербург" },
  { stem: "петербург", nom: "санкт-петербург" },
  { stem: "ростов", nom: "ростов" },
  { stem: "воронеж", nom: "воронеж" },
  { stem: "краснодар", nom: "краснодар" },
  { stem: "ставропол", nom: "ставрополь" },
  { stem: "волгоград", nom: "волгоград" },
  { stem: "саратов", nom: "саратов" },
  { stem: "самар", nom: "самара" },
  { stem: "казан", nom: "казань" },
  { stem: "уф", nom: "уфа" },
  { stem: "пенз", nom: "пенза" },
  { stem: "перм", nom: "пермь" },
  { stem: "твер", nom: "тверь" },
  { stem: "тул", nom: "тула" },
  { stem: "рязан", nom: "рязань" },
  { stem: "ижевск", nom: "ижевск" },
  { stem: "ижевс", nom: "ижевск" },
  { stem: "элист", nom: "элиста" },
  { stem: "астрахан", nom: "астрахань" },
  { stem: "новочеркасск", nom: "новочеркасск" },
  { stem: "таганрог", nom: "таганрог" },
  { stem: "шахт", nom: "шахты" },
  { stem: "сочи", nom: "сочи" },
  { stem: "анап", nom: "анапа" },
  { stem: "ялт", nom: "ялта" },
  { stem: "геленджик", nom: "геленджик" },
  { stem: "новороссийск", nom: "новороссийск" },
  { stem: "пятигорск", nom: "пятигорск" },
  { stem: "кисловодск", nom: "кисловодск" },
  { stem: "минеральн", nom: "минеральные воды" },
  { stem: "махачкал", nom: "махачкала" },
  { stem: "грозн", nom: "грозный" },
  { stem: "нальчик", nom: "нальчик" },
  { stem: "владикавказ", nom: "владикавказ" },
];

function normCity(w: string): string {
  if (!w) return w;
  for (const c of CITIES) {
    if (w.startsWith(c.stem)) return c.nom;
  }
  return w;
}

const VOWELS = new Set(["а", "е", "ё", "и", "о", "у", "ы", "э", "ю", "я"]);

function genitive(nom: string): string {
  if (!nom) return nom;
  if (nom === "санкт-петербург") return "санкт-петербурга";
  if (nom === "минеральные воды") return "минеральных вод";
  if (nom === "шахты") return "шахт";
  const last = nom.slice(-1);
  if (last === "а") return nom.slice(0, -1) + "ы";
  if (last === "я") return nom.slice(0, -1) + "и";
  if (last === "ь") return nom.slice(0, -1) + "и";
  if (last === "й") return nom.slice(0, -1) + "я";
  if (VOWELS.has(last)) return nom;
  return nom + "а";
}

function accusative(nom: string): string {
  if (!nom) return nom;
  if (nom === "минеральные воды") return "минеральные воды";
  return nom;
}

function tcase(w: string): string {
  return w.split(/(\s|-)/).map((p) => (p && /[а-яёa-z]/i.test(p[0]) ? p[0].toUpperCase() + p.slice(1) : p)).join("");
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

export default function Index() {
  const [route, setRoute] = useState<{ from: string; to: string }>({ from: "", to: "" });

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const term = p.get("utm_term") || p.get("keyword") || "";
    setRoute(parseRoute(term));
  }, []);

  const headline = useMemo(() => {
    const fromNom = route.from ? tcase(route.from) : "";
    const toNom = route.to ? tcase(route.to) : "";
    const fromGen = route.from ? tcase(genitive(route.from)) : "";
    const toAcc = route.to ? tcase(accusative(route.to)) : "";
    if (fromNom && toNom) return { top: "Заказать такси", bottom: `${fromNom} — ${toNom}` };
    if (fromGen) return { top: "Заказать такси", bottom: `из ${fromGen}` };
    if (toAcc) return { top: "Заказать такси", bottom: `в ${toAcc}` };
    return { top: "Заказать такси", bottom: "межгород" };
  }, [route]);

  useEffect(() => {
    const fromNom = route.from ? tcase(route.from) : "";
    const toNom = route.to ? tcase(route.to) : "";
    const fromGen = route.from ? tcase(genitive(route.from)) : "";
    const toAcc = route.to ? tcase(accusative(route.to)) : "";
    let phrase = "межгород";
    if (fromNom && toNom) phrase = `${fromNom} — ${toNom}`;
    else if (fromGen) phrase = `из ${fromGen}`;
    else if (toAcc) phrase = `в ${toAcc}`;
    document.title = `Заказать такси ${phrase} | Такси Дальняк`;
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