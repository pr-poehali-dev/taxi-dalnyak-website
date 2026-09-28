import RouteLanding, { type RouteLandingConfig } from "@/components/route-landing/RouteLanding";

const CONFIG: RouteLandingConfig = {
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
};

export default function MoskvaSpb() {
  return <RouteLanding config={CONFIG} />;
}
