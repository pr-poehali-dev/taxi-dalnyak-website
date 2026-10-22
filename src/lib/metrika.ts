const YM_ID = 111028538;
const STAFF_KEY = "app_no_goals";

const STAFF_PATHS = ["/app/driver", "/app/office-k7x2", "/keywords", "/direct", "/pages", "/deals", "/clicks", "/track", "/privacy-drivers"];

function isStaffPath(path = window.location.pathname) {
  return STAFF_PATHS.some((p) => path === p || path.startsWith(p + "/"));
}

export function markStaffDevice() {
  try { localStorage.setItem(STAFF_KEY, "1"); } catch { /* ignore */ }
}

function isStaffDevice() {
  try {
    if (localStorage.getItem(STAFF_KEY) === "1") return true;
    if (localStorage.getItem("app_token_driver") || localStorage.getItem("app_token_dispatcher")) return true;
  } catch { /* ignore */ }
  return false;
}

export function goalsBlocked() {
  return isStaffDevice() || isStaffPath();
}

function applyUrlFlag() {
  try {
    const v = new URLSearchParams(window.location.search).get("nogoals");
    if (v === "1") localStorage.setItem(STAFF_KEY, "1");
    if (v === "0") localStorage.removeItem(STAFF_KEY);
  } catch { /* ignore */ }
  const p = window.location.pathname;
  if (p === "/app/driver" || p === "/app/office-k7x2") markStaffDevice();
}

const KEY_GOAL_FROM = new Set(["app_quote", "app_order_click", "app_lead", "app_order_any", "lead", "app_contact"]);
let keySent = false;

export function reachGoal(goal: string, params?: Record<string, string | number>) {
  if (goalsBlocked()) return;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ym = (window as any).ym;
  if (typeof ym !== "function") return;
  ym(YM_ID, "reachGoal", goal, params);
  if (KEY_GOAL_FROM.has(goal) && !keySent) {
    keySent = true;
    ym(YM_ID, "reachGoal", "app_key", { from: goal });
  }
}

export function initGlobalGoals() {
  applyUrlFlag();
  document.addEventListener(
    "click",
    (e) => {
      const target = e.target as HTMLElement | null;
      const link = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!link || link.closest("[data-no-goal]")) return;
      if (goalsBlocked()) return;

      const href = link.getAttribute("href") || "";
      const page = window.location.pathname;

      if (href.startsWith("tel:")) {
        reachGoal("call", { page, phone: href.replace(/\D/g, "") });
        reachGoal("lead", { page, channel: "call" });
      }

      if (href.includes("max.ru")) {
        reachGoal("max", { page });
        reachGoal("lead", { page, channel: "max" });
      }

      if (href.includes("t.me/")) {
        reachGoal("telegram", { page });
        reachGoal("lead", { page, channel: "telegram" });
      }

      if (href.includes("wa.me") || href.includes("whatsapp")) {
        reachGoal("whatsapp", { page });
        reachGoal("lead", { page, channel: "whatsapp" });
      }
    },
    true,
  );
}
