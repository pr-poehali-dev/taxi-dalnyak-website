import { useState } from "react";
import { Btn } from "./ui";

export default function TakeOrder({ preorder, onTake }: { preorder: boolean; onTake: (eta: number | null) => void }) {
  const [open, setOpen] = useState(false);
  const [custom, setCustom] = useState("");
  const [busy, setBusy] = useState(false);

  const go = (m: number | null) => {
    if (busy) return;
    setBusy(true);
    onTake(m);
    window.setTimeout(() => setBusy(false), 2500);
  };

  if (preorder) return <Btn onClick={() => go(null)} disabled={busy} className="w-full">Взять предзаказ</Btn>;
  if (!open) return <Btn onClick={() => setOpen(true)} className="w-full">Взять заказ</Btn>;

  return (
    <div className="rounded-2xl bg-amber-50 p-3">
      <div className="mb-2 font-extrabold text-amber-900">Через сколько приедете к клиенту?</div>
      <div className="grid grid-cols-4 gap-2">
        {[30, 60, 90, 120].map((m) => (
          <button key={m} disabled={busy} onClick={() => go(m)} className="rounded-xl bg-white py-3 font-extrabold text-neutral-900 active:bg-[#fcd34d] disabled:opacity-50">{m < 60 ? `${m} мин` : m % 60 ? `${Math.floor(m / 60)}:30 ч` : `${m / 60} ч`}</button>
        ))}
      </div>
      <div className="mt-2 flex gap-2">
        <input value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))} inputMode="numeric" placeholder="Своё время, минут"
          className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2.5 font-bold text-neutral-900 outline-none" />
        <button disabled={!custom || busy} onClick={() => go(Number(custom))} className="rounded-xl bg-neutral-900 px-4 font-bold text-white disabled:opacity-40">Взять</button>
      </div>
      <button onClick={() => setOpen(false)} className="mt-2 w-full text-center text-sm font-semibold text-neutral-500">Отмена</button>
    </div>
  );
}
