export const HERO_BG  = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/5b51c7b0-9a76-4168-9d48-1f212a2618c4.jpg";
export const LOGO     = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/eed871f1-fcfc-4342-ba10-6d3337b98fe4.jpg";

export const IMG_SOLARIS = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/50fbc92b-0398-4145-abda-af1256d79d90.jpg";
export const IMG_K5      = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/c9beeef8-2aa7-49f3-b8b4-e8937eae11a5.jpg";
export const IMG_STARIA  = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/c7203733-cf29-40aa-9486-829fbf00a034.jpg";

export const PHONE      = "8 (995) 645-51-25";
export const PHONE_HREF = "tel:+79956455125";
export const TG_HREF    = "https://t.me/Mezhgorod1816";
export const WA_HREF    = "https://wa.me/79956455125?text=" + encodeURIComponent("Здравствуйте! Хочу узнать стоимость поездки.");
export const VK_HREF    = "https://vk.ru/dalnyack";
export const MAX_HREF   = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";

export const TARIFFS = [
  {
    id: "standard",
    name: "СТАНДАРТ",
    car: "Hyundai Solaris",
    img: IMG_SOLARIS,
    accentColor: "#e8c97a",
    prices: [
      { label: "до 500 км",   price: "35₽/км" },
      { label: "500–1000 км", price: "32₽/км" },
      { label: "от 1000 км",  price: "30₽/км" },
    ],
    newTerr: "80₽/км",
    features: ["Седан / Хэтчбек", "До 3 пассажиров", "Кондиционер"],
  },
  {
    id: "comfort",
    name: "КОМФОРТ",
    car: "Kia K5",
    img: IMG_K5,
    accentColor: "#7ab8e8",
    prices: [
      { label: "до 500 км",   price: "42₽/км" },
      { label: "500–1000 км", price: "40₽/км" },
      { label: "от 1000 км",  price: "38₽/км" },
    ],
    newTerr: "100₽/км",
    features: ["Бизнес-авто", "До 4 пассажиров", "USB / USB-C зарядка"],
  },
  {
    id: "minivan",
    name: "МИНИВЭН",
    car: "Hyundai Staria",
    img: IMG_STARIA,
    accentColor: "#a8e87a",
    prices: [
      { label: "до 500 км",   price: "60₽/км" },
      { label: "500–1000 км", price: "55₽/км" },
      { label: "от 1000 км",  price: "50₽/км" },
    ],
    newTerr: "100₽/км",
    features: ["Минивэн", "До 6 пассажиров", "Детское кресло"],
  },
];

export const IMG_CARSEAT = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/918a26f0-02c2-4f96-a09e-5fd799521d3a.jpg";

export const ADVANTAGES = [
  { img: null,         icon: "⚡", text: "Подача от 30 мин",          sub: "кроме Москвы и СПб" },
  { img: null,         icon: "📋", text: "Предзаказ",                  sub: "без предоплаты" },
  { img: null,         icon: "🔄", text: "Ожидание бесплатно",         sub: "при поездке туда-обратно в один день" },
  { img: IMG_CARSEAT,  icon: "",   text: "Детское кресло",             sub: "бесплатно" },
  { img: null,         icon: "🐾", text: "Животные",                   sub: "бесплатно" },
];

export const WHO = [
  { icon: "🎖️", label: "Бойцы СВО" },
  { icon: "👨‍👩‍👧", label: "Семьи с детьми" },
  { icon: "🏢", label: "Организации" },
];