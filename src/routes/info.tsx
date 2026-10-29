import { createFileRoute } from "@tanstack/react-router";
import Index from "@/pages/Index";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/info")({
  head: () => pageHead({ title: "Заказать такси из города в город от 200 км — Такси Дальняк", description: "Заказать межгородное такси по России по фиксированной цене. Работаем с 2014 года, автопарк для дальних рейсов: седаны, кроссоверы, минивэны. Звоните +7 (995) 645-51-25 круглосуточно.", path: "/info", keywords: "межгородное такси по россии, такси из города в город, заказать такси дальняк" }),
  component: Index,
});
