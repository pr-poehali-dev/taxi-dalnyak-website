const YM_ID = 111028538;

function reachGoal(goal: string, params?: Record<string, string>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ym = (window as any).ym;
  if (typeof ym === "function") ym(YM_ID, "reachGoal", goal, params);
}

export function initGlobalGoals() {
  document.addEventListener(
    "click",
    (e) => {
      const target = e.target as HTMLElement | null;
      const link = target?.closest?.("a") as HTMLAnchorElement | null;
      if (!link) return;

      const href = link.getAttribute("href") || "";
      const page = window.location.pathname;

      if (href.startsWith("tel:")) {
        reachGoal("call", { page, phone: href.replace(/\D/g, "") });
      }

      if (href.includes("max.ru")) {
        reachGoal("max", { page });
      }
    },
    true,
  );
}