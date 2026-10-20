import { useCallback, useState } from "react";

export function useReadMap(role: string) {
  const key = `app_read_${role}`;
  const [read, setRead] = useState<Record<number, number>>(() => {
    try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch { return {}; }
  });
  const mark = useCallback((tripId: number, msgId: number) => {
    setRead((m) => {
      if ((m[tripId] || 0) >= msgId) return m;
      const n = { ...m, [tripId]: msgId };
      localStorage.setItem(key, JSON.stringify(n));
      return n;
    });
  }, [key]);
  return { read, mark };
}
