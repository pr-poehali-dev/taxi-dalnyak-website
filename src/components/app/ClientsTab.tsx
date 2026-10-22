import { useCallback, useState } from "react";
import { appCall } from "@/lib/appApi";
import { usePoll } from "@/lib/usePoll";
import { Badge, Btn, Field } from "./ui";

interface C {
  id: number; name: string | null; phone: string; created_at: string; is_blocked: boolean; blocked_at: string | null; block_note: string | null;
  trips_total: number; trips_done: number; trips_cancelled: number; trips_24h: number;
}

export default function ClientsTab({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const [q, setQ] = useState("");
  const [list, setList] = useState<C[]>([]);
  const [days, setDays] = useState(14);
  const [daily, setDaily] = useState<{ day: string; n: number; by_disp: number; drivers: number }[]>([]);
  const [total, setTotal] = useState<{ clients: number; drivers: number } | null>(null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const r = await appCall<{ clients: C[]; daily: typeof daily; total: typeof total }>("disp_clients", { q, days }, token);
    setList(r.clients);
    setDaily(r.daily || []);
    setTotal(r.total || null);
  }, [q, token, days]);

  usePoll(load, 30000, true, onUnauthorized);

  const toggle = async (c: C) => {
    setErr("");
    let note = "";
    if (!c.is_blocked) {
      if (!window.confirm(`Заблокировать ${c.name || c.phone}? Его активные заказы отменятся, войти он больше не сможет.`)) return;
      note = window.prompt("Причина (необязательно)") || "";
    }
    try {
      await appCall("disp_client_block", { client_id: c.id, blocked: !c.is_blocked, note }, token);
      await load();
    } catch (e) { setErr((e as Error).message); }
  };

  return (
    <div className="space-y-3">
      <div className="rounded-3xl bg-white p-4 shadow-sm">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-neutral-50 p-3"><b className="block text-2xl">{total?.clients ?? "—"}</b><span className="text-xs text-neutral-500">пассажиров всего</span></div>
          <div className="rounded-2xl bg-emerald-50 p-3"><b className="block text-2xl text-emerald-700">{daily.reduce((s, d) => s + Number(d.n), 0)}</b><span className="text-xs text-neutral-500">новых за {days} дн.</span></div>
          <div className="rounded-2xl bg-neutral-50 p-3"><b className="block text-2xl">{daily[0]?.n ?? 0}</b><span className="text-xs text-neutral-500">сегодня</span></div>
        </div>
        <div className="mt-3 flex gap-1.5">
          {[[1, "Сегодня"], [7, "7 дней"], [14, "14 дней"], [30, "30 дней"], [90, "90 дней"]].map(([v, l]) => (
            <button key={v} onClick={() => setDays(Number(v))} className={`flex-1 rounded-xl py-2 text-xs font-extrabold ${days === v ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-600"}`}>{l}</button>
          ))}
        </div>
        <div className="mt-3 max-h-72 overflow-y-auto">
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 border-b border-neutral-100 pb-1 text-[11px] font-bold uppercase text-neutral-400">
            <span>День</span><span className="text-right">Пассажиры</span><span className="text-right">из них вы</span><span className="text-right">Водители</span>
          </div>
          {daily.map((d) => (
            <div key={d.day} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-4 border-b border-neutral-50 py-1.5 text-sm">
              <span>{new Date(d.day).toLocaleDateString("ru-RU", { day: "numeric", month: "short", weekday: "short" })}</span>
              <span className="text-right font-extrabold">{d.n}</span>
              <span className="text-right text-neutral-500">{d.by_disp}</span>
              <span className="text-right text-neutral-500">{d.drivers}</span>
            </div>
          ))}
        </div>
      </div>
      <Field value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по имени или телефону" />
      {err && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-600">{err}</p>}
      {list.length === 0 && <p className="rounded-3xl bg-white p-5 text-center text-sm text-neutral-500">Клиентов не найдено.</p>}
      {list.map((c) => (
        <div key={c.id} className={`rounded-3xl bg-white p-4 shadow-sm ${c.is_blocked ? "ring-2 ring-red-200" : ""}`}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="truncate font-extrabold">{c.name || "Без имени"}</div>
              <a href={`tel:${c.phone}`} className="text-sm font-semibold text-sky-700">{c.phone}</a>
            </div>
            {c.is_blocked ? <Badge tone="red">Заблокирован</Badge> : c.trips_24h >= 4 ? <Badge tone="yellow">Много заказов</Badge> : null}
          </div>
          <div className="mt-2 grid grid-cols-4 gap-1.5 text-center text-xs">
            <div className="rounded-xl bg-neutral-50 p-2"><b className="block text-base">{c.trips_total}</b>заказов</div>
            <div className="rounded-xl bg-neutral-50 p-2"><b className="block text-base">{c.trips_done}</b>поездок</div>
            <div className="rounded-xl bg-neutral-50 p-2"><b className="block text-base">{c.trips_cancelled}</b>отмен</div>
            <div className="rounded-xl bg-neutral-50 p-2"><b className="block text-base">{c.trips_24h}</b>за сутки</div>
          </div>
          {c.block_note && <div className="mt-2 text-sm text-red-600">Причина: {c.block_note}</div>}
          <Btn kind={c.is_blocked ? "ghost" : "danger"} onClick={() => toggle(c)} className="mt-3 w-full !py-2.5 !text-sm">
            {c.is_blocked ? "Разблокировать" : "Заблокировать клиента"}
          </Btn>
        </div>
      ))}
    </div>
  );
}
