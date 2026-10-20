import type { ReactNode } from "react";

export const YELLOW = "#fcd34d";

export function Btn({ children, onClick, disabled, kind = "main", type = "button", className = "" }: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  kind?: "main" | "dark" | "ghost" | "danger";
  type?: "button" | "submit";
  className?: string;
}) {
  const styles: Record<string, string> = {
    main: "bg-[#fcd34d] text-black",
    dark: "bg-neutral-900 text-white",
    ghost: "bg-neutral-100 text-neutral-900",
    danger: "bg-red-50 text-red-600",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`rounded-2xl px-4 py-3.5 font-bold text-[15px] active:scale-[0.98] transition disabled:opacity-50 ${styles[kind]} ${className}`}>
      {children}
    </button>
  );
}

export function Field(props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  const { label, className = "", ...rest } = props;
  return (
    <label className="block">
      {label && <span className="mb-1 block text-xs font-semibold text-neutral-500">{label}</span>}
      <input {...rest} className={`w-full rounded-2xl bg-neutral-100 px-4 py-3.5 text-[15px] font-semibold text-neutral-900 outline-none focus:ring-2 focus:ring-[#fcd34d] ${className}`} />
    </label>
  );
}

export function Badge({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "green" | "yellow" | "red" | "blue" }) {
  const t = {
    gray: "bg-neutral-100 text-neutral-700",
    green: "bg-emerald-100 text-emerald-700",
    yellow: "bg-amber-100 text-amber-800",
    red: "bg-red-100 text-red-700",
    blue: "bg-sky-100 text-sky-700",
  }[tone];
  return <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${t}`}>{children}</span>;
}

export function tripTone(s: string): "gray" | "green" | "yellow" | "red" | "blue" {
  return ({ new: "yellow", assigned: "blue", arrived: "blue", in_progress: "green", done: "gray", cancelled: "red" } as const)[s as "new"] || "gray";
}

export function Shell({ title, onLogout, children, right }: { title: string; onLogout?: () => void; children: ReactNode; right?: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900" style={{ fontFamily: "Manrope, sans-serif" }}>
      <header className="sticky top-0 z-[1000] flex items-center justify-between bg-white px-4 py-3 shadow-sm">
        <a href="/app" className="text-lg font-extrabold">{title}</a>
        <div className="flex items-center gap-3">
          {right}
          {onLogout && <button onClick={onLogout} className="text-sm font-semibold text-neutral-500">Выйти</button>}
        </div>
      </header>
      {children}
    </div>
  );
}
