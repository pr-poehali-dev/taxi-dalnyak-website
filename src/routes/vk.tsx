import { createFileRoute } from "@tanstack/react-router";
import QuickVk from "@/pages/QuickVk";
import { pageHead } from "@/lib/seo";
import { HOME_CONFIG } from "@/pages/Home";

export const Route = createFileRoute("/vk")({
  head: () =>
    pageHead({
      title: HOME_CONFIG.seoTitle,
      description: HOME_CONFIG.seoDescription,
      keywords: HOME_CONFIG.seoKeywords,
      canonical: HOME_CONFIG.canonical,
    }),
  component: QuickVk,
});
