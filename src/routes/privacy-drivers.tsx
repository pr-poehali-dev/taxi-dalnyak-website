import { createFileRoute } from "@tanstack/react-router";
import DriverPrivacy from "@/pages/DriverPrivacy";

export const Route = createFileRoute("/privacy-drivers")({
  component: DriverPrivacy,
});
