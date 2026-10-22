import { appCall } from "./appApi";
import { getAdSource } from "./adSource";
import { isStandalone } from "./pushClient";
import { goalsBlocked, reachGoal } from "./metrika";

const GOALS: Partial<Record<FunnelStep, string>> = {
  route: "app_route",
  quote: "app_quote",
  order_click: "app_order_click",
};

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

export function reachHotQuote(params: Record<string, string | number>) {
  if (sent.has("goal:app_quote_hot")) return;
  sent.add("goal:app_quote_hot");
  reachGoal("app_quote_hot", params);
}

export function trackStep(step: FunnelStep, extra: { details?: string; once?: boolean; token?: string | null } = {}) {
  if (goalsBlocked()) return;
  const key = step + (extra.details || "");
  if (extra.once !== false && sent.has(key)) return;
  sent.add(key);
  const goal = GOALS[step];
  if (goal && !sent.has("goal:" + goal)) {
    sent.add("goal:" + goal);
    reachGoal(goal);
  }
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
