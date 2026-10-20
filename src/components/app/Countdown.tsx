import { useEffect, useState } from "react";

export function etaMinutes(eta: string | null | undefined, now: number) {
  if (!eta) return null;
  return Math.max(0, Math.ceil((new Date(eta).getTime() - now) / 60000));
}

export function useNow(ms = 15000) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

export function humanMinutes(m: number) {
  if (m <= 0) return "прибывает";
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h && r) return `${h} ч ${r} мин`;
  if (h) return `${h} ч`;
  return `${r} мин`;
}
