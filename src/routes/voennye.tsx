import { createFileRoute } from "@tanstack/react-router";
import Military from "@/pages/Military";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/voennye")({
  head: () => pageHead({ title: "Такси для военных — дальние маршруты от 500 км | Такси Дальняк", description: "Такси для военных и в новые территории — Донецк, Луганск, Херсон. Конфиденциально, без лишних вопросов, оплата наличными или картой. Звоните +7 (995) 645-51-25.", path: "/voennye", keywords: "такси для военных, такси в новые территории, такси донецк луганск херсон" }),
  component: Military,
});
