import { createFileRoute } from "@tanstack/react-router";
import KPP from "@/pages/KPP";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/kpp")({
  head: () => pageHead({ title: "Такси до КПП — дальние поездки | Такси Дальняк", description: "Такси до КПП и в новые территории — фиксированная цена, без счётчика. Донецк, Луганск, Мариуполь, Запорожье. Круглосуточно, звоните +7 (995) 645-51-25.", path: "/kpp", keywords: "такси до кпп, такси донецк, такси луганск, такси на кпп из россии" }),
  component: KPP,
});
