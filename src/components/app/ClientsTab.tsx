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
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const r = await appCall<{ clients: C[] }>("disp_clients", { q }, token);
    setList(r.clients);
  }, [q, token]);

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
