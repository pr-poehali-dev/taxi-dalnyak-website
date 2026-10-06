import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

interface Item {
  src: "click" | "call" | "max";
  id: number | string;
  utm?: { s?: string; c?: string; t?: string };
  info?: string | null;
  channel: string;
  caller?: string;
  page?: string;
  campaign?: string;
  term?: string;
  at?: string;
  hasId: boolean;
  dealId?: number | null;
  dealStatus?: string | null;
  amount?: number | null;
  paidSent: boolean;
  orderSent: boolean;
  spam: boolean;
  name?: string | null;
}

const CARD = "#13263d";
const DEEP = "#081321";
const LINE = "rgba(255,255,255,0.09)";
const ORANGE = "#ff7a1a";
const GREEN = "#37d67a";
const RED = "#ff6b6b";
const MUTED = "rgba(255,255,255,0.62)";

const CH: Record<string, string> = {
  gudok: "Звонок", phone: "Звонок", call: "Звонок", telegram: "Telegram", tg: "Telegram", max: "Макс",
};

const fmt = (iso?: string) => {
  if (!iso) return "";
  const d = new Date(iso.endsWith("Z") ? iso : iso + "Z");
  return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
};

const inp = {
  background: DEEP, border: `1px solid ${LINE}`, borderRadius: 10, color: "#fff",
  padding: "10px 12px", fontSize: 14, width: "100%", fontFamily: "inherit",
} as const;

const btn = (bg: string, fg: string) => ({
  background: bg, color: fg, border: "none", borderRadius: 9, padding: "8px 13px",
  fontWeight: 800, fontSize: 13, cursor: "pointer",
}) as const;

export default function LeadsFeed({ api, onChanged }: { api: string; onChanged: () => void }) {
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [f, setF] = useState({ amount: "", costs: "", clientName: "", routeFrom: "", routeTo: "" });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [hideSpam, setHideSpam] = useState(true);

  const load = useCallback(async () => {
    try {
      const [fd, md] = await Promise.all([
        fetch(api + "?action=feed").then((r) => r.json()),
        fetch(api + "?action=max_leads").then((r) => r.json()).catch(() => ({ leads: [] })),
      ]);
      const deals = fd.maxDeals || {};
      const maxItems: Item[] = (md.leads || []).map((l: any) => {
        const d = deals[l.userId];
        const iso = l.date ? new Date(l.date * 1000).toISOString() : undefined;
        return {
          src: "max", id: l.userId, channel: "max", name: l.name, at: iso,
          campaign: l.utmCampaign || undefined, term: l.utmTerm || undefined,
          utm: { s: l.utmSource, c: l.utmCampaign, t: l.utmTerm },
          hasId: true, dealId: d?.dealId, dealStatus: d?.status, amount: d?.amount,
          paidSent: !!d?.paidSent, orderSent: !!d?.orderSent, spam: false, info: d?.info,
        } as Item;
      });
      const all = [...(fd.feed || []), ...maxItems];
      all.sort((a, b) => (b.at || "").localeCompare(a.at || ""));
      setItems(all);
    } catch {
      setMsg("Не удалось загрузить обращения");
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

  const key = (i: Item) => `${i.src}-${i.id}`;

  const send = async (i: Item, stage: "order" | "paid") => {
    if (stage === "paid" && !f.amount) return setMsg("Укажите сумму оплаты");
    setBusy(true);
    const d = await post("stage", {
      src: i.src, id: i.id, stage, name: i.name,
      utmSource: i.utm?.s, utmCampaign: i.utm?.c, utmTerm: i.utm?.t, ...f,
    });
    setBusy(false);
    if (!d.ok) return setMsg(d.error || "Не удалось сохранить");
    if (i.src === "max") {
      setMsg(
        d.sent
          ? "Передано в Метрику через «Откуда Подписки»"
          : /tracking link/.test(d.info || "")
            ? "Записано у нас, но Макс не принял: этот человек пришёл не по рекламной ссылке, связать его с рекламой нельзя"
            : `Записано, но Метрика не приняла: ${d.info || "ошибка"}`,
      );
    } else if (!i.hasId) setMsg("Записано, но у обращения нет кода клиента Метрики — в Метрику не уйдёт");
    else if (d.metrika && d.metrika.ok === false) setMsg(`Записано, Метрика ответила ошибкой: ${d.metrika.info}`);
    else setMsg(stage === "paid" ? "Оплата передана в Метрику" : "Заказ передан в Метрику");
    setOpen(null);
    setF({ amount: "", costs: "", clientName: "", routeFrom: "", routeTo: "" });
    load();
    onChanged();
  };

  const spam = async (i: Item) => {
    await post("feed_spam", { src: i.src, id: i.id, spam: !i.spam });
    load();
  };

  const shown = items.filter((i) => !(hideSpam && i.spam));

  return (
    <section style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 16, padding: 16, marginBottom: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <h2 style={{ fontWeight: 800, fontSize: 19 }}>Обращения клиентов</h2>
        <label style={{ color: MUTED, fontSize: 13, display: "flex", gap: 6, alignItems: "center" }}>
          <input type="checkbox" checked={hideSpam} onChange={(e) => setHideSpam(e.target.checked)} />
          скрыть спам
        </label>
      </div>
      <p style={{ color: MUTED, fontSize: 13, margin: "4px 0 12px" }}>
        Звонки, Telegram и Макс в одном списке. Нажмите «Заказал» или «Оплатил» — Метрика сразу узнает и научит рекламу искать таких клиентов.
      </p>
      {msg && <div style={{ color: ORANGE, fontSize: 13, marginBottom: 10 }}>{msg}</div>}
      {shown.length === 0 && <div style={{ color: MUTED, fontSize: 14 }}>Обращений пока нет.</div>}

      <div style={{ display: "grid", gap: 10 }}>
        {shown.map((i) => {
          const paid = i.dealStatus === "paid";
          const ordered = paid || i.dealStatus === "order";
          const k = key(i);
          return (
            <div key={k} style={{ background: DEEP, border: `1px solid ${LINE}`, borderRadius: 12, padding: 12, opacity: i.spam ? 0.5 : 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
                <b style={{ fontSize: 15 }}>
                  {CH[i.channel] || i.channel}
                  {i.caller ? ` · ${i.caller}` : ""}
                  {i.name ? ` · ${i.name}` : ""}
                </b>
                <span style={{ color: MUTED, fontSize: 13 }}>{fmt(i.at)}</span>
              </div>
              <div style={{ color: MUTED, fontSize: 12.5, margin: "4px 0 8px" }}>
                {i.campaign ? `Кампания ${i.campaign}` : "Кампания не определена"}
                {i.term ? ` · «${i.term}»` : ""}
                {" · "}
                <span style={{ color: i.hasId ? GREEN : RED }}>
                  {i.hasId ? "Метрика узнает клиента" : "нет кода клиента"}
                </span>
              </div>

              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {paid ? (
                  <span style={{ color: GREEN, fontSize: 13, fontWeight: 700, display: "flex", gap: 5, alignItems: "center" }}>
                    <Icon name="CircleCheck" size={14} />
                    Оплатил {i.amount?.toLocaleString("ru-RU")} ₽ · {i.paidSent ? "в Метрике" : "ждёт отправки"}
                  </span>
                ) : (
                  <>
                    {i.src === "max" && i.dealStatus === "order" && !i.orderSent && (
                      <span style={{ color: RED, fontSize: 12.5 }}>заказ не принят</span>
                    )}
                    {ordered ? (
                      <span style={{ color: GREEN, fontSize: 13, fontWeight: 700 }}>
                        Заказал · {i.orderSent ? "в Метрике" : "ждёт отправки"}
                      </span>
                    ) : (
                      <button type="button" disabled={busy} onClick={() => send(i, "order")} style={btn("#2b4a6e", "#fff")}>
                        Заказал
                      </button>
                    )}
                    <button type="button" onClick={() => setOpen(open === k ? null : k)} style={btn(ORANGE, "#1a0c00")}>
                      Оплатил
                    </button>
                    {i.src !== "max" && <button
                      type="button"
                      onClick={() => spam(i)}
                      style={{ ...btn("none", i.spam ? GREEN : MUTED), border: `1px solid ${LINE}` }}
                    >
                      {i.spam ? "Не спам" : "Спам"}
                    </button>}
                  </>
                )}
              </div>

              {open === k && !paid && (
                <div style={{ display: "grid", gap: 8, marginTop: 10 }}>
                  <input style={inp} inputMode="numeric" placeholder="Сумма с клиента, ₽" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} />
                  <input style={inp} inputMode="numeric" placeholder="Расходы (водитель, бензин), ₽" value={f.costs} onChange={(e) => setF({ ...f, costs: e.target.value })} />
                  <input style={inp} placeholder="Имя клиента (необязательно)" value={f.clientName} onChange={(e) => setF({ ...f, clientName: e.target.value })} />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <input style={inp} placeholder="Откуда" value={f.routeFrom} onChange={(e) => setF({ ...f, routeFrom: e.target.value })} />
                    <input style={inp} placeholder="Куда" value={f.routeTo} onChange={(e) => setF({ ...f, routeTo: e.target.value })} />
                  </div>
                  <button type="button" disabled={busy} onClick={() => send(i, "paid")} style={{ ...btn(GREEN, "#04230f"), padding: 11, fontSize: 14 }}>
                    {busy ? "Отправляю…" : "Сохранить и отправить в Метрику"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
