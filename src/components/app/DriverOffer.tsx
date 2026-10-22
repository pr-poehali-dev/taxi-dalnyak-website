import { useState } from "react";
import Icon from "@/components/ui/icon";
import { appCall } from "@/lib/appApi";
import { Btn } from "./ui";

export const CAR_FEATURES: [string, string][] = [
  ["ac", "Кондиционер"], ["big_trunk", "Большой багажник"], ["child_seat", "Детское кресло"], ["pets", "Можно с животными"],
  ["offroad", "Повышенная проходимость"], ["lying", "Можно перевезти лежачего"], ["no_smoke", "Не курят в салоне"],
  ["usb", "Зарядка для телефона"], ["wifi", "Wi-Fi в салоне"],
];

export function DriverWish({ wish }: { wish: string }) {
  return (
    <div className="rounded-2xl bg-amber-50 p-3 ring-1 ring-amber-200">
      <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase text-amber-700"><Icon name="Sparkles" size={14} /> Пассажир хочет</div>
      <div className="mt-0.5 font-bold text-neutral-900">{wish}</div>
      <div className="mt-1 text-xs text-amber-800">Пассажир сам выберет водителя из откликнувшихся</div>
    </div>
  );
}

export default function DriverOffer({ tripId, preorder, myOffer, offersCount, token, onDone }: {
  tripId: number; preorder: boolean; myOffer?: string | null; offersCount?: number; token: string; onDone: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [eta, setEta] = useState<number | null>(preorder ? null : 20);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const send = async () => {
    setBusy(true); setErr("");
    try {
      await appCall("driver_offer", { trip_id: tripId, ...(eta ? { eta_minutes: eta } : {}), note }, token);
      setOpen(false);
      onDone();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async () => {
    setBusy(true);
    try { await appCall("driver_offer_withdraw", { trip_id: tripId }, token); onDone(); } finally { setBusy(false); }
  };

  if (myOffer === "active") {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-50 p-3 text-sm font-bold text-emerald-800">
          <Icon name="CircleCheck" size={18} /> Вы откликнулись. Ждём выбор пассажира{offersCount ? ` · откликов: ${offersCount}` : ""}
        </div>
        <button onClick={withdraw} disabled={busy} className="w-full text-center text-sm font-semibold text-neutral-500">Отозвать отклик</button>
      </div>
    );
  }
  if (myOffer === "lost") {
    return <div className="rounded-2xl bg-neutral-100 p-3 text-center text-sm font-semibold text-neutral-500">Пассажир выбрал другого водителя</div>;
  }

  if (!open) {
    return (
      <Btn onClick={() => setOpen(true)} className="w-full">
        Предложить свою машину{offersCount ? ` · уже ${offersCount}` : ""}
      </Btn>
    );
  }

  return (
    <div className="space-y-3 rounded-2xl bg-neutral-50 p-3">
      {err && <p className="rounded-xl bg-red-50 p-2 text-sm font-semibold text-red-600">{err}</p>}
      {!preorder && (
        <div>
          <div className="mb-1.5 text-sm font-extrabold">Через сколько приедете?</div>
          <div className="grid grid-cols-4 gap-2">
            {[10, 20, 30, 60].map((m) => (
              <button key={m} onClick={() => setEta(m)} className={`rounded-xl py-2.5 text-sm font-extrabold ${eta === m ? "bg-neutral-900 text-white" : "bg-white text-neutral-900"}`}>{m} мин</button>
            ))}
          </div>
        </div>
      )}
      <div>
        <div className="mb-1.5 text-sm font-extrabold">Пару слов пассажиру</div>
        <textarea value={note} onChange={(e) => setNote(e.target.value.slice(0, 200))} rows={2}
          placeholder="Например: Камри 2022, чистый салон, багажник свободный. Помогу с вещами"
          className="w-full resize-none rounded-xl bg-white px-3 py-2 text-sm font-semibold text-neutral-900 outline-none ring-1 ring-neutral-200" />
        <p className="mt-1 text-[11px] text-neutral-500">Не пишите телефон — он будет скрыт. Хороший комментарий повышает шанс, что выберут вас</p>
      </div>
      <Btn onClick={send} disabled={busy || (!preorder && !eta)} className="w-full">{busy ? "Отправляем..." : "Откликнуться"}</Btn>
      <button onClick={() => setOpen(false)} className="w-full text-center text-sm font-semibold text-neutral-500">Отмена</button>
    </div>
  );
}

export function CarFeaturesEditor({ initial, year, token, onSaved }: { initial: string[]; year: number | null; token: string; onSaved: () => void }) {
  const [sel, setSel] = useState<string[]>(initial);
  const [y, setY] = useState(year ? String(year) : "");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const toggle = (k: string) => setSel(sel.includes(k) ? sel.filter((x) => x !== k) : [...sel, k]);
  const save = async () => {
    setBusy(true);
    try {
      await appCall("driver_set_car", { features: sel, car_year: y }, token);
      setOk(true); onSaved();
      window.setTimeout(() => setOk(false), 2500);
    } finally { setBusy(false); }
  };
  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <h3 className="font-extrabold">Моя машина для пассажиров</h3>
      <p className="mb-3 text-sm text-neutral-500">Это видят пассажиры, когда сами выбирают водителя. Чем подробнее, тем чаще выбирают вас</p>
      <label className="mb-3 block text-sm font-bold">Год выпуска
        <input value={y} onChange={(e) => setY(e.target.value.replace(/\D/g, "").slice(0, 4))} inputMode="numeric" placeholder="2020"
          className="mt-1 block w-full rounded-xl bg-neutral-100 px-3 py-2.5 font-bold outline-none" />
      </label>
      <div className="flex flex-wrap gap-1.5">
        {CAR_FEATURES.map(([k, l]) => (
          <button key={k} onClick={() => toggle(k)}
            className={`rounded-full px-3 py-1.5 text-xs font-bold ${sel.includes(k) ? "bg-emerald-600 text-white" : "bg-neutral-100 text-neutral-700"}`}>
            {sel.includes(k) ? "✓ " : ""}{l}
          </button>
        ))}
      </div>
      <Btn kind="dark" onClick={save} disabled={busy} className="mt-3 w-full">{ok ? "Сохранено" : busy ? "Сохраняем..." : "Сохранить"}</Btn>
    </div>
  );
}
