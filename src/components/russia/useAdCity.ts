import { useEffect, useState } from "react";
import { findCitiesSmart } from "@/lib/cityMatch";

export interface AdCity {
  from: string | null;
  to: string | null;
  utm: { source: string; medium: string; campaign: string; term: string; content: string };
}

const KEY = "ru_ad_city";
const FIX: Record<string, string> = { "Ростов": "Ростов-на-Дону" };
const fix = (c: string | null | undefined) => (c ? FIX[c] ?? c : null);

/** Город и маршрут из рекламы: ключевая фраза (utm_term) или регион показа (?city={region_name}). */
export function useAdCity(): AdCity {
  const [state, setState] = useState<AdCity>({
    from: null,
    to: null,
    utm: { source: "direct", medium: "none", campaign: "none", term: "", content: "none" },
  });

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const term = p.get("utm_term") || p.get("keyword") || "";
    const fromTerm = findCitiesSmart(term).map((c) => fix(c) as string);
    const region = p.get("city") || p.get("region") || "";
    const fromRegion = region ? fix(findCitiesSmart(region)[0]) : null;

    let from = fromTerm[0] ?? fromRegion ?? null;
    let to = fromTerm[1] ?? null;
    if (fromTerm.length === 1 && fromRegion && fromRegion !== fromTerm[0] && /\b(в|до)\s/i.test(term)) {
      from = fromRegion;
      to = fromTerm[0];
    }
    try {
      if (from) sessionStorage.setItem(KEY, JSON.stringify({ from, to }));
      else {
        const saved = JSON.parse(sessionStorage.getItem(KEY) || "null");
        if (saved?.from) { from = saved.from; to = saved.to ?? null; }
      }
    } catch { /* ignore */ }

    setState({
      from,
      to,
      utm: {
        source: p.get("utm_source") || "direct",
        medium: p.get("utm_medium") || "none",
        campaign: p.get("utm_campaign") || "none",
        term,
        content: p.get("utm_content") || "none",
      },
    });
  }, []);

  return state;
}
