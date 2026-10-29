import { createFileRoute } from "@tanstack/react-router";
import Moscow from "@/pages/regions/Moscow";
import { regionHead } from "@/lib/regionSeo";

export const Route = createFileRoute("/moskva")({
  head: () => regionHead("/moskva"),
  component: Moscow,
});
