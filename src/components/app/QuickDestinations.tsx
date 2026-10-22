import Icon from "@/components/ui/icon";
import type { Place } from "./AddressSearch";

const CITIES: [string, string, number, number][] = [
  ["Москва", "Москва", 55.7558, 37.6173],
  ["Санкт-Петербург", "Санкт-Петербург", 59.9386, 30.3141],
  ["Белгород", "Белгородская область", 50.5954, 36.5873],
  ["Курск", "Курская область", 51.7304, 36.1926],
  ["Нижний Новгород", "Нижегородская область", 56.3269, 44.0059],
  ["Воронеж", "Воронежская область", 51.6608, 39.2003],
  ["Ростов-на-Дону", "Ростовская область", 47.2357, 39.7015],
  ["Краснодар", "Краснодарский край", 45.0355, 38.9753],
  ["Донецк", "ДНР", 48.0159, 37.8029],
  ["Луганск", "ЛНР", 48.574, 39.3078],
  ["Казань", "Татарстан", 55.7963, 49.1088],
  ["Сочи", "Краснодарский край", 43.5855, 39.7231],
  ["Мариуполь", "ДНР", 47.0971, 37.5434],
  ["Симферополь", "Крым", 44.9521, 34.1024],
  ["Самара", "Самарская область", 53.1959, 50.1002],
  ["Брянск", "Брянская область", 53.2434, 34.3637],
  ["Орёл", "Орловская область", 52.9703, 36.0635],
  ["Тула", "Тульская область", 54.1931, 37.6173],
  ["Липецк", "Липецкая область", 52.6088, 39.5992],
  ["Ярославль", "Ярославская область", 57.6261, 39.8845],
  ["Волгоград", "Волгоградская область", 48.708, 44.5133],
  ["Мелитополь", "Запорожская обл.", 46.8489, 35.3653],
];

function km(a: [number, number], b: [number, number]) {
  const r = (x: number) => (x * Math.PI) / 180;
  const h = Math.sin(r(b[0] - a[0]) / 2) ** 2 + Math.cos(r(a[0])) * Math.cos(r(b[0])) * Math.sin(r(b[1] - a[1]) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export function FirstScreenHead() {
  return (
    <div className="mb-4">
      <h1 className="text-[22px] font-extrabold leading-tight text-neutral-900">Такси в любой город России</h1>
      <p className="mt-1 text-sm font-semibold text-neutral-500">Выберите город — цена появится сразу, без регистрации</p>
      <div className="mt-3 flex flex-wrap gap-1.5 text-xs font-bold text-neutral-700">
        {["Цена не меняется в пути", "Оплата водителю", "Вся Россия и новые регионы"].map((t) => (
          <span key={t} className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-800">
            <Icon name="Check" size={12} /> {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function QuickDestinations({ from, onPick, onOther }: { from?: [number, number] | null; onPick: (p: Place) => void; onOther: () => void }) {
  const list = CITIES
    .map((c) => ({ c, d: from ? km(from, [c[2], c[3]]) * 1.2 : 0 }))
    .filter((x) => !from || x.d > 90)
    .slice(0, 8);
  return (
    <div>
      <div className="mb-2 text-xs font-bold uppercase text-neutral-400">Популярные направления</div>
      <div className="grid grid-cols-2 gap-2">
        {list.map(({ c: [city, region, lat, lng], d }) => (
          <button key={city}
            onClick={() => onPick({ label: `${city}, ${region}`, title: city, subtitle: region, lat, lng, city, street: "", house: "", state: region })}
            className="flex items-center justify-between rounded-2xl bg-neutral-100 px-3.5 py-3 text-left active:bg-neutral-200">
            <span className="min-w-0">
              <span className="block truncate text-sm font-extrabold text-neutral-900">{city}</span>
              <span className="block truncate text-[11px] font-semibold text-neutral-500">{d ? `≈ ${Math.round(d / 10) * 10} км` : region}</span>
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
