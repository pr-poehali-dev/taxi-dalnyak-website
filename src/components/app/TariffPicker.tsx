import { TARIFF_LIST, Tariff, money } from "@/lib/appApi";

export default function TariffPicker({ prices, value, onChange }: {
  prices: Partial<Record<Tariff, number>>; value: Tariff; onChange: (t: Tariff) => void;
}) {
  return (
    <div className="space-y-2">
      {TARIFF_LIST.filter((t) => prices[t.id] !== undefined).map((t) => {
        const on = value === t.id;
        const special = t.id === "choice";
        return (
          <button key={t.id} onClick={() => onChange(t.id)}
            className={`relative flex w-full items-center gap-3 rounded-2xl border-2 p-2.5 text-left transition ${on ? (special ? "border-amber-500 bg-amber-50" : "border-neutral-900 bg-neutral-50") : special ? "border-amber-200 bg-gradient-to-r from-amber-50 to-white" : "border-neutral-100 bg-white"}`}>
            {t.badge && <span className="absolute -top-2 left-3 rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-extrabold uppercase text-white">{t.badge}</span>}
            <img src={t.img} alt={t.name} loading="lazy" className="h-16 w-24 shrink-0 rounded-xl bg-neutral-100 object-cover" />
            <span className="min-w-0 flex-1">
              <span className="block text-base font-extrabold">{t.name}</span>
              <span className="block text-xs font-semibold text-neutral-500">{t.seats}</span>
              <span className={`block text-xs text-neutral-400 ${special ? "" : "truncate"}`}>{t.cars}</span>
            </span>
            <span className="text-lg font-extrabold">{money(prices[t.id] || 0)}</span>
          </button>
        );
      })}
    </div>
  );
}
