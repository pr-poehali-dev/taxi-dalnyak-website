import { useState, useEffect, useRef, useCallback, memo } from "react";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/2cfb628d-f55c-47b3-9871-e215cef551a3";
const LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/eed871f1-fcfc-4342-ba10-6d3337b98fe4.jpg";

type Msg = { id: string; from: string; text: string; time: string; is_read: boolean; image_url?: string | null };
type Session = { session_id: string; last_message_at: string; unread: number; last_text: string | null };

// Звук — три восходящих тона
let _ac: AudioContext | null = null;
function beep() {
  try {
    if (!_ac) _ac = new AudioContext();
    if (_ac.state === "suspended") _ac.resume();
    [0, 0.12, 0.24].forEach((delay, i) => {
      const o = _ac!.createOscillator();
      const g = _ac!.createGain();
      o.connect(g); g.connect(_ac!.destination);
      o.frequency.value = [660, 880, 1100][i];
      g.gain.setValueAtTime(0.4, _ac!.currentTime + delay);
      g.gain.exponentialRampToValueAtTime(0.001, _ac!.currentTime + delay + 0.3);
      o.start(_ac!.currentTime + delay);
      o.stop(_ac!.currentTime + delay + 0.3);
    });
  } catch { /* */ }
}

function fmtTime(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString())
      return d.toLocaleString("ru", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleString("ru", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
}

const MsgBubble = memo(({ msg }: { msg: Msg }) => {
  const op = msg.from === "operator";
  return (
    <div className={`flex items-end gap-2 ${op ? "flex-row-reverse" : "flex-row"}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-0.5 ${op ? "bg-amber/20 border border-amber/40" : "bg-white/10"}`}>
        <Icon name={op ? "Headphones" : "User"} size={13} className={op ? "text-amber" : "text-white/40"} />
      </div>
      <div className={`max-w-[75%] rounded-2xl overflow-hidden ${op ? "bg-amber text-coal rounded-br-sm" : "bg-white/8 text-white rounded-bl-sm"}`}>
        {msg.image_url && (
          <a href={msg.image_url} target="_blank" rel="noopener noreferrer">
            <img src={msg.image_url} alt="" className="block max-w-full" style={{ maxHeight: 220 }} />
          </a>
        )}
        {(msg.text || !msg.image_url) && (
          <div className="px-3.5 py-2.5">
            {msg.text && <p className="text-sm leading-relaxed">{msg.text}</p>}
            <p className={`text-[11px] mt-1 ${op ? "text-coal/50 text-right" : "text-white/30"}`}>{msg.time}</p>
          </div>
        )}
      </div>
    </div>
  );
});
MsgBubble.displayName = "MsgBubble";

// Поле ввода — отдельный компонент чтобы НЕ терять фокус при обновлении сообщений
function ReplyInput({ onSend }: { onSend: (t: string) => Promise<void> }) {
  const [txt, setTxt] = useState("");
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const send = async () => {
    const t = txt.trim();
    if (!t || busy) return;
    setBusy(true);
    setTxt("");
    await onSend(t);
    setBusy(false);
    requestAnimationFrame(() => ref.current?.focus());
  };

  return (
    <div className="flex gap-2 p-3 border-t border-white/10 bg-[#0d0d0d] shrink-0">
      <input
        ref={ref}
        value={txt}
        onChange={e => setTxt(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
        placeholder="Ответить клиенту..."
        autoComplete="off"
        enterKeyHint="send"
        inputMode="text"
        className="flex-1 min-w-0 bg-white/8 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:ring-1 focus:ring-amber/60 transition"
      />
      <button
        onClick={send}
        disabled={busy || !txt.trim()}
        className="w-11 h-11 shrink-0 rounded-xl bg-amber text-coal flex items-center justify-center hover:bg-amber/90 active:scale-95 transition disabled:opacity-40"
      >
        {busy ? <Icon name="Loader" size={17} className="animate-spin" /> : <Icon name="Send" size={17} />}
      </button>
    </div>
  );
}

export default function Admin() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [view, setView] = useState<"list" | "chat">("list"); // мобильный вид
  const [notifPerm, setNotifPerm] = useState<NotificationPermission>(
    "Notification" in window ? Notification.permission : "denied"
  );

  const endRef = useRef<HTMLDivElement>(null);
  const prevUnread = useRef<Record<string, number>>({});
  const sessInit = useRef(false);

  const loadSessions = useCallback(async () => {
    try {
      const r = await fetch(`${API}?all=true`, { signal: AbortSignal.timeout(8000) });
      if (!r.ok) return;
      const d = await r.json();
      const list: Session[] = d.sessions || [];
      setConnected(true);

      if (!sessInit.current) {
        sessInit.current = true;
        list.forEach(s => { prevUnread.current[s.session_id] = s.unread; });
      } else {
        list.forEach(s => {
          const prev = prevUnread.current[s.session_id] ?? 0;
          if (s.unread > prev && s.session_id !== active) {
            beep();
            if ("Notification" in window && Notification.permission === "granted") {
              try { new Notification("Новое сообщение", { body: s.last_text || "Клиент написал", icon: LOGO, badge: LOGO }); } catch { /* */ }
            }
          }
          prevUnread.current[s.session_id] = s.unread;
        });
      }
      setSessions(list);
    } catch { setConnected(false); }
  }, [active]);

  const loadMsgs = useCallback(async (sid: string) => {
    try {
      const r = await fetch(`${API}?session_id=${sid}`, { signal: AbortSignal.timeout(8000) });
      if (!r.ok) return;
      const d = await r.json();
      setMsgs(d.messages || []);
      // Помечаем прочитанными
      fetch(API, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ session_id: sid, mark_read: true }) }).catch(() => {});
      // Обновляем счётчик
      prevUnread.current[sid] = 0;
      setSessions(prev => prev.map(s => s.session_id === sid ? { ...s, unread: 0 } : s));
    } catch { /* */ }
    setLoading(false);
  }, []);

  // Опрос сессий
  useEffect(() => {
    loadSessions();
    const t = setInterval(loadSessions, 8000);
    return () => clearInterval(t);
  }, [loadSessions]);

  // Опрос сообщений активной сессии
  useEffect(() => {
    if (!active) return;
    setLoading(true);
    setMsgs([]);
    loadMsgs(active);
    const t = setInterval(() => loadMsgs(active), 5000);
    return () => clearInterval(t);
  }, [active, loadMsgs]);

  // Автоскролл вниз
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "nearest" });
  }, [msgs]);

  const openSession = (sid: string) => {
    setActive(sid);
    setView("chat");
  };

  const doSend = async (text: string) => {
    if (!active) return;
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: active, text, from_role: "operator" }),
    }).catch(() => {});
    await loadMsgs(active);
    await loadSessions();
  };

  const askNotif = async () => {
    const p = await Notification.requestPermission();
    setNotifPerm(p);
    if (p === "granted") beep();
  };

  const totalUnread = sessions.reduce((s, x) => s + (x.unread || 0), 0);
  const activeSession = sessions.find(s => s.session_id === active);

  // ── Мобильный дизайн: либо список, либо чат ──────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col" style={{ fontFamily: "'Golos Text', sans-serif" }}>

      {/* Шапка */}
      <header className="h-14 px-4 flex items-center justify-between border-b border-white/10 bg-[#0d0d0d] shrink-0 z-20">
        <div className="flex items-center gap-2.5">
          {/* Кнопка назад — только в чате на мобиле */}
          {view === "chat" && (
            <button onClick={() => setView("list")} className="mr-1 w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition md:hidden">
              <Icon name="ArrowLeft" size={18} />
            </button>
          )}
          <div className="w-7 h-7 bg-amber rounded-lg flex items-center justify-center shrink-0">
            <span className="font-black text-[#0a0a0a] text-xs" style={{ fontFamily: "Oswald" }}>Д</span>
          </div>
          <span className="font-bold text-sm tracking-wider text-white uppercase" style={{ fontFamily: "Oswald" }}>
            {view === "chat" && active
              ? `Клиент ···${active.slice(-5)}`
              : "Дальняк · Оператор"
            }
          </span>
          {totalUnread > 0 && view !== "chat" && (
            <span className="bg-amber text-[#0a0a0a] font-black text-xs px-2 py-0.5 rounded-full" style={{ fontFamily: "Oswald" }}>{totalUnread}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Статус соединения */}
          <span className={`flex items-center gap-1 text-xs ${connected ? "text-green-400" : "text-yellow-400"}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-green-400" : "bg-yellow-400 animate-pulse"}`} />
            <span className="hidden sm:inline">{connected ? "Онлайн" : "..."}</span>
          </span>
          {notifPerm !== "granted" && "Notification" in window && (
            <button onClick={askNotif} className="flex items-center gap-1 text-xs text-amber border border-amber/30 px-2.5 py-1.5 rounded-lg hover:bg-amber/10 transition">
              <Icon name="Bell" size={13} /><span className="hidden sm:inline">Звук</span>
            </button>
          )}
          <a href="/" className="text-xs text-white/30 hover:text-amber px-2 py-1.5 transition">
            <Icon name="ExternalLink" size={14} />
          </a>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">

        {/* ── Список сессий ── */}
        <div className={`flex flex-col border-r border-white/10 bg-[#0d0d0d] ${
          view === "list" ? "flex w-full md:w-72 md:flex" : "hidden md:flex md:w-72"
        }`}>
          <div className="px-4 py-2.5 border-b border-white/8 flex items-center justify-between">
            <p className="text-xs text-white/30 uppercase tracking-wider">Диалоги ({sessions.length})</p>
            {!connected && <p className="text-[11px] text-yellow-400">Нет связи</p>}
          </div>
          <div className="flex-1 overflow-y-auto">
            {sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6 py-12">
                <Icon name="MessageSquare" size={40} className="text-white/10" />
                <p className="text-sm text-white/25">Пока нет сообщений</p>
                <p className="text-xs text-white/15">Обновление каждые 8 сек</p>
              </div>
            ) : sessions.map(s => {
              const isAct = active === s.session_id;
              return (
                <button key={s.session_id} onClick={() => openSession(s.session_id)}
                  className={`w-full text-left px-4 py-4 border-b border-white/5 transition-colors active:bg-white/5 ${isAct ? "bg-amber/8 border-l-[3px] border-l-amber" : "hover:bg-white/[0.03]"}`}>
                  <div className="flex items-center gap-3">
                    {/* Аватар */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${isAct ? "bg-amber text-coal" : "bg-white/10 text-white/40"}`} style={{ fontFamily: "Oswald" }}>
                      {s.session_id.slice(-2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className={`text-sm font-semibold truncate ${isAct ? "text-amber" : "text-white/80"}`}>
                          Клиент ···{s.session_id.slice(-5)}
                        </p>
                        <p className="text-[11px] text-white/25 shrink-0">{fmtTime(s.last_message_at)}</p>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-white/35 truncate">{s.last_text || "—"}</p>
                        {s.unread > 0 && (
                          <span className="w-5 h-5 bg-amber rounded-full flex items-center justify-center text-coal text-[11px] font-black shrink-0" style={{ fontFamily: "Oswald" }}>
                            {s.unread > 9 ? "9+" : s.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Область чата ── */}
        <div className={`flex-1 flex flex-col overflow-hidden ${
          view === "chat" ? "flex" : "hidden md:flex"
        }`}>
          {!active ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
              <div className="w-20 h-20 rounded-2xl bg-amber/8 border border-amber/15 flex items-center justify-center">
                <Icon name="MessageCircle" size={36} className="text-amber/30" />
              </div>
              <div>
                <p className="font-bold text-lg text-white/30" style={{ fontFamily: "Oswald" }}>ВЫБЕРИ ДИАЛОГ</p>
                <p className="text-sm text-white/20 mt-1">
                  {sessions.length > 0 ? "Нажми на клиента слева" : "Жди — клиенты напишут"}
                </p>
              </div>
              {/* Подсказка для мобильного — нажать на меню */}
              <button onClick={() => setView("list")} className="md:hidden text-xs text-amber border border-amber/30 px-4 py-2 rounded-xl">
                Открыть список диалогов
              </button>
            </div>
          ) : (
            <>
              {/* Инфо о клиенте */}
              <div className="px-4 py-2.5 border-b border-white/10 bg-[#111] flex items-center gap-3 shrink-0">
                <div className="w-9 h-9 rounded-full bg-amber/15 border border-amber/30 flex items-center justify-center font-bold text-amber text-sm" style={{ fontFamily: "Oswald" }}>
                  {active.slice(-2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-white">Клиент ···{active.slice(-5)}</p>
                  <p className="text-[11px] text-white/35">
                    {activeSession ? fmtTime(activeSession.last_message_at) : "—"}
                  </p>
                </div>
              </div>

              {/* Сообщения */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#080808]">
                {loading && (
                  <div className="flex justify-center py-10">
                    <Icon name="Loader" size={24} className="text-amber animate-spin" />
                  </div>
                )}
                {!loading && msgs.length === 0 && (
                  <div className="text-center py-10">
                    <p className="text-sm text-white/20">Нет сообщений</p>
                  </div>
                )}
                {msgs.map(m => <MsgBubble key={m.id} msg={m} />)}
                <div ref={endRef} />
              </div>

              <ReplyInput onSend={doSend} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
