import { useEffect } from "react";

export function useAppManifest() {
  useEffect(() => {
    const link = document.querySelector<HTMLLinkElement>('link[rel="manifest"]');
    const prev = link?.getAttribute("href");
    link?.setAttribute("href", "/app.webmanifest");
    const theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    const prevTheme = theme?.content;
    if (theme) theme.content = "#fcd34d";
    return () => {
      if (prev) link?.setAttribute("href", prev);
      if (theme && prevTheme) theme.content = prevTheme;
    };
  }, []);
}
