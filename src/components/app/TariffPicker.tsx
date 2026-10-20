import { TARIFF_LIST, Tariff, money } from "@/lib/appApi";

export default function TariffPicker({ prices, value, onChange }: {
  prices: Record<Tariff, number>; value: Tariff; onChange: (t: Tariff) => void;
}) {
  return (
    <div className="space-y-2">
      {TARIFF_LIST.map((t) => {
        const on = value === t.id;
        return (
          <button key={t.id} onClick={() => onChange(t.id)}
            className={`flex w-full items-center gap-3 rounded-2xl border-2 p-2.5 text-left transition ${on ? "border-neutral-900 bg-neutral-50" : "border-neutral-100 bg-white"}`}>
            <img src={t.img} alt={t.name} loading="lazy" className="h-16 w-24 shrink-0 rounded-xl bg-neutral-100 object-cover" />
            <span className="min-w-0 flex-1">
              <span className="block text-base font-extrabold">{t.name}</span>
              <span className="block text-xs font-semibold text-neutral-500">{t.seats}</span>
              <span className="block truncate text-xs text-neutral-400">{t.cars}</span>
            </span>
            <span className="text-lg font-extrabold">{money(prices[t.id])}</span>
          </button>
        );
      })}
    </div>
  );
}
