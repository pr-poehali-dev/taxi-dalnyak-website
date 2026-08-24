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
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 380);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = [
    {
      key: "phone",
      label: "Позвонить",
      href: contacts.PHONE_HREF,
      bg: `linear-gradient(135deg,${GOLD},${GOLD2})`,
      icon: "Phone",
      external: false,
      dark: true,
      pulse: true,
    },
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
  ];

  return (
    <div
      className="fixed right-2.5 z-[60] flex flex-col items-end gap-2"
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 152px)",
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0)" : "translateY(10px)",
        transition: "opacity .25s ease, transform .25s ease",
      }}
    >
      <style>{`
        @keyframes fcPulse{0%,100%{box-shadow:0 4px 16px rgba(201,168,76,.5),0 0 0 0 rgba(201,168,76,.35)}50%{box-shadow:0 4px 16px rgba(201,168,76,.65),0 0 0 9px rgba(201,168,76,0)}}
        .fc-pulse{animation:fcPulse 2.8s ease-out infinite}
      `}</style>

      {items.map(it => (
        <a
          key={it.key}
          href={it.href}
          {...(it.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
          onClick={() => onLead?.(it.key)}
          className={`flex items-center gap-2 rounded-full pl-3 pr-3.5 py-2.5 active:scale-95 transition-transform ${it.pulse ? "fc-pulse" : ""}`}
          style={{
            background: it.bg,
            boxShadow: it.pulse ? undefined : "0 5px 18px rgba(0,0,0,0.45)",
            minWidth: 132,
          }}
        >
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style={{ background: it.dark ? "rgba(10,15,30,0.15)" : "rgba(255,255,255,0.18)" }}
          >
            <Icon
              name={it.icon}
              size={14}
              style={{ color: it.dark ? "#0a0f1e" : "#fff" }}
              fallback="MessageCircle"
            />
          </span>
          <span
            style={{
              fontFamily: "Oswald",
              color: it.dark ? "#0a0f1e" : "#fff",
              fontSize: 13,
              fontWeight: 800,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              letterSpacing: "0.02em",
            }}
          >
            {it.label}
          </span>
        </a>
      ))}
    </div>
  );
}
