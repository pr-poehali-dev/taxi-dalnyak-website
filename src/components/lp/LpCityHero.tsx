import type { ReactNode } from "react";
import Icon from "@/components/ui/icon";
import type { LpLinks } from "./LpCta";

interface Props {
  links: LpLinks;
  onLead: (c: string) => void;
  phone: string;
  badge: string;
  title: ReactNode;
  sub: string;
}

const CHIPS = [
  { icon: "Timer", text: "Подача от 30 минут" },
  { icon: "Wallet", text: "Без предоплаты" },
  { icon: "Lock", text: "Цена не меняется" },
];

export default function LpCityHero({ links, onLead, phone, badge, title, sub }: Props) {
  return (
    <section style={{ background: "radial-gradient(120% 80% at 50% 0%, #1f1a0b 0%, #0a0a0d 60%)" }}>
      <div className="px-5 pt-5 pb-8 max-w-xl mx-auto">
        <div className="flex items-center justify-between gap-3">
          <a href="/"><img src="/logo-dalnyak.webp" alt="Такси Дальняк" width={600} height={371} className="w-20 rounded-xl" /></a>
          <a href={links.phone} onClick={() => onLead("phone")} className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
            <Icon name="Phone" size={16} /> {phone}
          </a>
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs font-bold text-white/80">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          Диспетчер на связи сейчас · {badge}
        </div>

        <h1 className="mt-3 text-[34px] sm:text-5xl font-bold uppercase leading-[1.05]" style={{ fontFamily: "Oswald, sans-serif" }}>
          {title}
        </h1>
        <p className="mt-3 text-base font-semibold text-white/80 leading-snug">{sub}</p>

        <a
          href={links.phone}
          onClick={() => onLead("phone")}
          className="mt-6 flex flex-col items-center justify-center rounded-2xl py-5 active:scale-[0.98] transition"
          style={{ background: "linear-gradient(135deg,#fcd34d,#f59e0b)", color: "#111", boxShadow: "0 10px 40px rgba(245,158,11,0.4)" }}
        >
          <span className="flex items-center gap-2 text-xl font-extrabold uppercase">
            <Icon name="Phone" size={24} /> Вызвать машину
          </span>
          <span className="mt-0.5 text-sm font-bold opacity-75">{phone}</span>
        </a>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <a href={links.telegram} target="_blank" rel="noopener noreferrer" onClick={() => onLead("telegram")}
            className="flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold active:scale-[0.98] transition"
            style={{ background: "linear-gradient(90deg,#0ea5e9,#38bdf8)", color: "#fff" }}>
            <Icon name="Send" size={18} /> Telegram
          </a>
          <a href={links.max} target="_blank" rel="noopener noreferrer" onClick={() => onLead("max")}
            className="flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold active:scale-[0.98] transition"
            style={{ background: "linear-gradient(90deg,#7c3aed,#d946ef)", color: "#fff" }}>
            <Icon name="MessageCircle" size={18} /> MAX
          </a>
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2">
          {CHIPS.map((c) => (
            <span key={c.text} className="flex items-center gap-1.5 text-[13px] font-bold text-white/85">
              <Icon name={c.icon} fallback="Check" size={15} className="text-amber-300" /> {c.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
