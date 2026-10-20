import { useCallback, useEffect, useState } from "react";
import { appCall, TRIP_STATUS, money } from "@/lib/appApi";
import { useAppSession } from "@/lib/useAppSession";
import { usePoll } from "@/lib/usePoll";
import AppMap, { MapPoint } from "@/components/app/AppMap";
import PhoneLogin from "@/components/app/PhoneLogin";
import { Badge, Btn, Field, Shell, tripTone } from "@/components/app/ui";
import Icon from "@/components/ui/icon";

const DEFAULT_CENTER: [number, number] = [55.751, 37.618];

interface Trip {
  id: number;
  from_text: string;
  to_text: string;
  status: string;
  price: number | null;
  driver_name: string | null;
  driver_phone: string | null;
  car_model: string | null;
  car_plate: string | null;
  car_color: string | null;
  driver_lat: number | null;
  driver_lng: number | null;
  created_at: string;
}

async function reverse(lat: number, lng: number) {
  try {
    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&accept-language=ru&lat=${lat}&lon=${lng}`);
    const j = await r.json();
    const a = j.address || {};
    const street = [a.road, a.house_number].filter(Boolean).join(", ");
    return [a.city || a.town || a.village, street].filter(Boolean).join(", ") || j.display_name || "";
  } catch {
    return "";
  }
}

export default function AppClient() {
  const { token, setToken } = useAppSession("client");
  const [pos, setPos] = useState<[number, number] | null>(null);
  const [gpsErr, setGpsErr] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [comment, setComment] = useState("");
  const [price, setPrice] = useState("");
  const [active, setActive] = useState<Trip | null>(null);
  const [history, setHistory] = useState<Trip[]>([]);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const locate = useCallback(() => {
    setGpsErr("");
    if (!navigator.geolocation) {
      setGpsErr("Ваш браузер не поддерживает определение местоположения");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        const c: [number, number] = [p.coords.latitude, p.coords.longitude];
        setPos(c);
        const addr = await reverse(c[0], c[1]);
        setFrom((cur) => cur || addr || "Моё местоположение");
      },
      () => setGpsErr("Разрешите доступ к местоположению, чтобы водитель нашёл вас точно"),
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }, []);

  useEffect(() => {
    if (token) locate();
  }, [token, locate]);

  const refresh = useCallback(async () => {
    const r = await appCall<{ active: Trip | null; history: Trip[] }>("client_my_trip", {}, token);
    setActive(r.active);
    setHistory(r.history);
  }, [token]);

  usePoll(refresh, 4000, !!token, () => setToken(null));

  const order = async () => {
    setBusy(true);
    setErr("");
    try {
      await appCall("client_create_trip", {
        from_text: from, from_lat: pos?.[0], from_lng: pos?.[1], to_text: to, comment, price: price || null,
      }, token);
      setTo("");
      setComment("");
      await refresh();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const cancel = async () => {
    if (!active) return;
    await appCall("client_cancel_trip", { trip_id: active.id }, token).catch((e) => setErr(e.message));
    refresh();
  };

  if (!token) {
    return (
      <Shell title="Такси Дальняк">
        <PhoneLogin action="client_login" withName hint="Укажите имя и номер, чтобы водитель мог с вами связаться." onToken={setToken} />
      </Shell>
    );
  }

  const points: MapPoint[] = [];
  if (pos) points.push({ lat: pos[0], lng: pos[1], color: "#2563eb", label: "Вы" });
  if (active?.driver_lat && active?.driver_lng) points.push({ lat: active.driver_lat, lng: active.driver_lng, color: "#f59e0b", label: "Водитель" });

  return (
    <Shell title="Такси Дальняк" onLogout={() => setToken(null)}>
      <div className="relative">
        <AppMap center={pos || DEFAULT_CENTER} points={points} className="h-[46vh] w-full" />
        <button onClick={locate} aria-label="Моё местоположение"
          className="absolute right-3 top-3 z-[500] flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg">
          <Icon name="Crosshair" size={20} />
        </button>
      </div>

      <div className="relative z-[600] -mt-5 rounded-t-3xl bg-white p-5 shadow-[0_-8px_30px_rgba(0,0,0,0.08)]">
        {gpsErr && (
          <div className="mb-3 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-800">
            {gpsErr}
            <button onClick={locate} className="ml-2 underline">Разрешить</button>
          </div>
        )}

        {active ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold">Заказ №{active.id}</h2>
              <Badge tone={tripTone(active.status)}>{TRIP_STATUS[active.status]}</Badge>
            </div>
            <div className="rounded-2xl bg-neutral-100 p-3 text-sm">
              <div><b>Откуда:</b> {active.from_text || "по GPS"}</div>
              <div><b>Куда:</b> {active.to_text}</div>
              {active.price ? <div><b>Цена:</b> {money(active.price)}</div> : null}
            </div>
            {active.status === "new" && (
              <p className="flex items-center gap-2 text-sm font-semibold text-neutral-600">
                <Icon name="Loader" size={16} className="animate-spin" /> Диспетчер и водители уже видят заказ
              </p>
            )}
            {active.driver_name && (
              <div className="rounded-2xl border border-neutral-200 p-3">
                <div className="font-extrabold">{active.driver_name}</div>
                <div className="text-sm text-neutral-600">{[active.car_color, active.car_model, active.car_plate].filter(Boolean).join(" · ")}</div>
                {active.driver_phone && (
                  <a href={`tel:${active.driver_phone}`} className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#fcd34d] py-3 font-bold">
                    <Icon name="Phone" size={18} /> Позвонить водителю
                  </a>
                )}
              </div>
            )}
            {["new", "assigned", "arrived"].includes(active.status) && <Btn kind="danger" onClick={cancel} className="w-full">Отменить заказ</Btn>}
          </div>
        ) : (
          <div className="space-y-3">
            <Field label="Откуда" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Определяем адрес..." />
            <Field label="Куда" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Город или адрес назначения" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ваша цена, ₽" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))} placeholder="по желанию" />
              <Field label="Комментарий" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="багаж, дети" />
            </div>
            {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
            <Btn onClick={order} disabled={busy || !to.trim()} className="w-full text-lg">{busy ? "Отправляем..." : "Заказать такси"}</Btn>
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-6">
            <h3 className="mb-2 text-sm font-extrabold uppercase text-neutral-400">История</h3>
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded-2xl bg-neutral-50 p-3 text-sm">
                  <span className="font-semibold">{h.to_text}</span>
                  <Badge tone={tripTone(h.status)}>{TRIP_STATUS[h.status]}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
