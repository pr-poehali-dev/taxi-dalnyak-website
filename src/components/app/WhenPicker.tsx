import { useMemo } from "react";
import Icon from "@/components/ui/icon";

const MIN_AHEAD_MIN = 40;
const pad = (n: number) => String(n).padStart(2, "0");
const toLocal = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

export function earliest(): Date {
  const d = new Date(Date.now() + MIN_AHEAD_MIN * 60000);
  d.setSeconds(0, 0);
  d.setMinutes(Math.ceil(d.getMinutes() / 5) * 5);
  return d;
}

export function whenLabel(value: string) {
  if (!value) return "";
  const d = new Date(value);
  const today = new Date();
  const tomorrow = new Date(Date.now() + 86400000);
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString();
  const day = same(d, today) ? "сегодня" : same(d, tomorrow) ? "завтра" : d.toLocaleDateString("ru-RU", { day: "numeric", month: "long" });
  return `${day}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function whenError(value: string) {
  if (!value) return "Выберите день и время";
  if (new Date(value).getTime() < earliest().getTime() - 60000) return `Предзаказ можно оформить минимум за ${MIN_AHEAD_MIN} минут до поездки`;
  return "";
}

export default function WhenPicker({ enabled, value, onToggle, onChange }: {
  enabled: boolean; value: string; onToggle: (on: boolean) => void; onChange: (v: string) => void;
}) {
  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => { const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); return d; }), []);
  const cur = value ? new Date(value) : null;
  const err = enabled && value ? whenError(value) : "";

  const choose = (on: boolean) => {
    onToggle(on);
    if (on && !value) onChange(toLocal(earliest()));
  };

  const setDay = (d: Date) => {
    const base = cur || earliest();
    const n = new Date(d);
    n.setHours(base.getHours(), base.getMinutes(), 0, 0);
    onChange(toLocal(n));
  };
  const setPart = (h: number | null, m: number | null) => {
    const n = new Date(cur || earliest());
    if (h !== null) n.setHours(h);
    if (m !== null) n.setMinutes(m);
    onChange(toLocal(n));
  };

  const sel = "rounded-2xl bg-neutral-100 px-3 py-3 text-center text-lg font-extrabold text-neutral-900 outline-none focus:ring-2 focus:ring-[#fcd34d]";

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-neutral-100 p-1">
        {([[false, "Сейчас"], [true, "На другое время"]] as const).map(([on, l]) => (
          <button key={String(on)} onClick={() => choose(on)}
            className={`rounded-xl py-3 text-sm font-extrabold ${enabled === on ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"}`}>{l}</button>
        ))}
      </div>

      {enabled && (
        <div className="space-y-3 rounded-3xl bg-neutral-50 p-3">
          <div>
            <div className="mb-1.5 text-xs font-bold uppercase text-neutral-400">День</div>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {days.map((d, i) => {
                const on = cur && cur.toDateString() === d.toDateString();
                return (
                  <button key={i} onClick={() => setDay(d)}
                    className={`flex min-w-[58px] shrink-0 flex-col items-center rounded-2xl px-2 py-2 ${on ? "bg-neutral-900 text-white" : "bg-white text-neutral-800"}`}>
                    <span className={`text-[11px] font-bold uppercase ${on ? "text-neutral-300" : "text-neutral-400"}`}>{i === 0 ? "Сегодня" : i === 1 ? "Завтра" : d.toLocaleDateString("ru-RU", { weekday: "short" })}</span>
                    <span className="text-xl font-extrabold leading-tight">{d.getDate()}</span>
                    <span className={`text-[11px] font-semibold ${on ? "text-neutral-300" : "text-neutral-400"}`}>{d.toLocaleDateString("ru-RU", { month: "short" }).replace(".", "")}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <div className="mb-1.5 text-xs font-bold uppercase text-neutral-400">Время подачи</div>
            <div className="flex items-center gap-2">
              <select value={cur ? cur.getHours() : 12} onChange={(e) => setPart(Number(e.target.value), null)} className={`${sel} flex-1`} aria-label="Часы">
                {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{pad(h)}</option>)}
              </select>
              <span className="text-xl font-extrabold">:</span>
              <select value={cur ? Math.round(cur.getMinutes() / 5) * 5 % 60 : 0} onChange={(e) => setPart(null, Number(e.target.value))} className={`${sel} flex-1`} aria-label="Минуты">
                {Array.from({ length: 12 }, (_, i) => i * 5).map((m) => <option key={m} value={m}>{pad(m)}</option>)}
              </select>
            </div>
          </div>
          {err ? (
            <p className="flex items-start gap-2 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-600"><Icon name="TriangleAlert" size={16} className="mt-0.5 shrink-0" />{err}</p>
          ) : value ? (
            <p className="flex items-start gap-2 rounded-2xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
              <Icon name="CalendarCheck" size={16} className="mt-0.5 shrink-0" />
              <span>Подача {whenLabel(value)}. Водителя найдём заранее, напомним за час и за 15 минут.</span>
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}
