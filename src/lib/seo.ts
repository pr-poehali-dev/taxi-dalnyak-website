// Мета-теги страницы для head() маршрутов (серверный рендер).
export const SITE_URL = "https://taxidalnyack.ru";

export interface PageSeo {
  title: string;
  description?: string;
  /** Путь для canonical и og:url, например "/tariffs". */
  path?: string;
  /** Полный canonical, если отличается от SITE_URL + path. */
  canonical?: string;
  keywords?: string;
  noindex?: boolean;
}

export function pageHead({ title, description, path, canonical, keywords, noindex }: PageSeo) {
  const url = canonical ?? (path !== undefined ? `${SITE_URL}${path}` : undefined);
  const meta: Record<string, string>[] = [{ title }, { property: "og:title", content: title }];
  if (description) {
    meta.push({ name: "description", content: description });
    meta.push({ property: "og:description", content: description });
  }
  if (keywords) meta.push({ name: "keywords", content: keywords });
  if (url) meta.push({ property: "og:url", content: url });
  if (noindex) meta.push({ name: "robots", content: "noindex, nofollow" });
  return {
    meta,
    links: url ? [{ rel: "canonical", href: url }] : [],
  };
}
