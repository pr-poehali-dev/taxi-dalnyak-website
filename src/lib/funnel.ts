import { appCall } from "./appApi";
import { getAdSource } from "./adSource";
import { isStandalone } from "./pushClient";

export type FunnelStep = "open" | "login" | "route" | "quote" | "order" | "install_offer" | "install" | "login_prompt" | "order_click";

const VKEY = "app_visitor_id";

function visitor(): string {
  try {
    let v = localStorage.getItem(VKEY);
    if (!v) {
      v = Math.random().toString(36).slice(2) + Date.now().toString(36);
      localStorage.setItem(VKEY, v);
    }
    return v;
  } catch {
    return "anon-" + Math.random().toString(36).slice(2);
  }
}

const sent = new Set<string>();

export function trackStep(step: FunnelStep, extra: { details?: string; once?: boolean; token?: string | null } = {}) {
  const key = step + (extra.details || "");
  if (extra.once !== false && sent.has(key)) return;
  sent.add(key);
  const s = getAdSource();
  appCall("funnel", {
    step,
    visitor: visitor(),
    installed: isStandalone(),
    from_ad: Boolean(s.yclid || s.utmSource),
    utm_source: s.utmSource || (s.yclid ? "yandex" : ""),
    utm_campaign: s.utmCampaign || "",
    details: extra.details || "",
  }, extra.token || readToken()).catch(() => undefined);
}

function readToken(): string | null {
  try {
    return localStorage.getItem("app_token_client");
  } catch {
    return null;
  }
}
