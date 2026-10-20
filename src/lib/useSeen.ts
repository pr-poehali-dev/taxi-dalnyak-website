import { useRef } from "react";

export function useSeen() {
  const ref = useRef<Map<string, Set<string>>>(new Map());
  return (group: string, ids: (string | number)[]): string[] => {
    const strs = ids.map(String);
    const first = !ref.current.has(group);
    const set = ref.current.get(group) || new Set<string>();
    const fresh = strs.filter((i) => !set.has(i));
    strs.forEach((i) => set.add(i));
    ref.current.set(group, set);
    return first ? [] : fresh;
  };
}
