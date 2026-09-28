import RouteLanding, { type RouteLandingConfig } from "@/components/route-landing/RouteLanding";

const CONFIG: RouteLandingConfig = {
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
};

export default function RostovMoskva() {
  return <RouteLanding config={CONFIG} />;
}
