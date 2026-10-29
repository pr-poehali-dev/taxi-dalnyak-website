import Icon from "@/components/ui/icon";
import type { LpLinks } from "@/components/lp/LpCta";
import { cityRod } from "@/lib/routeFromQuery";

interface Props {
  links: LpLinks;
  onLead: (c: string) => void;
  phone: string;
  from: string | null;
  to: string | null;
  minKm: number;
}

const CHIPS = [
  { icon: "Lock", text: "Цена фиксируется до выезда" },
  { icon: "Wallet", text: "Без предоплаты" },
  { icon: "UserCheck", text: "Без попутчиков" },
  { icon: "Clock", text: "24/7, подача от 30 минут" },
];

export default function RuHero({ links, onLead, phone, from, to, minKm }: Props) {
  const fromLabel = from ?? "Ваш город";
  const toLabel = to ?? "Любой город России";

  return (
    <section className="relative overflow-hidden" style={{ background: "radial-gradient(120% 70% at 50% 0%, #2a1f06 0%, #0b0b0f 62%)" }}>
      <div className="relative px-5 pt-4 pb-8 max-w-xl mx-auto">
        <header className="flex items-center justify-between gap-3">
          <a href="/" className="flex items-center gap-2">
            <img src="/logo-dalnyak-s.webp" alt="Такси Дальняк" width={64} height={40} className="w-16 rounded-lg" />
          </a>
          <a href={links.phone} onClick={() => onLead("phone")} className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-extrabold text-amber-300" style={{ background: "rgba(251,191,36,0.1)", border: "1px solid rgba(251,191,36,0.3)" }}>
            <Icon name="Phone" size={15} /> {phone}
          </a>
        </header>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold text-white/85" style={{ background: "rgba(255,255,255,0.06)" }}>
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70 animate-ping" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </span>
          Диспетчер на связи · отвечаем за 1 минуту
        </div>

        <h1 className="mt-4 text-[32px] leading-[1.05] sm:text-5xl font-bold uppercase" style={{ fontFamily: "Oswald, sans-serif" }}>
          {from && to ? (
            <>Такси межгород <span className="text-amber-400">{from} — {to}</span></>
          ) : from ? (
            <>Такси межгород <span className="text-amber-400">из {cityRod(from)}</span> в другой город</>
          ) : (
            <>Такси межгород <span className="text-amber-400">из вашего города</span> в другой город</>
          )}
        </h1>
        <p className="mt-3 text-[16px] font-semibold text-white/80 leading-snug">
          Отвезём от двери до двери в любой город России, в Крым, ДНР и ЛНР. Работаем только с дальними поездками, от {minKm} км.
        </p>

        <div className="mt-5 rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-center self-stretch py-1">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="flex-1 w-px my-1 border-l-2 border-dashed border-amber-400/50" />
              <span className="w-3 h-3 rounded-full border-2 border-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] uppercase tracking-wider text-white/50 font-bold">Откуда</div>
              <div className="font-extrabold text-lg truncate">{fromLabel}</div>
              <div className="h-3" />
              <div className="text-[11px] uppercase tracking-wider text-white/50 font-bold">Куда</div>
              <div className="font-extrabold text-lg truncate">{toLabel}</div>
            </div>
            <Icon name="CarFront" size={34} className="text-amber-400 shrink-0" />
          </div>
        </div>

        <a
          href={links.phone}
          onClick={() => onLead("phone")}
          className="mt-5 flex flex-col items-center justify-center rounded-2xl py-4 active:scale-[0.98] transition"
          style={{ background: "linear-gradient(135deg,#fcd34d,#f59e0b)", color: "#111", boxShadow: "0 10px 40px rgba(245,158,11,0.35)" }}
        >
          <span className="flex items-center gap-2 text-xl font-extrabold uppercase">
            <Icon name="Phone" size={22} /> Позвонить и узнать цену
          </span>
          <span className="mt-0.5 text-sm font-bold opacity-75">{phone} · круглосуточно</span>
        </a>

        <div className="mt-3 grid grid-cols-2 gap-3">
          <a href={links.telegram} target="_blank" rel="noopener noreferrer" onClick={() => onLead("telegram")}
            className="flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold active:scale-[0.98] transition"
            style={{ background: "#229ED9", color: "#fff" }}>
            <Icon name="Send" size={18} /> Telegram
          </a>
          <a href={links.max} target="_blank" rel="noopener noreferrer" onClick={() => onLead("max")}
            className="flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold active:scale-[0.98] transition"
            style={{ background: "linear-gradient(90deg,#4f46e5,#7c3aed)", color: "#fff" }}>
            <Icon name="MessageCircle" size={18} /> MAX
          </a>
        </div>
        <p className="mt-2 text-center text-xs text-white/55">Напишите «откуда — куда — когда», цену назовём сразу</p>

        <div className="mt-5 grid grid-cols-2 gap-2">
          {CHIPS.map((c) => (
            <span key={c.text} className="flex items-center gap-2 text-[13px] font-bold text-white/85 leading-tight">
              <Icon name={c.icon} fallback="Check" size={16} className="text-amber-300 shrink-0" /> {c.text}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
