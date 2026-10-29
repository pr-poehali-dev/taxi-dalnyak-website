import { createFileRoute } from "@tanstack/react-router";
import Nizhny from "@/pages/regions/Nizhny";
import { regionHead } from "@/lib/regionSeo";

export const Route = createFileRoute("/nizhniy")({
  head: () => regionHead("/nizhniy"),
  component: Nizhny,
});
