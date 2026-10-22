import { goalsBlocked } from "./metrika";
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
      if (goalsBlocked() || link.closest("[data-no-visit-key]")) {
        if (openTelegramApp(href)) { e.preventDefault(); e.stopPropagation(); }
        return;
      }

      const patched = withVisitKey(href);
      if (patched !== href) link.setAttribute("href", patched);
      if (openTelegramApp(patched)) {
        e.preventDefault();
        e.stopPropagation();
      }
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
function isMobileUa() {
  return /android|iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** На телефоне открывает Telegram напрямую через приложение (t.me часто не грузится), с запасным переходом на t.me. */
export function openTelegramApp(href: string): boolean {
  if (!isMobileUa()) return false;
  let url: URL;
  try { url = new URL(href); } catch { return false; }
  if (!/(^|\.)t\.me$|telegram\.me$/.test(url.hostname)) return false;
  const name = url.pathname.replace(/^\/+/, "").split("/")[0];
  if (!/^[A-Za-z][A-Za-z0-9_]{3,}$/.test(name)) return false;
  const text = url.searchParams.get("text");
  const deep = `tg://resolve?domain=${name}${text ? `&text=${encodeURIComponent(text)}` : ""}`;
  let left = false;
  const onHide = () => { if (document.hidden) left = true; };
  document.addEventListener("visibilitychange", onHide);
  window.location.href = deep;
  window.setTimeout(() => {
    document.removeEventListener("visibilitychange", onHide);
    if (!left && !document.hidden) window.location.href = url.toString();
  }, 1500);
  return true;
}
