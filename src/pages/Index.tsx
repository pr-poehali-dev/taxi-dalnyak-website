import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";

const CAR_BG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/c9beeef8-2aa7-49f3-b8b4-e8937eae11a5.jpg";
const LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/3a499542-747a-49d2-808e-4c137548c76e.jpg";
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

function Splash({ visible }: { visible: boolean }) {
  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a] transition-opacity duration-500 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 via-transparent to-transparent" />
      <div className="relative flex flex-col items-center gap-6 px-6 text-center">
        <img
          src={LOGO}
          alt="Такси Дальняк"
          className="w-32 h-32 sm:w-36 sm:h-36 rounded-3xl object-cover shadow-2xl shadow-amber-500/30 animate-pulse"
        />
        <div className="space-y-1.5">
          <div
            className="text-[11px] uppercase tracking-[0.4em] text-amber-300 font-bold"
            style={{ fontFamily: "Oswald" }}
          >
            С 2014 года · 12 000+ поездок
          </div>
          <div
            className="text-2xl sm:text-3xl font-black uppercase text-white tracking-wide"
            style={{ fontFamily: "Oswald" }}
          >
            Доверие проверено дорогой
          </div>
          <div className="text-white/60 text-sm pt-1">
            Фиксированная цена · опытные водители · без предоплаты
          </div>
        </div>
        <div className="w-44 h-[3px] bg-white/10 rounded-full overflow-hidden mt-2">
          <div className="h-full bg-gradient-to-r from-amber-400 to-amber-300 splash-bar" />
        </div>
      </div>
      <style>{`
        @keyframes splashBar { from { transform: translateX(-100%); } to { transform: translateX(0); } }
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
    const t = setTimeout(() => setSplash(false), 1100);
    return () => clearTimeout(t);
  }, []);

  const fromNom = route.from ? tcase(route.from) : "";
  const toNom = route.to ? tcase(route.to) : "";
  const fromGen = route.from ? tcase(genitive(route.from)) : "";
  const toAcc = route.to ? tcase(accusative(route.to)) : "";

  const headline = useMemo(() => {
    if (fromNom && toNom)
      return { kicker: "Подаём машину сейчас", top: `${fromNom} — ${toNom}`, sub: "Едем по фиксированной цене" };
    if (fromGen)
      return { kicker: "Подаём машину сейчас", top: `Из ${fromGen}`, sub: "Куда ехать — скажете водителю" };
    if (toAcc)
      return { kicker: "Подаём машину сейчас", top: `В ${toAcc}`, sub: "Откуда забрать — скажете водителю" };
    return { kicker: "Межгород по всей России", top: "Заказать такси", sub: "Фиксированная цена · без предоплаты" };
  }, [fromNom, toNom, fromGen, toAcc]);

  useEffect(() => {
    let phrase = "межгород";
    if (fromNom && toNom) phrase = `${fromNom} — ${toNom}`;
    else if (fromGen) phrase = `из ${fromGen}`;
    else if (toAcc) phrase = `в ${toAcc}`;
    document.title = `Заказать такси ${phrase} — фикс. цена | Такси Дальняк`;
  }, [fromNom, toNom, fromGen, toAcc]);

  return (
    <>
      <Splash visible={splash} />

      <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#0a0a0a] text-white pb-24 sm:pb-0">
        <img src={CAR_BG} alt="" className="absolute inset-0 w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/70 to-black" />
        <div className="pointer-events-none absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-amber-400/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 w-[420px] h-[420px] rounded-full bg-amber-500/10 blur-3xl" />

        <div className="relative z-10 min-h-[100dvh] flex flex-col">
          <header className="px-5 pt-5 sm:pt-7 flex items-center gap-3">
            <img src={LOGO} alt="Дальняк" className="w-11 h-11 rounded-xl object-cover ring-1 ring-white/10" />
            <div className="leading-tight">
              <div className="text-[11px] uppercase tracking-[0.25em] text-amber-300/80 font-bold" style={{ fontFamily: "Oswald" }}>Такси</div>
              <div className="text-lg font-black uppercase tracking-wider" style={{ fontFamily: "Oswald" }}>Дальняк</div>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[11px] text-white/70 border border-emerald-400/30 bg-emerald-400/10 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold">Свободно сейчас</span>
            </div>
          </header>

          <main className="flex-1 flex flex-col justify-center px-5 py-6 sm:py-10">
            <div className="max-w-xl mx-auto w-full text-center">
              <div className="inline-flex items-center gap-2 border border-amber-300/30 bg-amber-300/10 rounded-full px-4 py-1.5 mb-4">
                <Icon name="ShieldCheck" size={13} className="text-amber-300" />
                <span className="text-[11px] sm:text-xs uppercase tracking-widest text-amber-200 font-bold">
                  {headline.kicker}
                </span>
              </div>

              <h1 className="font-black uppercase leading-[0.95] tracking-tight" style={{ fontFamily: "Oswald", fontSize: "clamp(40px, 10vw, 80px)" }}>
                <span className="block text-white drop-shadow-2xl">Заказать такси</span>
                <span className="block text-amber-300 drop-shadow-2xl">{headline.top}</span>
              </h1>

              <p className="mt-3 text-amber-100/90 text-base sm:text-lg font-semibold">
                {headline.sub}
              </p>

              <div className="mt-5 grid grid-cols-3 gap-2 max-w-md mx-auto text-[11px] sm:text-xs">
                <div className="flex flex-col items-center gap-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-1">
                  <Icon name="BadgeRussianRuble" size={18} className="text-amber-300" />
                  <span className="text-white/85 font-semibold leading-tight">Фикс цена<br/>без сюрпризов</span>
                </div>
                <div className="flex flex-col items-center gap-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-1">
                  <Icon name="Wallet" size={18} className="text-amber-300" />
                  <span className="text-white/85 font-semibold leading-tight">Без<br/>предоплаты</span>
                </div>
                <div className="flex flex-col items-center gap-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-1">
                  <Icon name="Clock4" size={18} className="text-amber-300" />
                  <span className="text-white/85 font-semibold leading-tight">Подача<br/>от 15 минут</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5 max-w-sm mx-auto">
                <a
                  href={PHONE_HREF}
                  className="group relative flex items-center justify-center gap-3 bg-amber-400 hover:bg-amber-300 text-[#0a0a0a] font-black text-lg py-4 rounded-2xl shadow-xl shadow-amber-500/30 active:scale-[0.98] transition overflow-hidden"
                  style={{ fontFamily: "Oswald" }}
                >
                  <span className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Icon name="PhoneCall" size={20} />
                  <span className="tracking-wide">Позвонить · {PHONE}</span>
                </a>
                <div className="text-[11px] text-white/55 -mt-1">Ответим за 30 секунд · рассчитаем цену сразу</div>

                <a
                  href={TG_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-[#229ED9] hover:bg-[#2eaee9] text-white font-bold text-base py-3.5 rounded-2xl shadow-lg shadow-[#229ED9]/25 active:scale-[0.98] transition"
                  style={{ fontFamily: "Oswald" }}
                >
                  <Icon name="Send" size={17} />
                  <span className="uppercase tracking-wide">Написать в Telegram</span>
                </a>

                <a
                  href={MAX_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-white/95 hover:bg-white text-[#0a0a0a] font-bold text-base py-3.5 rounded-2xl shadow-lg shadow-black/30 active:scale-[0.98] transition"
                  style={{ fontFamily: "Oswald" }}
                >
                  <img src={MAX_LOGO} alt="" className="w-5 h-5 rounded object-cover" />
                  <span className="uppercase tracking-wide">Написать в МАКС</span>
                </a>
              </div>

              <div className="mt-6 flex items-center justify-center gap-4 text-[11px] sm:text-xs text-white/65">
                <div className="flex items-center gap-1.5">
                  <Icon name="Star" size={13} className="text-amber-300 fill-amber-300" />
                  <span><b className="text-white">4,9</b> · 1200+ отзывов</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-white/30" />
                <div className="flex items-center gap-1.5">
                  <Icon name="ShieldCheck" size={13} className="text-emerald-400" />
                  <span>Договор · ИП</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-white/30 hidden sm:block" />
                <div className="hidden sm:flex items-center gap-1.5">
                  <Icon name="Calendar" size={13} className="text-white/70" />
                  <span>с 2014 г.</span>
                </div>
              </div>
            </div>
          </main>

          <footer className="px-5 pb-6 text-center text-[11px] text-white/40 hidden sm:block">
            © {new Date().getFullYear()} Такси «Дальняк» · Межгород по всей России · Работаем 24/7
          </footer>
        </div>

        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/10 px-3 py-2.5 flex gap-2">
          <a
            href={PHONE_HREF}
            className="flex-[2] flex items-center justify-center gap-2 bg-amber-400 active:bg-amber-300 text-[#0a0a0a] font-black text-sm py-3 rounded-xl shadow-lg shadow-amber-500/30 active:scale-[0.98] transition"
            style={{ fontFamily: "Oswald" }}
          >
            <Icon name="PhoneCall" size={16} />
            <span className="uppercase tracking-wide">Позвонить</span>
          </a>
          <a
            href={TG_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 bg-[#229ED9] active:bg-[#2eaee9] text-white font-bold text-sm py-3 rounded-xl active:scale-[0.98] transition"
            style={{ fontFamily: "Oswald" }}
          >
            <Icon name="Send" size={15} />
            <span className="uppercase tracking-wide">Чат</span>
          </a>
        </div>
      </div>
    </>
  );
}
