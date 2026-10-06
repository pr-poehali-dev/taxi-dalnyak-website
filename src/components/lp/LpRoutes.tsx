import Icon from "@/components/ui/icon";

export interface LpRouteCard {
  from: string;
  to: string;
  km: number;
  rate: number;
}

const fmt = (n: number) => n.toLocaleString("ru-RU");

interface Props {
  onPick: (km: number) => void;
  routes?: LpRouteCard[];
  title?: string;
  note?: string;
}

const DEFAULT: LpRouteCard[] = [
  { from: "Ростов-на-Дону", to: "Москва", km: 1080, rate: 32 },
  { from: "Воронеж", to: "Москва", km: 520, rate: 32 },
  { from: "Белгород", to: "Москва", km: 650, rate: 32 },
  { from: "Ростов-на-Дону", to: "Донецк", km: 240, rate: 32 },
];

export default function LpRoutes({ onPick, routes = DEFAULT, title, note }: Props) {
  if (routes.length === 0) return null;
  return (
    <section className="px-5 py-8 max-w-xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold uppercase text-center" style={{ fontFamily: "Oswald, sans-serif" }}>
        {title ?? "Популярные направления"}
      </h2>
      <div className="mt-6 space-y-3">
        {routes.map((r) => (
          <button
            key={r.from + r.to}
            type="button"
            onClick={() => onPick(r.km)}
            className="w-full flex items-center justify-between rounded-2xl px-4 py-4 text-left active:scale-[0.98] transition"
            style={{ background: "#14141a", border: "1px solid rgba(255,255,255,0.1)" }}
          >
            <span>
              <span className="block font-extrabold">{r.from} — {r.to}</span>
              <span className="block text-xs text-white/60 mt-0.5">≈ {fmt(r.km)} км</span>
            </span>
            <span className="text-right">
              <span className="block text-xs text-white/60">от</span>
              <span className="block text-xl font-extrabold text-amber-400">{fmt(r.km * r.rate)} ₽</span>
            </span>
            <Icon name="ChevronRight" size={20} className="text-white/50 ml-2" />
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-white/50">{note ?? "Цены по тарифу «Стандарт», расстояние приблизительное"}</p>
    </section>
  );
}
