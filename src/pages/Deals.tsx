import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import MaxLeadPicker, { type MaxLead } from "@/components/deals/MaxLeadPicker";
import func2url from "../../backend/func2url.json";

const API = (func2url as Record<string, string>)["track-visit"] || "";

const NAVY = "#0d1b2e";
const CARD = "#13263d";
const DEEP = "#081321";
const LINE = "rgba(255,255,255,0.09)";
const ORANGE = "#ff7a1a";
const ORANGE2 = "#ff9f45";
const GREEN = "#37d67a";
const MUTED = "rgba(255,255,255,0.62)";
const F = "Manrope, system-ui, sans-serif";

interface Deal {
  id: number;
  clientName?: string;
  clientPhone?: string;
  routeFrom?: string;
  routeTo?: string;
  channel?: string;
  utmSource?: string;
  utmCampaign?: string;
  utmTerm?: string;
  amount: number;
  costs: number;
  profit: number;
  status: string;
  comment?: string;
  visitKey?: string;
  ymClientId?: string;
  gudokCall?: boolean;
  sentToMetrika?: boolean;
  maxUserId?: string;
  maxGoalSent?: boolean;
  maxGoalInfo?: string;
  createdAt?: string;
}

interface Campaign {
  name: string;
  deals: number;
  amount: number;
  profit: number;
}

interface AutoSync {
  enabled: boolean;
  lastRun?: string | null;
  pending: number;
}

const money = (n: number) => n.toLocaleString("ru-RU") + " ₽";

const EMPTY = {
  visitKey: "", clientName: "", clientPhone: "",
  routeFrom: "", routeTo: "", channel: "telegram",
  amount: "", costs: "", comment: "",
  maxUserId: "", maxUtmSource: "", maxUtmCampaign: "", maxUtmTerm: "",
};

export default function Deals() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [byCampaign, setByCampaign] = useState<Campaign[]>([]);
  const [totals, setTotals] = useState({ paidCount: 0, amount: 0, profit: 0 });
  const [auto, setAuto] = useState<AutoSync>({ enabled: false, pending: 0 });
  const [form, setForm] = useState({ ...EMPTY });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const load = useCallback(async () => {
    if (!API) return;
    try {
      const r = await fetch(API);
      const d = await r.json();
      setDeals(d.deals || []);
      setByCampaign(d.byCampaign || []);
      setTotals(d.totals || { paidCount: 0, amount: 0, profit: 0 });
      setAuto(d.autoSync || { enabled: false, pending: 0 });
    } catch {
      setMsg("Не удалось загрузить данные");
    }
  }, []);

  useEffect(() => {
    document.title = "Учёт оплат | Такси Дальняк";
    let m = document.querySelector('meta[name="robots"]');
    if (!m) {
      m = document.createElement("meta");
      m.setAttribute("name", "robots");
      document.head.appendChild(m);
    }
    m.setAttribute("content", "noindex, nofollow");
    load();
    return () => m?.setAttribute("content", "index, follow");
  }, [load]);

  const save = async () => {
    if (!form.amount) {
      setMsg("Укажите сумму оплаты");
      return;
    }
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, status: "paid" }),
      });
      const d = await r.json().catch(() => ({}));
      setForm({ ...EMPTY });
      if (d.maxGoal) setMsg(d.maxGoal.ok ? "Оплата записана и передана в Метрику через Макс" : `Оплата записана, но в Метрику не ушла: ${d.maxGoal.info}`);
      else setMsg("Оплата записана");
      await load();
    } catch {
      setMsg("Ошибка сохранения");
    }
    setBusy(false);
  };

  const sync = async () => {
    setBusy(true);
    setMsg("");
    try {
      const r = await fetch(API + "?action=sync", { method: "POST" });
      const d = await r.json();
      const noId = deals.filter((x) => !x.sentToMetrika && !x.ymClientId && !x.maxUserId).length;
      if (!d.ok) setMsg(`Метрика: ${d.info || "нужен токен"}`);
      else if (d.sent > 0) setMsg(`Передано в Метрику: ${d.sent}`);
      else if (noId > 0)
        setMsg(`Отправлять нечего: у ${noId} оплат нет кода клиента с сайта, Метрика не сможет связать их с рекламой. Вписывайте код из первого сообщения клиента.`);
      else setMsg("Новых оплат для отправки нет — всё уже в Метрике.");
      await load();
    } catch {
      setMsg("Ошибка передачи");
    }
    setBusy(false);
  };

  const resendMax = async (id: number) => {
    const r = await fetch(API + "?action=max_goal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const d = await r.json().catch(() => ({}));
    setMsg(d.ok ? "Оплата передана в Метрику через Макс" : `Не получилось: ${d.info || "ошибка"}`);
    await load();
  };

  const pickMax = (userId: string, lead?: MaxLead) =>
    setForm((f) => ({
      ...f,
      maxUserId: userId,
      channel: userId ? "max" : f.channel,
      clientName: lead && !f.clientName ? lead.name : f.clientName,
      maxUtmSource: lead?.utmSource || "",
      maxUtmCampaign: lead?.utmCampaign || "",
      maxUtmTerm: lead?.utmTerm || "",
    }));

  const remove = async (id: number) => {
    await fetch(API + "?id=" + id, { method: "DELETE" });
    await load();
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "12px 13px", borderRadius: 12,
    background: DEEP, border: `1px solid ${LINE}`, color: "#fff",
    fontFamily: F, fontSize: 15.5, outline: "none",
  };

  const field = (label: string, k: keyof typeof EMPTY, ph?: string, type?: string) => (
    <label key={k} style={{ display: "block" }}>
      <span style={{ display: "block", color: MUTED, fontSize: 13, marginBottom: 5 }}>{label}</span>
      <input
        style={inputStyle}
        type={type || "text"}
        inputMode={type === "number" ? "numeric" : undefined}
        placeholder={ph}
        value={form[k]}
        onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))}
      />
    </label>
  );

  const profit = (Number(form.amount) || 0) - (Number(form.costs) || 0);

  return (
    <main style={{ background: NAVY, minHeight: "100dvh", fontFamily: F, color: "#fff", padding: "26px 16px 56px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <h1 style={{ fontWeight: 800, fontSize: "clamp(25px,7vw,34px)", letterSpacing: "-0.03em", marginBottom: 6 }}>
          Учёт <span style={{ color: ORANGE2 }}>оплат</span>
        </h1>
        <p style={{ color: MUTED, fontSize: 14.5, marginBottom: 22, lineHeight: 1.45 }}>
          Записывайте сюда каждую оплаченную поездку. Реклама будет учиться искать таких же клиентов.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9, marginBottom: 22 }}>
          {[
            { t: "Оплат", v: String(totals.paidCount), c: "#fff" },
            { t: "Выручка", v: money(totals.amount), c: ORANGE2 },
            { t: "Чистыми", v: money(totals.profit), c: GREEN },
          ].map((s) => (
            <div key={s.t} style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: "13px 11px" }}>
              <div style={{ color: MUTED, fontSize: 12.5, marginBottom: 4 }}>{s.t}</div>
              <div style={{ fontWeight: 800, fontSize: "clamp(15px,4vw,19px)", color: s.c, whiteSpace: "nowrap" }}>{s.v}</div>
            </div>
          ))}
        </div>

        <section style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 16, padding: 16, marginBottom: 24 }}>
          <h2 style={{ fontWeight: 800, fontSize: 19, marginBottom: 14 }}>Новая оплата</h2>
          <div style={{ display: "grid", gap: 11 }}>
            <MaxLeadPicker
              api={API}
              value={form.maxUserId}
              onChange={pickMax}
              colors={{ card: CARD, deep: DEEP, line: LINE, muted: MUTED, accent: ORANGE2, green: GREEN }}
            />
            {!form.maxUserId && field("Или код клиента с сайта", "visitKey", "Например, K7PM2Q")}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
              {field("Сумма с клиента", "amount", "12000", "number")}
              {field("Расходы (водитель, бензин)", "costs", "8000", "number")}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
              {field("Откуда", "routeFrom", "Ростов")}
              {field("Куда", "routeTo", "Москва")}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 11 }}>
              {field("Имя клиента", "clientName", "Иван")}
              {field("Телефон", "clientPhone", "+7...")}
            </div>
            <label style={{ display: "block" }}>
              <span style={{ display: "block", color: MUTED, fontSize: 13, marginBottom: 5 }}>Откуда пришёл</span>
              <select
                style={inputStyle}
                value={form.channel}
                onChange={(e) => setForm((f) => ({ ...f, channel: e.target.value }))}
              >
                <option value="telegram">Telegram</option>
                <option value="max">Макс</option>
                <option value="phone">Звонок</option>
                <option value="vk">ВКонтакте</option>
                <option value="other">Другое</option>
              </select>
            </label>
            {field("Комментарий", "comment", "Необязательно")}

            <div style={{ color: MUTED, fontSize: 14 }}>
              Чистыми с поездки: <b style={{ color: profit >= 0 ? GREEN : "#ff6b6b" }}>{money(profit)}</b>
            </div>

            <button
              type="button"
              disabled={busy}
              onClick={save}
              style={{
                padding: "15px 18px", borderRadius: 13, border: "none", cursor: "pointer",
                background: `linear-gradient(135deg, ${ORANGE2}, ${ORANGE})`,
                color: "#10192a", fontWeight: 800, fontSize: 17, fontFamily: F,
                opacity: busy ? 0.6 : 1,
              }}
            >
              Записать оплату
            </button>
          </div>
        </section>

        <section style={{ marginBottom: 24 }}>
          <h2 style={{ fontWeight: 800, fontSize: 19, marginBottom: 12 }}>Передача в Метрику</h2>

          <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: "13px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 7 }}>
              <Icon
                name={auto.enabled ? "CircleCheck" : "TriangleAlert"}
                size={18}
                style={{ color: auto.enabled ? GREEN : ORANGE2 }}
              />
              <span style={{ fontWeight: 700, fontSize: 15.5 }}>
                {auto.enabled ? "Работает автоматически" : "Нужен доступ к Метрике"}
              </span>
            </div>

            <p style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.5, margin: 0 }}>
              {auto.enabled
                ? "Оплаты уходят в Метрику сами, раз в сутки. Нажимать ничего не нужно."
                : "Добавьте токен Метрики в настройках проекта — и отправка включится сама."}
              {auto.lastRun && (
                <>
                  <br />
                  Последняя отправка: {new Date(auto.lastRun).toLocaleString("ru-RU")}
                </>
              )}
              {auto.pending > 0 && (
                <>
                  <br />
                  Ждут отправки: {auto.pending}
                </>
              )}
            </p>

            <button
              type="button"
              disabled={busy}
              onClick={sync}
              style={{
                marginTop: 11, padding: "10px 14px", borderRadius: 11, cursor: "pointer",
                background: "rgba(255,255,255,0.07)", border: `1px solid ${LINE}`,
                color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: F,
              }}
            >
              Отправить сейчас
            </button>
          </div>

          {msg && (
            <div style={{ marginTop: 10, background: DEEP, border: `1px solid ${LINE}`, borderRadius: 12, padding: "11px 13px", color: ORANGE2, fontSize: 14 }}>
              {msg}
            </div>
          )}
        </section>

        {byCampaign.length > 0 && (
          <section style={{ marginBottom: 24 }}>
            <h2 style={{ fontWeight: 800, fontSize: 19, marginBottom: 12 }}>Что приносит деньги</h2>
            <div style={{ display: "grid", gap: 8 }}>
              {byCampaign.map((c) => (
                <div key={c.name} style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 13, padding: "12px 13px", display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</div>
                    <div style={{ color: MUTED, fontSize: 13 }}>{c.deals} оплат</div>
                  </div>
                  <div style={{ textAlign: "right", whiteSpace: "nowrap" }}>
                    <div style={{ fontWeight: 800, color: ORANGE2 }}>{money(c.amount)}</div>
                    <div style={{ color: GREEN, fontSize: 13 }}>{money(c.profit)} чистыми</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 style={{ fontWeight: 800, fontSize: 19, marginBottom: 12 }}>Последние записи</h2>
          {deals.length === 0 && (
            <div style={{ color: MUTED, fontSize: 14.5, background: CARD, border: `1px solid ${LINE}`, borderRadius: 13, padding: "14px 13px" }}>
              Пока пусто. Запишите первую оплату — и увидите, какая реклама её принесла.
            </div>
          )}
          <div style={{ display: "grid", gap: 8 }}>
            {deals.map((d) => (
              <div key={d.id} style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 13, padding: "12px 13px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 4 }}>
                  <div style={{ fontWeight: 700, fontSize: 15.5 }}>
                    {d.routeFrom || "—"} → {d.routeTo || "—"}
                  </div>
                  <div style={{ fontWeight: 800, color: ORANGE2, whiteSpace: "nowrap" }}>{money(d.amount)}</div>
                </div>
                <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.5 }}>
                  {d.clientName || "Без имени"} · {d.channel || "—"} · чистыми{" "}
                  <span style={{ color: GREEN }}>{money(d.profit)}</span>
                  <br />
                  {d.utmCampaign ? `Кампания: ${d.utmCampaign}` : "Источник не определён"}
                  {d.utmTerm ? ` · «${d.utmTerm}»` : ""}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                  {d.maxUserId ? (
                    <span style={{ fontSize: 12.5, color: d.maxGoalSent ? GREEN : ORANGE2, display: "flex", alignItems: "center", gap: 5 }}>
                      <Icon name={d.maxGoalSent ? "CircleCheck" : "CircleAlert"} size={14} />
                      {d.maxGoalSent ? "В Метрике через Макс" : "Не ушло в Метрику"}
                      {!d.maxGoalSent && (
                        <button
                          type="button"
                          onClick={() => resendMax(d.id)}
                          style={{ background: "none", border: "none", color: ORANGE2, textDecoration: "underline", cursor: "pointer", fontSize: 12.5, padding: 0 }}
                        >
                          повторить
                        </button>
                      )}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: 12.5,
                        fontWeight: 700,
                        padding: "3px 10px",
                        borderRadius: 999,
                        color: d.sentToMetrika ? GREEN : d.ymClientId ? ORANGE2 : "#ef4444",
                        background: d.sentToMetrika ? "rgba(55,214,122,0.14)" : d.ymClientId ? "rgba(255,159,69,0.14)" : "rgba(239,68,68,0.12)",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                      }}
                    >
                      <Icon name={d.sentToMetrika ? "CircleCheck" : d.ymClientId ? "Clock" : "CircleX"} size={14} />
                      {d.sentToMetrika ? "В Метрике" : d.ymClientId ? "Ждёт отправки" : "Не уйдёт, нет кода клиента"}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: 12.5,
                      fontWeight: 700,
                      padding: "3px 10px",
                      borderRadius: 999,
                      color: d.gudokCall ? GREEN : MUTED,
                      background: d.gudokCall ? "rgba(55,214,122,0.14)" : "rgba(255,255,255,0.06)",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Icon name={d.gudokCall ? "PhoneIncoming" : "PhoneOff"} size={14} />
                    {d.gudokCall ? "Найден звонок из Гудка" : "Звонок не найден"}
                  </span>
                  <button
                    type="button"
                    onClick={() => remove(d.id)}
                    style={{ marginLeft: "auto", background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: 13 }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}