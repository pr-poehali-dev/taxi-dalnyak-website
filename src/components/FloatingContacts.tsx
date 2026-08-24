import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { DEFAULT_CONTACTS, type Contacts } from "@/lib/contacts";

const GOLD = "#c9a84c";
const GOLD2 = "#e8c96a";

interface Props {
  contacts?: Contacts;
  onLead?: (channel: string) => void;
}

export default function FloatingContacts({ contacts = DEFAULT_CONTACTS, onLead }: Props) {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 420);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = [
    {
      key: "tg",
      label: "Telegram",
      href: contacts.TG_HREF,
      bg: "linear-gradient(135deg,#0e6da8,#1a8fc2)",
      icon: "Send",
      external: true,
    },
    {
      key: "max",
      label: "MAX",
      href: contacts.MAX_HREF,
      bg: "linear-gradient(135deg,#003a9e,#0055e5)",
      icon: "MessageCircle",
      external: true,
    },
    {
      key: "phone",
      label: contacts.PHONE,
      href: contacts.PHONE_HREF,
      bg: `linear-gradient(135deg,${GOLD},${GOLD2})`,
      icon: "Phone",
      external: false,
      dark: true,
    },
  ];

  return (
    <div
      className="fixed right-3 z-[60] flex flex-col items-end gap-2.5"
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 150px)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0)" : "translateY(12px)",
        transition: "opacity .25s ease, transform .25s ease",
      }}
    >
      <style>{`
        @keyframes fcPulse{0%,100%{box-shadow:0 4px 18px rgba(201,168,76,.45),0 0 0 0 rgba(201,168,76,.3)}50%{box-shadow:0 4px 18px rgba(201,168,76,.6),0 0 0 10px rgba(201,168,76,0)}}
        .fc-pulse{animation:fcPulse 2.8s ease-out infinite}
      `}</style>

      {open &&
        items.map(it => (
          <a
            key={it.key}
            href={it.href}
            {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            onClick={() => { onLead?.(it.key); setOpen(false); }}
            className="flex items-center gap-2 rounded-full pl-3.5 pr-4 py-2.5 active:scale-95 transition-transform"
            style={{ background: it.bg, boxShadow: "0 6px 20px rgba(0,0,0,0.45)" }}
          >
            <Icon
              name={it.icon}
              size={16}
              style={{ color: it.dark ? "#0a0f1e" : "#fff" }}
              fallback="MessageCircle"
            />
            <span
              style={{
                fontFamily: "Oswald",
                color: it.dark ? "#0a0f1e" : "#fff",
                fontSize: 12.5,
                fontWeight: 800,
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {it.label}
            </span>
          </a>
        ))}

      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-label={open ? "Закрыть контакты" : "Связаться с нами"}
        className={`w-14 h-14 rounded-full flex items-center justify-center active:scale-95 transition-transform ${open ? "" : "fc-pulse"}`}
        style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}
      >
        <Icon
          name={open ? "X" : "MessageCircle"}
          size={24}
          style={{ color: "#0a0f1e" }}
          fallback="Phone"
        />
      </button>
    </div>
  );
}
