import { createFileRoute } from "@tanstack/react-router";
import Direct from "@/pages/Direct";
import { pageHead } from "@/lib/seo";
import { HOME_CONFIG } from "@/pages/Home";

export const Route = createFileRoute("/direct")({
  head: () =>
    pageHead({
      title: HOME_CONFIG.seoTitle,
      description: HOME_CONFIG.seoDescription,
      keywords: HOME_CONFIG.seoKeywords,
      canonical: HOME_CONFIG.canonical,
    }),
  component: Direct,
});
