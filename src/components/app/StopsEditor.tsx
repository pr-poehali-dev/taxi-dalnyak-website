import { useState } from "react";
import Icon from "@/components/ui/icon";
import AddressSearch, { type Place } from "./AddressSearch";
import { useBackClose } from "@/lib/useBackClose";

export const MAX_STOPS = 3;

function StopModal({ token, near, onPick, onClose }: { token: string | null; near: [number, number] | null; onPick: (p: Place) => void; onClose: () => void }) {
  useBackClose(onClose);
  const [text, setText] = useState("");
  return (
    <div className="fixed inset-0 z-[3000] flex items-end bg-black/50 lg:items-center lg:justify-center" onClick={onClose}>
      <div className="min-h-[60vh] w-full rounded-t-[28px] bg-white p-5 lg:min-h-0 lg:max-w-md lg:rounded-[28px]" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-extrabold">Промежуточная остановка</h3>
          <button onClick={onClose} aria-label="Закрыть" className="p-1 text-neutral-400"><Icon name="X" size={22} /></button>
        </div>
        <AddressSearch token={token || ""} action={token ? "client_suggest" : "guest_suggest"} value={text} onChange={setText} near={near}
          onPick={(p) => { onPick(p); onClose(); }} placeholder="Город, улица или адрес остановки" />
        <p className="mt-3 text-xs text-neutral-500">Заезд по пути: забрать попутчика, вещи, документы. Цена пересчитается с учётом километров.</p>
      </div>
    </div>
  );
}

export default function StopsEditor({ stops, onChange, token, near, stopPrice, mode }: {
  stops: Place[]; onChange: (s: Place[]) => void; token: string | null; near: [number, number] | null; stopPrice: number; mode: "list" | "add";
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      {mode === "list" && stops.map((s, i) => (
        <div key={i}>
          <div className="mx-4 border-t border-neutral-200" />
          <div className="flex items-center gap-3 px-4 py-3">
            <span className="h-3 w-3 shrink-0 rounded-full border-2 border-neutral-900 bg-white" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-bold text-neutral-400">Остановка {stops.length > 1 ? i + 1 : ""}</span>
              <span className="block truncate text-[15px] font-extrabold">{s.label}</span>
            </span>
            <button onClick={() => onChange(stops.filter((_, j) => j !== i))} aria-label="Убрать остановку" className="p-1">
              <Icon name="X" size={18} className="text-neutral-400" />
            </button>
          </div>
        </div>
      ))}
      {mode === "add" && stops.length < MAX_STOPS && (
        <>
          <div className="mx-4 border-t border-neutral-200" />
          <button onClick={() => setOpen(true)} className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-extrabold text-neutral-700 active:bg-neutral-200">
            <Icon name="Plus" size={16} className="shrink-0" />
            <span className="flex-1">Добавить остановку</span>
            <span className="text-xs font-bold text-neutral-400">+{stopPrice} ₽ и км</span>
          </button>
        </>
      )}
      {open && <StopModal token={token} near={near} onClose={() => setOpen(false)} onPick={(p) => onChange([...stops, p])} />}
    </>
  );
}
