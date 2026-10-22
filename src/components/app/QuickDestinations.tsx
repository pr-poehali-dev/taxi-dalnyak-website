import Icon from "@/components/ui/icon";
import type { Place } from "./AddressSearch";

const CITIES: [string, string, number, number][] = [
  ["Донецк", "ДНР", 48.0159, 37.8029],
  ["Луганск", "ЛНР", 48.574, 39.3078],
  ["Мариуполь", "ДНР", 47.0971, 37.5434],
  ["Мелитополь", "Запорожская обл.", 46.8489, 35.3653],
  ["Ростов-на-Дону", "Ростовская область", 47.2357, 39.7015],
  ["Москва", "Москва", 55.7558, 37.6173],
  ["Краснодар", "Краснодарский край", 45.0355, 38.9753],
  ["Воронеж", "Воронежская область", 51.6608, 39.2003],
];

export function FirstScreenHead() {
  return (
    <div className="mb-4">
      <h1 className="text-[22px] font-extrabold leading-tight text-neutral-900">Такси в другой город</h1>
      <p className="mt-1 text-sm font-semibold text-neutral-500">Выберите город — цена появится сразу, без регистрации</p>
      <div className="mt-3 flex flex-wrap gap-1.5 text-xs font-bold text-neutral-700">
        {["Цена не меняется в пути", "Оплата водителю", "Новые территории и КПП"].map((t) => (
          <span key={t} className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800">
            <Icon name="Check" size={12} /> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function QuickDestinations({ exclude, onPick, onOther }: { exclude?: string; onPick: (p: Place) => void; onOther: () => void }) {
  const ex = (exclude || "").toLowerCase();
  const list = CITIES.filter(([c]) => !ex || !ex.startsWith(c.toLowerCase().slice(0, 5))).slice(0, 6);
  return (
    <div>
      <div className="mb-2 text-xs font-bold uppercase text-neutral-400">Популярные направления</div>
      <div className="grid grid-cols-2 gap-2">
        {list.map(([city, region, lat, lng]) => (
          <button key={city}
            onClick={() => onPick({ label: `${city}, ${region}`, title: city, subtitle: region, lat, lng, city, street: "", house: "", state: region })}
            className="flex items-center justify-between rounded-2xl bg-neutral-100 px-3.5 py-3 text-left active:bg-neutral-200">
            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold text-neutral-900">{city}</span>
              <span className="block truncate text-[11px] font-semibold text-neutral-500">{region}</span>
            </span>
            <Icon name="ChevronRight" size={16} className="shrink-0 text-neutral-400" />
          </button>
        ))}
      </div>
      <button onClick={onOther} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#fcd34d] py-3.5 text-[15px] font-extrabold text-neutral-900">
        <Icon name="Search" size={18} /> Другой город или адрес
      </button>
    </div>
  );
}
