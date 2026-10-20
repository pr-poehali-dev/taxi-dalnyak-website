import Icon from "@/components/ui/icon";

export function tgUrl(raw: string) {
  const v = (raw || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  if (/^(t\.me|telegram\.me)\//i.test(v)) return "https://" + v;
  return "https://t.me/" + v.replace(/^@/, "");
}

export function maxUrl(raw: string) {
  const v = (raw || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return "https://" + v.replace(/^\/+/, "");
}

export default function SupportLinks({ telegram, max, className = "" }: { telegram?: string; max?: string; className?: string }) {
  const tg = tgUrl(telegram || "");
  const mx = maxUrl(max || "");
  if (!tg && !mx) return null;
  const open = (e: React.MouseEvent<HTMLAnchorElement>, url: string) => {
    e.preventDefault();
    const w = window.open(url, "_blank", "noopener,noreferrer");
    if (!w) window.location.href = url;
  };
  return (
    <div className={className}>
      <div className="mb-2 text-xs font-bold uppercase text-neutral-400">Нужна помощь? Напишите в поддержку</div>
      <div className="flex gap-2">
        {tg && (
          <a href={tg} onClick={(e) => open(e, tg)} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-sky-50 py-3.5 text-center text-sm font-extrabold text-sky-700">
            <Icon name="Send" size={16} /> Telegram
          </a>
        )}
        {mx && (
          <a href={mx} onClick={(e) => open(e, mx)} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-violet-50 py-3.5 text-center text-sm font-extrabold text-violet-700">
            <Icon name="MessageCircle" size={16} /> MAX
          </a>
        )}
      </div>
    </div>
  );
}
