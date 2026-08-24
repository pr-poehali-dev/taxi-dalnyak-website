// Сёла, посёлки и деревни РФ. Файл большой (~3 МБ), поэтому грузится лениво —
// только когда пользователь начинает искать населённый пункт в калькуляторе.

let cache: Map<string, [number, number]> | null = null;
let loading: Promise<Map<string, [number, number]>> | null = null;

export function isSettlementsReady(): boolean {
  return cache !== null;
}

export function loadSettlements(): Promise<Map<string, [number, number]>> {
  if (cache) return Promise.resolve(cache);
  if (loading) return loading;

  loading = fetch("/settlements.txt")
    .then((r) => (r.ok ? r.text() : ""))
    .then((text) => {
      const map = new Map<string, [number, number]>();
      for (const line of text.split("\n")) {
        const i = line.indexOf("|");
        if (i < 1) continue;
        const j = line.indexOf("|", i + 1);
        if (j < 0) continue;
        const name = line.slice(0, i);
        const lat = Number(line.slice(i + 1, j));
        const lon = Number(line.slice(j + 1));
        if (Number.isFinite(lat) && Number.isFinite(lon)) map.set(name, [lat, lon]);
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

export function searchSettlements(query: string, limit = 6): string[] {
  if (!cache) return [];
  const q = norm(query);
  if (q.length < 3) return [];

  const starts: string[] = [];
  const inside: string[] = [];
  for (const name of cache.keys()) {
    const n = norm(name);
    if (n.startsWith(q)) {
      starts.push(name);
      if (starts.length >= limit) break;
    } else if (inside.length < limit && n.includes(q)) {
      inside.push(name);
    }
  }
  return [...starts, ...inside].slice(0, limit);
}

export function getSettlementCoords(name: string): [number, number] | null {
  if (!cache) return null;
  const direct = cache.get(name);
  if (direct) return direct;

  // запасной вариант: сравнение без учёта регистра и буквы «ё»
  const q = norm(name);
  for (const [k, v] of cache) if (norm(k) === q) return v;
  return null;
}