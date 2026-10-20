import { useEffect, useRef } from "react";

interface Entry { close: () => void; byBack: boolean }

const stack: Entry[] = [];
let depth = 0;
let ignoring = false;
let ignoreUntil = 0;
let bound = false;

function onPop() {
  if (ignoring && Date.now() < ignoreUntil) {
    ignoring = false;
    return;
  }
  ignoring = false;
  if (depth > 0) depth -= 1;
  const top = stack[stack.length - 1];
  if (top) {
    top.byBack = true;
    top.close();
  }
}

function release() {
  if (stack.length === 0 && depth > 0) {
    const n = depth;
    depth = 0;
    ignoring = true;
    ignoreUntil = Date.now() + 700;
    window.history.go(-n);
  }
}

export function useBackClose(onClose: () => void) {
  const ref = useRef(onClose);
  ref.current = onClose;
  useEffect(() => {
    if (!bound) {
      window.addEventListener("popstate", onPop);
      bound = true;
    }
    const entry: Entry = { close: () => ref.current(), byBack: false };
    stack.push(entry);
    window.history.pushState({ overlay: true }, "");
    depth += 1;
    return () => {
      const i = stack.indexOf(entry);
      if (i >= 0) stack.splice(i, 1);
      window.setTimeout(release, 0);
    };
  }, []);
}
