export function getAllUtmParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  params.forEach((v, k) => {
    if (k.startsWith("utm_")) {
      const val = v.trim();
      if (!val || val.startsWith("{") || val.endsWith("}")) return;
      utm[k] = val;
    }
  });
  return utm;
}

const STOP_WORDS = new Set([
  "такси", "taxi", "заказать", "заказ", "заказы", "заказывать",
  "вызвать", "вызов", "вызова", "поездка", "поездку", "поездки",
  "трансфер", "междугороднее", "междугородное", "междугородний",
  "межгород", "межгорода", "недорого", "дешево", "цена", "стоимость",
  "номер", "номера", "телефон", "телефоны", "круглосуточно", "сейчас",
  "срочно", "сегодня", "завтра", "онлайн", "из", "в", "во", "до", "от",
  "с", "со", "к", "ко", "по", "на", "и", "или", "же", "ли", "то",
  "это", "цена", "цены",
]);

const CITY_SUFFIXES = [
  "ского", "ская", "скую", "ский", "ское", "ому", "ему", "ыми",
  "ими", "ого", "его", "ой", "ей", "ом", "ам", "ям", "ах", "ях",
  "ы", "и", "у", "ю", "е", "а", "я",
];

const KEEP_AS_IS = new Set([
  "москва", "уфа", "анапа", "ялта", "сочи", "тверь", "пермь",
  "тула", "рязань", "казань", "самара", "пенза", "элиста",
]);

function normalizeCity(word: string): string {
  if (word.length <= 3) return word;
  if (KEEP_AS_IS.has(word)) return word;
  if (word.startsWith("москв")) return "москва";
  if (word.startsWith("ростов")) return "ростов";
  if (word.startsWith("воронеж")) return "воронеж";
  if (word.startsWith("краснодар")) return "краснодар";
  if (word.startsWith("ставропол")) return "ставрополь";
  if (word.startsWith("волгоград")) return "волгоград";
  if (word.startsWith("саратов")) return "саратов";
  if (word.startsWith("астрахан")) return "астрахань";
  if (word.startsWith("новочеркасск")) return "новочеркасск";
  if (word.startsWith("таганрог")) return "таганрог";
  if (word.startsWith("шахт")) return "шахты";
  if (word.startsWith("сочи")) return "сочи";
  if (word.startsWith("анап")) return "анапа";
  if (word.startsWith("геленджик")) return "геленджик";
  if (word.startsWith("новороссийск")) return "новороссийск";
  if (word.startsWith("пятигорск")) return "пятигорск";
  if (word.startsWith("кисловодск")) return "кисловодск";
  if (word.startsWith("минеральн")) return "минеральные воды";
  if (word.startsWith("махачкал")) return "махачкала";
  if (word.startsWith("грозн")) return "грозный";
  if (word.startsWith("нальчик")) return "нальчик";
  if (word.startsWith("владикавказ")) return "владикавказ";
  if (word.startsWith("санкт")) return "санкт-петербург";
  if (word.startsWith("питер")) return "санкт-петербург";
  if (word.startsWith("петербург")) return "санкт-петербург";
  for (const suf of CITY_SUFFIXES) {
    if (word.length - suf.length >= 3 && word.endsWith(suf)) {
      return word.slice(0, -suf.length);
    }
  }
  return word;
}

function titleCase(word: string): string {
  return word
    .split(/[-\s]/)
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
    .join(word.includes("-") ? "-" : " ");
}

export interface ParsedRoute {
  display: string;
  from: string;
  to: string;
}

export function parseKeyword(termRaw: string): ParsedRoute {
  const empty: ParsedRoute = { display: "", from: "", to: "" };
  if (!termRaw) return empty;
  let term = decodeURIComponent(termRaw).toLowerCase().trim();
  if (!term || term.startsWith("{") || term.endsWith("}")) return empty;
  term = term.replace(/[+_]/g, " ").replace(/[^a-zа-яё\s-]/gi, " ");

  const rawTokens = term.split(/\s+/).map((t) => t.trim()).filter(Boolean);
  let fromCity = "";
  let toCity = "";
  for (let i = 0; i < rawTokens.length - 1; i++) {
    const t = rawTokens[i];
    const next = rawTokens[i + 1];
    if (!next || STOP_WORDS.has(next)) continue;
    if ((t === "из" || t === "от" || t === "с" || t === "со") && !fromCity) {
      fromCity = normalizeCity(next);
    }
    if ((t === "в" || t === "во" || t === "до" || t === "к" || t === "ко") && !toCity) {
      toCity = normalizeCity(next);
    }
  }

  const tokens = rawTokens.filter((t) => t.length >= 2 && !STOP_WORDS.has(t));
  if (tokens.length === 0) return empty;

  const normalized = tokens.slice(0, 3).map((t) => normalizeCity(t));
  const unique: string[] = [];
  for (const w of normalized) if (!unique.includes(w)) unique.push(w);

  if (!fromCity && unique[0]) fromCity = unique[0];
  if (!toCity && unique[1]) toCity = unique[1];

  return {
    display: unique.map(titleCase).join(" "),
    from: fromCity ? titleCase(fromCity) : "",
    to: toCity ? titleCase(toCity) : "",
  };
}
