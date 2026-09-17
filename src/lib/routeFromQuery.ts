import { findCitiesSmart } from "@/lib/cityMatch";

export type QueryRoute = { from: string; to: string } | null;

export function routeFromQuery(term: string | undefined | null): QueryRoute {
  if (!term) return null;

  const cities = findCitiesSmart(term);
  if (cities.length < 2) return null;

  return { from: cities[0], to: cities[1] };
}

const ROD_EXCEPTIONS: Record<string, string> = {
  "Москва": "Москвы", "Санкт-Петербург": "Санкт-Петербурга", "Ростов-на-Дону": "Ростова-на-Дону",
  "Нижний Новгород": "Нижнего Новгорода", "Великий Новгород": "Великого Новгорода",
  "Новый Уренгой": "Нового Уренгоя", "Минеральные Воды": "Минеральных Вод",
  "Орёл": "Орла", "Крым": "Крыма", "Сочи": "Сочи", "Чебоксары": "Чебоксар",
  "Набережные Челны": "Набережных Челнов", "Ровеньки": "Ровеньков",
  "Великие Луки": "Великих Лук", "Мытищи": "Мытищ", "Люберцы": "Люберец",
  "Химки": "Химок", "Ессентуки": "Ессентуков", "Горки": "Горок",
  "Вятские Поляны": "Вятских Полян", "Кавказские Минеральные Воды": "Кавказских Минеральных Вод",
  "Дно": "Дна", "Плёс": "Плёса", "Гусь-Хрустальный": "Гусь-Хрустального",
};

const ADJ_RULES: [RegExp, string][] = [
  [/ая$/i, "ой"], [/яя$/i, "ей"], [/ый$/i, "ого"], [/ий$/i, "его"],
  [/ой$/i, "ого"], [/ые$/i, "ых"], [/ие$/i, "их"],
];

function adjRod(word: string): string | null {
  for (const [re, end] of ADJ_RULES) {
    if (re.test(word)) return word.replace(re, end);
  }
  return null;
}

function nounRod(word: string): string | null {
  if (/[иы]$/i.test(word)) return null;
  if (/я$/i.test(word)) return word.slice(0, -1) + "и";
  if (/[гкхжчшщ]а$/i.test(word)) return word.slice(0, -1) + "и";
  if (/а$/i.test(word)) return word.slice(0, -1) + "ы";
  if (/[еёоуэю]$/i.test(word)) return word;
  if (/ый$|ий$/i.test(word)) return word.slice(0, -2) + "ого";
  if (/й$/i.test(word)) return word.slice(0, -1) + "я";
  if (/ль$/i.test(word)) return word.slice(0, -2) + "ля";
  if (/ь$/i.test(word)) return word.slice(0, -1) + "и";
  return word + "а";
}

/** Родительный падеж + признак надёжности. */
export function cityRodSafe(city: string): { text: string; safe: boolean } {
  if (ROD_EXCEPTIONS[city]) return { text: ROD_EXCEPTIONS[city], safe: true };

  const words = city.split(" ");
  if (words.length > 1) {
    const last = nounRod(words[words.length - 1]);
    if (!last) return { text: city, safe: false };
    const head = words.slice(0, -1).map((w) => adjRod(w) ?? nounRod(w) ?? w);
    return { text: [...head, last].join(" "), safe: true };
  }

  const one = nounRod(city);
  return one ? { text: one, safe: true } : { text: city, safe: false };
}

export function cityRod(city: string): string {
  return cityRodSafe(city).text;
}

export function cityFromQuery(term: string | undefined | null): string | null {
  if (!term) return null;

  const cities = findCitiesSmart(term);
  if (cities.length !== 1) return null;

  return cities[0];
}