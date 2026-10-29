import { createFileRoute } from "@tanstack/react-router";
import Belgorod from "@/pages/regions/Belgorod";
import { regionHead } from "@/lib/regionSeo";

export const Route = createFileRoute("/belgorod")({
  head: () => regionHead("/belgorod"),
  component: Belgorod,
});
