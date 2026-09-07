import { type PriceGuideRoute } from "@/components/PriceGuide";

export const HERO_IMG  = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/7071b942-9c87-47e1-a16d-0af0c4b83c1d.jpg";
export const LOGO      = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/3a499542-747a-49d2-808e-4c137548c76e.jpg";
export const MAX_LOGO  = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/cf5e3e58-7d83-4d19-8c48-f91922395adf.png";

const REVIEW_1 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/b0eb5050-a05a-4647-8442-4b839d45161f.jpg";
const REVIEW_2 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/fedc4281-a106-4024-9369-8a03712c92a3.jpg";
const REVIEW_3 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/ac322d91-fd27-4c11-b86f-f28e85ec3df0.jpg";

export const YM_ID = 111028538;

export const GOLD  = "#c9a84c";
export const GOLD2 = "#e8c96a";
// Сколько направлений показываем до нажатия «Показать все».
// Остальные есть в HTML — их видят поисковики и автотаргетинг.
export const ROUTES_PREVIEW = 40;


export const BASE_REVIEWS = [
  { name: "Валерия", route: "Москва – Новомичуринск", text: "Очень переживала — зимой с ребёнком, первый раз на такое расстояние. Но всё прошло замечательно! Машину нашли быстро, водитель — замечательный человек. Довёз идеально!", img: REVIEW_1 },
  { name: "Ирина",   route: "Лен. область – Санкт-Петербург", text: "Позвонила в две компании — ничего не нашли. На третий раз нашла Такси Дальняк. Водитель очень вежливый, машина в идеальном состоянии.", img: REVIEW_3 },
  { name: "Евгений", route: "Межгород по России", text: "Рекомендую! Удобная и быстрая доставка, комфортабельный авто. Пацаны отвечают за время, комфорт и стоимость. От всей семьи — Спасибо!", img: REVIEW_2 },
  { name: "Клиент компании", route: "Межгород по России", text: "Фирма супер! Очень быстро ответили на сообщение и подобрали машину — это было ключевым моментом. Машина в отличном состоянии, чистая и исправная. Встретили ко времени, искать не пришлось. Довезли с максимальным комфортом. Буду обращаться ещё, всем рекомендую!", img: "/reviews/firma.jpg" },
  { name: "Эдуард Ефремов", route: "Межгород по России", text: "Поездка прошла отлично, водителю огромное спасибо!", img: "/reviews/eduard.jpg" },
  { name: "Павел", route: "Межгород по России", text: "Прекрасно. С водителем было о чём поговорить. Своих услуг в обход компании не предлагал — всё честно.", img: "/reviews/pavel.jpg" },
  { name: "Пассажир из КБР", route: "Межгород по России", text: "Приехали вовремя, довезли без проблем. 10 из 5!", img: "/reviews/kbr.jpg" },
  { name: "Рамазан", route: "Межгород по России", text: "Нормально, тихо спокойно. Водитель своих услуг в обход компании не предлагал.", img: "/reviews/rama.jpg" },
];

export const REGIONS = [
  { label: "Москва и МО",     href: "/moskva" },
  { label: "Белгород",        href: "/belgorod" },
  { label: "Богучары",        href: "/boguchar" },
  { label: "Воронеж",         href: "/voronezh" },
  { label: "Курск",           href: "/kursk" },
  { label: "Рязань",          href: "/ryazan" },
  { label: "Санкт-Петербург", href: "/spb" },
  { label: "Нижний Новгород", href: "/nizhniy" },
  { label: "Ижевск",          href: "/izhevsk" },
  { label: "Краснодар",       href: "/krasnodar" },
  { label: "Ростов-на-Дону",  href: "/rostov" },
  { label: "Ставрополь",      href: "/stavropol" },
  { label: "Новосибирск",     href: "/novosibirsk" },
  { label: "Тюмень",          href: "/tyumen" },
  { label: "Челябинск",       href: "/chelyabinsk" },
  { label: "Екатеринбург",    href: "/ekaterinburg" },
  { label: "Донецк",          href: "/donetsk" },
  { label: "Луганск",         href: "/lugansk" },
  { label: "Херсонская область", href: "/kherson" },
];

declare global {
  interface Window { ym?: (id: number, action: string, goal: string, params?: Record<string, unknown>) => void; }
}

export function ymGoal(goal: string, params: Record<string, string> = {}) {
  if (typeof window.ym === "function") window.ym(YM_ID, "reachGoal", goal, params);
}
function tmrGoal(goal: string) {
  const tmr = (window as unknown as { _tmr?: { push: (o: Record<string, unknown>) => void } })._tmr;
  if (tmr) tmr.push({ id: "3789002", type: "reachGoal", goal });
}

export function ymLead(channel: string, utmParams: { source: string; medium: string; campaign: string; term: string }, pageSource?: string) {
  ymGoal("lead", { channel, utm_source: utmParams.source, utm_medium: utmParams.medium, utm_campaign: utmParams.campaign, utm_term: utmParams.term });
  ymGoal(`lead_${channel}`, { utm_source: utmParams.source, utm_medium: utmParams.medium, utm_campaign: utmParams.campaign });
  if (pageSource) ymGoal(`lead_${pageSource}`);
  tmrGoal("lead");
  tmrGoal(`lead_${channel}`);
}

export interface UtmParams {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
}

export interface RegionConfig {
  slug: string;
  city: string;
  cityRod: string;
  h1?: string;
  routes: string[];
  about: string;
  features: string[];
  reviews?: { name: string; route: string; text: string; img: string }[];
  badge?: string;
  sub?: string;
  lead?: string;
  aboutTitle?: string;
  routesTitle?: string;
  routesNote?: string;
  canonical?: string;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  splashSub?: string;
  heroAlt?: string;
  /** Короткая версия: только шапка, заголовок, «Важно знать» и кнопки связи. */
  short?: boolean;
  /** Ориентиры цен «от» — показываются под блоком «Важно знать». */
  priceGuide?: PriceGuideRoute[];
  /** Примечание под таблицей цен. */
  priceNote?: string;
  /** Минимальное расстояние для заказа, км (по умолчанию 200). */
  minKm?: number;
  /** Своя сетка тарифов за км — вместо общей. */
  rateTable?: { title?: string; note?: string; rows: { name: string; rate: number; desc?: string }[] };
  /** Блок «Перевозка сотрудников по договору» с реквизитами. */
  corporate?: boolean;
  /** Оффер «обратная дорога −20%» под заголовком. */
  offerBack?: boolean;
}