import { createFileRoute } from "@tanstack/react-router";
import Keywords from "@/pages/Keywords";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/keywords")({
  head: () => pageHead({ title: "Ключевые фразы и минус-слова для Яндекс Директ" }),
  component: Keywords,
});
