import { createFileRoute } from "@tanstack/react-router";
import Tariffs from "@/pages/Tariffs";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/tariffs")({
  head: () => pageHead({ title: "Тарифы такси межгород — Стандарт, Комфорт, Минивэн | Такси Дальняк", description: "Тарифы на междугороднее такси: Стандарт, Комфорт, Комфорт+, Минивэн. Фиксированная цена, все автомобили не старше 10 лет. Звоните +7 (995) 645-51-25.", path: "/tariffs", keywords: "тарифы такси межгород, стоимость такси между городами, тарифы дальняк" }),
  component: Tariffs,
});
