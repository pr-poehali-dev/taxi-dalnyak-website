import { useCallback, useState } from "react";
import { appCall } from "@/lib/appApi";
import { usePoll } from "@/lib/usePoll";
import { Badge, Btn, Field } from "./ui";

interface P { id: number; code: string; km: number; max_uses: number | null; used_count: number; expires_at: string | null; is_active: boolean }

export default function PromosTab({ token, onUnauthorized }: { token: string; onUnauthorized: () => void }) {
  const [list, setList] = useState<P[]>([]);
  const [f, setF] = useState({ code: "", km: "", max_uses: "", days: "" });
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const r = await appCall<{ promos: P[] }>("disp_promos", {}, token);
    setList(r.promos);
  }, [token]);
  usePoll(load, 60000, true, onUnauthorized);

  const save = async () => {
    setErr("");
    try {
      await appCall("disp_promo_save", f, token);
      setF({ code: "", km: "", max_uses: "", days: "" });
      await load();
    } catch (e) { setErr((e as Error).message); }
  };
  const toggle = async (id: number) => { await appCall("disp_promo_toggle", { id }, token); await load(); };

  return (
    <div className="space-y-3">
      <div className="space-y-2 rounded-3xl bg-white p-4 shadow-sm">
        <div className="font-extrabold">Новый промокод</div>
        <Field label="Код" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.toUpperCase() })} placeholder="ДАЛЬНЯК50" />
        <div className="grid grid-cols-3 gap-2">
          <Field label="Сколько км" inputMode="numeric" value={f.km} onChange={(e) => setF({ ...f, km: e.target.value.replace(/\D/g, "") })} placeholder="50" />
          <Field label="Лимит раз" inputMode="numeric" value={f.max_uses} onChange={(e) => setF({ ...f, max_uses: e.target.value.replace(/\D/g, "") })} placeholder="без лимита" />
          <Field label="Дней" inputMode="numeric" value={f.days} onChange={(e) => setF({ ...f, days: e.target.value.replace(/\D/g, "") })} placeholder="без срока" />
        </div>
        {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
        <Btn onClick={save} disabled={f.code.length < 3 || !f.km} className="w-full !py-3">Создать</Btn>
      </div>
      {list.map((p) => (
        <div key={p.id} className="flex items-center justify-between gap-2 rounded-3xl bg-white p-4 shadow-sm">
          <div className="min-w-0">
            <div className="text-lg font-extrabold tracking-wide">{p.code}</div>
            <div className="text-sm text-neutral-500">{p.km} км · использован {p.used_count}{p.max_uses ? ` из ${p.max_uses}` : ""}{p.expires_at ? ` · до ${new Date(p.expires_at).toLocaleDateString("ru-RU")}` : ""}</div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Badge tone={p.is_active ? "green" : "gray"}>{p.is_active ? "Действует" : "Выключен"}</Badge>
            <button onClick={() => toggle(p.id)} className="text-xs font-bold text-sky-700">{p.is_active ? "Выключить" : "Включить"}</button>
          </div>
        </div>
      ))}
      {list.length === 0 && <p className="rounded-3xl bg-white p-5 text-center text-sm text-neutral-500">Промокодов пока нет.</p>}
    </div>
  );
}
