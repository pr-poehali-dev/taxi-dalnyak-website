import { useCallback, useState } from "react";
import { useParams } from "react-router-dom";
import { appCall } from "@/lib/appApi";
import { usePoll } from "@/lib/usePoll";
import AppMap, { MapPoint } from "@/components/app/AppMap";
import { humanMinutes, etaMinutes, useNow } from "@/components/app/Countdown";
import { TRIP_STATUS, whenText } from "@/lib/appApi";
import Icon from "@/components/ui/icon";

interface Track {
  status: string; from_text?: string; to_text?: string; from_lat?: number; from_lng?: number; to_lat?: number; to_lng?: number;
  eta_at?: string | null; scheduled_at?: string | null; driver_name?: string | null; car_model?: string | null;
  car_plate?: string | null; car_color?: string | null; driver_lat?: number | null; driver_lng?: number | null;
  callsign?: string | null; driver_phone?: string | null; client_hint?: string;
}

const STEPS = ["new", "assigned", "enroute", "arrived", "in_progress", "done"];

function Invite({ hint }: { hint?: string }) {
  return (
    <div className="rounded-3xl bg-neutral-900 p-5 text-white">
      <div className="text-lg font-extrabold">В следующий раз закажите сами</div>
      <p className="mt-1 text-sm text-neutral-300">
        Мы уже создали вам аккаунт{hint ? ` на номер ${hint}` : ""}. Войдите по этому номеру: цена сразу, история поездок и бонусные километры за каждую поездку.
      </p>
      <a href="/app/client" className="mt-4 flex items-center justify-center gap-2 rounded-2xl bg-[#fcd34d] py-3.5 font-extrabold text-neutral-900">
        <Icon name="Smartphone" size={18} /> Открыть приложение
      </a>
    </div>
  );
}

export default function AppTrack() {
  const { token } = useParams();
  const [d, setD] = useState<Track | null>(null);
  const [bad, setBad] = useState(false);
  const now = useNow();

  const load = useCallback(async () => {
    try { setD(await appCall<Track>("track", { token })); setBad(false); } catch { setBad(true); }
  }, [token]);

  usePoll(load, 6000, true, () => undefined);

  const points: MapPoint[] = [];
  if (d?.from_lat && d.from_lng) points.push({ lat: d.from_lat, lng: d.from_lng, color: "#2563eb", label: "Подача" });
  if (d?.to_lat && d.to_lng && d.status === "in_progress") points.push({ lat: d.to_lat, lng: d.to_lng, color: "#171717", label: "Назначение" });
  if (d?.driver_lat && d.driver_lng) points.push({ lat: d.driver_lat, lng: d.driver_lng, color: "#f59e0b", label: d.callsign ? `Борт ${d.callsign}` : "Машина", car: true });
  const eta = d?.status === "assigned" || d?.status === "enroute" ? etaMinutes(d?.eta_at, now) : null;
  const stepIdx = STEPS.indexOf(d?.status || "");
  const finished = !!d && (d.status === "done" || d.status === "cancelled");

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900" style={{ fontFamily: "Manrope, sans-serif" }}>
      <meta name="robots" content="noindex, nofollow" />
      <header className="flex items-center gap-3 bg-black px-4 py-3">
        <img src="/logo-dalnyak-s.webp" alt="Такси Дальняк" className="h-9 w-auto" />
        <span className="font-extrabold text-white">Ваша поездка</span>
      </header>
      {bad && <p className="p-8 text-center text-neutral-500">Ссылка недействительна.</p>}
      {d && finished && (
        <div className="mx-auto max-w-md space-y-4 p-4">
          <p className="pt-6 text-center text-2xl font-extrabold">{d.status === "done" ? "Поездка завершена. Спасибо!" : "Поездка отменена"}</p>
          <Invite hint={d.client_hint} />
        </div>
      )}
      {d && d.from_text && !finished && (
        <div className="lg:flex">
          <AppMap center={[55.75, 37.62]} points={points} className="h-[50vh] w-full lg:order-2 lg:h-[calc(100vh-60px)] lg:flex-1" />
          <div className="space-y-3 p-4 lg:w-[420px]">
            <div className="text-2xl font-extrabold">{TRIP_STATUS[d.status]}{d.scheduled_at && d.status === "new" ? ` · ${whenText(d.scheduled_at)}` : ""}</div>
            <div className="flex gap-1">
              {STEPS.map((k, i) => <span key={k} className={`h-1.5 flex-1 rounded-full ${i <= stepIdx ? "bg-[#fcd34d]" : "bg-neutral-200"}`} />)}
            </div>
            {eta !== null && <div className="rounded-2xl bg-[#fcd34d] p-3 font-extrabold">Машина приедет через {humanMinutes(eta)}</div>}
            {d.status === "arrived" && <div className="rounded-2xl bg-emerald-500 p-3 font-extrabold text-white">Машина на месте и ждёт вас</div>}
            {d.driver_name && (
              <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold">{[d.car_color, d.car_model].filter(Boolean).join(" ")}</div>
                  <div className="mt-1 inline-block rounded-md border border-neutral-300 px-2 py-0.5 font-extrabold tracking-wider">{d.car_plate}</div>
                  <div className="mt-1 text-sm text-neutral-500">Водитель {d.driver_name}{d.callsign ? ` · борт ${d.callsign}` : ""}</div>
                </div>
                {d.driver_phone && <a data-no-goal href={`tel:${d.driver_phone}`} aria-label="Позвонить водителю" className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500 text-white"><Icon name="Phone" size={20} /></a>}
              </div>
            )}
            <div className="rounded-2xl bg-white p-3 text-sm shadow-sm">
              <div><b>Откуда:</b> {d.from_text}</div>
              <div><b>Куда:</b> {d.to_text}</div>
            </div>
            {!d.driver_lat && d.status !== "new" && <p className="text-sm text-neutral-500">Машина появится на карте, когда водитель выедет к вам.</p>}
            <Invite hint={d.client_hint} />
          </div>
        </div>
      )}
    </div>
  );
}
