import { useMemo, useRef, useState } from "react";
import AppMap, { MapPoint } from "./AppMap";
import { Badge } from "./ui";
import { money } from "@/lib/appApi";

export interface FleetDriver {
  id: number; name: string; phone: string; car_model: string; car_plate: string; status: string; online: boolean; busy: boolean;
  tariffs: string[]; loc_city: string | null; lat: number | null; lng: number | null; seen_ago: number | null; wants_line: boolean;
  online_today_sec: number; online_week_sec: number; balance: number;
}

export function ago(sec: number | null) {
  if (sec === null || sec === undefined) return "не заходил";
  if (sec < 90) return "только что";
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} мин назад`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h} ч назад`;
  return `${Math.floor(h / 24)} дн. назад`;
}

export function dur(sec: number) {
  const m = Math.round(sec / 60);
  if (m < 60) return `${m} мин`;
  return `${Math.floor(m / 60)} ч ${m % 60} мин`;
}

type Filter = "all" | "online" | "offline" | "busy";

const RU_CENTER: [number, number] = [55.75, 37.62];

export default function FleetTab({ drivers }: { drivers: FleetDriver[] }) {
  const [f, setF] = useState<Filter>("all");
  const [focus, setFocus] = useState<{ id: number; lat: number; lng: number; n: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const active = drivers.filter((d) => d.status === "approved");
  const online = active.filter((d) => d.online);
  const busy = online.filter((d) => d.busy);
  const free = online.filter((d) => !d.busy);
  const offline = active.filter((d) => !d.online);

  const list = (f === "online" ? free : f === "busy" ? busy : f === "offline" ? offline : active)
    .slice().sort((a, b) => Number(b.online) - Number(a.online) || (a.seen_ago ?? 9e9) - (b.seen_ago ?? 9e9));

  const located = active.filter((d) => d.lat !== null && d.lng !== null);
  const shown = f === "all" ? located : located.filter((d) => list.includes(d));
  const points: MapPoint[] = useMemo(() => shown.map((d) => ({
    lat: d.lat as number, lng: d.lng as number,
    color: !d.online ? "#a3a3a3" : d.busy ? "#0ea5e9" : "#10b981",
    label: d.id === focus?.id ? `${d.name} · ${d.car_plate}` : d.name.split(" ")[0],
  })), [shown.map((d) => `${d.id}:${d.lat}:${d.lng}:${d.online}:${d.busy}`).join("|"), focus?.id]);
  const fitKey = `${f}:${shown.map((d) => d.id).join(",")}`;

  const showOnMap = (d: FleetDriver) => {
    if (d.lat === null || d.lng === null) return;
    setFocus({ id: d.id, lat: d.lat, lng: d.lng, n: Date.now() });
    mapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const byCity = new Map<string, number>();
  online.forEach((d) => byCity.set(d.loc_city || "Город не определён", (byCity.get(d.loc_city || "Город не определён") || 0) + 1));

  const Tile = ({ id, n, label, color }: { id: Filter; n: number; label: string; color: string }) => (
    <button onClick={() => setF(id)} className={`rounded-2xl p-3 text-center ring-2 ${f === id ? "ring-neutral-900" : "ring-transparent"} ${color}`}>
      <div className="text-2xl font-extrabold text-neutral-900">{n}</div>
      <div className="text-xs font-bold text-neutral-600">{label}</div>
    </button>
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-2">
        <Tile id="all" n={active.length} label="Всего" color="bg-white" />
        <Tile id="online" n={free.length} label="Свободны" color="bg-emerald-100" />
        <Tile id="busy" n={busy.length} label="На заказе" color="bg-sky-100" />
        <Tile id="offline" n={offline.length} label="Не в сети" color="bg-neutral-200" />
      </div>

      <div ref={mapRef} className="scroll-mt-20 overflow-hidden rounded-3xl bg-white shadow-sm">
        <div className="relative">
          <AppMap center={RU_CENTER} points={points} className="h-[46vh] w-full" fitKey={fitKey} fitMaxZoom={11} fly={focus ? { lat: focus.lat, lng: focus.lng, n: focus.n, zoom: 12 } : null} />
          <div className="pointer-events-none absolute bottom-2 left-2 z-[500] flex gap-2 rounded-xl bg-white/95 px-2.5 py-1.5 text-[11px] font-bold shadow">
            <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-emerald-500" />Свободен</span>
            <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-sky-500" />На заказе</span>
            <span className="flex items-center gap-1"><i className="h-2.5 w-2.5 rounded-full bg-neutral-400" />Не в сети</span>
          </div>
        </div>
        {located.length === 0 && <p className="p-3 text-center text-sm text-neutral-500">Пока ни от одного водителя нет координат. Они появятся, когда водитель откроет приложение и разрешит геолокацию.</p>}
      </div>

      {byCity.size > 0 && (
        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-2 text-xs font-bold uppercase text-neutral-400">Где сейчас машины в сети</div>
          <div className="flex flex-wrap gap-2">
            {[...byCity.entries()].map(([c, n]) => <Badge key={c} tone="green">{c}: {n}</Badge>)}
          </div>
        </div>
      )}

      {list.length === 0 && <p className="rounded-3xl bg-white p-6 text-center text-neutral-500">Нет водителей в этой группе.</p>}
      {list.map((d) => (
        <div key={d.id} className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className={`h-3 w-3 rounded-full ${d.online ? (d.busy ? "bg-sky-500" : "bg-emerald-500") : "bg-neutral-300"}`} />
                <span className="font-extrabold">{d.name}</span>
              </div>
              <div className="text-sm text-neutral-500">{d.car_model} · {d.car_plate}</div>
              <a href={`tel:${d.phone}`} className="text-sm font-semibold text-sky-700">{d.phone}</a>
            </div>
            <div className="text-right">
              <Badge tone={d.online ? (d.busy ? "blue" : "green") : "gray"}>{d.online ? (d.busy ? "На заказе" : "Свободен") : "Не в сети"}</Badge>
              <div className="mt-1 text-xs text-neutral-500">{d.online ? "на связи" : `был ${ago(d.seen_ago)}`}</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-xl bg-neutral-50 p-2.5">
              <div className="text-xs text-neutral-400">Где находится</div>
              <div className="font-bold">{d.loc_city || (d.lat ? "Город уточняется" : "Нет GPS")}</div>
              {d.lat && d.lng && <button onClick={() => showOnMap(d)} className="text-xs font-bold text-sky-700 underline">Показать на карте</button>}
            </div>
            <div className="rounded-xl bg-neutral-50 p-2.5">
              <div className="text-xs text-neutral-400">В сети</div>
              <div className="font-bold">сегодня {dur(d.online_today_sec)}</div>
              <div className="text-xs text-neutral-500">за неделю {dur(d.online_week_sec)}</div>
            </div>
          </div>
          {!d.online && d.wants_line && <p className="mt-2 text-xs font-semibold text-amber-700">Включил «на линии», но приложение закрыто или нет связи</p>}
          <div className="mt-2 text-xs text-neutral-400">Баланс {money(d.balance)}</div>
        </div>
      ))}
    </div>
  );
}
