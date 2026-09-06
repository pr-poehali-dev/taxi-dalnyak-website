import { useParams } from "react-router-dom";
import RegionalPage from "@/pages/RegionalPage";
import PageNotFound from "@/pages/PageNotFound";
import { findTown } from "@/data/towns";

export default function TownPage() {
  const { slug } = useParams<{ slug: string }>();
  const town = slug ? findTown(slug) : undefined;

  if (!town) return <PageNotFound />;

  const { city, cityRod, cityPred, region, intro, nearby, routes } = town;
  const main = routes.slice(0, 4).map(r => r.split(" – ")[1]).join(", ");

  return (
    <RegionalPage
      config={{
        slug: town.slug,
        city,
        cityRod,
        seoTitle: `Такси из ${cityRod} в другой город — ${main} | Такси Дальняк`,
        seoDescription: `Заказать междугороднее такси из ${cityRod} (${region}) в ${main} и другие города России. Прямой рейс без пересадок, фиксированная цена, подача круглосуточно. +7 (995) 645-51-25`,
        seoKeywords: [
          `такси ${city}`,
          `такси из ${cityRod}`,
          `междугороднее такси ${city}`,
          ...routes.slice(0, 6).map(r => `такси ${r.replace(" – ", " ")}`),
          `такси ${region.toLowerCase()}`,
          town.extraKeywords ?? "",
        ].filter(Boolean).join(", "),
        h1: `Такси из ${cityRod} [gold]в любой город России[/gold]`,
        badge: `${city} · ${region} · Межгород`,
        sub: "Прямой рейс без пересадок · Круглосуточно",
        lead: `Забираем по адресу в ${cityPred} и везём прямо до двери в нужном городе. Цену называем до выезда и фиксируем — в дороге она не меняется.`,
        about: `${intro} ${nearby} Машина едет только за вами — попутчиков не подсаживаем, остановки делаем по вашей просьбе.`,
        features: [
          `Подача в ${cityPred} и сёлах района`,
          `Прямые рейсы: ${routes[0].split(" – ")[1]}, ${routes[1].split(" – ")[1]}`,
          "Работаем на новых территориях с 2014 года",
          "Фиксированная цена — без доплат в дороге",
          "Помощь с багажом, остановки в пути",
          "Круглосуточно, включая ночные выезды",
        ],
        routes,
      }}
    />
  );
}
