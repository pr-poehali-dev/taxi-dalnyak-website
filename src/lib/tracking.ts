import { captureAdSource, getAdSource, getYmClientId, type AdSource } from "./adSource";
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
    await fetch(endpoint, {
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
