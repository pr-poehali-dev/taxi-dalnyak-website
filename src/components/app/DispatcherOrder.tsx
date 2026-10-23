import Icon from "@/components/ui/icon";
import { trackLeadClick } from "@/lib/tracking";

const PHONE_HREF = "tel:+79956455125";

type Props = { tg: string; max: string; onContact?: (channel: string) => void; compact?: boolean };

export default function DispatcherOrder({ tg, max, onContact, compact }: Props) {
  const go = (ch: string) => () => { trackLeadClick(ch === "call" ? "phone" : ch); onContact?.(ch); };
  return (
    <div className={`rounded-3xl bg-neutral-900 text-white ${compact ? "p-3" : "p-4"}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[15px] font-extrabold leading-tight">Заказать через диспетчера</div>
          <div className="text-xs text-white/60">Круглосуточно · посчитаем и подберём машину</div>
        </div>
        <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-1 text-[11px] font-bold text-emerald-300">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />на связи
        </span>
      </div>
      <a href={PHONE_HREF} onClick={go("call")}
        className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 py-3.5 text-base font-extrabold text-white active:bg-emerald-600">
        <Icon name="Phone" size={20} /> 8 995 645-51-25
      </a>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <a href={max} target="_blank" rel="noopener noreferrer" onClick={go("max")}
          className="flex items-center justify-center gap-2 rounded-2xl bg-violet-600 py-3 text-sm font-extrabold text-white">
          <Icon name="MessageCircle" size={18} /> MAX
        </a>
        <a href={tg} target="_blank" rel="noopener noreferrer" onClick={go("telegram")}
          className="flex items-center justify-center gap-2 rounded-2xl bg-sky-500 py-3 text-sm font-extrabold text-white">
          <Icon name="Send" size={18} /> Telegram
        </a>
      </div>
    </div>
  );
}
