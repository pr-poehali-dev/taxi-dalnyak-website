import { captureAdSource, getAdSource, getYmClientId, getYmClientIdSync, type AdSource } from "./adSource";
import func2url from "../../backend/func2url.json";

const URLS = func2url as Record<string, string>;

/** Регистрирует визит на сервере: код визита + рекламные метки. Вызывается один раз за сессию. */
export async function registerVisit(): Promise<AdSource> {
  const source = captureAdSource();
  const endpoint = URLS["track-visit"];
  const once = `visit_sent_${source.visitKey}`;

  if (!endpoint || sessionStorage.getItem(once)) return source;

  try {
    const ymClientId = await getYmClientId();
    if (!ymClientId) {
      window.setTimeout(() => {
        const late = getYmClientIdSync();
        if (late) {
          fetch(endpoint + "?action=visit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...source, ymClientId: late }),
            keepalive: true,
          }).catch(() => {});
        }
      }, 6000);
    }
    await fetch(endpoint + "?action=visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...source, ymClientId }),
      keepalive: true,
    });
    sessionStorage.setItem(once, "1");
  } catch {
    /* аналитика не должна ломать сайт */
  }
  return source;
}

/** Фиксирует обращение на своём сервере: звонок, Telegram или Макс. */
export function trackLeadClick(channel: string) {
  const endpoint = URLS["track-visit"];
  if (!endpoint) return;

  const s = getAdSource();
  const p = new URLSearchParams(window.location.search);

  try {
    const payload = JSON.stringify({
      visitKey: s.visitKey,
      channel,
      page: window.location.pathname,
      utmSource: p.get("utm_source") || s.utmSource || "",
      utmMedium: p.get("utm_medium") || s.utmMedium || "",
      utmCampaign: p.get("utm_campaign") || s.utmCampaign || "",
      utmTerm: p.get("utm_term") || p.get("keyword") || s.utmTerm || "",
      utmContent: p.get("utm_content") || s.utmContent || "",
      yclid: p.get("yclid") || s.yclid || "",
      ymClientId: getYmClientIdSync() || "",
    });

    const url = endpoint + "?action=click";
    if (navigator.sendBeacon) {
      navigator.sendBeacon(url, new Blob([payload], { type: "application/json" }));
    } else {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    /* аналитика не должна ломать сайт */
  }
}

/**
 * Автоматически подставляет код визита во ВСЕ ссылки на Telegram и Макс на сайте —
 * на любой странице, включая те, что добавим позже.
 */
export function initVisitKeyLinks() {
  document.addEventListener(
    "click",
    (e) => {
      const el = e.target as HTMLElement | null;
      const link = el?.closest?.("a") as HTMLAnchorElement | null;
      if (!link) return;

      const href = link.getAttribute("href") || "";
      if (!href.includes("t.me/") && !href.includes("max.ru/")) return;
      if (href.includes("?text=") || href.includes("?start=")) return;

      const patched = withVisitKey(href);
      if (patched !== href) link.setAttribute("href", patched);
    },
    true,
  );
}

/** Добавляет код визита в ссылку на мессенджер, чтобы связать обращение с рекламой. */
export function withVisitKey(href: string): string {
  const key = getAdSource().visitKey;
  if (!key) return href;

  try {
    const url = new URL(href);
    if (url.hostname.includes("t.me")) {
      url.searchParams.set("text", `Здравствуйте! Хочу заказать такси. Код ${key}`);
    } else if (url.hostname.includes("max.ru")) {
      url.searchParams.set("start", key);
    }
    return url.toString();
  } catch {
    return href;
  }
}