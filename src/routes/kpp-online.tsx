import { createFileRoute } from "@tanstack/react-router";
import KppOnline from "@/pages/KppOnline";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/kpp-online")({
  head: () => pageHead({ title: "Очереди на КПП онлайн — Весело-Вознесенка, Успенка, Изварино | Дальняк" }),
  component: KppOnline,
});
