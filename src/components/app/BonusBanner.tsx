import { useState } from "react";
import Icon from "@/components/ui/icon";

export default function BonusBanner({ km, earnPct, maxPct, refKm, onMore }: { km: number; earnPct: number; maxPct: number; refKm: number; onMore: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="absolute inset-x-3 bottom-9 z-[500]">
      {open ? (
        <div className="rounded-3xl bg-white p-4 shadow-xl">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 font-extrabold"><Icon name="Gift" size={20} /> Копи-км</div>
            <button onClick={() => setOpen(false)} aria-label="Свернуть"><Icon name="X" size={18} className="text-neutral-400" /></button>
          </div>
          <p className="mt-1.5 text-sm text-neutral-600">
            Копите километры: {earnPct}% от каждой поездки и {refKm} км за приглашённого друга. Тратьте на скидку до {maxPct}% от стоимости заказа.
          </p>
          <button onClick={onMore} className="mt-2 text-sm font-extrabold text-sky-700">Мой счёт и код для друзей</button>
        </div>
      ) : (
        <button onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-full bg-neutral-900 py-2 pl-3 pr-4 text-sm font-extrabold text-white shadow-lg">
          <Icon name="Gift" size={16} className="text-[#fcd34d]" /> Копи-км: {km} км
        </button>
      )}
    </div>
  );
}
