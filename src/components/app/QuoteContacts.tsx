import { useState } from "react";
import Icon from "@/components/ui/icon";
import { trackLeadClick } from "@/lib/tracking";

const PHONE_HREF = "tel:+79956455125";

type Props = { tg: string; max: string; message: string; onContact: (channel: string) => void };

export default function QuoteContacts({ tg, max, message, onContact }: Props) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 6000);
    } catch { /* ignore */ }
  };

  const openChat = (e: React.MouseEvent<HTMLAnchorElement>, url: string, channel: string) => {
    e.preventDefault();
    trackLeadClick(channel);
    onContact(channel);
    copy();
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) window.location.href = url;
  };

  return (
    <div className="rounded-3xl border-2 border-emerald-100 bg-emerald-50/60 p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"><Icon name="Headset" fallback="Phone" size={20} /></div>
        <div className="min-w-0">
          <div className="text-[15px] font-extrabold text-neutral-900">Заказать через диспетчера — 24/7</div>
          <div className="text-xs text-neutral-500">Удобнее голосом? Позвоните или напишите — оформим заказ по этой цене, подскажем по КПП, багажу и времени.</div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <a href={PHONE_HREF} onClick={() => { trackLeadClick("phone"); onContact("call"); }} className="flex flex-col items-center gap-1 rounded-2xl bg-emerald-600 py-3 text-xs font-extrabold text-white">
          <Icon name="Phone" size={20} />Позвонить
        </a>
        <a href={max} onClick={(e) => openChat(e, max, "max")} className="flex flex-col items-center gap-1 rounded-2xl bg-white py-3 text-xs font-extrabold text-violet-700 shadow-sm">
          <Icon name="MessageCircle" size={20} />MAX
        </a>
        <a href={tg} onClick={(e) => openChat(e, tg, "telegram")} className="flex flex-col items-center gap-1 rounded-2xl bg-white py-3 text-xs font-extrabold text-sky-700 shadow-sm">
          <Icon name="Send" size={20} />Telegram
        </a>
      </div>
      <div className="mt-2 text-center text-[11px] font-semibold text-neutral-400">
        {copied ? "Маршрут и цена скопированы — вставьте в чат" : "8 995 645-51-25 · маршрут и цену скопируем для чата"}
      </div>
    </div>
  );
}
