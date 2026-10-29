import { createFileRoute } from "@tanstack/react-router";
import Deals from "@/pages/Deals";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/deals")({
  head: () => pageHead({ title: "Учёт оплат | Такси Дальняк", noindex: true }),
  component: Deals,
});
