import type { RouteLandingConfig } from "@/components/route-landing/RouteLanding";

// Реестр посадочных под маршруты.
// Добавил конфиг сюда — страница и ссылка в каталоге /pages появятся сами.
export const ROUTE_LANDINGS: RouteLandingConfig[] = [
  {
    slug: "rostov-moskva",
    goalKey: "rostov_moskva",
    from: "Ростов",
    to: "Москва",
    fromPrep: "в Ростове",
    badge: "1 100 км · 12 часов в пути",
    km: "~1 100 км",
    priceFrom: "40 000 ₽",
    tollLabel: "Платная дорога М4",
    tariffs: [
      { name: "Стандарт", price: "40 000 ₽", desc: "Седан, до 3 пассажиров, 2 чемодана", icon: "Car" },
      { name: "Комфорт", price: "45 000 ₽", desc: "Кроссовер, больше места, климат-контроль", icon: "CarFront", hit: true },
      { name: "Минивэн", price: "65 000 ₽", desc: "До 6 пассажиров, багаж без ограничений", icon: "Bus" },
    ],
  },
  {
    slug: "moskva-spb",
    goalKey: "moskva_spb",
    from: "Москва",
    to: "Санкт-Петербург",
    fromPrep: "в Москве",
    badge: "700 км · 8 часов в пути",
    km: "~700 км",
    priceFrom: "30 000 ₽",
    tollLabel: "Платная дорога М11",
    tariffs: [
      { name: "Стандарт", price: "30 000 ₽", desc: "Седан, до 3 пассажиров, 2 чемодана", icon: "Car" },
      { name: "Комфорт", price: "35 000 ₽", desc: "Кроссовер, больше места, климат-контроль", icon: "CarFront", hit: true },
      { name: "Минивэн", price: "45 000 ₽", desc: "До 6 пассажиров, багаж без ограничений", icon: "Bus" },
    ],
  },
  {
    slug: "krasnodar-rostov",
    goalKey: "krasnodar_rostov",
    from: "Краснодар",
    to: "Ростов-на-Дону",
    fromPrep: "в Краснодаре",
    badge: "290 км · около 4 часов в пути",
    km: "~290 км",
    priceFrom: "11 000 ₽",
    tollLabel: "Платная дорога М4",
    tariffs: [
      { name: "Стандарт", price: "11 000 ₽", desc: "Седан, до 3 пассажиров, 2 чемодана", icon: "Car" },
      { name: "Комфорт", price: "14 000 ₽", desc: "Кроссовер, больше места, климат-контроль", icon: "CarFront", hit: true },
      { name: "Минивэн", price: "18 000 ₽", desc: "До 6 пассажиров, багаж без ограничений", icon: "Bus" },
    ],
  },
  {
    slug: "rostov-donetsk",
    goalKey: "rostov_donetsk",
    from: "Ростов",
    to: "Донецк",
    fromPrep: "в Ростове",
    badge: "180 км · около 4 часов в пути",
    km: "~180 км",
    priceFrom: "12 000 ₽",
    tollAlt: {
      included: "Проезд через границу и все расходы в пути",
      hero: "Все расходы в пути включены.",
      note: "Дорога и оформление на границе включены.",
      seo: "все расходы в пути включены",
    },
    tariffs: [
      { name: "Стандарт", price: "12 000 ₽", desc: "Седан, до 3 пассажиров, 2 чемодана", icon: "Car" },
    ],
  },
  {
    slug: "rostov-lugansk",
    goalKey: "rostov_lugansk",
    from: "Ростов",
    to: "Луганск",
    fromPrep: "в Ростове",
    badge: "220 км · около 4 часов в пути",
    km: "~220 км",
    priceFrom: "12 000 ₽",
    tollAlt: {
      included: "Проезд через границу и все расходы в пути",
      hero: "Все расходы в пути включены.",
      note: "Дорога и оформление на границе включены.",
      seo: "все расходы в пути включены",
    },
    tariffs: [
      { name: "Стандарт", price: "12 000 ₽", desc: "Седан, до 3 пассажиров, 2 чемодана", icon: "Car" },
    ],
  },
];

export function findRouteLanding(slug?: string): RouteLandingConfig | undefined {
  return ROUTE_LANDINGS.find((r) => r.slug === slug);
}

export interface OtherLanding {
  path: string;
  title: string;
  note: string;
  icon: string;
}

// Остальные посадочные и рекламные страницы проекта.
export const OTHER_LANDINGS: OtherLanding[] = [
  { path: "/", title: "Главная", note: "Основной сайт, коллтрекинг", icon: "House" },
  { path: "/call", title: "Только звонок", note: "Под обучение кампании на звонки", icon: "Phone" },
  { path: "/max", title: "Макс", note: "Реклама с переходом в Макс", icon: "MessageCircle" },
  { path: "/lite", title: "Telegram", note: "Реклама с переходом в Telegram", icon: "Send" },
  { path: "/direct", title: "Яндекс.Директ", note: "Посадочная под Директ", icon: "Target" },
  { path: "/zvoni", title: "Быстрый заказ", note: "Короткая страница заказа", icon: "Zap" },
  { path: "/vk", title: "ВКонтакте", note: "Посадочная под VK", icon: "Users" },
  { path: "/voennye", title: "Военнослужащим", note: "Поездки для военных", icon: "Shield" },
  { path: "/kpp", title: "КПП", note: "Поездки к пунктам пропуска", icon: "Flag" },
  { path: "/moscow-business", title: "Бизнес Москва", note: "Корпоративным клиентам", icon: "Briefcase" },
  { path: "/tariffs", title: "Тарифы", note: "Цены и калькулятор", icon: "Calculator" },
  { path: "/reviews", title: "Отзывы", note: "Отзывы клиентов", icon: "Star" },
  { path: "/otzyv", title: "Оставить отзыв", note: "Форма для клиента", icon: "PenLine" },
  { path: "/promo", title: "Акции", note: "Промо-страница", icon: "Gift" },
];