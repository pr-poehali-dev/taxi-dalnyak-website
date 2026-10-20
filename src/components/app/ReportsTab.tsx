import { useCallback, useState } from "react";
import { appCall, TARIFF_NAME, money } from "@/lib/appApi";
import { usePoll } from "@/lib/usePoll";
import { dur } from "./FleetTab";

interface Report {
  days: number;
  summary: Record<string, number | null>;
  by_day: { day: string; total: number; done: number; revenue: number }[];
  by_tariff: { tariff: string; total: number; done: number; revenue: number }[];
  by_driver: { id: number; name: string; car_model: string; car_plate: string; done: number; revenue: number; commission: number; rating: number | null; refusals: number; online_sec: number }[];
}

const PERIODS = [[1, "Сегодня"], [7, "7 дней"], [30, "30 дней"], [365, "Год"]] as const;

export default function ReportsTab({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const [days, setDays] = useState(7);
  const [r, setR] = useState<Report | null>(null);
  const load = useCallback(async () => setR(await appCall<Report>("disp_report", { days }, token)), [days, token]);
  usePoll(load, 30000, true, onUnauthorized);

  const s = r?.summary;
  const n = (k: string) => Number(s?.[k] || 0);
  const conv = n("total") ? Math.round((n("done") / n("total")) * 100) : 0;
  const Card = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
    <div className="rounded-2xl bg-white p-3 shadow-sm">
      <div className="text-xs font-bold text-neutral-400">{label}</div>
      <div className="text-xl font-extrabold text-neutral-900">{value}</div>
      {sub && <div className="text-xs text-neutral-500">{sub}</div>}
    </div>
  );

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-1 rounded-2xl bg-white p-1.5 shadow-sm">
        {PERIODS.map(([d, l]) => (
          <button key={d} onClick={() => setDays(d)} className={`rounded-xl py-2 text-xs font-extrabold ${days === d ? "bg-[#fcd34d]" : "text-neutral-500"}`}>{l}</button>
        ))}
      </div>
      {!r && <p className="text-neutral-500">Загрузка...</p>}
      {r && s && (
        <>
          <div className="grid grid-cols-2 gap-2">
            <Card label="Заказов создано" value={String(n("total"))} sub={`предзаказов: ${n("preorders")}`} />
            <Card label="Выполнено" value={String(n("done"))} sub={`${conv}% от всех`} />
            <Card label="Оборот" value={money(n("revenue"))} sub={`средний чек ${money(n("avg_price"))}`} />
            <Card label="Комиссия сервиса" value={money(n("commission"))} sub={`средний пробег ${n("avg_km")} км`} />
            <Card label="Отменено" value={String(n("cancelled"))} sub={`клиент ${n("cancelled_client")}, диспетчер ${n("cancelled_dispatcher")}`} />
            <Card label="Отказов водителей" value={String(n("driver_refusals"))} sub="после назначения" />
            <Card label="В работе сейчас" value={String(n("open"))} />
            <Card label="Новых пассажиров" value={String(n("new_clients"))} sub={s.avg_rating ? `средняя оценка ${Number(s.avg_rating).toFixed(1)}` : "оценок нет"} />
          </div>

          {r.by_tariff.length > 0 && (
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <div className="mb-2 text-xs font-bold uppercase text-neutral-400">По тарифам</div>
              {r.by_tariff.map((t) => (
                <div key={t.tariff} className="flex justify-between border-b border-neutral-100 py-2 text-sm last:border-0">
                  <span className="font-bold">{TARIFF_NAME[t.tariff]}</span>
                  <span className="text-neutral-600">{t.done} из {t.total} · {money(t.revenue)}</span>
                </div>
              ))}
            </div>
          )}

          {r.by_day.length > 1 && (
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <div className="mb-2 text-xs font-bold uppercase text-neutral-400">По дням</div>
              {r.by_day.slice(0, 31).map((d) => (
                <div key={d.day} className="flex justify-between border-b border-neutral-100 py-2 text-sm last:border-0">
                  <span className="font-bold">{new Date(d.day).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}</span>
                  <span className="text-neutral-600">{d.done} из {d.total} · {money(d.revenue)}</span>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-3xl bg-white p-4 shadow-sm">
            <div className="mb-2 text-xs font-bold uppercase text-neutral-400">По водителям</div>
            {r.by_driver.length === 0 && <p className="text-sm text-neutral-500">Нет данных.</p>}
            {r.by_driver.map((d) => (
              <div key={d.id} className="border-b border-neutral-100 py-2.5 text-sm last:border-0">
                <div className="flex justify-between"><span className="font-extrabold">{d.name}</span><span className="font-bold">{money(d.revenue)}</span></div>
                <div className="text-xs text-neutral-500">
                  {d.car_model} {d.car_plate} · поездок {d.done} · комиссия {money(d.commission)} · {d.rating ? `★${Number(d.rating).toFixed(1)}` : "без оценок"} · отказов {d.refusals} · в сети {dur(d.online_sec)}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
