import { createFileRoute } from "@tanstack/react-router";
import ClientPrivacy from "@/pages/ClientPrivacy";

export const Route = createFileRoute("/privacy")({
  component: ClientPrivacy,
});
