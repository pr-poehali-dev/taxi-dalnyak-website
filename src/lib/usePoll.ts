import { useEffect, useRef } from "react";
import { AppApiError } from "./appApi";

export function usePoll(fn: () => Promise<void>, ms: number, active: boolean, onAuthFail: () => void) {
  const fnRef = useRef(fn);
  const failRef = useRef(onAuthFail);
  fnRef.current = fn;
  failRef.current = onAuthFail;

  useEffect(() => {
    if (!active) return;
    let stop = false;
    const tick = async () => {
      try {
        await fnRef.current();
      } catch (e) {
        if (e instanceof AppApiError && e.code === 401) failRef.current();
      }
    };
    tick();
    const id = setInterval(() => !stop && tick(), ms);
    return () => {
      stop = true;
      clearInterval(id);
    };
  }, [ms, active]);
}
