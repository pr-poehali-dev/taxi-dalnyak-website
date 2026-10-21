import { useCallback, useState } from "react";
import { appCall } from "@/lib/appApi";
import { usePoll } from "@/lib/usePoll";

interface Funnel {
  steps: Record<string, { n: number; installed: number }>;
  names: Record<string, string>;
  sources: { source: string; n: number }[];
  lost: { visitor: string; at: string; details: string | null; installed: boolean; name: string | null; phone: string | null }[];
}

const PERIODS = [[1, "Сегодня"], [7, "7 дней"], [30, "30 дней"]] as const;
const ORDER = ["open", "login_prompt", "login", "route", "quote", "order"];

const HINTS: Record<string, string> = {
  login_prompt: "Открыли и ничего не нажали: возможно, непонятно, что делать, или пришли не те люди с рекламы.",
  login: "Увидели вход и ушли: не хотят оставлять номер. Можно усилить текст, зачем нужен вход.",
  route: "Вошли, но не ввели маршрут: возможно, неудобный поиск адреса или им нужна была просто информация.",
  quote: "Не дождались цены: возможно, ошибка расчёта или плохой интернет.",
  order: "Увидели цену и ушли: чаще всего дорого или нет нужной даты. Позвоните им, если есть телефон.",
};

export default function FunnelTab({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const [days, setDays] = useState(1);
  const [onlyAd, setOnlyAd] = useState(true);
  const [f, setF] = useState<Funnel | null>(null);
  const load = useCallback(async () => setF(await appCall<Funnel>("disp_funnel", { days, only_ad: onlyAd }, token)), [days, onlyAd, token]);
  usePoll(load, 30000, true, onUnauthorized);

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
      <div className="grid grid-cols-3 gap-1 rounded-2xl bg-white p-1.5 shadow-sm">
        {PERIODS.map(([d, l]) => (
          <button key={d} onClick={() => setDays(d)} className={`rounded-xl py-2 text-xs font-extrabold ${days === d ? "bg-[#fcd34d]" : "text-neutral-500"}`}>{l}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-white p-1.5 shadow-sm">
        {[[true, "Только с рекламы"], [false, "Все посетители"]].map(([v, l]) => (
          <button key={String(v)} onClick={() => setOnlyAd(v as boolean)} className={`rounded-xl py-2 text-xs font-extrabold ${onlyAd === v ? "bg-neutral-900 text-white" : "text-neutral-500"}`}>{l as string}</button>
        ))}
      </div>

      {!f && <p className="text-neutral-500">Загрузка...</p>}
      {f && (
        <>
          <div className="rounded-3xl bg-white p-4 shadow-sm">
            <div className="mb-3 text-xs font-bold uppercase text-neutral-400">Уникальные посетители по шагам</div>
            {ORDER.map((k, i) => {
              const v = n(k);
              const pct = top ? Math.round((v / top) * 100) : 0;
              const prev = i ? n(ORDER[i - 1]) : 0;
              return (
                <div key={k} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-neutral-900">{f.names[k]}</span>
                    <span className="font-extrabold text-neutral-900">{v} <span className="text-xs font-semibold text-neutral-400">{pct}%</span></span>
                  </div>
                  <div className="mt-1 h-2.5 rounded-full bg-neutral-100"><div className="h-2.5 rounded-full bg-[#fcd34d]" style={{ width: `${pct}%` }} /></div>
                  <div className="mt-0.5 text-xs text-neutral-500">
                    {i > 0 && prev > v && `ушли на этом шаге: ${prev - v} · `}из установленного приложения: {f.steps[k]?.installed || 0}
                  </div>
                </div>
              );
            })}
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
                  {" · "}{l.installed ? "приложение" : "браузер"}
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
