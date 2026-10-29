import { createFileRoute } from "@tanstack/react-router";
import Voronezh from "@/pages/regions/Voronezh";
import { regionHead } from "@/lib/regionSeo";

export const Route = createFileRoute("/voronezh")({
  head: () => regionHead("/voronezh"),
  component: Voronezh,
});
