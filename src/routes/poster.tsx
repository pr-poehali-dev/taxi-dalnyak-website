import { createFileRoute } from "@tanstack/react-router";
import PosterHome from "@/pages/PosterHome";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/poster")({
  head: () => pageHead({ title: "Заказать такси из города в город от 200 км — Такси Дальняк", description: "Межгородское такси по России от 200 км. Без попутчиков, цена не меняется, без предоплаты. Звоните +7 (995) 645-51-25 круглосуточно.", path: "/", keywords: "такси межгород, заказать такси из города в город, междугороднее такси" }),
  component: PosterHome,
});
