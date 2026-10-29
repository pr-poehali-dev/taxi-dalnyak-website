import { createFileRoute } from "@tanstack/react-router";
import SPb from "@/pages/regions/SPb";
import { regionHead } from "@/lib/regionSeo";

export const Route = createFileRoute("/spb")({
  head: () => regionHead("/spb"),
  component: SPb,
});
