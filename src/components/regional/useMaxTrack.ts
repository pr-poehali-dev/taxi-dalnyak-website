import { useEffect } from "react";

const MAX_SCRIPT = "https://max.tgtrack.ru/API/landing_script/v1/?linkID=a7cec2d2ae73f&type=ya&counterID=111028538";

export function useMaxTrack(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (document.querySelector(`script[src="${MAX_SCRIPT}"]`)) return;
    const s = document.createElement("script");
    s.src = MAX_SCRIPT;
    s.defer = true;
    document.head.appendChild(s);
  }, [enabled]);
}
