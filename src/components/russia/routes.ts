import { CITY_COORDS } from "@/lib/cities";

const HUBS = [
  "Москва", "Санкт-Петербург", "Краснодар", "Ростов-на-Дону", "Воронеж", "Казань", "Нижний Новгород",
  "Самара", "Екатеринбург", "Сочи", "Минеральные Воды", "Симферополь", "Волгоград", "Белгород",
  "Уфа", "Челябинск", "Ставрополь", "Саратов", "Курск", "Тула", "Ярославль", "Пермь", "Тюмень",
  "Новосибирск", "Омск", "Донецк", "Луганск", "Мариуполь", "Анапа", "Пенза", "Липецк", "Брянск",
];

export const DEFAULT_ROUTES: [string, string][] = [
  ["Ростов-на-Дону", "Москва"],
  ["Воронеж", "Москва"],
  ["Москва", "Санкт-Петербург"],
  ["Краснодар", "Сочи"],
  ["Белгород", "Москва"],
  ["Екатеринбург", "Челябинск"],
];

export interface RouteItem { from: string; to: string; km: number; hours: number }

export function roadKm(a: string, b: string): number | null {
  const p = CITY_COORDS[a];
  const q = CITY_COORDS[b];
  if (!p || !q) return null;
  const rad = Math.PI / 180;
  const dLat = (q[0] - p[0]) * rad;
  const dLon = (q[1] - p[1]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(p[0] * rad) * Math.cos(q[0] * rad) * Math.sin(dLon / 2) ** 2;
  const air = 2 * 6371 * Math.asin(Math.sqrt(h));
  const k = air < 300 ? 1.3 : air < 800 ? 1.2 : 1.15;
  return Math.round((air * k) / 10) * 10;
}

function item(from: string, to: string): RouteItem | null {
  const km = roadKm(from, to);
  if (!km) return null;
  return { from, to, km, hours: Math.max(3, Math.round(km / 75)) };
}

/** Направления из города клиента: ближайшие крупные города от minKm до 1800 км. */
export function routesFrom(from: string | null, to: string | null, minKm: number): RouteItem[] {
  const out: RouteItem[] = [];
  if (from && to) {
    const r = item(from, to);
    if (r) out.push(r);
  }
  if (from && CITY_COORDS[from]) {
    const list = HUBS.filter((h) => h !== from && h !== to)
      .map((h) => item(from, h))
      .filter((r): r is RouteItem => !!r && r.km >= minKm && r.km <= 1800)
      .sort((a, b) => a.km - b.km);
    const moscow = list.find((r) => r.to === "Москва");
    for (const r of [...(moscow ? [moscow] : []), ...list]) {
      if (out.length >= 6) break;
      if (!out.some((o) => o.to === r.to)) out.push(r);
    }
    if (out.length >= 3) return out;
  }
  return DEFAULT_ROUTES.map(([a, b]) => item(a, b)).filter((r): r is RouteItem => !!r);
}
