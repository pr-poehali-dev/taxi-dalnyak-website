import { useCallback, useEffect, useState } from "react";
import { appCall } from "@/lib/appApi";
import { usePoll } from "@/lib/usePoll";

interface Funnel {
  date_from: string;
  date_to: string;
  flow: string[];
  steps: Record<string, { n: number; installed: number }>;
  names: Record<string, string>;
  sources: { source: string; n: number }[];
  lost: { visitor: string; at: string; details: string | null; installed: boolean; clicked: boolean; name: string | null; phone: string | null }[];
}

const PERIODS = [[1, "Сегодня"], [7, "7 дней"], [30, "30 дней"], [0, "Даты"]] as const;
const ORDER = ["open", "route", "quote", "order_click", "login", "order"];

const HINTS: Record<string, string> = {
  route: "Открыли и не указали, куда ехать: возможно, непонятный первый экран или с рекламы пришли не те люди (искали такси по городу).",
  quote: "Указали маршрут, но цену не увидели: ошибка расчёта, слишком короткая поездка или плохой интернет.",
  order_click: "Увидели цену и не нажали «Заказать»: чаще всего дорого или нужна другая дата. Звоните тем, у кого есть телефон.",
  login: "Нажали «Заказать», но не оставили телефон: не хотят регистрироваться или не пришла СМС.",
  order: "Вошли, но заказ не оформился: ошибка при отправке или передумали в последний момент.",
};

const iso = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const ru = (s: string) => new Date(s + "T00:00:00").toLocaleDateString("ru-RU", { day: "numeric", month: "short" });

export default function FunnelTab({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const [days, setDays] = useState<number>(7);
  const [onlyAd, setOnlyAd] = useState(true);
  const [d1, setD1] = useState(() => iso(new Date(Date.now() - 6 * 86400000)));
  const [d2, setD2] = useState(() => iso(new Date()));
  const [f, setF] = useState<Funnel | null>(null);
  const load = useCallback(async () => {
    const period = days ? { days } : { date_from: d1, date_to: d2 };
    setF(await appCall<Funnel>("disp_funnel", { ...period, only_ad: onlyAd }, token));
  }, [days, d1, d2, onlyAd, token]);
  usePoll(load, 30000, true, onUnauthorized);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let stop = false;
    setBusy(true);
    load().catch(() => undefined).finally(() => { if (!stop) setBusy(false); });
    return () => { stop = true; };
  }, [load]);

  const n = (k: string) => f?.steps[k]?.n || 0;
  const top = n("open");
  let worst = "";
  let worstDrop = 0;
  ORDER.slice(1).forEach((k, i) => {
    const prev = n(ORDER[i]);
    const drop = prev ? (prev - n(k)) / prev : 0;
    if (prev >= 3 && drop > worstDrop) { worstDrop = drop; worst = k; }
  });

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-4 gap-1 rounded-2xl bg-white p-1.5 shadow-sm">
        {PERIODS.map(([d, l]) => (
          <button key={d} onClick={() => setDays(d)} className={`rounded-xl py-2 text-xs font-extrabold ${days === d ? "bg-[#fcd34d]" : "text-neutral-500"}`}>{l}</button>
        ))}
      </div>
      {days === 0 && (
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-3 shadow-sm">
          <label className="text-xs font-bold text-neutral-500">С
            <input type="date" value={d1} max={d2} onChange={(e) => e.target.value && setD1(e.target.value)} className="mt-1 w-full rounded-xl bg-neutral-100 px-3 py-2 text-sm font-bold text-neutral-900" />
          </label>
          <label className="text-xs font-bold text-neutral-500">По
            <input type="date" value={d2} min={d1} max={iso(new Date())} onChange={(e) => e.target.value && setD2(e.target.value)} className="mt-1 w-full rounded-xl bg-neutral-100 px-3 py-2 text-sm font-bold text-neutral-900" />
          </label>
        </div>
      )}
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-white p-1.5 shadow-sm">
        {[[true, "Только с рекламы"], [false, "Все посетители"]].map(([v, l]) => (
          <button key={String(v)} onClick={() => setOnlyAd(v as boolean)} className={`rounded-xl py-2 text-xs font-extrabold ${onlyAd === v ? "bg-neutral-900 text-white" : "text-neutral-500"}`}>{l as string}</button>
        ))}
      </div>

      {(!f || busy) && <p className="text-sm text-neutral-500">Обновляем отчёт...</p>}
      {f && (
        <>
          <div className="rounded-3xl bg-white p-4 shadow-sm">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-xs font-bold uppercase text-neutral-400">Воронка пассажира</span>
              <span className="text-xs font-semibold text-neutral-500">{f.date_from === f.date_to ? ru(f.date_from) : `${ru(f.date_from)} — ${ru(f.date_to)}`}</span>
            </div>
            <p className="mb-3 text-xs text-neutral-500">Уникальные посетители. Процент справа — сколько дошло от открывших.</p>
            {ORDER.map((k, i) => {
              const v = n(k);
              const pct = top ? Math.round((v / top) * 100) : 0;
              const prev = i ? n(ORDER[i - 1]) : 0;
              const lost = Math.max(0, prev - v);
              const lostPct = prev ? Math.round((lost / prev) * 100) : 0;
              return (
                <div key={k}>
                  {i > 0 && (
                    <div className="my-1.5 flex items-center gap-2 pl-3 text-xs">
                      <span className="text-neutral-300">↓</span>
                      {prev ? (
                        <span className={`rounded-full px-2 py-0.5 font-extrabold ${lostPct >= 50 ? "bg-red-50 text-red-600" : lostPct >= 25 ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                          потеряли {lostPct}% · {lost} чел.
                        </span>
                      ) : <span className="text-neutral-400">нет данных</span>}
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-neutral-900"><span className="mr-1.5 text-neutral-400">{i + 1}.</span>{f.names[k]}</span>
                    <span className="font-extrabold text-neutral-900">{v} <span className="text-xs font-semibold text-neutral-400">{pct}%</span></span>
                  </div>
                  <div className="mt-1 h-2.5 rounded-full bg-neutral-100"><div className="h-2.5 rounded-full bg-[#fcd34d]" style={{ width: `${pct}%` }} /></div>
                  <div className="mt-0.5 text-xs text-neutral-400">из установленного приложения: {f.steps[k]?.installed || 0}</div>
                </div>
              );
            })}
            {top > 0 && (
              <div className="mt-4 flex justify-between rounded-2xl bg-neutral-50 p-3 text-sm">
                <span className="font-bold text-neutral-700">Итог: из открывших заказали</span>
                <span className="font-extrabold text-neutral-900">{Math.round((n("order") / top) * 1000) / 10}%</span>
              </div>
            )}
          </div>

          {top === 0 && <p className="rounded-3xl bg-white p-5 text-center text-sm text-neutral-500">За этот период никто не открывал приложение{onlyAd ? " с рекламы" : ""}. Данные начнут копиться с сегодняшнего дня.</p>}

          {worst && (
            <div className="rounded-3xl bg-amber-50 p-4 ring-1 ring-amber-200">
              <div className="text-xs font-bold uppercase text-amber-700">Главное узкое место</div>
              <div className="mt-1 font-extrabold text-neutral-900">{f.names[worst]}: теряется {Math.round(worstDrop * 100)}%</div>
              <p className="mt-1 text-sm text-amber-900">{HINTS[worst]}</p>
            </div>
          )}

          {f.sources.length > 0 && (
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <div className="mb-2 text-xs font-bold uppercase text-neutral-400">Откуда пришли</div>
              {f.sources.map((s) => (
                <div key={s.source} className="flex justify-between border-b border-neutral-100 py-2 text-sm last:border-0">
                  <span className="font-bold">{s.source}</span><span className="text-neutral-600">{s.n}</span>
                </div>
              ))}
            </div>
          )}

          <div className="rounded-3xl bg-white p-4 shadow-sm">
            <div className="mb-1 text-xs font-bold uppercase text-neutral-400">Посмотрели цену и не заказали</div>
            <p className="mb-2 text-xs text-neutral-500">Маршрут и цена, которые они увидели. Если есть телефон, можно перезвонить и предложить поездку.</p>
            {f.lost.length === 0 && <p className="text-sm text-neutral-500">Таких нет.</p>}
            {f.lost.map((l) => (
              <div key={l.visitor} className="border-b border-neutral-100 py-2.5 text-sm last:border-0">
                <div className="font-bold text-neutral-900">{l.details || "маршрут не записан"}</div>
                <div className="text-xs text-neutral-500">
                  {new Date(l.at).toLocaleString("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  {" · "}{l.installed ? "приложение" : "браузер"}{l.clicked ? " · нажал «Заказать»" : ""}
                  {l.phone ? <> · {l.name || "без имени"}, <a href={`tel:${l.phone}`} className="font-bold text-sky-700">{l.phone}</a></> : " · не входил"}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
