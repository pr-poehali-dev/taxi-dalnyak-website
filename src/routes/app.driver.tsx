import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import AppPending from "@/components/AppPending";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/driver")({
  ssr: false,
  head: () => pageHead({ title: "Дальняк Водитель", noindex: true }),
  pendingComponent: AppPending,
  component: lazyRouteComponent(() => import("@/pages/app/AppDriver")),
});
