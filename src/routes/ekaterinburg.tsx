import { createFileRoute } from "@tanstack/react-router";
import Ekaterinburg from "@/pages/regions/Ekaterinburg";
import { regionHead } from "@/lib/regionSeo";

export const Route = createFileRoute("/ekaterinburg")({
  head: () => regionHead("/ekaterinburg"),
  component: Ekaterinburg,
});
