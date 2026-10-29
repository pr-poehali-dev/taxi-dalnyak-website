import { createFileRoute } from "@tanstack/react-router";
import Lite from "@/pages/Lite";
import { pageHead } from "@/lib/seo";

// TGTrack для Telegram: скрипт перехватывает любые ссылки на свой канал,
// поэтому подключается только на этой посадочной.
const TGTRACK_TG = "https://api.tgtrack.ru/API/landing_script/v1/?linkID=2ce09a2a1819b0&type=ya&counterID=111028538";

export const Route = createFileRoute("/lite")({
  head: () => ({
    ...pageHead({ title: "Такси из города в город · фиксированная цена | Такси Дальняк", description: "Такси из города в город. Поездки от 200 км, цена фиксируется до выезда, машина только за вами. Узнать стоимость в Telegram или по телефону +7 (995) 645-51-25.", path: "/lite" }),
    scripts: [{ src: TGTRACK_TG, defer: true }],
  }),
  component: Lite,
});
