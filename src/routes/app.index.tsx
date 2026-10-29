import { createFileRoute } from "@tanstack/react-router";
import { Navigate } from "@/lib/router-compat";
import AppPending from "@/components/AppPending";
import { pageHead } from "@/lib/seo";

// Как и раньше: /app в браузере заменяется на /app/client.
export const Route = createFileRoute("/app/")({
  ssr: false,
  head: () => pageHead({ title: "Такси Дальняк", noindex: true }),
  pendingComponent: AppPending,
  component: AppRedirect,
});

function AppRedirect() {
  return (
    <>
      <AppPending />
      <Navigate to="/app/client" replace />
    </>
  );
}
