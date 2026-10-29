import { createFileRoute, notFound } from "@tanstack/react-router";
import { findRouteLanding } from "@/lib/routeLandings";
import { findTown } from "@/data/towns";
import { pageHead, SITE_URL } from "@/lib/seo";
import RouteLandingPage from "@/pages/RouteLandingPage";
import TownPage from "@/pages/TownPage";

const PHONE = "+7 (995) 645-51-25";

function seoFor(slug: string) {
  const r = findRouteLanding(slug);
  if (r) {
    const routeName = `${r.from} — ${r.to}`;
    const tollSeo = r.tollAlt?.seo ?? "все расходы в пути включены";
    return pageHead({
      title: `Такси ${routeName} · фикс-цена ${r.priceFrom} | Такси Дальняк`,
      description:
        `Такси ${routeName} по фиксированной цене от ${r.priceFrom} под ключ. Без попутчиков, ` +
        `${r.tollLabel ? r.tollLabel.toLowerCase() + " включена" : tollSeo}, подача к подъезду. ` +
        `Звоните ${PHONE} круглосуточно.`,
      canonical: `${SITE_URL}/${r.slug}`,
    });
  }
  const town = findTown(slug);
  if (town) {
    const { city, cityRod, region, routes } = town;
    const main = routes.slice(0, 4).map((x) => x.split(" – ")[1]).join(", ");
    return pageHead({
      title: `Такси из ${cityRod}${town.titleSuffix ?? ""} в другой город — ${main} | Такси Дальняк`,
      description: `Заказать междугороднее такси из ${cityRod} (${region}) в ${main} и другие города России. Прямой рейс без пересадок, фиксированная цена, подача круглосуточно. +7 (995) 645-51-25`,
      keywords: [
        `такси ${city}`,
        `такси из ${cityRod}`,
        `междугороднее такси ${city}`,
        ...routes.slice(0, 6).map((x) => `такси ${x.replace(" – ", " ")}`),
        `такси ${region.toLowerCase()}`,
        town.extraKeywords ?? "",
      ].filter(Boolean).join(", "),
      canonical: `${SITE_URL}/${town.slug}`,
    });
  }
  return { meta: [], links: [] };
}

// Посадочные под маршруты (/rostov-moskva) и малые города (/<slug>).
export const Route = createFileRoute("/$slug")({
  loader: ({ params }) => {
    if (findRouteLanding(params.slug)) return { kind: "route" as const };
    if (findTown(params.slug)) return { kind: "town" as const };
    throw notFound();
  },
  head: ({ params }) => seoFor(params.slug),
  component: SlugPage,
});

function SlugPage() {
  const data = Route.useLoaderData();
  return data.kind === "route" ? <RouteLandingPage /> : <TownPage />;
}