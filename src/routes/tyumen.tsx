import { createFileRoute } from "@tanstack/react-router";
import Tyumen from "@/pages/regions/Tyumen";
import { regionHead } from "@/lib/regionSeo";

export const Route = createFileRoute("/tyumen")({
  head: () => regionHead("/tyumen"),
  component: Tyumen,
});
