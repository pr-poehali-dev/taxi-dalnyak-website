import { useState, useEffect, useRef, useCallback } from "react";
import AlisaChat, { type AlisaChatHandle } from "@/components/AlisaChat";
import { getAllUtmParams, parseKeyword } from "@/lib/utm";

const LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/eed871f1-fcfc-4342-ba10-6d3337b98fe4.jpg";

function trackGoal(goal: string) {
  try {
    const w = window as unknown as { ym?: (id: number, action: string, goal: string) => void };
    if (w.ym) w.ym(108400932, "reachGoal", goal);
  } catch {
    /* noop */
  }
}

interface Chip {
  label: string;
  emoji?: string;
  goal: string;
}

const QUICK_CHIPS: Chip[] = [
  { label: "Хочу узнать цену", emoji: "💰", goal: "chip_price" },
  { label: "Когда подадите?", emoji: "⏱️", goal: "chip_when" },
  { label: "Поедем сегодня", emoji: "🚀", goal: "chip_today" },
  { label: "Поедем завтра", emoji: "📅", goal: "chip_tomorrow" },
  { label: "Большой багаж", emoji: "🧳", goal: "chip_baggage" },
  { label: "Едем с ребёнком", emoji: "👶", goal: "chip_child" },
  { label: "Едем с собакой", emoji: "🐕", goal: "chip_pet" },
  { label: "Документы для бухгалтерии", emoji: "🧾", goal: "chip_docs" },
  { label: "5-8 человек, минивэн", emoji: "👨‍👩‍👧‍👦", goal: "chip_minivan" },
  { label: "Туда-обратно одним днём", emoji: "🔁", goal: "chip_round" },
  { label: "Почему у вас дороже?", emoji: "🤔", goal: "chip_why_expensive" },
  { label: "Расскажите о машинах", emoji: "🚗", goal: "chip_cars" },
];

export default function Index() {
  const utmRef = useRef<Record<string, string>>({});
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");
  const [initialPrompt, setInitialPrompt] = useState<string>("");
  const [usedChips, setUsedChips] = useState<Set<string>>(new Set());
  const chatRef = useRef<AlisaChatHandle>(null);

  useEffect(() => {
    utmRef.current = getAllUtmParams();
    const params = new URLSearchParams(window.location.search);
    const term = params.get("utm_term") || params.get("keyword") || "";
    const parsed = parseKeyword(term);
    if (parsed.from) setFromCity(parsed.from);
    if (parsed.to) setToCity(parsed.to);
    if (parsed.from && parsed.to) {
      setInitialPrompt(`Хочу из ${parsed.from} в ${parsed.to}.`);
    } else if (parsed.display) {
      setInitialPrompt(`Хочу такси ${parsed.display}.`);
    }
  }, []);

  const onChip = useCallback((chip: Chip) => {
    trackGoal(chip.goal);
    setUsedChips((s) => new Set(s).add(chip.label));
    chatRef.current?.sendClick(chip.label);
  }, []);

  const visibleChips = QUICK_CHIPS.filter((c) => !usedChips.has(c.label)).slice(0, 8);

  return (
    <div className="min-h-[100dvh] bg-[#F5F2ED] text-[#1a1a1a] font-golos overflow-x-hidden flex flex-col">
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-black/5 px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={LOGO} alt="Дальняк" className="w-8 h-8 rounded-lg object-cover" />
          <div>
            <div className="font-oswald text-[14px] font-bold uppercase tracking-wider leading-none">Дальняк</div>
            <div className="text-[10px] text-black/55 font-golos">межгород · 24/7</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10.5px] text-green-700 font-bold font-golos">Алиса отвечает</span>
        </div>
      </header>

      <div className="px-4 pt-3 pb-1.5">
        <div className="flex items-start gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-[15px] flex-shrink-0">
            А
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-oswald text-[14px] font-bold uppercase leading-tight">
              {fromCity && toCity ? `Алиса посчитает ${fromCity} → ${toCity}` : "Алиса посчитает за минуту"}
            </div>
            <div className="text-[11.5px] text-black/55 font-golos leading-tight mt-0.5">
              живой диспетчер · отвечает в чате · оформляет за 1 минуту
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col px-3 pt-2 min-h-0">
        <div
          className="flex-1 rounded-2xl bg-white border border-black/10 overflow-hidden shadow-lg"
          style={{
            boxShadow: "0 12px 28px rgba(0,0,0,0.08), 0 4px 8px rgba(0,0,0,0.04)",
            minHeight: "55vh",
            maxHeight: "70dvh",
          }}
        >
          <AlisaChat
            ref={chatRef}
            utm={utmRef.current}
            routeFrom={fromCity}
            routeTo={toCity}
            initialPrompt={initialPrompt}
            onOrdered={() => trackGoal("order_completed")}
          />
        </div>

        <div className="text-center text-[10.5px] text-black/45 font-golos py-2">
          ⚡ Среднее время ответа — 28 секунд
        </div>
      </div>

      <section className="px-3 pb-4">
        <div className="text-[11px] uppercase font-oswald font-bold tracking-wider text-black/45 mb-2 px-1">
          Спросить одним тапом
        </div>
        <div className="flex flex-wrap gap-2">
          {visibleChips.map((c) => (
            <button
              key={c.label}
              type="button"
              onClick={() => onChip(c)}
              className="px-3 py-2 rounded-full bg-white border border-black/10 text-[12.5px] font-golos active:scale-95 transition-transform shadow-sm hover:border-amber-400/60"
            >
              {c.emoji && <span className="mr-1">{c.emoji}</span>}
              {c.label}
            </button>
          ))}
        </div>
      </section>

      <section className="px-3 pb-4">
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white rounded-xl py-2.5 px-2 border border-black/5 text-center">
            <div className="font-oswald font-bold text-[15px] leading-none">50К+</div>
            <div className="text-[10px] text-black/55 font-golos leading-tight mt-0.5">поездок</div>
          </div>
          <div className="bg-white rounded-xl py-2.5 px-2 border border-black/5 text-center">
            <div className="font-oswald font-bold text-[15px] leading-none">5 лет</div>
            <div className="text-[10px] text-black/55 font-golos leading-tight mt-0.5">на рынке</div>
          </div>
          <div className="bg-white rounded-xl py-2.5 px-2 border border-black/5 text-center">
            <div className="font-oswald font-bold text-[15px] leading-none">24/7</div>
            <div className="text-[10px] text-black/55 font-golos leading-tight mt-0.5">диспетчер</div>
          </div>
        </div>
      </section>

      <footer className="px-4 pb-3 text-center text-[10px] text-black/45 font-golos">
        © {new Date().getFullYear()} Такси «Дальняк»
      </footer>
    </div>
  );
}
