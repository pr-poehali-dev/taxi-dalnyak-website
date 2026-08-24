// Единый модуль расчёта стоимости поездки.
// Тарифы за километр: обычные регионы РФ и новые территории (ДНР, ЛНР, Херсонская, Запорожская).

export const MIN_PRICE = 10000;

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
}

export const TARIFF_CLASSES: TariffClass[] = [
  { id: "standart",    name: "Стандарт", desc: "Рио · Поло · Солярис",  seats: 4, luggage: "1–2 сумки",    rateRf: 35, rateNt: 95,  color: "#c9a84c" },
  { id: "comfort",     name: "Комфорт",  desc: "Хавал Джулиан 2025",    seats: 4, luggage: "2–3 сумки",    rateRf: 40, rateNt: 100, color: "#22D3EE", badge: "Популярный" },
  { id: "comfortplus", name: "Комфорт+", desc: "Toyota Camry 70 кузов", seats: 4, luggage: "3–4 сумки",    rateRf: 45, rateNt: 110, color: "#A78BFA", badge: "Бизнес" },
  { id: "minivan",     name: "Минивэн",  desc: "Hyundai Staria 2022",   seats: 7, luggage: "Много багажа", rateRf: 55, rateNt: 120, color: "#34D399", badge: "Группа" },
];

export const RATE_STANDARD = TARIFF_CLASSES[0].rateRf;
export const RATE_NEW_TERRITORIES = TARIFF_CLASSES[0].rateNt;

const NEW_TERRITORIES_CITIES = [
  "донецк", "луганск", "мариуполь", "мелитополь", "херсон",
  "новые территории", "лнр", "днр", "запорожск", "бердянск",
  "макеевка", "горловка", "енакиево", "алчевск", "стаханов",
  "краснодон", "снежное", "торез", "шахтёрск", "шахтерск",
  "харцызск", "ясиноватая", "докучаевск", "волноваха",
  "новоазовск", "старобельск", "сватово", "кадиевка",
  "геническ", "скадовск", "энергодар", "токмак", "приморск",
  "васильевка", "каховка", "олешки",
];

export function isNewTerritoriesRoute(...cities: (string | undefined)[]): boolean {
  return cities.some((c) => {
    if (!c) return false;
    const low = c.toLowerCase();
    return NEW_TERRITORIES_CITIES.some((nt) => low.includes(nt));
  });
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

export function calcAllPrices(km: number, newTerritories = false) {
  return TARIFF_CLASSES.map((t) => ({
    ...t,
    rate: newTerritories ? t.rateNt : t.rateRf,
    price: calcPriceFor(km, t.id, newTerritories) ?? 0,
  }));
}

export function calcPrice(km: number, newTerritories = false): PriceRange | null {
  if (!km || km <= 0) return null;
  const rate = newTerritories ? RATE_NEW_TERRITORIES : RATE_STANDARD;
  const p = roundPrice(km * rate);
  return { min: p, max: p, rate };
}
