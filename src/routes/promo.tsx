import { createFileRoute } from "@tanstack/react-router";
import Promo from "@/pages/Promo";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/promo")({
  head: () => pageHead({ title: "Межгородное такси от адреса до адреса — Такси Дальняк", description: "Межгородное такси от адреса до адреса. Поездки от 200 км по всей России, комфортные авто, без пересадок. Фиксированная цена до выезда.", path: "/promo" }),
  component: Promo,
});
