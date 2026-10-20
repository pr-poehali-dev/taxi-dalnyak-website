import { useCallback, useState } from "react";
import type { Role } from "./appApi";

export function useAppSession(role: Role) {
  const key = `app_token_${role}`;
  const [token, setTokenState] = useState<string | null>(() => localStorage.getItem(key));
  const setToken = useCallback((t: string | null) => {
    if (t) localStorage.setItem(key, t);
    else localStorage.removeItem(key);
    setTokenState(t);
  }, [key]);
  return { token, setToken };
}
