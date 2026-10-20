import { useRef } from "react";
import { pushNotify } from "./notify";

interface Chatty { id: number; last_msg_id?: number | null; last_msg_role?: string | null }

export function useChatAlert(myRole: string, text: string) {
  const seen = useRef<Map<number, number>>(new Map());
  const first = useRef(true);
  return (trips: Chatty[]) => {
    let alert = false;
    trips.forEach((t) => {
      const last = t.last_msg_id || 0;
      const prev = seen.current.get(t.id) || 0;
      if (!first.current && last > prev && t.last_msg_role && t.last_msg_role !== myRole) alert = true;
      seen.current.set(t.id, last);
    });
    first.current = false;
    if (alert) pushNotify(text);
  };
}
