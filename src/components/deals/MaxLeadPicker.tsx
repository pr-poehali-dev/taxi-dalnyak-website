import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

export interface MaxLead {
  userId: string;
  name: string;
  username?: string;
  date: number;
  utmSource?: string;
  utmCampaign?: string;
  utmTerm?: string;
}

interface Props {
  api: string;
  value: string;
  onChange: (userId: string, lead?: MaxLead) => void;
  colors: { card: string; deep: string; line: string; muted: string; accent: string; green: string };
}

export default function MaxLeadPicker({ api, value, onChange, colors }: Props) {
  const [leads, setLeads] = useState<MaxLead[]>([]);
  const [state, setState] = useState<"loading" | "ok" | "nokey" | "error">("loading");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!api) return;
    fetch(api + "?action=max_leads")
      .then((r) => r.json())
      .then((d) => {
        if (!d.enabled) return setState("nokey");
        setLeads(d.leads || []);
        setState(d.error ? "error" : "ok");
      })
      .catch(() => setState("error"));
  }, [api]);

  const selected = leads.find((l) => l.userId === value);
  const query = q.trim().toLowerCase();
  const list = leads
    .filter((l) => !query || l.name.toLowerCase().includes(query) || (l.username || "").toLowerCase().includes(query) || l.userId.includes(query))
    .slice(0, 30);

  const fmt = (t: number) =>
    t ? new Date(t * 1000).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : "";

  const box: React.CSSProperties = {
    width: "100%", padding: "12px 13px", borderRadius: 12, background: colors.deep,
    border: `1px solid ${colors.line}`, color: "#fff", fontSize: 15.5, outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
  };

  return (
    <div>
      <span style={{ display: "block", color: colors.muted, fontSize: 13, marginBottom: 5 }}>
        Клиент из Макса (кто написал с рекламы)
      </span>

      {selected || (value && state !== "ok") ? (
        <div style={{ ...box, display: "flex", alignItems: "center", gap: 10 }}>
          <Icon name="UserCheck" size={18} style={{ color: colors.green, flexShrink: 0 }} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {selected ? selected.name : "ID " + value}
            </div>
            {selected && (
              <div style={{ color: colors.muted, fontSize: 12.5 }}>
                написал {fmt(selected.date)}
                {selected.utmCampaign ? ` · ${selected.utmCampaign}` : ""}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            style={{ background: "none", border: "none", color: colors.muted, cursor: "pointer", padding: 4 }}
            aria-label="Убрать"
          >
            <Icon name="X" size={18} />
          </button>
        </div>
      ) : state === "ok" ? (
        <div style={{ position: "relative" }}>
          <input
            style={box}
            placeholder={leads.length ? "Начните вводить имя" : "За 21 день никто не написал"}
            value={q}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
            }}
          />
          {open && list.length > 0 && (
            <div
              style={{
                marginTop: 6, background: colors.card, border: `1px solid ${colors.line}`,
                borderRadius: 12, maxHeight: 280, overflowY: "auto",
              }}
            >
              {list.map((l) => (
                <button
                  key={l.userId}
                  type="button"
                  onClick={() => {
                    onChange(l.userId, l);
                    setQ("");
                    setOpen(false);
                  }}
                  style={{
                    display: "block", width: "100%", textAlign: "left", padding: "10px 12px",
                    background: "none", border: "none", borderBottom: `1px solid ${colors.line}`,
                    color: "#fff", cursor: "pointer", fontFamily: "inherit",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 15 }}>
                    {l.name}
                    {l.username ? <span style={{ color: colors.muted, fontWeight: 400 }}> @{l.username}</span> : null}
                  </div>
                  <div style={{ color: colors.muted, fontSize: 12.5 }}>
                    {fmt(l.date)}
                    {l.utmCampaign ? ` · ${l.utmCampaign}` : ""}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <input
          style={box}
          inputMode="numeric"
          placeholder={state === "loading" ? "Загружаю список…" : "ID клиента в Максе (цифры)"}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
        />
      )}

      {state === "nokey" && (
        <div style={{ color: colors.muted, fontSize: 12.5, marginTop: 5 }}>
          Чтобы выбирать клиента из списка, добавьте ключ для отчётов «Откуда Подписки».
        </div>
      )}
      {state === "error" && (
        <div style={{ color: colors.accent, fontSize: 12.5, marginTop: 5 }}>
          Не удалось получить список из «Откуда Подписки». Можно вписать ID вручную.
        </div>
      )}
    </div>
  );
}
