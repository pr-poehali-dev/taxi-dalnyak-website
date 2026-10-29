import { createFileRoute } from "@tanstack/react-router";
import Stavropol from "@/pages/regions/Stavropol";
import { regionHead } from "@/lib/regionSeo";

export const Route = createFileRoute("/stavropol")({
  head: () => regionHead("/stavropol"),
  component: Stavropol,
});
