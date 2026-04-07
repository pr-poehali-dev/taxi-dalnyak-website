export const HERO_BG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/9f1988fa-044e-4fe0-9ed6-d8c75200c13b.jpg";
export const CAR_IMG  = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/d777a0ac-bb72-4451-9248-4a96fb44db9f.jpg";
export const LOGO     = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/eed871f1-fcfc-4342-ba10-6d3337b98fe4.jpg";

export const PHONE      = "8 (995) 645-51-25";
export const PHONE_HREF = "tel:+79956455125";
export const TG_HREF    = "https://t.me/Mezhgorod1816";
export const WA_HREF    = "https://wa.me/79956455125?text=" + encodeURIComponent("Здравствуйте! Хочу узнать стоимость поездки.");
export const VK_HREF    = "https://vk.ru/dalnyack";
export const MAX_HREF   = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";

export const NAV = [
  { id: "hero",     label: "Главная"   },
  { id: "tariffs",  label: "Тарифы"    },
  { id: "why",      label: "Почему мы" },
  { id: "contacts", label: "Контакты"  },
];

export const TARIFFS = [
  {
    icon: "Car",
    name: "СТАНДАРТ",
    price: "30",
    desc: "Комфортная поездка на проверенном седане",
    features: ["Седан / Хэтчбек", "До 3 пассажиров", "Кондиционер", "Оплата картой / наличными"],
    featured: false,
  },
  {
    icon: "Star",
    name: "КОМФОРТ",
    price: "40",
    desc: "Бизнес-класс для тех, кто ценит качество",
    features: ["Бизнес-авто", "До 4 пассажиров", "USB / USB-C зарядка", "Вода в дорогу"],
    featured: true,
  },
  {
    icon: "Users",
    name: "МИНИВЭН",
    price: "50",
    desc: "Большой автомобиль для компании или груза",
    features: ["Минивэн / Внедорожник", "До 6 пассажиров", "Детское кресло", "Большой багажник"],
    featured: false,
  },
];

export const WHY = [
  { icon: "ShieldCheck", title: "Фиксированная цена",           text: "Цена за поездку известна заранее. Никаких надбавок за ночь, пробки или погоду." },
  { icon: "Route",       title: "Только от 200 км",             text: "Специализируемся исключительно на дальних маршрутах — знаем их как никто." },
  { icon: "Clock",       title: "24 часа, 7 дней",              text: "Принимаем заказы круглосуточно. Выезд в любое время суток." },
  { icon: "MapPin",      title: "Вся Россия + новые территории", text: "Межгород, аэропорты, трансферы — любое направление. Работаем в ДНР, ЛНР, Запорожской и Херсонской областях." },
  { icon: "Banknote",    title: "Выгоднее такси",               text: "На дальних маршрутах дешевле агрегаторов на 20–40%. Считаем за км, не за мин." },
  { icon: "ThumbsUp",    title: "5 лет на рынке",               text: "Более 50 000 выполненных поездок. Опытные водители, чистые авто." },
];

export const REVIEWS = [
  { name: "Алексей М.",  city: "Москва → Казань",             text: "Ехали с семьёй 800 км — водитель пунктуальный, машина чистая, цена как договорились. Однозначно рекомендую!", stars: 5 },
  { name: "Светлана К.", city: "Нижний Новгород → Самара",    text: "Заказывала несколько раз для командировок. Всегда в срок, цена честная, никаких сюрпризов. Теперь только Дальняк.", stars: 5 },
  { name: "Дмитрий Р.",  city: "Ижевск → Чайковский",        text: "Быстро ответили в Telegram, сразу назвали цену. Поездка прошла отлично, приеду ещё.", stars: 5 },
];
