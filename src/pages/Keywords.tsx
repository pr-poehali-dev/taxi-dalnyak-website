import { useEffect, useRef, useState } from "react";

const GOLD = "#c9a84c";
const GOLD2 = "#e5cd7d";

type Tab = "keys" | "minus";

export default function Keywords() {
  const [tab, setTab] = useState<Tab>("keys");
  const [keys, setKeys] = useState("");
  const [minus, setMinus] = useState("");
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    document.title = "Ключевые фразы и минус-слова для Яндекс Директ";
    const load = (u: string) =>
      fetch(u).then((r) => r.text()).then((t) => t.replace(/^\uFEFF/, "").trim());
    load("/direct-keywords.txt").then(setKeys);
    load("/direct-minus.txt").then(setMinus);
  }, []);

  const text = tab === "keys" ? keys : minus;
  const count = text ? text.split("\n").length : 0;

  const copy = async () => {
    const el = ref.current;
    if (el) {
      el.select();
      el.setSelectionRange(0, 999999);
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      document.execCommand("copy");
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const tabStyle = (active: boolean) => ({
    flex: 1,
    padding: "11px 8px",
    borderRadius: 10,
    border: active ? `1px solid ${GOLD}` : "1px solid rgba(255,255,255,0.12)",
    background: active ? "rgba(201,168,76,0.14)" : "transparent",
    color: active ? GOLD : "rgba(255,255,255,0.6)",
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "#fff", padding: 20 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 20, margin: "0 0 12px" }}>Настройки для Яндекс Директ</h1>

        <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <button onClick={() => setTab("keys")} style={tabStyle(tab === "keys")}>
            Ключевые фразы
          </button>
          <button onClick={() => setTab("minus")} style={tabStyle(tab === "minus")}>
            Минус-слова
          </button>
        </div>

        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: "0 0 14px" }}>
          {tab === "keys"
            ? `${count} фраз. Скопируйте и вставьте в поле «Ключевые фразы» при создании группы объявлений.`
            : `${count} минус-слов. Скопируйте и вставьте в «Минус-фразы» на уровне кампании.`}
        </p>

        <button
          onClick={copy}
          style={{
            background: `linear-gradient(135deg,${GOLD},${GOLD2})`,
            color: "#0a0f1e", border: 0, borderRadius: 10, padding: "14px 22px",
            fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", marginBottom: 14,
          }}>
          {copied ? "Скопировано!" : tab === "keys" ? "Скопировать все фразы" : "Скопировать минус-слова"}
        </button>

        <textarea
          ref={ref}
          readOnly
          value={text}
          style={{
            width: "100%", height: "60vh", background: "#111827", color: "#e5e7eb",
            border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: 12,
            fontFamily: "ui-monospace,monospace", fontSize: 13, lineHeight: 1.6,
            resize: "vertical", boxSizing: "border-box",
          }}
        />
      </div>
    </div>
  );
}
