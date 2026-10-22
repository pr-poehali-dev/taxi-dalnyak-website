import { useCallback, useState } from "react";
import { appCall, TARIFF_NAME } from "@/lib/appApi";
import { usePoll } from "@/lib/usePoll";
import AppMap, { MapPoint } from "./AppMap";
import Icon from "@/components/ui/icon";

export interface Car {
  id: number; callsign: string | null; lat: number; lng: number; status: "free" | "busy" | "offline"; tariff: string;
  virtual?: boolean; name?: string; car_model?: string; car_plate?: string; city?: string | null; loc_ago?: number | null;
}

export const CAR_COLOR: Record<string, string> = { free: "#16a34a", busy: "#f59e0b", offline: "#9ca3af" };
export const CAR_STATUS: Record<string, string> = { free: "Свободен", busy: "На заказе", offline: "Не на линии" };

function ago(s?: number | null) {
  if (s == null) return "";
  if (s < 90) return "только что";
  if (s < 3600) return `${Math.round(s / 60)} мин назад`;
  return `${Math.round(s / 3600)} ч назад`;
}

export default function FleetMap({ token }: { token: string }) {
  const [cars, setCars] = useState<Car[]>([]);
  const [filter, setFilter] = useState<"all" | "free" | "busy">("all");
  const [fly, setFly] = useState<{ lat: number; lng: number; n: number; zoom?: number } | null>(null);

  const load = useCallback(async () => {
    const r = await appCall<{ cars: Car[] }>("disp_map", {}, token);
    setCars(r.cars);
  }, [token]);
  usePoll(load, 8000, true, () => undefined);

  const shown = cars.filter((c) => filter === "all" || c.status === filter);
  const points: MapPoint[] = shown.map((c) => ({ lat: c.lat, lng: c.lng, color: c.virtual ? (c.status === "free" ? "#86efac" : "#fcd34d") : CAR_COLOR[c.status], label: c.callsign ? `№${c.callsign}` : c.name || "", car: true }));
  const real = cars.filter((c) => !c.virtual);
  const count = (s: string) => cars.filter((c) => c.status === s).length;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <AppMap center={[52.5, 38.5]} points={points} fitKey={`${filter}-${shown.length > 0}`} fitMaxZoom={8} fly={fly} className="h-[60vh] w-full" />
        <div className="flex flex-wrap items-center gap-2 p-3 text-xs font-bold">
          {([["all", `Все (${cars.length})`], ["free", `Свободны (${count("free")})`], ["busy", `На заказе (${count("busy")})`]] as const).map(([k, l]) => (
            <button key={k} onClick={() => setFilter(k)} className={`rounded-full px-3 py-1.5 ${filter === k ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3 px-1 text-xs text-neutral-500">
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-[#16a34a]" />свободен</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-[#f59e0b]" />на заказе</span>
        <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-[#9ca3af]" />не на линии</span>
      </div>

      <div className="rounded-3xl bg-white p-4 shadow-sm">
        <div className="mb-2 text-xs font-bold uppercase text-neutral-400">Водители на карте ({real.length})</div>
        {real.length === 0 && <p className="text-sm text-neutral-500">Пока никто из водителей не передавал координаты. Они появятся, когда водитель откроет приложение и выйдет на линию.</p>}
        {real.map((c) => (
          <button key={c.id} onClick={() => setFly({ lat: c.lat, lng: c.lng, n: Date.now(), zoom: 13 })} className="flex w-full items-center gap-3 border-b border-neutral-100 py-2.5 text-left last:border-0">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: CAR_COLOR[c.status] }}><Icon name="Car" size={18} /></span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="block font-extrabold">{c.callsign && <span className="mr-1.5 rounded bg-neutral-900 px-1 text-[#fcd34d]">№{c.callsign}</span>}{c.name}</span>
              <span className="block truncate text-xs text-neutral-500">{c.car_model} {c.car_plate} · {TARIFF_NAME[c.tariff]} · {c.city || "город не определён"} · {ago(c.loc_ago)}</span>
            </span>
            <span className="text-xs font-extrabold" style={{ color: CAR_COLOR[c.status] }}>{CAR_STATUS[c.status]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
