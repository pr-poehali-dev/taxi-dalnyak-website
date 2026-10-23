import Icon from "@/components/ui/icon";
import { money } from "@/lib/appApi";

function hm(min: number) {
  const h = Math.floor(min / 60);
  const m = Math.round(min % 60);
  if (!h) return `${m} мин`;
  return m ? `${h} ч ${m} мин` : `${h} ч`;
}

export default function RouteSummary({ km, min, approx, toll, tollKnown }: {
  km: number; min?: number; approx?: boolean; tollKnown?: boolean; toll?: { km: number; rub: number; roads: string[] } | null;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-amber-400 text-neutral-900 shadow-lg shadow-amber-400/30">
      <div className="grid grid-cols-2 divide-x divide-neutral-900/15">
        <div className="flex items-center gap-2.5 p-3">
          <Icon name="Route" size={24} className="shrink-0" />
          <div>
            <div className="text-[11px] font-bold uppercase opacity-70">Расстояние</div>
            <div className="text-xl font-black leading-tight">{approx ? "≈ " : ""}{km} км</div>
          </div>
        </div>
        <div className="flex items-center gap-2.5 p-3">
          <Icon name="Clock" size={24} className="shrink-0" />
          <div>
            <div className="text-[11px] font-bold uppercase opacity-70">В пути</div>
            <div className="text-xl font-black leading-tight">{min ? `≈ ${hm(min)}` : "—"}</div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2.5 border-t border-neutral-900/15 bg-neutral-900 px-3 py-2.5 text-white">
        <Icon name="Ticket" size={20} className="shrink-0 text-amber-400" />
        {toll ? (
          <div className="min-w-0 flex-1 text-sm">
            <span className="font-extrabold">Платная дорога ≈ {money(toll.rub)}</span>
            <span className="text-white/60"> · {toll.km} км{toll.roads.length ? ` по ${toll.roads.join(", ")}` : ""}, оплачивается отдельно</span>
          </div>
        ) : !tollKnown ? (
          <div className="text-sm font-bold">Платные участки уточнит водитель</div>
        ) : (
          <div className="text-sm font-bold">Платных дорог на маршруте нет</div>
        )}
      </div>
    </div>
  );
}