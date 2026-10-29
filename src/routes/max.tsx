import { createFileRoute } from "@tanstack/react-router";
import Max from "@/pages/Max";
import { pageHead } from "@/lib/seo";

// TGTrack для MAX: скрипт перехватывает любые ссылки на свой чат, поэтому
// подключается только на этой посадочной.
const TGTRACK_MAX = "https://max.tgtrack.ru/API/landing_script/v1/?linkID=a7cec2d2ae73f&type=ya&counterID=111028538";

export const Route = createFileRoute("/max")({
  head: () => ({
    ...pageHead({ title: "Такси из города в город · фиксированная цена | Такси Дальняк", description: "Такси из города в город. Поездки от 200 км, цена фиксируется до выезда, машина только за вами. Узнать стоимость в MAX или по телефону +7 (995) 645-51-25.", path: "/max" }),
    scripts: [{ src: TGTRACK_MAX, defer: true }],
  }),
  component: Max,
});
