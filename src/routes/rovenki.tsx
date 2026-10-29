import { createFileRoute } from "@tanstack/react-router";
import Rovenki from "@/pages/regions/Rovenki";
import { regionHead } from "@/lib/regionSeo";

export const Route = createFileRoute("/rovenki")({
  head: () => regionHead("/rovenki"),
  component: Rovenki,
});
