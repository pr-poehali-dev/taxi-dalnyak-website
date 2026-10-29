import { createFileRoute } from "@tanstack/react-router";
import Kursk from "@/pages/regions/Kursk";
import { regionHead } from "@/lib/regionSeo";

export const Route = createFileRoute("/kursk")({
  head: () => regionHead("/kursk"),
  component: Kursk,
});
