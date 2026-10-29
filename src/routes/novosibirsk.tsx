import { createFileRoute } from "@tanstack/react-router";
import Novosibirsk from "@/pages/regions/Novosibirsk";
import { regionHead } from "@/lib/regionSeo";

export const Route = createFileRoute("/novosibirsk")({
  head: () => regionHead("/novosibirsk"),
  component: Novosibirsk,
});
