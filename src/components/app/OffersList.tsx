import { useState } from "react";
import Icon from "@/components/ui/icon";
import { appCall } from "@/lib/appApi";

export interface Offer {
  id: number; driver_id: number; eta_minutes: number | null; note: string | null; created_at: string;
  driver_name: string; car_model: string | null; car_color: string | null; car_year: number | null;
  plate_hint: string | null; has_photo: boolean; rating: number | null; trips_done: number; features: string[];
}

function Photo({ offer, token }: { offer: Offer; token: string }) {
  const [src, setSrc] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [big, setBig] = useState(false);
  if (!offer.has_photo) {
    return <span className="flex h-20 w-24 shrink-0 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400"><Icon name="Car" size={28} /></span>;
  }
  const load = async () => {
    if (src) { setBig(true); return; }
    setBusy(true);
    try {
      const r = await appCall<{ image: string }>("client_offer_photo", { offer_id: offer.id }, token);
      setSrc(r.image);
    } catch { /* ignore */ } finally { setBusy(false); }
  };
  return (
    <>
      <button type="button" onClick={load} className="relative flex h-20 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-neutral-100">
        {src ? <img src={src} alt={offer.car_model || "Машина"} className="h-full w-full object-cover" />
          : <span className="flex flex-col items-center text-[10px] font-bold text-neutral-500">
              <Icon name={busy ? "Loader2" : "Camera"} size={20} className={busy ? "animate-spin" : ""} />Фото машины
            </span>}
      </button>
      {big && src && (
        <div className="fixed inset-0 z-[4000] flex items-center justify-center bg-black/80 p-4" onClick={() => setBig(false)}>
          <img src={src} alt="" className="max-h-full max-w-full rounded-2xl" />
        </div>
      )}
    </>
  );
}

export default function OffersList({ tripId, wish, offers, token, onChosen }: {
  tripId: number; wish?: string | null; offers: Offer[]; token: string; onChosen: () => void;
}) {
  const [busy, setBusy] = useState<number | null>(null);
  const [err, setErr] = useState("");

  const choose = async (o: Offer) => {
    if (!window.confirm(`Выбрать ${o.driver_name}, ${o.car_model}?`)) return;
    setBusy(o.id); setErr("");
    try {
      await appCall("client_choose_offer", { trip_id: tripId, offer_id: o.id }, token);
      onChosen();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="space-y-3">
      {wish && (
        <div className="rounded-2xl bg-amber-50 p-3 text-sm">
          <div className="text-xs font-bold uppercase text-amber-700">Ваше пожелание</div>
          <div className="font-bold text-neutral-900">{wish}</div>
        </div>
      )}
      {err && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-600">{err}</p>}
      {offers.length === 0 ? (
        <div className="flex items-center gap-3 rounded-3xl bg-neutral-50 p-4">
          <span className="relative flex h-10 w-10 shrink-0 items-center justify-center">
            <span className="absolute h-10 w-10 animate-ping rounded-full bg-amber-300/50" />
            <span className="relative flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 text-white"><Icon name="Radio" size={18} /></span>
          </span>
          <div className="text-sm">
            <div className="font-extrabold">Водители смотрят ваш заказ</div>
            <div className="text-neutral-500">Отклики появятся здесь. Мы пришлём уведомление</div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold">Откликнулись водители · {offers.length}</h3>
            <span className="text-xs text-neutral-500">Выберите одного</span>
          </div>
          {offers.map((o) => {
            const car = [o.car_color, o.car_model].filter(Boolean).join(" ");
            return (
              <div key={o.id} className="rounded-3xl bg-white p-3 shadow-sm ring-1 ring-neutral-100">
                <div className="flex gap-3">
                  <Photo offer={o} token={token} />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-base font-extrabold">{car || "Автомобиль"}{o.car_year ? `, ${o.car_year}` : ""}</div>
                    <div className="mt-0.5 flex items-center gap-1.5 text-sm">
                      <span className="font-bold">{o.driver_name}</span>
                      {o.rating ? <span className="flex items-center gap-0.5 font-bold text-amber-600"><Icon name="Star" size={13} />{Number(o.rating).toFixed(1)}</span> : <span className="rounded-full bg-sky-50 px-1.5 text-[10px] font-bold text-sky-700">новый</span>}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {o.trips_done} поездок{o.eta_minutes ? ` · подача через ${o.eta_minutes} мин` : ""}{o.plate_hint ? ` · ${o.plate_hint}` : ""}
                    </div>
                  </div>
                </div>
                {o.features.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {o.features.map((f) => <span key={f} className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-800">{f}</span>)}
                  </div>
                )}
                {o.note && <div className="mt-2 rounded-xl bg-neutral-50 px-3 py-2 text-sm text-neutral-700">«{o.note}»</div>}
                <button onClick={() => choose(o)} disabled={busy !== null}
                  className="mt-3 w-full rounded-2xl bg-neutral-900 py-3 text-[15px] font-extrabold text-white disabled:opacity-50">
                  {busy === o.id ? "Выбираем..." : "Выбрать этого водителя"}
                </button>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
