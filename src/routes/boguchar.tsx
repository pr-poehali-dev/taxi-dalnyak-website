import { createFileRoute } from "@tanstack/react-router";
import Boguchar from "@/pages/regions/Boguchar";
import { regionHead } from "@/lib/regionSeo";

export const Route = createFileRoute("/boguchar")({
  head: () => regionHead("/boguchar"),
  component: Boguchar,
});
