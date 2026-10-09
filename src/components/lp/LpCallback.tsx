import { useState } from "react";
import Icon from "@/components/ui/icon";
import func2url from "../../../backend/func2url.json";

const URLS = func2url as Record<string, string>;

interface Utm {
  source: string;
  medium: string;
  campaign: string;
  term: string;
}

interface Props {
  city: string;
  utm: Utm;
  onLead: (channel: string) => void;
  id?: string;
  compact?: boolean;
  title?: string;
  subtitle?: string;
}

function formatPhone(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);
  const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
  let out = "+7";
  if (p[0]) out += ` (${p[0]}`;
  if (p[0].length === 3) out += ")";
  if (p[1]) out += ` ${p[1]}`;
  if (p[2]) out += `-${p[2]}`;
  if (p[3]) out += `-${p[3]}`;
  return out;
}

export default function LpCallback({ city, utm, onLead, id, compact, title, subtitle }: Props) {
  const [phone, setPhone] = useState("");
  const [to, setTo] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");

  const digits = phone.replace(/\D/g, "");
  const valid = digits.length === 11;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || state === "sending") return;
    setState("sending");
    try {
      const res = await fetch(URLS["orders-create"], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: "+" + digits,
          route_from: city,
          route_to: to.trim() || "уточнить маршрут",
          utm_source: utm.source,
          utm_medium: utm.medium,
          utm_campaign: utm.campaign,
          utm_term: utm.term,
        }),
      });
      if (!res.ok) throw new Error("fail");
      setState("done");
      onLead("form");
    } catch {
      setState("error");
    }
  };

  if (state === "done") {
    return (
      <div id={id} className="rounded-2xl p-5 text-center scroll-mt-4" style={{ background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.45)" }}>
        <span className="mx-auto w-12 h-12 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#fcd34d,#f59e0b)", color: "#111" }}>
          <Icon name="Check" size={24} />
        </span>
        <h3 className="mt-3 text-lg font-extrabold">Заявка принята</h3>
        <p className="mt-1 text-sm text-white/80">Диспетчер перезвонит в ближайшие минуты, назовёт цену и объяснит её.</p>
      </div>
    );
  }

  return (
    <form id={id} onSubmit={submit} className="rounded-2xl p-4 scroll-mt-4" style={{ background: "rgba(20,20,26,0.92)", border: "1px solid rgba(245,158,11,0.35)" }}>
      {!compact && (
        <>
          <h3 className="text-lg font-extrabold uppercase text-center" style={{ fontFamily: "Oswald, sans-serif" }}>
            {title ?? "Перезвоним и назовём цену"}
          </h3>
          <p className="mt-1 mb-3 text-center text-xs text-white/65">{subtitle ?? "Оставьте номер — диспетчер позвонит за 2 минуты"}</p>
        </>
      )}
      {compact && <p className="mb-2 text-center text-xs text-white/65">Или оставьте номер — перезвоним сами за 2 минуты</p>}
      <input
        value={to}
        onChange={(e) => setTo(e.target.value)}
        placeholder="Куда едем? (город, по желанию)"
        autoComplete="off"
        className="w-full rounded-xl px-4 py-3 text-[15px] font-semibold outline-none mb-2"
        style={{ background: "#0b0b0f", border: "1px solid rgba(255,255,255,0.14)", color: "#fff" }}
      />
      <div className="flex gap-2">
        <input
          type="tel"
          inputMode="tel"
          value={phone}
          onChange={(e) => setPhone(formatPhone(e.target.value))}
          onFocus={() => !phone && setPhone("+7")}
          placeholder="+7 (___) ___-__-__"
          autoComplete="tel"
          className="min-w-0 flex-1 rounded-xl px-4 py-3 text-[15px] font-bold outline-none"
          style={{ background: "#0b0b0f", border: "1px solid rgba(255,255,255,0.14)", color: "#fff" }}
        />
        <button
          type="submit"
          disabled={!valid || state === "sending"}
          className="rounded-xl px-4 font-extrabold uppercase text-sm disabled:opacity-50 active:scale-[0.98] transition"
          style={{ background: "linear-gradient(135deg,#fcd34d,#f59e0b)", color: "#111" }}
        >
          {state === "sending" ? "..." : "Перезвоните"}
        </button>
      </div>
      {state === "error" && <p className="mt-2 text-xs text-red-300 text-center">Не получилось отправить. Позвоните нам или напишите в мессенджер.</p>}
      <p className="mt-2 text-center text-[11px] text-white/45">Нажимая кнопку, вы соглашаетесь на обработку номера для связи по заказу</p>
    </form>
  );
}
