import { createFileRoute } from "@tanstack/react-router";
import Izhevsk from "@/pages/regions/Izhevsk";
import { regionHead } from "@/lib/regionSeo";

export const Route = createFileRoute("/izhevsk")({
  head: () => regionHead("/izhevsk"),
  component: Izhevsk,
});
