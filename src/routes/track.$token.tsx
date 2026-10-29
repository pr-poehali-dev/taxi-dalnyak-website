import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import AppPending from "@/components/AppPending";
import { pageHead } from "@/lib/seo";

// Отслеживание поездки: карта (leaflet) работает только в браузере.
export const Route = createFileRoute("/track/$token")({
  ssr: false,
  head: () => pageHead({ title: "Такси Дальняк", noindex: true }),
  pendingComponent: AppPending,
  component: lazyRouteComponent(() => import("@/pages/app/AppTrack")),
});
