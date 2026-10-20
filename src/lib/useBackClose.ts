import { useEffect, useRef } from "react";

export function useBackClose(onClose: () => void) {
  const ref = useRef(onClose);
  ref.current = onClose;
  useEffect(() => {
    window.history.pushState({ overlay: true }, "");
    let closedByBack = false;
    const onPop = () => {
      closedByBack = true;
      ref.current();
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      if (!closedByBack && window.history.state?.overlay) window.history.back();
    };
  }, []);
}
