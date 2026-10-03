import Icon from "@/components/ui/icon";

interface Props {
  links: { phone: string; telegram: string; max: string };
  phone: string;
  onLead: (channel: string) => void;
}

export default function ContactButtons({ links, phone, onLead }: Props) {
  const items = [
    { channel: "telegram", href: links.telegram, label: "Telegram", icon: "Send", cls: "bg-gradient-to-r from-sky-500 to-sky-400 border-sky-300/60" },
    { channel: "phone", href: links.phone, label: "Позвонить", icon: "Phone", cls: "bg-black border-white/80", sub: phone },
    { channel: "max", href: links.max, label: "MAX", icon: "MessageCircle", cls: "bg-gradient-to-r from-violet-600 to-fuchsia-500 border-fuchsia-300/60" },
  ];

  return (
    <section id="contacts" className="px-4 pt-8 pb-4 max-w-xl mx-auto space-y-4 scroll-mt-4">
      {items.map((it) => {
        const ext = it.channel !== "phone";
        return (
          <a
            key={it.channel}
            href={it.href}
            target={ext ? "_blank" : undefined}
            rel={ext ? "noopener noreferrer" : undefined}
            onClick={() => onLead(it.channel)}
            className={`flex items-center gap-3 rounded-2xl border-2 px-4 py-3.5 shadow-lg active:scale-[0.98] transition ${it.cls}`}
          >
            <span className="w-9 h-9 rounded-full bg-white/25 flex items-center justify-center shrink-0">
              <Icon name={it.icon} size={18} className="text-white" />
            </span>
            <span className="flex-1 text-center">
              <span className="block font-bold uppercase tracking-wide">{it.label}</span>
              {it.sub && <span className="block text-xs text-white/70">{it.sub}</span>}
            </span>
            <Icon name="ChevronRight" size={22} className="text-white" />
          </a>
        );
      })}
    </section>
  );
}
