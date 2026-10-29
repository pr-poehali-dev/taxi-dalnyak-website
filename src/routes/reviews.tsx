import { createFileRoute } from "@tanstack/react-router";
import Reviews from "@/pages/Reviews";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/reviews")({
  head: () => pageHead({ title: "Отзывы о такси Дальняк — реальные пассажиры о межгородних поездках", description: "Реальные отзывы клиентов Такси Дальняк о поездках между городами. Более 50 тысяч выполненных рейсов, рейтинг 4.9. Звоните +7 (995) 645-51-25.", path: "/reviews", keywords: "отзывы такси межгород, отзывы такси дальняк, такси между городами отзывы" }),
  component: Reviews,
});
