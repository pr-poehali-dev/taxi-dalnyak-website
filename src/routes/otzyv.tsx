import { createFileRoute } from "@tanstack/react-router";
import Otzyv from "@/pages/Otzyv";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/otzyv")({
  head: () => pageHead({ title: "Оставить отзыв — Такси Дальняк", noindex: true }),
  component: Otzyv,
});
