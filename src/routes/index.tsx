import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import AppPending from "@/components/AppPending";

// Главная — приложение пассажира: вход хранится в localStorage, карта (leaflet)
// работает только в браузере, поэтому страница рендерится на клиенте.
// Title, description и og-теги главной — по умолчанию из __root.tsx.
export const Route = createFileRoute("/")({
  ssr: false,
  head: () => ({ links: [{ rel: "canonical", href: "https://taxidalnyack.ru/" }] }),
  pendingComponent: AppPending,
  component: lazyRouteComponent(() => import("@/pages/app/AppClient")),
});