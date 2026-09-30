import { useCallback, useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../backend/func2url.json";

const API = (func2url as Record<string, string>)["track-visit"] || "";

const NAVY = "#0d1b2e";
const CARD = "#13263d";
const LINE = "rgba(255,255,255,0.09)";
const ORANGE2 = "#ff9f45";
const GREEN = "#37d67a";
const MUTED = "rgba(255,255,255,0.62)";
const F = "Manrope, system-ui, sans-serif";

interface ChannelRow {
  channel: string;
  today: number;
  yesterday: number;
  week: number;
  total: number;
}

interface CampaignRow {
  campaign: string;
  term: string;
  count: number;
}

interface RecentRow {
  at: string | null;
  channel: string;
  page: string;
  campaign: string;
  term: string;
}

interface Report {
  totals: { today: number; week: number; all: number };
  byChannel: ChannelRow[];
  byCampaign: CampaignRow[];
  recent: RecentRow[];
}

const CHANNEL_NAME: Record<string, string> = {
  phone: "Звонок",
  call: "Звонок",
  telegram: "Telegram",
  tg: "Telegram",
  max: "Макс",
  vk: "ВКонтакте",
  whatsapp: "WhatsApp",
};

const CHANNEL_ICON: Record<string, string> = {
  phone: "PhoneCall",
  call: "PhoneCall",
  telegram: "Send",
  tg: "Send",
  max: "MessageCircle",
  vk: "Users",
  whatsapp: "MessageSquare",
};

function chName(c: string) {
  return CHANNEL_NAME[c] || c;
}

function fmtTime(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function Clicks() {
  const [data, setData] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!API) return;
    try {
      const r = await fetch(API + "?action=clicks");
      setData(await r.json());
    } catch {
      /* тихо */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    document.title = "Обращения с сайта | Такси Дальняк";
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, [load]);

  const totals = data?.totals ?? { today: 0, week: 0, all: 0 };

  return (
    <main style={{ background: NAVY, minHeight: "100dvh", fontFamily: F, color: "#fff", padding: "26px 16px 56px" }}>
      <div style={{ maxWidth: 680, margin: "0 auto" }}>
        <h1 style={{ fontWeight: 800, fontSize: "clamp(25px,7vw,34px)", letterSpacing: "-0.03em", marginBottom: 6 }}>
          Обращения <span style={{ color: ORANGE2 }}>с сайта</span>
        </h1>
        <p style={{ color: MUTED, fontSize: 14.5, marginBottom: 22, lineHeight: 1.45 }}>
          Каждое нажатие на телефон, Telegram и Макс — с рекламным запросом, по которому человек пришёл.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9, marginBottom: 22 }}>
          {[
            { t: "Сегодня", v: String(totals.today), c: GREEN },
            { t: "За 7 дней", v: String(totals.week), c: ORANGE2 },
            { t: "Всего", v: String(totals.all), c: "#fff" },
          ].map((s) => (
            <div key={s.t} style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: "13px 11px" }}>
              <div style={{ color: MUTED, fontSize: 12.5, marginBottom: 4 }}>{s.t}</div>
              <div style={{ fontWeight: 800, fontSize: "clamp(17px,5vw,22px)", color: s.c }}>{s.v}</div>
            </div>
          ))}
        </div>

        {loading && <p style={{ color: MUTED, fontSize: 14 }}>Загружаю…</p>}

        {!loading && totals.all === 0 && (
          <section style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 16, padding: 18, marginBottom: 24 }}>
            <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.5, margin: 0 }}>
              Пока пусто. Обращения начнут появляться здесь, как только сайт опубликуют и на него зайдут люди.
            </p>
          </section>
        )}

        {!!data?.byChannel.length && (
          <section style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
            <h2 style={{ fontWeight: 800, fontSize: 19, marginBottom: 14 }}>По каналам</h2>
            <div style={{ display: "grid", gap: 9 }}>
              {data.byChannel.map((c) => (
                <div
                  key={c.channel}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 11,
                    padding: "11px 12px",
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 12,
                  }}
                >
                  <Icon name={(CHANNEL_ICON[c.channel] || "MousePointerClick") as "PhoneCall"} size={18} style={{ color: ORANGE2 }} />
                  <span style={{ fontWeight: 700, fontSize: 15, flex: 1 }}>{chName(c.channel)}</span>
                  <span style={{ color: MUTED, fontSize: 12.5 }}>сегодня</span>
                  <span style={{ fontWeight: 800, fontSize: 16, color: GREEN, minWidth: 26, textAlign: "right" }}>{c.today}</span>
                  <span style={{ color: MUTED, fontSize: 12.5, minWidth: 62, textAlign: "right" }}>за 7 дн. {c.week}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {!!data?.byCampaign.length && (
          <section style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
            <h2 style={{ fontWeight: 800, fontSize: 19, marginBottom: 6 }}>Какая реклама работает</h2>
            <p style={{ color: MUTED, fontSize: 13, marginBottom: 14, lineHeight: 1.45 }}>
              За последние 7 дней. Слева — кампания и поисковый запрос, справа — сколько обращений принёс.
            </p>
            <div style={{ display: "grid", gap: 7 }}>
              {data.byCampaign.map((c, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 11,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{c.campaign}</div>
                    <div style={{ color: MUTED, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {c.term}
                    </div>
                  </div>
                  <span style={{ fontWeight: 800, fontSize: 16, color: ORANGE2 }}>{c.count}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {!!data?.recent.length && (
          <section style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 16, padding: 16 }}>
            <h2 style={{ fontWeight: 800, fontSize: 19, marginBottom: 14 }}>Последние обращения</h2>
            <div style={{ display: "grid", gap: 7 }}>
              {data.recent.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.04)",
                    borderRadius: 11,
                  }}
                >
                  <Icon name={(CHANNEL_ICON[r.channel] || "MousePointerClick") as "PhoneCall"} size={16} style={{ color: ORANGE2, flexShrink: 0 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{chName(r.channel)}</div>
                    <div style={{ color: MUTED, fontSize: 12.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.term !== "—" ? r.term : r.campaign}
                    </div>
                  </div>
                  <span style={{ color: MUTED, fontSize: 12.5, whiteSpace: "nowrap" }}>{fmtTime(r.at)}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
