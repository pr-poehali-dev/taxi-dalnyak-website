import Icon from "@/components/ui/icon";

export interface LpLinks {
  phone: string;
  telegram: string;
  max: string;
}

interface Props {
  links: LpLinks;
  onLead: (channel: string) => void;
  size?: "lg" | "md";
}

export default function LpCta({ links, onLead, size = "lg" }: Props) {
  const pad = size === "lg" ? "py-4 text-base" : "py-3 text-sm";
  return (
    <div className="space-y-3">
      <a
        href={links.phone}
        onClick={() => onLead("phone")}
        className={`flex items-center justify-center gap-2 rounded-2xl font-extrabold uppercase active:scale-[0.98] transition ${pad}`}
        style={{ background: "linear-gradient(135deg,#fcd34d,#f59e0b)", color: "#111", boxShadow: "0 8px 30px rgba(245,158,11,0.35)" }}
      >
        <Icon name="Phone" size={20} />
        Позвонить и узнать цену
      </a>
      <div className="grid grid-cols-2 gap-3">
        <a
          href={links.telegram}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onLead("telegram")}
          className={`flex items-center justify-center gap-2 rounded-2xl font-bold active:scale-[0.98] transition ${pad}`}
          style={{ background: "linear-gradient(90deg,#0ea5e9,#38bdf8)", color: "#fff" }}
        >
          <Icon name="Send" size={18} />
          Telegram
        </a>
        <a
          href={links.max}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onLead("max")}
          className={`flex items-center justify-center gap-2 rounded-2xl font-bold active:scale-[0.98] transition ${pad}`}
          style={{ background: "linear-gradient(90deg,#7c3aed,#d946ef)", color: "#fff" }}
        >
          <Icon name="MessageCircle" size={18} />
          MAX
        </a>
      </div>
    </div>
  );
}
