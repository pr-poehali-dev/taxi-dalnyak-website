import { createFileRoute } from "@tanstack/react-router";
import Lugansk from "@/pages/regions/Lugansk";
import { regionHead } from "@/lib/regionSeo";

export const Route = createFileRoute("/lugansk")({
  head: () => regionHead("/lugansk"),
  component: Lugansk,
});
