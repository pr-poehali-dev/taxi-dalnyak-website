import { useEffect } from "react";
import { routeFromQuery } from "@/lib/routeFromQuery";
import { type RegionConfig } from "@/components/regional/shared";

/** Проставляет title/description/canonical/OG и JSON-LD региональной страницы. */
export function useRegionalSeo(config: RegionConfig, PHONE: string) {
  useEffect(() => {
    const qr = routeFromQuery(new URLSearchParams(window.location.search).get("utm_term"));
    const title = qr
      ? `Такси ${qr.from} – ${qr.to} — фиксированная цена | Такси Дальняк`
      : config.seoTitle ?? `Заказать такси из ${config.cityRod} в другой город от 200 км — Такси Дальняк`;
    document.title = title;

    const description = config.seoDescription ?? `Такси из ${config.cityRod} в другой город по фиксированной цене. ${config.routes.slice(0, 4).join(", ")} и другие направления. Круглосуточно, звоните ${PHONE}.`;
    const keywords = config.seoKeywords ?? `такси ${config.cityRod}, заказать такси ${config.cityRod}, межгород ${config.cityRod}, такси из ${config.cityRod} в другой город`;
    const canonicalUrl = config.canonical ?? `https://taxidalnyack.ru/${config.slug === "moscow" ? "moskva" : config.slug === "nizhny" ? "nizhniy" : config.slug}`;

    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector(selector) as HTMLElement | null;
      if (!el) {
        const tagName = selector.startsWith("link") ? "link" : "meta";
        el = document.createElement(tagName);
        if (tagName === "meta") {
          const nameMatch = selector.match(/\[(name|property)="([^"]+)"\]/);
          if (nameMatch) el.setAttribute(nameMatch[1], nameMatch[2]);
        } else {
          el.setAttribute("rel", "canonical");
        }
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    };

    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[name="keywords"]', "content", keywords);
    setMeta('link[rel="canonical"]', "href", canonicalUrl);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", canonicalUrl);

    const schemaId = "regional-schema";
    let script = document.getElementById(schemaId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.id = schemaId;
      script.type = "application/ld+json";
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "TaxiService",
      name: `Такси Дальняк — ${config.city}`,
      description,
      telephone: "+79956455125",
      url: canonicalUrl,
      areaServed: { "@type": "City", name: config.city },
      serviceType: "Междугороднее такси",
      provider: { "@type": "Organization", name: "Такси Дальняк", telephone: "+79956455125", url: "https://taxidalnyack.ru/" },
      openingHours: "Mo-Su 00:00-23:59",
      priceRange: "от 26₽/км",
    });

    const breadcrumbId = "regional-breadcrumb";
    let bc = document.getElementById(breadcrumbId) as HTMLScriptElement | null;
    if (!bc) {
      bc = document.createElement("script");
      bc.id = breadcrumbId;
      bc.type = "application/ld+json";
      document.head.appendChild(bc);
    }
    bc.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Главная", item: "https://taxidalnyack.ru/" },
        { "@type": "ListItem", position: 2, name: config.city, item: canonicalUrl },
      ],
    });

    return () => {
      script?.remove();
      bc?.remove();
    };
  }, [config.city, config.cityRod, config.slug, config.routes]);
}
