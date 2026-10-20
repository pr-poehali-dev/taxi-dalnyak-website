import { useEffect } from "react";
import { pushNotify, unlockAudio } from "./notify";

export type AppKind = "client" | "driver" | "office";

export function useAppShell(kind: AppKind) {
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    const prev = link?.getAttribute("href");
    link?.setAttribute("href", `/app-${kind}.webmanifest`);
    const theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const prevTheme = theme?.content;
    if (theme) theme.content = "#fcd34d";
    let robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const prevRobots = robots?.content;
    if (robots) robots.content = "noindex, nofollow";
    else {
      robots = document.createElement("meta");
      robots.name = "robots";
      robots.content = "noindex, nofollow";
      document.head.appendChild(robots);
    }

    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock);
    window.addEventListener("keydown", unlock);

    const onMsg = (e: MessageEvent) => {
      if (e.data?.type === "push") pushNotify(e.data.title);
    };
    navigator.serviceWorker?.addEventListener("message", onMsg);

    return () => {
      if (prev) link?.setAttribute("href", prev);
      if (theme && prevTheme) theme.content = prevTheme;
      if (robots && prevRobots) robots.content = prevRobots;
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      navigator.serviceWorker?.removeEventListener("message", onMsg);
    };
  }, [kind]);
}
