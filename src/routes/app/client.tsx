import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import AppPending from "@/components/AppPending";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/app/client")({
  ssr: false,
  head: () => pageHead({ title: "Такси Дальняк", noindex: true }),
  pendingComponent: AppPending,
  component: lazyRouteComponent(() => import("@/pages/app/AppClient")),
});
