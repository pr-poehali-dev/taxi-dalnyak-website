import { createFileRoute } from "@tanstack/react-router";
import MoscowBusiness from "@/pages/MoscowBusiness";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/moscow-business")({
  head: () => pageHead({ title: "Такси бизнес-класс Москва — Mercedes с водителем | Такси Дальняк", description: "Такси бизнес-класса из Москвы на Mercedes E-Class и Viano с личным водителем. Встреча в аэропорту, деловые поездки, поездки в другой город. Звоните +7 (995) 645-51-25.", path: "/moscow-business", keywords: "такси бизнес класс москва, mercedes с водителем москва, vip такси межгород" }),
  component: MoscowBusiness,
});
