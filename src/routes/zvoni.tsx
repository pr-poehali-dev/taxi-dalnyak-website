import { createFileRoute } from "@tanstack/react-router";
import Quick from "@/pages/Quick";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/zvoni")({
  head: () => pageHead({ title: "Заказать такси из города в город от 200 км — Такси Дальняк" }),
  component: Quick,
});
