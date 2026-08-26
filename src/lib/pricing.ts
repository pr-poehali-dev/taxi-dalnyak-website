// Единый модуль расчёта стоимости поездки.
// Тарифы за километр: обычные регионы РФ и новые территории (ДНР, ЛНР, Херсонская, Запорожская).
import { NEW_TERRITORY_CITIES } from "@/lib/cities";

export const MIN_PRICE = 5000;

export interface TariffClass {
  id: string;
  name: string;
  desc: string;
  seats: number;
  luggage: string;
  rateRf: number;
  rateNt: number;
  color: string;
  badge?: string;
  img: string;
}

export const TARIFF_CLASSES: TariffClass[] = [
  { id: "standart",    name: "Стандарт", desc: "Рио · Поло · Солярис",  seats: 4, luggage: "1–2 сумки",    rateRf: 30, rateNt: 95,  color: "#c9a84c" , img: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/39d043f8-acde-4a27-a69c-ebe03e8bd403.jpg" },
  { id: "comfort",     name: "Комфорт",  desc: "Хавал Джулиан 2025",    seats: 4, luggage: "2–3 сумки",    rateRf: 40, rateNt: 100, color: "#22D3EE", badge: "Популярный" , img: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/238966ba-ee86-4f06-bc36-0872f043ebfb.jpg" },
  { id: "comfortplus", name: "Комфорт+", desc: "Toyota Camry 70 кузов", seats: 4, luggage: "3–4 сумки",    rateRf: 45, rateNt: 110, color: "#A78BFA", badge: "Бизнес" , img: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/38f8c2aa-ebc6-4a58-bedb-3322efbce272.jpg" },
  { id: "minivan",     name: "Минивэн",  desc: "Hyundai Staria 2022",   seats: 7, luggage: "Много багажа", rateRf: 55, rateNt: 120, color: "#34D399", badge: "Группа" , img: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/92a14984-9eac-4b0c-aa50-8c49af1c12b7.jpg" },
];

export const RATE_STANDARD = TARIFF_CLASSES[0].rateRf;
export const RATE_NEW_TERRITORIES = TARIFF_CLASSES[0].rateNt;

export function isNewTerritoriesRoute(...cities: (string | undefined)[]): boolean {
  return cities.some((c) => (c ? NEW_TERRITORY_CITIES.has(c) : false));
}

// Фиксированные цены на популярных маршрутах (Стандарт, ₽).
// Имеют приоритет над расчётом по километражу.
const FIXED_ROUTES: Record<string, number> = {
  "Ростов-на-Дону|Луганск": 13000,
  "Ростов-на-Дону|Донецк": 13000,
};

function routeKey(a: string, b: string): string {
  return [a, b].sort((x, y) => x.localeCompare(y, "ru")).join("|");
}

export function getFixedBase(from?: string, to?: string): number | null {
  if (!from || !to) return null;
  const key = routeKey(from, to);
  for (const [k, v] of Object.entries(FIXED_ROUTES)) {
    if (routeKey(...(k.split("|") as [string, string])) === key) return v;
  }
  return null;
}

export interface PriceRange {
  min: number;
  max: number;
  rate: number;
}

function roundPrice(v: number): number {
  return Math.max(MIN_PRICE, Math.round(v / 100) * 100);
}

export function calcPriceFor(km: number, tariffId: string, newTerritories = false): number | null {
  if (!km || km <= 0) return null;
  const t = TARIFF_CLASSES.find((x) => x.id === tariffId) ?? TARIFF_CLASSES[0];
  return roundPrice(km * (newTerritories ? t.rateNt : t.rateRf));
}

export interface TariffPrice extends TariffClass {
  rate: number;
  price: number;
}

// Если для маршрута задана фиксированная цена — остальные классы
// пересчитываются от неё в той же пропорции, что и тарифы за км.
export function calcAllPrices(
  km: number,
  newTerritories = false,
  from?: string,
  to?: string,
): TariffPrice[] {
  const base = TARIFF_CLASSES[0];
  const fixed = getFixedBase(from, to);
  const baseRate = newTerritories ? base.rateNt : base.rateRf;

  return TARIFF_CLASSES.map((t) => {
    const rate = newTerritories ? t.rateNt : t.rateRf;
    const price = fixed
      ? Math.max(MIN_PRICE, Math.round((fixed * rate) / baseRate / 100) * 100)
      : calcPriceFor(km, t.id, newTerritories) ?? 0;
    return { ...t, rate, price };
  });
}

export function calcPrice(km: number, newTerritories = false): PriceRange | null {
  if (!km || km <= 0) return null;
  const rate = newTerritories ? RATE_NEW_TERRITORIES : RATE_STANDARD;
  const p = roundPrice(km * rate);
  return { min: p, max: p, rate };
}