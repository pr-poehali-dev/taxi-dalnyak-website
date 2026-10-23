import { useCallback, useEffect, useMemo, useState } from "react";
import Icon from "@/components/ui/icon";

interface Order {
  id: number;
  createdAt: string | null;
  tripStatus: string;
  crmStatus: "IN_PROGRESS" | "PAID" | "CANCELLED" | "SPAM";
  crmStatusRu: string;
  sentStatus: string | null;
  sentAt: string | null;
  error: string | null;
  price: number;
  from: string;
  to: string;
  km: number;
  phone: string | null;
  name: string | null;
  ymClientId: string | null;
  fromAd: boolean;
  utmSource: string | null;
  utmCampaign: string | null;
  createdBy: string | null;
  cost: number;
  costManual: boolean;
  isTest: boolean;
}

interface Data {
  orders: Order[];
  enabled: boolean;
  lastRun: string | null;
  lastResult: { ok: boolean; sent: number; info: string } | null;
  pending: number;
  driverPct: number;
}

const CARD = "#13263d";
const DEEP = "#081321";
const LINE = "rgba(255,255,255,0.09)";
const ORANGE2 = "#ff9f45";
const GREEN = "#37d67a";
const RED = "#ff6b6b";
const BLUE = "#5aa9ff";
const MUTED = "rgba(255,255,255,0.62)";
const F = "Manrope, system-ui, sans-serif";

const COLORS: Record<string, string> = { PAID: GREEN, CANCELLED: RED, IN_PROGRESS: BLUE, SPAM: "#8a96a8" };
const money = (n: number) => Math.round(n).toLocaleString("ru-RU") + " ₽";
const dt = (s: string | null) => (s ? new Date(s).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "—");

type Filter = "all" | "PAID" | "IN_PROGRESS" | "CANCELLED" | "SPAM" | "ad" | "pending";

export default function AppOrdersCrm({ api }: { api: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [busy, setBusy] = useState<number | "all" | null>(null);
  const [msg, setMsg] = useState("");
  const [costs, setCosts] = useState<Record<number, string>>({});
  const [pct, setPct] = useState("");

  const load = useCallback(async () => {
    try {
      const r = await fetch(api + "?action=crm_orders");
      setData(await r.json());
    } catch {
      setMsg("Не удалось загрузить заказы");
    }
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const send = async (ids?: number[]) => {
    setBusy(ids ? ids[0] : "all");
    setMsg("");
    try {
      const r = await fetch(api + "?action=crm_sync", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: ids || [] }),
      });
      const d = await r.json();
      setMsg(d.ok ? (d.sent ? `Отправлено в Метрику: ${d.sent}` : "Всё уже отправлено") : `Ошибка: ${d.info}`);
      await load();
    } catch {
      setMsg("Не удалось отправить");
    } finally {
      setBusy(null);
    }
  };

  const post = async (action: string, payload: object, key: number | "all") => {
    setBusy(key);
    setMsg("");
    try {
      const r = await fetch(api + "?action=" + action, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const d = await r.json();
      setMsg(d.ok ? "Сохранено и отправлено в Метрику" : `Ошибка: ${d.info}`);
      await load();
    } catch {
      setMsg("Не удалось сохранить");
    } finally {
      setBusy(null);
    }
  };

  const orders = useMemo(() => data?.orders || [], [data]);
  const stats = useMemo(() => {
    const paid = orders.filter((o) => o.crmStatus === "PAID");
    const real = orders.filter((o) => !o.isTest);
    return {
      all: real.length,
      test: orders.length - real.length,
      profit: paid.reduce((s, o) => s + o.price - o.cost, 0),
      paid: paid.length,
      revenue: paid.reduce((s, o) => s + o.price, 0),
      work: orders.filter((o) => o.crmStatus === "IN_PROGRESS").length,
      cancel: orders.filter((o) => o.crmStatus === "CANCELLED").length,
      ad: real.filter((o) => o.fromAd).length,
      adPaid: paid.filter((o) => o.fromAd).length,
    };
  }, [orders]);

  const shown = orders.filter((o) =>
    filter === "all" ? !o.isTest : filter === "ad" ? o.fromAd : filter === "pending" ? o.sentStatus !== o.crmStatus : o.crmStatus === filter);

  if (!data) return null;

  const chips: { id: Filter; t: string; n: number }[] = [
    { id: "all", t: "Все", n: stats.all },
    { id: "PAID", t: "Оплачен", n: stats.paid },
    { id: "IN_PROGRESS", t: "В работе", n: stats.work },
    { id: "CANCELLED", t: "Отменён", n: stats.cancel },
    { id: "ad", t: "С рекламы", n: stats.ad },
    { id: "SPAM", t: "Тесты", n: stats.test },
    { id: "pending", t: "Не отправлены", n: data.pending },
  ];

  return (
    <section style={{ marginBottom: 24, fontFamily: F }}>
      <h2 style={{ fontWeight: 800, fontSize: 19, marginBottom: 6 }}>Заказы приложения → CRM Метрики</h2>
      <p style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.5, marginBottom: 12 }}>
        Каждый заказ уходит в «Управление заказами» Метрики сам: в работе, оплачен (поездка завершена — с суммой и расходом), отменён. Тестовые заказы уходят как «спам» и в обучение не попадают.
        Отправка раз в сутки. Номер заказа в Метрике — <b style={{ color: "#fff" }}>trip_ID</b>.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8, marginBottom: 12 }}>
        {[
          { t: "Оплачено", v: String(stats.paid), c: GREEN },
          { t: "Выручка / прибыль", v: `${money(stats.revenue)} / ${money(stats.profit)}`, c: ORANGE2 },
          { t: "С рекламы оплачено", v: `${stats.adPaid} из ${stats.ad}`, c: "#fff" },
        ].map((s) => (
          <div key={s.t} style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 13, padding: "11px 10px" }}>
            <div style={{ color: MUTED, fontSize: 12 }}>{s.t}</div>
            <div style={{ fontWeight: 800, fontSize: 17, color: s.c, whiteSpace: "nowrap" }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 13, padding: "11px 13px", marginBottom: 12, fontSize: 13.5 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 700 }}>
          <Icon name={data.enabled ? "CircleCheck" : "TriangleAlert"} size={17} style={{ color: data.enabled ? GREEN : ORANGE2 }} />
          {data.enabled ? "Автоотправка включена" : "Нужен токен Метрики"}
        </div>
        <div style={{ color: MUTED, marginTop: 4, lineHeight: 1.5 }}>
          Последняя отправка: {dt(data.lastRun)}
          {data.lastResult && !data.lastResult.ok && <><br /><span style={{ color: RED }}>{data.lastResult.info}</span></>}
          <br />Ждут отправки: {data.pending}
        </div>
        <button type="button" disabled={busy !== null} onClick={() => send()}
          style={{ marginTop: 9, padding: "9px 13px", borderRadius: 10, background: "rgba(255,255,255,0.08)", border: `1px solid ${LINE}`, color: "#fff", fontWeight: 700, fontSize: 13.5, fontFamily: F, cursor: "pointer" }}>
          {busy === "all" ? "Отправляем..." : "Отправить сейчас"}
        </button>
        <div style={{ marginTop: 11, paddingTop: 10, borderTop: `1px solid ${LINE}`, color: MUTED, lineHeight: 1.5 }}>
          Расход по заказу (оплата водителю) считается сам: <b style={{ color: "#fff" }}>{data.driverPct}%</b> от цены поездки.
          Если по заказу расход другой — впишите его в карточке заказа.
          <div style={{ display: "flex", gap: 6, marginTop: 7 }}>
            <input value={pct} onChange={(e) => setPct(e.target.value.replace(/\D/g, "").slice(0, 3))} placeholder={`${data.driverPct}`} inputMode="numeric"
              style={{ width: 70, padding: "7px 9px", borderRadius: 9, background: DEEP, border: `1px solid ${LINE}`, color: "#fff", fontFamily: F, fontSize: 14 }} />
            <button type="button" disabled={busy !== null || !pct} onClick={() => post("crm_cost_pct", { pct: Number(pct) }, "all").then(() => setPct(""))}
              style={{ padding: "7px 12px", borderRadius: 9, background: "rgba(255,255,255,0.08)", border: `1px solid ${LINE}`, color: "#fff", fontWeight: 700, fontFamily: F, cursor: "pointer" }}>
              Изменить %
            </button>
          </div>
        </div>
        {msg && <div style={{ marginTop: 8, color: ORANGE2 }}>{msg}</div>}
      </div>

      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 6, marginBottom: 8 }}>
        {chips.map((c) => (
          <button key={c.id} type="button" onClick={() => setFilter(c.id)}
            style={{ flexShrink: 0, padding: "7px 11px", borderRadius: 999, fontSize: 13, fontWeight: 700, fontFamily: F, cursor: "pointer",
              background: filter === c.id ? "#fff" : DEEP, color: filter === c.id ? "#0d1b2e" : "#fff", border: `1px solid ${LINE}` }}>
            {c.t} · {c.n}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gap: 8 }}>
        {shown.length === 0 && <div style={{ color: MUTED, fontSize: 14, padding: 10 }}>Заказов нет</div>}
        {shown.map((o) => {
          const synced = o.sentStatus === o.crmStatus;
          return (
            <div key={o.id} style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 13, padding: "11px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                <div style={{ fontWeight: 800, fontSize: 14.5 }}>trip_{o.id} <span style={{ color: MUTED, fontWeight: 600, fontSize: 12.5 }}>· {dt(o.createdAt)}</span></div>
                <span style={{ fontSize: 12, fontWeight: 800, padding: "3px 9px", borderRadius: 999, color: "#0d1b2e", background: COLORS[o.crmStatus] }}>{o.crmStatusRu}</span>
              </div>
              <div style={{ fontSize: 13.5, marginTop: 5, lineHeight: 1.4 }}>
                {o.from} → {o.to}
                <div style={{ color: MUTED, fontSize: 12.5 }}>
                  {o.km ? `${Math.round(o.km)} км · ` : ""}{money(o.price)}{o.name ? ` · ${o.name}` : ""}{o.phone ? ` · ${o.phone}` : ""}
                </div>
              </div>
              {o.crmStatus === "PAID" && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 7, fontSize: 12.5, color: MUTED, flexWrap: "wrap" }}>
                  Расход:
                  <input value={costs[o.id] ?? String(Math.round(o.cost))} inputMode="numeric"
                    onChange={(e) => setCosts({ ...costs, [o.id]: e.target.value.replace(/\D/g, "") })}
                    style={{ width: 86, padding: "5px 8px", borderRadius: 8, background: DEEP, border: `1px solid ${LINE}`, color: "#fff", fontFamily: F, fontSize: 13 }} />
                  ₽ · прибыль <b style={{ color: GREEN }}>{money(o.price - Number(costs[o.id] ?? o.cost))}</b>
                  {!o.costManual && <span>(авто {data.driverPct}%)</span>}
                  {costs[o.id] !== undefined && costs[o.id] !== String(Math.round(o.cost)) && (
                    <button type="button" disabled={busy !== null} onClick={() => post("crm_order", { id: o.id, cost: costs[o.id] }, o.id).then(() => setCosts((c) => { const n = { ...c }; delete n[o.id]; return n; }))}
                      style={{ padding: "4px 9px", borderRadius: 8, background: ORANGE2, color: "#0d1b2e", border: 0, fontWeight: 800, fontFamily: F, cursor: "pointer" }}>
                      Сохранить
                    </button>
                  )}
                </div>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 7, fontSize: 12 }}>
                <span style={{ padding: "3px 8px", borderRadius: 8, background: DEEP, color: o.fromAd ? ORANGE2 : MUTED }}>
                  {o.fromAd ? `Реклама · кампания ${o.utmCampaign || o.utmSource || "Яндекс"}` : o.createdBy === "dispatcher" ? "Создан диспетчером" : "Не из рекламы"}
                </span>
                <span style={{ padding: "3px 8px", borderRadius: 8, background: DEEP, color: o.ymClientId ? GREEN : MUTED }}>
                  {o.ymClientId ? "Связь с визитом есть" : "Связь по телефону"}
                </span>
                <span style={{ padding: "3px 8px", borderRadius: 8, background: DEEP, color: synced ? GREEN : ORANGE2 }}>
                  {synced ? `В Метрике ${dt(o.sentAt)}` : o.error ? "Ошибка отправки" : "Ждёт отправки"}
                </span>
                <button type="button" disabled={busy !== null} onClick={() => post("crm_order", { id: o.id, isTest: !o.isTest }, o.id)}
                  style={{ padding: "3px 9px", borderRadius: 8, background: "rgba(255,255,255,0.08)", color: "#fff", border: 0, fontWeight: 700, fontFamily: F, cursor: "pointer" }}>
                  {o.isTest ? "Это реальный заказ" : "Это тест"}
                </button>
                <button type="button" disabled={busy !== null} onClick={() => send([o.id])}
                  style={{ padding: "3px 9px", borderRadius: 8, background: synced ? "rgba(255,255,255,0.08)" : ORANGE2, color: synced ? "#fff" : "#0d1b2e", border: 0, fontWeight: 800, fontFamily: F, cursor: "pointer" }}>
                  {busy === o.id ? "..." : synced ? "Отправить ещё раз" : "Отправить"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
