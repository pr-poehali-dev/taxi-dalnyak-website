import { createFileRoute } from "@tanstack/react-router";
import Rostov from "@/pages/regions/Rostov";
import { regionHead } from "@/lib/regionSeo";

export const Route = createFileRoute("/rostov")({
  head: () => regionHead("/rostov"),
  component: Rostov,
});
