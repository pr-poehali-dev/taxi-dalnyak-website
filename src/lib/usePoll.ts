import { useEffect, useRef } from "react";
import { AppApiError } from "./appApi";

export function usePoll(fn: () => Promise<void>, ms: number, active: boolean, onAuthFail: () => void, pollHidden = false) {
  const fnRef = useRef(fn);
  const failRef = useRef(onAuthFail);
  fnRef.current = fn;
  failRef.current = onAuthFail;

  useEffect(() => {
    if (!active) return;
    let stop = false;
    let timer: number | undefined;
    let fails = 0;
    const tick = async () => {
      if (stop) return;
      if (document.hidden && !pollHidden) { timer = window.setTimeout(tick, ms); return; }
      try {
        await fnRef.current();
        fails = 0;
      } catch (e) {
        if (e instanceof AppApiError && e.code === 401) failRef.current();
        fails += 1;
      }
      if (!stop) timer = window.setTimeout(tick, ms * Math.min(8, 2 ** Math.min(fails, 3)));
    };
    const onShow = () => {
      if (!document.hidden && !stop) {
        window.clearTimeout(timer);
        tick();
      }
    };
    tick();
    document.addEventListener("visibilitychange", onShow);
    return () => {
      stop = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onShow);
    };
  }, [ms, active, pollHidden]);
}
