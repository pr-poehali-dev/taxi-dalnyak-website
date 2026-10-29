import { createFileRoute } from "@tanstack/react-router";
import Donetsk from "@/pages/regions/Donetsk";
import { regionHead } from "@/lib/regionSeo";

export const Route = createFileRoute("/donetsk")({
  head: () => regionHead("/donetsk"),
  component: Donetsk,
});
