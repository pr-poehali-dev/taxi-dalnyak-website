import { createFileRoute } from "@tanstack/react-router";
import Chelyabinsk from "@/pages/regions/Chelyabinsk";
import { regionHead } from "@/lib/regionSeo";

export const Route = createFileRoute("/chelyabinsk")({
  head: () => regionHead("/chelyabinsk"),
  component: Chelyabinsk,
});
