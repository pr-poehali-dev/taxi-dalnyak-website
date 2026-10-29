import { createFileRoute } from "@tanstack/react-router";
import Russia from "@/pages/Russia";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/rossiya")({
  head: () => pageHead({ title: "Такси межгород по России: из вашего города в любой город | Такси Дальняк", description: "Междугороднее такси по всей России, в Крым, ДНР и ЛНР. От двери до двери, цена фиксируется до выезда, без предоплаты и попутчиков. Круглосуточно: +7 (995) 645-51-25.", path: "/rossiya" }),
  component: Russia,
});
