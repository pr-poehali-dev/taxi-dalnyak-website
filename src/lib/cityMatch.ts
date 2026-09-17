import { CITY_COORDS } from "@/lib/cities";

const STOP_WORDS = new Set([
  "такси", "межгород", "межгорода", "заказать", "заказ", "заказы", "номер", "телефон",
  "цена", "цены", "стоимость", "сколько", "стоит", "дешево", "дешёво", "недорого",
  "дешевле", "из", "до", "в", "во", "на", "по", "под", "от", "за", "и", "или",
  "перевозка", "перевозки", "трансфер", "трансферы", "машина", "машину", "машины",
  "авто", "автомобиль", "водитель", "водителя", "водители", "км", "рублей", "руб",
  "рубль", "рублях", "круглосуточно", "срочно", "быстро", "онлайн", "сайт", "город",
  "города", "другой", "любой", "куда", "угодно", "россии", "россия", "рф", "область",
  "обл", "район", "поселок", "посёлок", "село", "станица", "деревня", "новых",
  "территорий", "территории", "отзывы", "услуги", "услуга", "вызвать", "вызов",
  "поездка", "поездки", "рейс", "рейсы", "тариф", "тарифы", "легковое", "минивэн",
  "дальние", "дальний", "дальнее", "расстояние", "маршрут", "маршруты",
  "домой", "дома", "дом", "туда", "обратно", "сюда", "мне", "нам", "рядом",
  "близко", "далеко", "аэропорт", "вокзал", "сво", "военных", "военные",
  "белый", "белая", "черный", "чёрный", "новый", "новая", "старый", "старая",
  "большой", "малый", "южный", "северный", "восточный", "западный", "верхний",
  "нижний", "красный", "зеленый", "зелёный", "оплата", "картой", "наличными",
  "комфорт", "бизнес", "класса", "детским", "креслом", "предоплата", "предоплаты",
  "попутчик", "попутно", "груз", "вахта", "работа", "мест", "подача", "быстрая",
]);

const ALIASES: Record<string, string> = {
  "спб": "Санкт-Петербург", "питер": "Санкт-Петербург", "петербург": "Санкт-Петербург",
  "мск": "Москва", "нн": "Нижний Новгород", "ебург": "Екатеринбург",
  "екб": "Екатеринбург", "ростовнадону": "Ростов-на-Дону", "ростов": "Ростов-на-Дону",
  "новосиб": "Новосибирск", "влад": "Владивосток", "минводы": "Минеральные Воды",
  "новокаховка": "Новая Каховка", "днр": "Донецк", "лнр": "Луганск",
};

const norm = (s: string) => s.toLowerCase().replace(/ё/g, "е").trim();

function stem(word: string): string {
  let w = word;
  if (w.length <= 4) return w;
  w = w.replace(/(ами|ями|ого|его|ому|ему|ыми|ими|ах|ях|ов|ев|ей|ой|ом|ем|ую|юю|ию|ая|яя|ые|ие|ий|ый|ья|ье|а|я|у|ю|ы|и|о|е|ь|й)$/u, "");
  return w.length >= 3 ? w : word;
}

type Entry = { name: string; parts: string[]; stems: string[] };

const ENTRIES: Entry[] = Object.keys(CITY_COORDS).map((name) => {
  const parts = norm(name).split(/[\s-]+/).filter(Boolean);
  return { name, parts, stems: parts.map(stem) };
});

const MULTI = ENTRIES.filter((e) => e.parts.length > 1)
  .sort((a, b) => b.parts.length - a.parts.length);

const SINGLE_BY_STEM = new Map<string, Entry[]>();
for (const e of ENTRIES) {
  if (e.parts.length !== 1) continue;
  const key = e.stems[0];
  const list = SINGLE_BY_STEM.get(key);
  if (list) list.push(e);
  else SINGLE_BY_STEM.set(key, [e]);
}

const PREFER = new Set(["Ростов-на-Дону", "Москва", "Санкт-Петербург", "Новая Каховка"]);

function tokenize(term: string): string[] {
  return norm(term)
    .replace(/[^a-zа-я0-9\s-]/gi, " ")
    .split(/[\s-]+/)
    .filter((t) => t.length > 0 && !/^\d+$/.test(t));
}

export type Found = { name: string; pos: number };

export function findCitiesSmart(term: string): string[] {
  const tokens = tokenize(term);
  if (tokens.length === 0) return [];

  const used = new Array<boolean>(tokens.length).fill(false);
  const found: Found[] = [];

  const push = (name: string, pos: number) => {
    if (found.some((f) => f.name === name)) return;
    found.push({ name, pos });
  };

  for (const e of MULTI) {
    const n = e.parts.length;
    for (let i = 0; i + n <= tokens.length; i++) {
      if (used.slice(i, i + n).some(Boolean)) continue;
      let ok = true;
      for (let j = 0; j < n; j++) {
        const t = stem(tokens[i + j]);
        const s = e.stems[j];
        if (t !== s && !(t.length >= 4 && (t.startsWith(s) || s.startsWith(t)))) {
          ok = false;
          break;
        }
      }
      if (!ok) continue;
      for (let j = 0; j < n; j++) used[i + j] = true;
      push(e.name, i);
      break;
    }
  }

  for (let i = 0; i < tokens.length; i++) {
    if (used[i]) continue;
    const raw = tokens[i];
    if (STOP_WORDS.has(raw)) continue;

    const alias = ALIASES[raw];
    if (alias) {
      used[i] = true;
      push(alias, i);
      continue;
    }

    const s = stem(raw);
    if (s.length < 3) continue;

    let list = SINGLE_BY_STEM.get(s);
    if (!list && raw.length >= 5) {
      for (const [key, cand] of SINGLE_BY_STEM) {
        if (key.length >= 4 && (s.startsWith(key) || key.startsWith(s))) {
          list = cand;
          break;
        }
      }
    }
    if (!list || list.length === 0) continue;

    const pick = list.find((c) => PREFER.has(c.name)) ?? list[0];
    used[i] = true;
    push(pick.name, i);
  }

  return found.sort((a, b) => a.pos - b.pos).map((f) => f.name);
}