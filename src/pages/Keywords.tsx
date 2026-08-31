import { useEffect, useRef, useState } from "react";

const GOLD = "#c9a84c";
const GOLD2 = "#e5cd7d";

export default function Keywords() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    document.title = "Ключевые фразы для Яндекс Директ";
    fetch("/direct-keywords.txt")
      .then((r) => r.text())
      .then((t) => setText(t.replace(/^\uFEFF/, "").trim()));
  }, []);

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

  const count = text ? text.split("\n").length : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#0a0f1e", color: "#fff", padding: 20 }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <h1 style={{ fontSize: 20, margin: "0 0 4px" }}>
          Ключевые фразы {count ? `— ${count} шт.` : ""}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, margin: "0 0 16px" }}>
          Нажмите кнопку, затем вставьте в поле «Ключевые фразы» в Яндекс Директ.
        </p>

        <button
          onClick={copy}
          style={{
            background: `linear-gradient(135deg,${GOLD},${GOLD2})`,
            color: "#0a0f1e", border: 0, borderRadius: 10, padding: "14px 22px",
            fontSize: 15, fontWeight: 700, cursor: "pointer", width: "100%", marginBottom: 14,
          }}>
          {copied ? "Скопировано!" : "Скопировать все фразы"}
        </button>

        <textarea
          ref={ref}
          readOnly
          value={text}
          style={{
            width: "100%", height: "65vh", background: "#111827", color: "#e5e7eb",
            border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10, padding: 12,
            fontFamily: "ui-monospace,monospace", fontSize: 13, lineHeight: 1.6,
            resize: "vertical", boxSizing: "border-box",
          }}
        />
      </div>
    </div>
  );
}
