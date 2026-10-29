import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import AppPending from "@/components/AppPending";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/office-k7x2")({
  ssr: false,
  head: () => pageHead({ title: "Дальняк Диспетчер", noindex: true }),
  pendingComponent: AppPending,
  component: lazyRouteComponent(() => import("@/pages/app/AppDispatcher")),
});
