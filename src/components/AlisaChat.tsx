import { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from "react";
import Icon from "@/components/ui/icon";

const CHAT_API = "https://functions.poehali.dev/d286ffff-d3f8-402b-89e7-85d84a0c9c53";

interface Msg {
  id: string;
  role: "user" | "assistant";
  content: string;
  ts: number;
}

interface ApiResponse {
  reply: string;
  bubbles?: string[];
  session_id?: string;
}

export interface AlisaChatHandle {
  sendUser: (text: string) => void;
  sendClick: (label: string) => void;
}

interface Props {
  utm: Record<string, string>;
  routeFrom?: string;
  routeTo?: string;
  initialPrompt?: string;
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

const AlisaChat = forwardRef<AlisaChatHandle, Props>(function AlisaChat(
  { utm, routeFrom, routeTo, initialPrompt, onOrdered },
  ref,
) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [typing, setTyping] = useState(false);
  const sessionIdRef = useRef<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);
  const orderDetectedRef = useRef(false);
  const queueRef = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    sessionIdRef.current = getOrCreateSession();
  }, []);

  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    });
  }, []);

  const pushAssistantBubbles = useCallback(
    async (bubbles: string[]) => {
      for (let i = 0; i < bubbles.length; i++) {
        const text = bubbles[i];
        if (i > 0) await new Promise((r) => setTimeout(r, Math.min(900, 350 + text.length * 18)));
        setTyping(true);
        await new Promise((r) => setTimeout(r, Math.min(1100, 400 + text.length * 22)));
        setTyping(false);
        setMessages((m) => [
          ...m,
          { id: "a_" + Date.now() + "_" + i, role: "assistant", content: text, ts: Date.now() },
        ]);
        scrollToBottom();
      }
    },
    [scrollToBottom],
  );

  const sendToBackend = useCallback(
    async (text: string, isAuto = false) => {
      setSending(true);
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
        const data = (await res.json()) as ApiResponse;
        const bubbles = data.bubbles && data.bubbles.length > 0 ? data.bubbles : [data.reply || "..."];
        await pushAssistantBubbles(bubbles);

        const reply = data.reply || "";
        if (
          !orderDetectedRef.current &&
          /заказ принят|заявка принят|закреп(?:и|л|им)|менеджер свяж|водител[ьья] свяж/i.test(reply)
        ) {
          orderDetectedRef.current = true;
          trackGoal("alisa_order");
          if (onOrdered) onOrdered();
        }
        if (!isAuto) trackGoal("alisa_message_sent");
      } catch {
        await pushAssistantBubbles(["Связь подвисла на секунду 🙈", "Повторите, пожалуйста?"]);
      } finally {
        setSending(false);
      }
    },
    [utm, pushAssistantBubbles, onOrdered],
  );

  const enqueue = useCallback((fn: () => Promise<void>) => {
    queueRef.current = queueRef.current.then(fn).catch(() => undefined);
    return queueRef.current;
  }, []);

  // Стартовое приветствие
  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;
    trackGoal("alisa_open");

    enqueue(async () => {
      if (initialPrompt) {
        setMessages([{ id: "u_init", role: "user", content: initialPrompt, ts: Date.now() }]);
        await sendToBackend(initialPrompt, true);
        return;
      }
      if (routeFrom && routeTo) {
        const greet = `Привет! Вижу, нужно из ${routeFrom} в ${routeTo} 👋`;
        const ask = "На какой день машину?";
        await pushAssistantBubbles([greet, ask]);
        return;
      }
      await pushAssistantBubbles(["Привет! Я Алиса 👋", "Откуда нужно забрать?"]);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(scrollToBottom, [messages, typing, scrollToBottom]);

  const handleUserSend = useCallback(
    (text: string) => {
      const t = text.trim();
      if (!t || sending) return;
      setMessages((m) => [...m, { id: "u_" + Date.now(), role: "user", content: t, ts: Date.now() }]);
      scrollToBottom();
      enqueue(async () => {
        await sendToBackend(t, false);
      });
    },
    [sending, sendToBackend, scrollToBottom, enqueue],
  );

  const handleSendInput = useCallback(() => {
    const t = input.trim();
    if (!t) return;
    setInput("");
    handleUserSend(t);
  }, [input, handleUserSend]);

  useImperativeHandle(
    ref,
    () => ({
      sendUser: (text: string) => handleUserSend(text),
      sendClick: (label: string) => {
        const text = `[клик: ${label}]`;
        setMessages((m) => [...m, { id: "u_" + Date.now(), role: "user", content: label, ts: Date.now() }]);
        scrollToBottom();
        enqueue(async () => {
          await sendToBackend(text, true);
        });
      },
    }),
    [handleUserSend, sendToBackend, scrollToBottom, enqueue],
  );

  return (
    <div className="flex flex-col h-full bg-[#F5F2ED]">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        <div className="flex items-center gap-2 px-1 pb-2 sticky top-0 bg-[#F5F2ED]/90 backdrop-blur-sm z-10">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-[15px]">
              А
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#F5F2ED]" />
          </div>
          <div className="flex-1">
            <div className="font-oswald text-[13px] font-bold uppercase tracking-wide leading-tight">
              Алиса · диспетчер
            </div>
            <div className="text-[10.5px] text-green-600 font-golos flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              онлайн
            </div>
          </div>
        </div>

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[82%] px-3.5 py-2 rounded-2xl text-[14.5px] leading-snug whitespace-pre-wrap font-golos break-words ${
                m.role === "user"
                  ? "bg-[#1a1a1a] text-white rounded-br-md"
                  : "bg-white text-[#1a1a1a] rounded-bl-md shadow-sm border border-black/5"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {typing && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-black/5">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-black/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-black/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-black/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="px-3 py-2.5 bg-white border-t border-black/10 flex items-center gap-2">
        <input
          type="text"
          inputMode="text"
          autoComplete="off"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendInput();
          }}
          placeholder="Напишите Алисе…"
          disabled={sending}
          className="flex-1 px-4 py-2.5 rounded-full bg-[#F5F2ED] text-[15px] font-golos focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-60"
        />
        <button
          type="button"
          onClick={handleSendInput}
          disabled={sending || !input.trim()}
          className="w-10 h-10 rounded-full bg-amber-400 flex items-center justify-center disabled:opacity-50 active:scale-95 transition-transform"
          aria-label="Отправить"
        >
          <Icon name="Send" size={16} className="text-[#1a1a1a]" />
        </button>
      </div>
    </div>
  );
});

export default AlisaChat;
