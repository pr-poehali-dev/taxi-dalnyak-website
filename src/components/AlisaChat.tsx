import { useEffect, useRef, useState, useCallback } from "react";
import Icon from "@/components/ui/icon";

const CHAT_API = "https://functions.poehali.dev/d286ffff-d3f8-402b-89e7-85d84a0c9c53";

interface Msg {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  initialUserMessage?: string;
  utm: Record<string, string>;
  routeFrom?: string;
  routeTo?: string;
  onOrdered?: () => void;
}

const SESSION_KEY = "alisa_session_id";

function getOrCreateSession(): string {
  try {
    let sid = localStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = "s_" + Math.random().toString(36).slice(2) + "_" + Date.now().toString(36);
      localStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return "s_" + Math.random().toString(36).slice(2) + "_" + Date.now().toString(36);
  }
}

function trackGoal(goal: string) {
  try {
    const w = window as unknown as { ym?: (id: number, action: string, goal: string) => void };
    if (w.ym) w.ym(108400932, "reachGoal", goal);
  } catch {
    /* noop */
  }
}

export default function AlisaChat({ open, onClose, initialUserMessage, utm, routeFrom, routeTo, onOrdered }: Props) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const sessionIdRef = useRef<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const greetedRef = useRef(false);
  const orderDetectedRef = useRef(false);

  useEffect(() => {
    sessionIdRef.current = getOrCreateSession();
  }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }, []);

  const sendToBackend = useCallback(
    async (text: string, isAuto = false) => {
      setSending(true);
      setTyping(true);
      try {
        const res = await fetch(CHAT_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            session_id: sessionIdRef.current,
            utm,
          }),
        });
        const data = await res.json();
        const reply = (data.reply || "Извините, повторите ещё раз?").toString();
        setMessages((m) => [
          ...m,
          { id: "a_" + Date.now(), role: "assistant", content: reply, ts: Date.now() },
        ]);
        // Эвристика: если в ответе намёк на оформление — триггерим цель
        if (
          !orderDetectedRef.current &&
          /заказ принят|ваш заказ|заявка принята|менеджер свяжется|закреп/i.test(reply)
        ) {
          orderDetectedRef.current = true;
          trackGoal("alisa_order");
          if (onOrdered) onOrdered();
        }
        if (!isAuto) trackGoal("alisa_message_sent");
      } catch {
        setMessages((m) => [
          ...m,
          {
            id: "e_" + Date.now(),
            role: "assistant",
            content: "Связь подвисла на секунду. Повторите, пожалуйста, ваш маршрут?",
            ts: Date.now(),
          },
        ]);
      } finally {
        setSending(false);
        setTyping(false);
        scrollToBottom();
      }
    },
    [utm, scrollToBottom, onOrdered],
  );

  // Автоматическое приветствие при первом открытии
  useEffect(() => {
    if (!open || greetedRef.current) return;
    greetedRef.current = true;
    trackGoal("alisa_open");

    let firstUserMsg = initialUserMessage || "";
    if (!firstUserMsg && routeFrom && routeTo) {
      firstUserMsg = `Здравствуйте! Хочу из ${routeFrom} в ${routeTo}.`;
    }

    if (firstUserMsg) {
      setMessages([{ id: "u_init", role: "user", content: firstUserMsg, ts: Date.now() }]);
      sendToBackend(firstUserMsg, true);
    } else {
      // Просто приветствие без отправки на бэк
      setMessages([
        {
          id: "a_hello",
          role: "assistant",
          content: "Здравствуйте! 👋 Меня зовут Алиса, я помогу с межгородним такси. Откуда и куда едем?",
          ts: Date.now(),
        },
      ]);
    }
  }, [open, initialUserMessage, routeFrom, routeTo, sendToBackend]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(scrollToBottom, [messages, typing, scrollToBottom]);

  const handleSend = useCallback(
    async (text?: string) => {
      const t = (text ?? input).trim();
      if (!t || sending) return;
      setInput("");
      setMessages((m) => [...m, { id: "u_" + Date.now(), role: "user", content: t, ts: Date.now() }]);
      scrollToBottom();
      await sendToBackend(t, false);
    },
    [input, sending, scrollToBottom, sendToBackend],
  );

  if (!open) return null;

  const quickReplies = [
    "Сколько стоит?",
    "Когда подача?",
    "А скидка есть?",
    "Готов оформить",
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 flex items-end justify-center" onClick={onClose}>
      <div
        className="w-full max-w-md h-[100dvh] sm:h-[92vh] sm:rounded-t-3xl bg-[#F5F2ED] flex flex-col overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-black/10">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
              А
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-oswald text-[15px] font-bold text-[#1a1a1a] uppercase tracking-wide">
              Алиса · Дальняк
            </div>
            <div className="text-[11px] text-green-600 font-golos flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              онлайн · отвечает за 30 сек
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center"
            aria-label="Закрыть"
          >
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-2.5">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-[14.5px] leading-snug whitespace-pre-wrap font-golos ${
                  m.role === "user"
                    ? "bg-[#1a1a1a] text-white rounded-br-sm"
                    : "bg-white text-[#1a1a1a] rounded-bl-sm shadow-sm border border-black/5"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm border border-black/5">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-black/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 rounded-full bg-black/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 rounded-full bg-black/40 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick replies */}
        {messages.length > 0 && messages.length < 8 && !sending && (
          <div className="px-3 pb-2 flex gap-2 flex-wrap">
            {quickReplies.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleSend(q)}
                className="text-[12.5px] font-golos px-3 py-1.5 rounded-full bg-white border border-black/10 active:scale-95 transition-transform"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="px-3 py-3 bg-white border-t border-black/10 flex items-center gap-2">
          <input
            type="text"
            inputMode="text"
            autoComplete="off"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            placeholder="Напишите Алисе…"
            disabled={sending}
            className="flex-1 px-4 py-3 rounded-full bg-[#F5F2ED] text-[15px] font-golos focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-60"
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={sending || !input.trim()}
            className="w-11 h-11 rounded-full bg-amber-400 flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform"
            aria-label="Отправить"
          >
            <Icon name="Send" size={18} className="text-[#1a1a1a]" />
          </button>
        </div>
      </div>
    </div>
  );
}
