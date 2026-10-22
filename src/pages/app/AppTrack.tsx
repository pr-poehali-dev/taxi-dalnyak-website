import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { appCall } from "@/lib/appApi";
import { usePoll } from "@/lib/usePoll";
import AppMap, { MapPoint } from "@/components/app/AppMap";
import { humanMinutes, etaMinutes, useNow } from "@/components/app/Countdown";
import { TRIP_STATUS, whenText } from "@/lib/appApi";

interface Track {
  status: string; from_text?: string; to_text?: string; from_lat?: number; from_lng?: number; to_lat?: number; to_lng?: number;
  eta_at?: string | null; scheduled_at?: string | null; driver_name?: string | null; car_model?: string | null;
  car_plate?: string | null; car_color?: string | null; driver_lat?: number | null; driver_lng?: number | null;
}

export default function AppTrack() {
  const { token } = useParams();
  const [d, setD] = useState<Track | null>(null);
  const [bad, setBad] = useState(false);
  const now = useNow();

  const load = useCallback(async () => {
    try { setD(await appCall<Track>("track", { token })); setBad(false); } catch { setBad(true); }
  }, [token]);

  usePoll(load, 8000, true, () => undefined);

  const points: MapPoint[] = [];
  if (d?.from_lat && d.from_lng) points.push({ lat: d.from_lat, lng: d.from_lng, color: "#2563eb", label: "Подача" });
  if (d?.to_lat && d.to_lng && d.status === "in_progress") points.push({ lat: d.to_lat, lng: d.to_lng, color: "#171717", label: "Назначение" });
  if (d?.driver_lat && d.driver_lng) points.push({ lat: d.driver_lat, lng: d.driver_lng, color: "#f59e0b", label: "Машина" });
  const eta = d?.status === "assigned" || d?.status === "enroute" ? etaMinutes(d?.eta_at, now) : null;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900" style={{ fontFamily: "Manrope, sans-serif" }}>
      <meta name="robots" content="noindex, nofollow" />
      <header className="flex items-center gap-3 bg-black px-4 py-3">
        <img src="/logo-dalnyak-s.webp" alt="Такси Дальняк" className="h-9 w-auto" />
        <span className="font-extrabold text-white">Отслеживание поездки</span>
      </header>
      {bad && <p className="p-8 text-center text-neutral-500">Ссылка недействительна или поездка уже завершена.</p>}
      {d && (d.status === "done" || d.status === "cancelled") && (
        <p className="p-8 text-center text-lg font-extrabold">{d.status === "done" ? "Поездка завершена" : "Поездка отменена"}</p>
      )}
      {d && d.from_text && (
        <>
          <AppMap center={[55.75, 37.62]} points={points} className="h-[55vh] w-full" />
          <div className="space-y-3 p-4">
            <div className="text-xl font-extrabold">{TRIP_STATUS[d.status]}{d.scheduled_at && d.status === "new" ? ` · ${whenText(d.scheduled_at)}` : ""}</div>
            {eta !== null && <div className="rounded-2xl bg-[#fcd34d] p-3 font-extrabold">Машина приедет через {humanMinutes(eta)}</div>}
            {d.driver_name && (
              <div className="rounded-2xl bg-white p-3 shadow-sm">
                <div className="font-extrabold">{[d.car_color, d.car_model].filter(Boolean).join(" ")}</div>
                <div className="mt-1 inline-block rounded-md border border-neutral-300 px-2 py-0.5 font-extrabold tracking-wider">{d.car_plate}</div>
                <div className="mt-1 text-sm text-neutral-500">Водитель {d.driver_name}</div>
              </div>
            )}
            <div className="rounded-2xl bg-white p-3 text-sm shadow-sm">
              <div><b>Откуда:</b> {d.from_text}</div>
              <div><b>Куда:</b> {d.to_text}</div>
            </div>
            {!d.driver_lat && d.status !== "new" && <p className="text-sm text-neutral-500">Машина появится на карте, когда водитель выедет.</p>}
          </div>
        </>
      )}
    </div>
  );
}
