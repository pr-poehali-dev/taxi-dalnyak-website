import { useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";

const CAR_BG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/5800f832-b85d-4e36-a0df-00282ecddd47.jpg";
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

  const routeLabel = useMemo(() => {
    if (fromNom && toNom) return `${fromNom} — ${toNom}`;
    if (fromGen) return `из ${fromGen}`;
    if (toAcc) return `в ${toAcc}`;
    return "межгород";
  }, [fromNom, toNom, fromGen, toAcc]);

  const hasRoute = !!(fromNom && toNom) || !!fromGen || !!toAcc;

  const headline = useMemo(() => {
    if (hasRoute) {
      return {
        kicker: "Хватит листать выдачу",
        pre: `Устали искать такси ${routeLabel}?`,
        big: "Вот оно.",
        sub: "Фикс цена · подача от 30 минут · без предоплаты",
      };
    }
    return {
      kicker: "Едете в другой город?",
      pre: "Только вы и дорога.",
      big: "Доедем за фикс цену.",
      sub: "По всей России · без предоплаты · подача от 30 минут",
    };
  }, [hasRoute, routeLabel]);

  useEffect(() => {
    document.title = `Такси ${routeLabel} — фикс цена, без предоплаты | Дальняк`;
  }, [routeLabel]);

  return (
    <>
      <Splash visible={splash} />

      <div className="relative min-h-[100dvh] w-full overflow-hidden bg-[#0b0d12] text-white pb-24 sm:pb-0">
        <div className="absolute inset-0">
          <img src={CAR_BG} alt="Премиальный автомобиль такси Дальняк" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b0d12]/85 via-[#0b0d12]/60 to-[#0b0d12]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0b0d12]/90 via-transparent to-[#0b0d12]/70" />
        </div>
        <div className="pointer-events-none absolute -top-40 -right-40 w-[520px] h-[520px] rounded-full bg-amber-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-40 w-[520px] h-[520px] rounded-full bg-amber-500/15 blur-3xl" />

        <div className="relative z-10 min-h-[100dvh] flex flex-col">
          <header className="px-5 pt-5 sm:pt-7 flex items-center gap-3">
            <div className="flex items-center gap-3 bg-white/5 backdrop-blur-md border border-white/15 rounded-2xl pl-2 pr-4 py-1.5 shadow-lg">
              <img src={LOGO} alt="Дальняк" className="w-10 h-10 rounded-xl object-cover ring-1 ring-amber-300/40" />
              <div className="leading-tight">
                <div className="text-[10px] uppercase tracking-[0.3em] text-amber-300 font-bold" style={{ fontFamily: "Oswald" }}>Такси</div>
                <div className="text-base font-black uppercase tracking-wider text-white" style={{ fontFamily: "Oswald" }}>Дальняк</div>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1.5 text-[11px] text-emerald-300 border border-emerald-400/40 bg-emerald-400/10 backdrop-blur-md rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold">Машина свободна</span>
            </div>
          </header>

          <main className="flex-1 flex flex-col justify-center px-5 py-6 sm:py-10">
            <div className="max-w-xl mx-auto w-full text-center">
              <div className="inline-flex items-center gap-2 border border-amber-300/50 bg-amber-400/15 backdrop-blur-md rounded-full px-4 py-1.5 mb-5 shadow-lg">
                <Icon name="Crown" size={13} className="text-amber-300" />
                <span className="text-[11px] sm:text-xs uppercase tracking-widest text-amber-200 font-bold">
                  Бизнес-класс · межгород 24/7
                </span>
              </div>

              <p className="text-white/85 text-base sm:text-lg font-semibold mb-3 drop-shadow-lg" style={{ fontFamily: "Oswald" }}>
                {headline.pre}
              </p>

              <h1 className="font-black uppercase leading-[0.95] tracking-tight drop-shadow-2xl" style={{ fontFamily: "Oswald", fontSize: "clamp(42px, 10.5vw, 84px)" }}>
                <span className="block bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                  {headline.big}
                </span>
              </h1>

              <p className="mt-4 inline-block bg-amber-400 text-slate-900 px-4 py-2 rounded-xl text-sm sm:text-base font-black shadow-xl shadow-amber-500/30" style={{ fontFamily: "Oswald" }}>
                {headline.sub}
              </p>

              <div className="mt-6 grid grid-cols-3 gap-2 max-w-md mx-auto text-[11px] sm:text-xs">
                <div className="flex flex-col items-center gap-1 bg-white/8 backdrop-blur-md border border-white/15 rounded-xl py-3 px-1 shadow-lg">
                  <Icon name="BadgeRussianRuble" size={22} className="text-amber-300" />
                  <span className="text-white font-bold leading-tight">Фикс цена<br/>без сюрпризов</span>
                </div>
                <div className="flex flex-col items-center gap-1 bg-white/8 backdrop-blur-md border border-white/15 rounded-xl py-3 px-1 shadow-lg">
                  <Icon name="Wallet" size={22} className="text-amber-300" />
                  <span className="text-white font-bold leading-tight">Без<br/>предоплаты</span>
                </div>
                <div className="flex flex-col items-center gap-1 bg-white/8 backdrop-blur-md border border-white/15 rounded-xl py-3 px-1 shadow-lg">
                  <Icon name="Clock4" size={22} className="text-amber-300" />
                  <span className="text-white font-bold leading-tight">Подача<br/>от 30 минут</span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-2.5 max-w-sm mx-auto">
                <a
                  href={PHONE_HREF}
                  className="group relative flex items-center justify-center gap-3 bg-gradient-to-br from-amber-300 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-slate-900 font-black text-lg py-4 rounded-2xl shadow-2xl shadow-amber-500/50 active:scale-[0.98] transition overflow-hidden cta-pulse"
                  style={{ fontFamily: "Oswald" }}
                >
                  <span className="absolute inset-0 bg-white/40 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <Icon name="PhoneCall" size={20} />
                  <span className="tracking-wide">Позвонить · {PHONE}</span>
                </a>
                <div className="text-[12px] text-amber-200/90 -mt-1 font-semibold">Ответим за 30 секунд · цену скажем сразу</div>

                <a
                  href={TG_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-[#229ED9] hover:bg-[#2eaee9] text-white font-bold text-base py-3.5 rounded-2xl shadow-lg shadow-[#229ED9]/40 active:scale-[0.98] transition"
                  style={{ fontFamily: "Oswald" }}
                >
                  <Icon name="Send" size={17} />
                  <span className="uppercase tracking-wide">Написать в Telegram</span>
                </a>

                <a
                  href={MAX_HREF}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-white hover:bg-amber-50 text-slate-900 font-bold text-base py-3.5 rounded-2xl shadow-lg shadow-black/40 active:scale-[0.98] transition"
                  style={{ fontFamily: "Oswald" }}
                >
                  <img src={MAX_LOGO} alt="" className="w-5 h-5 rounded object-cover" />
                  <span className="uppercase tracking-wide">Написать в МАКС</span>
                </a>
              </div>

              <div className="mt-6 flex items-center justify-center flex-wrap gap-x-4 gap-y-2 text-[11px] sm:text-xs text-white/80">
                <div className="flex items-center gap-1.5">
                  <Icon name="Star" size={14} className="text-amber-300 fill-amber-300" />
                  <span><b className="text-white">4,9</b> · 1200+ отзывов</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-white/40" />
                <div className="flex items-center gap-1.5">
                  <Icon name="ShieldCheck" size={14} className="text-emerald-400" />
                  <span className="font-semibold">Договор · ИП</span>
                </div>
                <div className="w-1 h-1 rounded-full bg-white/40" />
                <div className="flex items-center gap-1.5">
                  <Icon name="Calendar" size={14} className="text-white/70" />
                  <span className="font-semibold">с 2014 г.</span>
                </div>
              </div>
            </div>
          </main>

          <footer className="px-5 pb-6 text-center text-[11px] text-white/40 hidden sm:block">
            © {new Date().getFullYear()} Такси «Дальняк» · Межгород по всей России · Работаем 24/7
          </footer>
        </div>

        <style>{`
          @keyframes ctaPulse {
            0%, 100% { box-shadow: 0 10px 25px -5px rgba(245,158,11,0.5), 0 0 0 0 rgba(245,158,11,0.5); }
            50% { box-shadow: 0 10px 25px -5px rgba(245,158,11,0.7), 0 0 0 14px rgba(245,158,11,0); }
          }
          .cta-pulse { animation: ctaPulse 2.2s ease-out infinite; }
        `}</style>

        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b0d12]/95 backdrop-blur-md border-t border-amber-300/30 px-3 py-2.5 flex gap-2 shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.6)]">
          <a
            href={PHONE_HREF}
            className="flex-[2] flex items-center justify-center gap-2 bg-gradient-to-br from-amber-300 to-amber-500 active:from-amber-200 active:to-amber-400 text-slate-900 font-black text-sm py-3 rounded-xl shadow-lg shadow-amber-500/40 active:scale-[0.98] transition"
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