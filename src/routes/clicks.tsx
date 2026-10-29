import { createFileRoute } from "@tanstack/react-router";
import Clicks from "@/pages/Clicks";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/clicks")({
  head: () => pageHead({ title: "Обращения с сайта | Такси Дальняк" }),
  component: Clicks,
});
