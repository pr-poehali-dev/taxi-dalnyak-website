import { createFileRoute } from "@tanstack/react-router";
import Ryazan from "@/pages/regions/Ryazan";
import { regionHead } from "@/lib/regionSeo";

export const Route = createFileRoute("/ryazan")({
  head: () => regionHead("/ryazan"),
  component: Ryazan,
});
