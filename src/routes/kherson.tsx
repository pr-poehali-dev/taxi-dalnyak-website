import { createFileRoute } from "@tanstack/react-router";
import Kherson from "@/pages/regions/Kherson";
import { regionHead } from "@/lib/regionSeo";

export const Route = createFileRoute("/kherson")({
  head: () => regionHead("/kherson"),
  component: Kherson,
});
