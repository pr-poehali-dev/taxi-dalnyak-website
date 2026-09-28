import { useLocation } from "react-router-dom";
import RouteLanding from "@/components/route-landing/RouteLanding";
import { findRouteLanding } from "@/lib/routeLandings";
import PageNotFound from "@/pages/PageNotFound";

export default function RouteLandingPage() {
  const { pathname } = useLocation();
  const slug = pathname.replace(/^\/+|\/+$/g, "");
  const config = findRouteLanding(slug);
  if (!config) return <PageNotFound />;
  return <RouteLanding key={config.slug} config={config} />;
}
