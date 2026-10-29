import { createFileRoute } from "@tanstack/react-router";
import Pages from "@/pages/Pages";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/pages")({
  head: () => pageHead({ title: "Все посадочные страницы | Такси Дальняк", noindex: true }),
  component: Pages,
});
