import { createFileRoute } from "@tanstack/react-router";
import Call from "@/pages/Call";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/call")({
  head: () => pageHead({ title: "Такси из города в город · звоните круглосуточно | Такси Дальняк", description: "Такси из города в город. Поездки от 200 км, цена фиксируется до выезда, машина только за вами. Звоните +7 (995) 645-51-25 — рассчитаем стоимость за минуту.", path: "/call" }),
  component: Call,
});
