import RouteLanding, { type RouteLandingConfig } from "@/components/route-landing/RouteLanding";

const CONFIG: RouteLandingConfig = {
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
};

export default function RostovDonetsk() {
  return <RouteLanding config={CONFIG} />;
}
