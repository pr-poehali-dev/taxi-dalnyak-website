import Icon from "@/components/ui/icon";
import type { LpLinks } from "./LpCta";

export default function LpStickyBar({ links, onLead }: { links: LpLinks; onLead: (c: string) => void }) {
  return (
    <div
      className="fixed bottom-0 inset-x-0 z-50 px-3 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(8px)", borderTop: "1px solid rgba(255,255,255,0.1)" }}
    >
      <div className="max-w-xl mx-auto grid grid-cols-[1fr_auto_auto] gap-2">
        <a
          href={links.phone}
          onClick={() => onLead("phone")}
          className="flex items-center justify-center gap-2 rounded-xl py-3 font-extrabold uppercase text-sm"
          style={{ background: "linear-gradient(135deg,#fcd34d,#f59e0b)", color: "#111" }}
        >
          <Icon name="Phone" size={18} /> Позвонить
        </a>
        <a href={links.telegram} target="_blank" rel="noopener noreferrer" onClick={() => onLead("telegram")} aria-label="Telegram"
          className="w-12 flex items-center justify-center rounded-xl" style={{ background: "#0ea5e9", color: "#fff" }}>
          <Icon name="Send" size={20} />
        </a>
        <a href={links.max} target="_blank" rel="noopener noreferrer" onClick={() => onLead("max")} aria-label="MAX"
          className="w-12 flex items-center justify-center rounded-xl" style={{ background: "#7c3aed", color: "#fff" }}>
          <Icon name="MessageCircle" size={20} />
        </a>
      </div>
    </div>
  );
}
