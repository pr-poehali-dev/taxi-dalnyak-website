import RouteLanding, { type RouteLandingConfig } from "@/components/route-landing/RouteLanding";

const CONFIG: RouteLandingConfig = {
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
};

export default function RostovLugansk() {
  return <RouteLanding config={CONFIG} />;
}
