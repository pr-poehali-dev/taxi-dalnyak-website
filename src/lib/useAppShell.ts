import { useEffect } from "react";
import { pushNotify, unlockAudio } from "./notify";

export type AppKind = "client" | "driver" | "office";

const META: Record<AppKind, { icon: string; title: string }> = {
  client: { icon: "/apple-touch-icon.png", title: "Дальняк" },
  driver: { icon: "/apple-touch-icon-driver.png", title: "Водитель" },
  office: { icon: "/apple-touch-icon-office.png", title: "Диспетчер" },
};

export function useAppShell(kind: AppKind) {
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    const prev = link?.getAttribute("href");
    link?.setAttribute("href", `/app-${kind}.webmanifest`);
    const touch = document.querySelector<HTMLLinkElement>('link[rel="apple-touch-icon"]');
    const prevTouch = touch?.getAttribute("href");
    touch?.setAttribute("href", META[kind].icon);
    const appTitle = document.querySelector<HTMLMetaElement>('meta[name="apple-mobile-web-app-title"]');
    const prevAppTitle = appTitle?.content;
    if (appTitle) appTitle.content = META[kind].title;
    const theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const prevTheme = theme?.content;
    if (theme) theme.content = "#000000";
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const prevRobots = robots?.content;
    if (robots) robots.content = "noindex, nofollow";
    else {
      robots = document.createElement("meta");
      robots.name = "robots";
      robots.content = "noindex, nofollow";
      document.head.appendChild(robots);
    }

    window.history.pushState({ guard: true }, "");
    const onPop = () => {
      const st = window.history.state;
      if (!st?.guard && !st?.overlay) window.history.pushState({ guard: true }, "");
    };
    window.addEventListener("popstate", onPop);

    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);

    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "push") pushNotify(e.data.title);
    };
    navigator.serviceWorker?.addEventListener("message", onMsg);

    return () => {
      if (prev) link?.setAttribute("href", prev);
      if (prevTouch) touch?.setAttribute("href", prevTouch);
      if (appTitle && prevAppTitle) appTitle.content = prevAppTitle;
      if (theme && prevTheme) theme.content = prevTheme;
      if (robots && prevRobots) robots.content = prevRobots;
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      navigator.serviceWorker?.removeEventListener("message", onMsg);
    };
  }, [kind]);
}
