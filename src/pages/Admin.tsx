import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";

const CHAT_URL = "https://functions.poehali.dev/7cea919d-afa7-4c03-a9cd-0e6cc7e634e8";

type Message = { id: string; from: string; text: string; time: string; is_read: boolean };
type Session = { session_id: string; last_message_at: string; unread: number; last_text: string | null };

export default function Admin() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const loadSessions = async () => {
    try {
      const res = await fetch(`${CHAT_URL}?all=true`);
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (e) { console.warn(e); }
  };

  const loadMessages = async (sid: string) => {
    try {
      const res = await fetch(`${CHAT_URL}?session_id=${sid}`);
      const data = await res.json();
      setMessages(data.messages || []);
      // отметить прочитанными
      await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sid, mark_read: true }),
      });
    } catch (e) { console.warn(e); }
  };

  useEffect(() => {
    loadSessions();
    const interval = setInterval(loadSessions, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!activeSession) return;
    loadMessages(activeSession);
    const interval = setInterval(() => loadMessages(activeSession), 3000);
    return () => clearInterval(interval);
  }, [activeSession]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendReply = async () => {
    if (!inputVal.trim() || !activeSession || sending) return;
    setSending(true);
    const text = inputVal;
    setInputVal("");
    try {
      await fetch(CHAT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: activeSession, text, from_role: "operator" }),
      });
      await loadMessages(activeSession);
      await loadSessions();
    } catch (e) { console.warn(e); }
    setSending(false);
  };

  const totalUnread = sessions.reduce((sum, s) => sum + (s.unread || 0), 0);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("ru", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="min-h-screen bg-background font-golos flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 h-14 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 bg-amber flex items-center justify-center rounded-sm">
            <span className="font-oswald font-bold text-coal text-xs">Д</span>
          </div>
          <span className="font-oswald font-bold tracking-widest text-foreground uppercase text-base">Дальняк · Оператор</span>
        </div>
        <div className="flex items-center gap-4">
          {totalUnread > 0 && (
            <span className="bg-amber text-coal font-oswald font-bold text-xs px-2.5 py-1 rounded-sm">
              {totalUnread} непрочитанных
            </span>
          )}
          <a href="/" className="text-muted-foreground hover:text-amber text-xs font-golos transition-colors flex items-center gap-1">
            <Icon name="ExternalLink" size={13} />
            Сайт
          </a>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sessions sidebar */}
        <aside className="w-72 border-r border-border bg-card flex flex-col shrink-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <p className="font-golos text-xs text-muted-foreground uppercase tracking-widest">Диалоги</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            {sessions.length === 0 && (
              <div className="p-6 text-center text-muted-foreground text-sm font-golos">
                <Icon name="MessageSquare" size={32} className="mx-auto mb-3 opacity-30" />
                Пока нет сообщений
              </div>
            )}
            {sessions.map(session => (
              <button
                key={session.session_id}
                onClick={() => setActiveSession(session.session_id)}
                className={`w-full text-left px-4 py-3.5 border-b border-border/50 hover:bg-secondary/50 transition-colors ${activeSession === session.session_id ? "bg-secondary border-l-2 border-l-amber" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 bg-amber/10 border border-amber/30 flex items-center justify-center rounded-sm shrink-0">
                      <Icon name="User" size={14} className="text-amber" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-golos text-xs text-foreground truncate font-medium">
                        Клиент #{session.session_id.slice(-6)}
                      </p>
                      <p className="font-golos text-[10px] text-muted-foreground truncate mt-0.5">
                        {session.last_text || "—"}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <p className="text-[10px] text-muted-foreground font-golos">{formatDate(session.last_message_at)}</p>
                    {session.unread > 0 && (
                      <span className="w-5 h-5 bg-amber rounded-full flex items-center justify-center text-coal text-[10px] font-bold font-oswald">
                        {session.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Chat panel */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {!activeSession ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
              <Icon name="MessageCircle" size={48} className="text-amber/30 mb-4" />
              <h2 className="font-oswald font-bold text-2xl text-foreground/30 tracking-wider">ВЫБЕРИ ДИАЛОГ</h2>
              <p className="font-golos text-sm text-muted-foreground mt-2">Нажми на клиента слева, чтобы начать отвечать</p>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="px-6 h-14 border-b border-border flex items-center gap-3 bg-card shrink-0">
                <div className="w-8 h-8 bg-amber/10 border border-amber/30 flex items-center justify-center rounded-sm">
                  <Icon name="User" size={15} className="text-amber" />
                </div>
                <div>
                  <p className="font-oswald font-semibold text-sm tracking-wider text-foreground">
                    Клиент #{activeSession.slice(-6)}
                  </p>
                  <p className="font-golos text-[10px] text-green-400">Активный диалог</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm font-golos py-8">Сообщений пока нет</div>
                )}
                {messages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.from === "operator" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[65%] px-4 py-3 ${msg.from === "operator" ? "bg-amber text-coal rounded-tl-lg rounded-bl-lg rounded-br-lg" : "bg-secondary text-foreground rounded-tr-lg rounded-br-lg rounded-bl-lg"}`}>
                      <p className="font-golos text-sm leading-relaxed">{msg.text}</p>
                      <div className={`flex items-center gap-2 mt-1.5 ${msg.from === "operator" ? "justify-end" : ""}`}>
                        <p className={`font-golos text-[10px] ${msg.from === "operator" ? "text-coal/60" : "text-muted-foreground"}`}>{msg.time}</p>
                        <p className={`font-golos text-[10px] uppercase tracking-wide ${msg.from === "operator" ? "text-coal/50" : "text-muted-foreground"}`}>
                          {msg.from === "operator" ? "вы" : "клиент"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border bg-card shrink-0">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={inputVal}
                    onChange={e => setInputVal(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && sendReply()}
                    placeholder="Введите ответ клиенту..."
                    className="flex-1 bg-secondary border border-border outline-none focus:border-amber transition-colors font-golos text-sm text-foreground placeholder:text-muted-foreground px-4 py-3 rounded-sm"
                  />
                  <button
                    onClick={sendReply}
                    disabled={sending || !inputVal.trim()}
                    className="bg-amber text-coal px-5 py-3 hover:bg-amber/90 transition-colors flex items-center gap-2 font-oswald font-semibold text-sm tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Icon name="Send" size={16} />
                    Отправить
                  </button>
                </div>
                <p className="text-muted-foreground text-[11px] font-golos mt-2">
                  Enter — отправить · Обновление автоматическое каждые 3 сек
                </p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
