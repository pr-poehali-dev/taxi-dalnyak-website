// Единый модуль расчёта стоимости поездки.
// Стандартный тариф — 40 ₽/км, поездки на новые территории — 90 ₽/км.

export const RATE_STANDARD = 40;
export const RATE_NEW_TERRITORIES = 90;

const NEW_TERRITORIES_CITIES = [
  "донецк", "луганск", "мариуполь", "мелитополь", "херсон",
  "новые территории", "лнр", "днр", "запорожск",
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

export function calcPrice(km: number, newTerritories = false): PriceRange | null {
  if (!km || km <= 0) return null;
  const rate = newTerritories ? RATE_NEW_TERRITORIES : RATE_STANDARD;
  const minP = Math.round(km * rate / 100) * 100;
  const maxP = Math.round(minP * 1.1 / 100) * 100;
  return { min: minP, max: maxP, rate };
}
