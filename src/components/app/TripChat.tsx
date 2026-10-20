import { useCallback, useEffect, useRef, useState } from "react";
import { appCall, Role } from "@/lib/appApi";
import { usePoll } from "@/lib/usePoll";
import Icon from "@/components/ui/icon";
import { useBackClose } from "@/lib/useBackClose";

interface Msg { id: number; sender_role: string; text: string; created_at: string }

const WHO: Record<string, string> = { client: "Пассажир", driver: "Водитель", dispatcher: "Диспетчер" };

export default function TripChat({ role, tripId, token, onClose, onUnauthorized, onRead }: {
  role: Role; tripId: number; token: string; onClose: () => void; onUnauthorized: () => void; onRead?: (id: number) => void;
}) {
  useBackClose(onClose);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");
  const last = useRef(0);
  const end = useRef<HTMLDivElement>(null);
  const prefix = role === "client" ? "client" : role === "driver" ? "driver" : "disp";

  const load = useCallback(async () => {
    const r = await appCall<{ messages: Msg[] }>(`${prefix}_chat_get`, { trip_id: tripId, after: last.current }, token);
    if (r.messages.length) {
      last.current = r.messages[r.messages.length - 1].id;
      setMsgs((m) => [...m, ...r.messages]);
      onRead?.(last.current);
    }
  }, [prefix, tripId, token, onRead]);

  usePoll(load, 3000, true, onUnauthorized);

  useEffect(() => { end.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs.length]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    setText("");
    setErr("");
    try {
      await appCall(`${prefix}_chat_send`, { trip_id: tripId, text: t }, token);
      await load();
    } catch (e2) {
      setErr((e2 as Error).message);
      setText(t);
    }
  };

  return (
    <div className="fixed inset-0 z-[2500] flex flex-col bg-neutral-50 text-neutral-900" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="flex items-center gap-3 bg-white px-4 py-3 shadow-sm">
        <button onClick={onClose} aria-label="Закрыть"><Icon name="ChevronLeft" size={26} /></button>
        <div>
          <div className="font-extrabold">Чат по заказу №{tripId}</div>
          <div className="text-xs text-neutral-500">Диспетчер видит переписку</div>
        </div>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {msgs.length === 0 && <p className="pt-10 text-center text-sm text-neutral-400">Сообщений пока нет. Напишите первым.</p>}
        {msgs.map((m) => {
          const mine = m.sender_role === role;
          return (
            <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-[15px] ${mine ? "bg-[#fcd34d]" : m.sender_role === "dispatcher" ? "bg-sky-100" : "bg-white shadow-sm"}`}>
                {!mine && <div className="text-[11px] font-extrabold text-neutral-500">{WHO[m.sender_role]}</div>}
                <div className="whitespace-pre-wrap break-words">{m.text}</div>
                <div className="mt-0.5 text-right text-[10px] text-neutral-500">{new Date(m.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            </div>
          );
        })}
        <div ref={end} />
      </div>
      {err && <p className="bg-red-50 px-4 py-2 text-sm font-semibold text-red-600">{err}</p>}
      <form onSubmit={send} className="flex gap-2 bg-white p-3">
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder="Сообщение"
          className="flex-1 rounded-2xl bg-neutral-100 px-4 py-3 text-[15px] outline-none focus:ring-2 focus:ring-[#fcd34d]" />
        <button type="submit" disabled={!text.trim()} className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fcd34d] disabled:opacity-40">
          <Icon name="Send" size={20} />
        </button>
      </form>
    </div>
  );
}
