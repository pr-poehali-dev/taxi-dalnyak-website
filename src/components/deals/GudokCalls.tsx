import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

interface Call {
  id: number;
  caller?: string;
  status?: string;
  duration?: number;
  calledAt?: string;
  hasClientId: boolean;
  campaign?: string;
  term?: string;
  spam: boolean;
  dealId?: number | null;
  amount?: number | null;
  sent: boolean;
}

const CARD = "#13263d";
const DEEP = "#081321";
const LINE = "rgba(255,255,255,0.09)";
const ORANGE = "#ff7a1a";
const GREEN = "#37d67a";
const RED = "#ff6b6b";
const MUTED = "rgba(255,255,255,0.62)";

const fmt = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso.endsWith("Z") ? iso : iso + "Z");
  return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
};

const input = {
  background: DEEP, border: `1px solid ${LINE}`, borderRadius: 10, color: "#fff",
  padding: "10px 12px", fontSize: 14, width: "100%", fontFamily: "inherit",
} as const;

export default function GudokCalls({ api, onChanged }: { api: string; onChanged: () => void }) {
  const [calls, setCalls] = useState<Call[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);
  const [f, setF] = useState({ amount: "", costs: "", clientName: "", routeFrom: "", routeTo: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await fetch(api + "?action=calls");
      const d = await r.json();
      setCalls(d.calls || []);
    } catch {
      setMsg("Не удалось загрузить звонки");
    }
  }, [api]);

  useEffect(() => {
    load();
  }, [load]);

  const post = async (action: string, body: object) => {
    const r = await fetch(`${api}?action=${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return r.json().catch(() => ({}));
  };

  const toggleSpam = async (c: Call) => {
    await post("call_spam", { callId: c.id, spam: !c.spam });
    load();
  };

  const saveDeal = async (c: Call) => {
    if (!f.amount) return setMsg("Укажите доход");
    setBusy(true);
    const d = await post("call_deal", { callId: c.id, ...f });
    setBusy(false);
    if (d.ok) {
      setMsg("Доход внесён и отправляется в Метрику");
      setOpenId(null);
      setF({ amount: "", costs: "", clientName: "", routeFrom: "", routeTo: "" });
      load();
      onChanged();
    } else setMsg(d.error || "Не удалось сохранить");
  };

  return (
    <section style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 16, padding: 16, marginBottom: 24 }}>
      <h2 style={{ fontWeight: 800, fontSize: 19, marginBottom: 4 }}>Звонки из Гудка</h2>
      <p style={{ color: MUTED, fontSize: 13, marginBottom: 12 }}>
        Отметьте звонок как спам или внесите доход — оплата сразу уйдёт в Метрику.
      </p>
      {msg && <div style={{ color: ORANGE, fontSize: 13, marginBottom: 10 }}>{msg}</div>}
      {calls.length === 0 && (
        <div style={{ color: MUTED, fontSize: 14 }}>
          Звонков пока нет. Они появятся здесь, когда Гудок пришлёт первый звонок.
        </div>
      )}
      <div style={{ display: "grid", gap: 10 }}>
        {calls.map((c) => (
          <div key={c.id} style={{ background: DEEP, border: `1px solid ${LINE}`, borderRadius: 12, padding: 12, opacity: c.spam ? 0.55 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <b style={{ fontSize: 15 }}>{c.caller || "Номер не определён"}</b>
              <span style={{ color: MUTED, fontSize: 13 }}>{fmt(c.calledAt)}{c.duration ? ` · ${c.duration} сек` : ""}</span>
            </div>
            <div style={{ color: MUTED, fontSize: 12.5, margin: "4px 0 8px" }}>
              {c.campaign ? `Кампания: ${c.campaign}` : "Кампания не определена"}{c.term ? ` · «${c.term}»` : ""}
              {" · "}
              <span style={{ color: c.hasClientId ? GREEN : RED }}>
                {c.hasClientId ? "есть код клиента Метрики" : "кода клиента Метрики нет"}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              {c.dealId ? (
                <span style={{ color: GREEN, fontSize: 13, fontWeight: 700, display: "flex", gap: 5, alignItems: "center" }}>
                  <Icon name="CircleCheck" size={14} />
                  Доход {c.amount?.toLocaleString("ru-RU")} ₽ · {c.sent ? "в Метрике" : "ждёт отправки"}
                </span>
              ) : (
                <>
                  <button type="button" onClick={() => setOpenId(openId === c.id ? null : c.id)}
                    style={{ background: ORANGE, color: "#1a0c00", border: "none", borderRadius: 9, padding: "7px 13px", fontWeight: 800, fontSize: 13, cursor: "pointer" }}>
                    Внести доход
                  </button>
                  <button type="button" onClick={() => toggleSpam(c)}
                    style={{ background: "none", color: c.spam ? GREEN : MUTED, border: `1px solid ${LINE}`, borderRadius: 9, padding: "7px 13px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    {c.spam ? "Вернуть из спама" : "Спам"}
                  </button>
                </>
              )}
            </div>
            {openId === c.id && !c.dealId && (
              <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                <input style={input} inputMode="numeric" placeholder="Доход, ₽" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
                <input style={input} inputMode="numeric" placeholder="Расход водителю, ₽ (необязательно)" value={f.costs} onChange={(e) => setF({ ...f, costs: e.target.value })} />
                <input style={input} placeholder="Имя клиента (необязательно)" value={f.clientName} onChange={(e) => setF({ ...f, clientName: e.target.value })} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input style={input} placeholder="Откуда" value={f.routeFrom} onChange={(e) => setF({ ...f, routeFrom: e.target.value })} />
                  <input style={input} placeholder="Куда" value={f.routeTo} onChange={(e) => setF({ ...f, routeTo: e.target.value })} />
                </div>
                <button type="button" disabled={busy} onClick={() => saveDeal(c)}
                  style={{ background: GREEN, color: "#04230f", border: "none", borderRadius: 10, padding: "11px", fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
                  {busy ? "Сохраняю…" : "Сохранить и отправить в Метрику"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
