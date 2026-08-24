// Сёла, посёлки и деревни РФ с указанием региона.
// Файл большой (~4.5 МБ), поэтому грузится лениво — только когда
// пользователь начинает искать населённый пункт в калькуляторе.

export interface Settlement {
  name: string;
  region: string;
  lat: number;
  lon: number;
}

// Ключ вида "Ивановка (Курская обл.)" -> запись
let cache: Map<string, Settlement> | null = null;
let loading: Promise<Map<string, Settlement>> | null = null;

export function settlementLabel(name: string, region: string): string {
  return `${name} (${region})`;
}

export function isSettlementsReady(): boolean {
  return cache !== null;
}

export function loadSettlements(): Promise<Map<string, Settlement>> {
  if (cache) return Promise.resolve(cache);
  if (loading) return loading;

  loading = fetch("/settlements.txt")
    .then((r) => (r.ok ? r.text() : ""))
    .then((text) => {
      const map = new Map<string, Settlement>();
      const nl = text.indexOf("\n");
      if (nl > 0) {
        const regions = text.slice(0, nl).split("|");
        let pos = nl + 1;
        while (pos < text.length) {
          let end = text.indexOf("\n", pos);
          if (end < 0) end = text.length;
          const line = text.slice(pos, end);
          pos = end + 1;

          const a = line.indexOf("|");
          if (a < 1) continue;
          const b = line.indexOf("|", a + 1);
          const c = line.indexOf("|", b + 1);
          if (b < 0 || c < 0) continue;

          const name = line.slice(0, a);
          const region = regions[Number(line.slice(a + 1, b))];
          const lat = Number(line.slice(b + 1, c));
          const lon = Number(line.slice(c + 1));
          if (!region || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;

          map.set(settlementLabel(name, region), { name, region, lat, lon });
        }
      }
      cache = map;
      return map;
    })
    .catch(() => {
      cache = new Map();
      return cache;
    });

  return loading;
}

function norm(v: string): string {
  return v.toLowerCase().replace(/ё/g, "е").trim();
}

// Возвращает подписи вида "Ивановка (Курская обл.)" — тёзки из разных
// областей видны как разные пункты.
export function searchSettlements(query: string, limit = 6): string[] {
  if (!cache) return [];
  const q = norm(query);
  if (q.length < 3) return [];

  const exact: string[] = [];
  const starts: string[] = [];
  const inside: string[] = [];
  for (const [label, s] of cache) {
    const n = norm(s.name);
    if (n === q) {
      exact.push(label);
      if (exact.length >= limit) break;
    } else if (starts.length < limit && n.startsWith(q)) {
      starts.push(label);
    } else if (inside.length < limit && n.includes(q)) {
      inside.push(label);
    }
  }
  return [...exact, ...starts, ...inside].slice(0, limit);
}

export function getSettlementCoords(label: string): [number, number] | null {
  if (!cache) return null;
  const direct = cache.get(label);
  if (direct) return [direct.lat, direct.lon];

  const q = norm(label);
  for (const [k, v] of cache) if (norm(k) === q) return [v.lat, v.lon];
  return null;
}