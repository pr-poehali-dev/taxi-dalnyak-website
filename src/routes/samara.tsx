import { createFileRoute } from "@tanstack/react-router";
import Samara from "@/pages/regions/Samara";
import { regionHead } from "@/lib/regionSeo";

export const Route = createFileRoute("/samara")({
  head: () => regionHead("/samara"),
  component: Samara,
});
