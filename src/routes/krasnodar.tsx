import { createFileRoute } from "@tanstack/react-router";
import Krasnodar from "@/pages/regions/Krasnodar";
import { regionHead } from "@/lib/regionSeo";

export const Route = createFileRoute("/krasnodar")({
  head: () => regionHead("/krasnodar"),
  component: Krasnodar,
});
