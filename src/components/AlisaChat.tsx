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
  const [keyboardOffset, setKeyboardOffset] = useState(0);
  const [operatorActive, setOperatorActive] = useState(false);
  const sessionIdRef = useRef<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const startedRef = useRef(false);
  const orderDetectedRef = useRef(false);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const lastSeenIsoRef = useRef<string>("");

  useEffect(() => {
    sessionIdRef.current = getOrCreateSession();
  }, []);

  // Обработка экранной клавиатуры через VisualViewport API
  useEffect(() => {
    const vv = (window as Window & { visualViewport?: VisualViewport }).visualViewport;
    if (!vv) return;
    const onResize = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      setKeyboardOffset(offset);
      // Прокручиваем сообщения вниз когда клавиатура появилась
      requestAnimationFrame(() => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      });
    };
    vv.addEventListener("resize", onResize);
    vv.addEventListener("scroll", onResize);
    onResize();
    return () => {
      vv.removeEventListener("resize", onResize);
      vv.removeEventListener("scroll", onResize);
    };
  }, []);

  const handleInputFocus = useCallback(() => {
    // Через небольшую паузу — чтобы клавиатура успела появиться
    setTimeout(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
      inputRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
    }, 250);
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

      const callOnce = async (timeoutMs: number) => {
        const ctrl = new AbortController();
        const timer = setTimeout(() => ctrl.abort(), timeoutMs);
        try {
          const res = await fetch(CHAT_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              message: text,
              session_id: sessionIdRef.current,
              utm,
            }),
            signal: ctrl.signal,
          });
          if (!res.ok) throw new Error("http_" + res.status);
          return (await res.json()) as ApiResponse;
        } finally {
          clearTimeout(timer);
        }
      };

      let data: ApiResponse | null = null;
      let lastErr: unknown = null;
      // 3 попытки с увеличенными таймаутами. История на бэке сохраняется — повтор безопасен.
      const timeouts = [90000, 60000, 45000];
      for (let attempt = 0; attempt < timeouts.length; attempt++) {
        try {
          data = await callOnce(timeouts[attempt]);
          lastErr = null;
          break;
        } catch (e) {
          lastErr = e;
          console.warn(`[alisa] attempt ${attempt + 1} failed:`, e);
          if (attempt < timeouts.length - 1) {
            await new Promise((r) => setTimeout(r, 1500));
          }
        }
      }

      if (!data) {
        console.warn("[alisa] sendToBackend ALL attempts failed:", lastErr);
        await pushAssistantBubbles([
          "Чуть задумалась 🙈 Дайте секунду и напишите ещё разок — я помню всё, что вы говорили.",
        ]);
        setSending(false);
        return;
      }

      try {
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

  // Поллинг — забираем новые сообщения от оператора (если он подключился)
  useEffect(() => {
    let stopped = false;
    const poll = async () => {
      if (!sessionIdRef.current || stopped) return;
      try {
        const since = lastSeenIsoRef.current ? `&since=${encodeURIComponent(lastSeenIsoRef.current)}` : "";
        const res = await fetch(`${CHAT_API}?session_id=${encodeURIComponent(sessionIdRef.current)}${since}`);
        const data = await res.json();
        if (data.operator_active !== undefined) setOperatorActive(!!data.operator_active);
        const newMsgs = (data.messages || []) as Array<{ role: string; text: string; ts: string }>;
        // Фильтруем только сообщения от оператора (Алисины уже в стейте)
        const opMsgs = newMsgs.filter((m) => m.role === "operator");
        if (opMsgs.length > 0) {
          for (const m of opMsgs) {
            setMessages((arr) => [
              ...arr,
              { id: "op_" + (m.ts || Date.now()), role: "assistant", content: m.text, ts: Date.now() },
            ]);
            if (m.ts) lastSeenIsoRef.current = m.ts;
          }
          scrollToBottom();
        } else if (newMsgs.length > 0) {
          // Просто двигаем курсор поллинга
          const lastTs = newMsgs[newMsgs.length - 1].ts;
          if (lastTs) lastSeenIsoRef.current = lastTs;
        }
      } catch {
        /* noop */
      }
    };
    const t = setInterval(poll, 4000);
    // первый раз через секунду
    const t0 = setTimeout(poll, 1000);
    return () => {
      stopped = true;
      clearInterval(t);
      clearTimeout(t0);
    };
  }, [scrollToBottom]);

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
    <div
      className="flex flex-col h-full bg-[#F5F2ED] transition-[padding] duration-150"
      style={{ paddingBottom: keyboardOffset ? `${keyboardOffset}px` : 0 }}
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2 overscroll-contain">
        <div className="flex items-center gap-2 px-1 pb-2 sticky top-0 bg-[#F5F2ED]/90 backdrop-blur-sm z-10">
          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-[15px]">
              А
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-[#F5F2ED]" />
          </div>
          <div className="flex-1">
            <div className="font-oswald text-[13px] font-bold uppercase tracking-wide leading-tight">
              {operatorActive ? "Диспетчер на связи" : "Алиса · диспетчер"}
            </div>
            <div className={`text-[10.5px] font-golos flex items-center gap-1 ${operatorActive ? "text-blue-600" : "text-green-600"}`}>
              <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${operatorActive ? "bg-blue-500" : "bg-green-500"}`} />
              {operatorActive ? "живой человек отвечает" : "онлайн"}
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
          ref={inputRef}
          type="text"
          inputMode="text"
          autoComplete="off"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendInput();
          }}
          placeholder="Напишите Алисе…"
          disabled={sending}
          className="flex-1 px-4 py-2.5 rounded-full bg-[#F5F2ED] text-[16px] font-golos focus:outline-none focus:ring-2 focus:ring-amber-400/50 disabled:opacity-60"
          style={{ fontSize: "16px" }}
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