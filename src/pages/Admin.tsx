import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

const API =
  "https://functions.poehali.dev/7cea919d-afa7-4c03-a9cd-0e6cc7e634e8";
const LOGO =
  "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/eed871f1-fcfc-4342-ba10-6d3337b98fe4.jpg";

type Msg = {
  id: string;
  from: string;
  text: string;
  time: string;
  is_read: boolean;
  image_url?: string | null;
};

type Session = {
  session_id: string;
  last_message_at: string;
  unread: number;
  last_text: string | null;
};

function toBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res((r.result as string).split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}

function fireNotif(title: string, body: string) {
  if (!("Notification" in window) || Notification.permission !== "granted")
    return;
  try {
    new Notification(title, { body, icon: LOGO });
  } catch {
    /* */
  }
}

function fmtDate(iso: string) {
  try {
    const d = new Date(iso);
    const now = new Date();
    if (d.toDateString() === now.toDateString())
      return d.toLocaleString("ru", { hour: "2-digit", minute: "2-digit" });
    return d.toLocaleString("ru", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export default function Admin() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [txt, setTxt] = useState("");
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msgsLoading, setMsgsLoading] = useState(false);
  const [connError, setConnError] = useState(false);
  const [notifPerm, setNotifPerm] = useState<NotificationPermission>(
    "Notification" in window ? Notification.permission : "denied"
  );
  const [sidebar, setSidebar] = useState(false);

  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevUnread = useRef<Record<string, number>>({});
  const sessInit = useRef(false);

  const loadSessions = useCallback(async () => {
    try {
      const r = await fetch(`${API}?all=true`);
      if (!r.ok) throw new Error("http " + r.status);
      const d = await r.json();
      const list: Session[] = d.sessions || [];
      setConnError(false);

      if (!sessInit.current) {
        sessInit.current = true;
        list.forEach(
          (s) => (prevUnread.current[s.session_id] = s.unread)
        );
      } else {
        list.forEach((s) => {
          const prev = prevUnread.current[s.session_id] ?? 0;
          if (s.unread > prev && s.session_id !== active) {
            fireNotif(
              "Новое сообщение",
              s.last_text || "Клиент прислал фото"
            );
          }
          prevUnread.current[s.session_id] = s.unread;
        });
      }
      setSessions(list);
    } catch {
      setConnError(true);
    }
  }, [active]);

  const loadMsgs = useCallback(
    async (sid: string) => {
      try {
        const r = await fetch(`${API}?session_id=${sid}`);
        if (!r.ok) throw new Error("http " + r.status);
        const d = await r.json();
        setMsgs(d.messages || []);

        fetch(API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sid, mark_read: true }),
        }).catch(() => {});
      } catch {
        /* */
      }
      setMsgsLoading(false);
    },
    []
  );

  useEffect(() => {
    loadSessions();
    const t = setInterval(loadSessions, 5000);
    return () => clearInterval(t);
  }, [loadSessions]);

  useEffect(() => {
    if (!active) return;
    setMsgsLoading(true);
    setMsgs([]);
    loadMsgs(active);
    const t = setInterval(() => loadMsgs(active), 3000);
    return () => clearInterval(t);
  }, [active, loadMsgs]);

  useEffect(() => {
    if (endRef.current)
      endRef.current.scrollIntoView({ block: "nearest" });
  }, [msgs]);

  const sendReply = async () => {
    const t = txt.trim();
    if (!t || !active || sending) return;
    setSending(true);
    setTxt("");
    try {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: active,
          text: t,
          from_role: "operator",
        }),
      });
      await loadMsgs(active);
      await loadSessions();
    } catch {
      /* */
    }
    setSending(false);
    inputRef.current?.focus();
  };

  const sendPhoto = async (file: File) => {
    if (!active || uploading) return;
    setUploading(true);
    try {
      const b64 = await toBase64(file);
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: active,
          image_b64: b64,
          from_role: "operator",
        }),
      });
      await loadMsgs(active);
      await loadSessions();
    } catch {
      /* */
    }
    setUploading(false);
  };

  const askNotif = async () => {
    const p = await Notification.requestPermission();
    setNotifPerm(p);
  };

  const openSession = (sid: string) => {
    setActive(sid);
    setSidebar(false);
    prevUnread.current[sid] = 0;
  };

  const totalUnread = sessions.reduce((s, x) => s + (x.unread || 0), 0);
  const activeInfo = sessions.find((s) => s.session_id === active);

  return (
    <div className="min-h-screen bg-background text-foreground font-golos flex flex-col">
      <header className="border-b border-white/[0.08] bg-background/80 backdrop-blur-xl px-4 sm:px-6 h-14 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebar((v) => !v)}
            className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition"
          >
            <Icon name={sidebar ? "X" : "Menu"} size={18} />
          </button>
          <div className="w-7 h-7 bg-amber rounded-lg flex items-center justify-center shrink-0">
            <span className="font-oswald font-black text-coal text-xs">Д</span>
          </div>
          <span className="font-oswald font-bold text-sm sm:text-base tracking-widest text-white uppercase">
            Дальняк · Оператор
          </span>
          {totalUnread > 0 && (
            <span className="bg-amber text-coal font-oswald font-black text-xs px-2.5 py-0.5 rounded-full">
              {totalUnread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {connError && (
            <span className="text-red-400 text-xs font-golos flex items-center gap-1">
              <Icon name="WifiOff" size={13} /> Нет связи
            </span>
          )}
          {notifPerm !== "granted" && "Notification" in window && (
            <button
              onClick={askNotif}
              className="flex items-center gap-1.5 text-xs text-amber border border-amber/30 hover:border-amber hover:bg-amber/10 px-3 py-1.5 rounded-lg font-golos transition"
            >
              <Icon name="Bell" size={13} />
              <span className="hidden sm:inline">Уведомления</span>
            </button>
          )}
          <a
            href="/"
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-amber font-golos transition px-2 py-1.5"
          >
            <Icon name="ExternalLink" size={13} />
            <span className="hidden sm:inline">Сайт</span>
          </a>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {sidebar && (
          <div
            className="fixed inset-0 bg-black/60 z-20 md:hidden"
            onClick={() => setSidebar(false)}
          />
        )}

        <aside
          className={`
          fixed md:relative inset-y-0 left-0 z-20
          w-72 border-r border-white/[0.08] bg-[#0d0d0d] flex flex-col shrink-0
          transition-transform duration-300
          ${sidebar ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
          style={{ top: 56 }}
        >
          <div className="px-4 py-3 border-b border-white/[0.08] flex items-center justify-between shrink-0">
            <p className="font-golos text-xs text-white/30 uppercase tracking-widest">
              Диалоги
            </p>
            <span className="font-golos text-xs text-white/20">
              {sessions.length} чел.
            </span>
          </div>

          <div className="flex-1 overflow-y-auto">
            {sessions.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <Icon
                  name="MessageSquare"
                  size={36}
                  className="text-white/10 mb-4"
                />
                <p className="font-golos text-sm text-white/25">
                  {connError
                    ? "Не удалось загрузить"
                    : "Пока нет сообщений"}
                </p>
                <p className="font-golos text-xs text-white/15 mt-1">
                  Обновление каждые 5 сек
                </p>
              </div>
            )}
            {sessions.map((s) => {
              const isActive = active === s.session_id;
              return (
                <button
                  key={s.session_id}
                  onClick={() => openSession(s.session_id)}
                  className={`w-full text-left px-4 py-3.5 border-b border-white/[0.04] transition-colors ${
                    isActive
                      ? "bg-amber/[0.08] border-l-2 border-l-amber"
                      : "hover:bg-white/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? "bg-amber/20 border border-amber/30"
                          : "bg-white/5"
                      }`}
                    >
                      <Icon
                        name="User"
                        size={14}
                        className={
                          isActive ? "text-amber" : "text-white/30"
                        }
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`font-golos text-xs font-semibold truncate ${
                            isActive ? "text-white" : "text-white/60"
                          }`}
                        >
                          Клиент ···{s.session_id.slice(-5)}
                        </p>
                        <div className="flex items-center gap-2 shrink-0">
                          <p className="text-[10px] text-white/20 font-golos">
                            {fmtDate(s.last_message_at)}
                          </p>
                          {s.unread > 0 && (
                            <span className="w-5 h-5 bg-amber rounded-full flex items-center justify-center text-coal text-[10px] font-black font-oswald">
                              {s.unread}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="font-golos text-[11px] text-white/25 truncate mt-0.5">
                        {s.last_text || "—"}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

        <main className="flex-1 flex flex-col overflow-hidden bg-background">
          {!active ? (
            <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-amber/[0.08] border border-amber/15 flex items-center justify-center">
                <Icon
                  name="MessageCircle"
                  size={36}
                  className="text-amber/40"
                />
              </div>
              <div>
                <h2 className="font-oswald font-bold text-xl text-white/30 tracking-wider">
                  ВЫБЕРИ ДИАЛОГ
                </h2>
                <p className="font-golos text-sm text-white/20 mt-1">
                  {sessions.length > 0
                    ? "Нажми на клиента слева, чтобы ответить"
                    : "Жди — клиенты напишут здесь"}
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="px-4 sm:px-6 h-14 border-b border-white/[0.08] flex items-center gap-3 bg-background/80 backdrop-blur-xl shrink-0">
                <button
                  onClick={() => setSidebar(true)}
                  className="md:hidden w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/5 transition"
                >
                  <Icon name="ArrowLeft" size={16} />
                </button>
                <div className="w-8 h-8 bg-amber/10 border border-amber/20 rounded-xl flex items-center justify-center shrink-0">
                  <Icon name="User" size={14} className="text-amber" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-oswald font-semibold text-sm text-white tracking-wider">
                    Клиент ···{active.slice(-5)}
                  </p>
                  <p className="font-golos text-[10px] text-green-400">
                    {activeInfo
                      ? `Последнее: ${fmtDate(activeInfo.last_message_at)}`
                      : "Активный диалог"}
                  </p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4 bg-[#080808]">
                {msgsLoading && (
                  <div className="flex justify-center py-8">
                    <Icon
                      name="Loader"
                      size={24}
                      className="text-amber animate-spin"
                    />
                  </div>
                )}
                {!msgsLoading && msgs.length === 0 && (
                  <div className="text-center py-12">
                    <p className="font-golos text-sm text-white/20">
                      Сообщений пока нет
                    </p>
                  </div>
                )}
                {msgs.map((m) => {
                  const isOp = m.from === "operator";
                  return (
                    <div
                      key={m.id}
                      className={`flex ${
                        isOp ? "justify-end" : "justify-start"
                      }`}
                    >
                      {!isOp && (
                        <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center shrink-0 mt-1 mr-2">
                          <Icon
                            name="User"
                            size={12}
                            className="text-white/30"
                          />
                        </div>
                      )}
                      <div
                        className={`max-w-[70%] overflow-hidden rounded-2xl ${
                          isOp
                            ? "bg-amber text-coal rounded-br-sm"
                            : "bg-white/[0.06] text-white rounded-bl-sm"
                        }`}
                      >
                        {m.image_url && (
                          <a
                            href={m.image_url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={m.image_url}
                              alt="фото"
                              className="block max-w-full object-cover"
                              style={{ maxHeight: 240 }}
                            />
                          </a>
                        )}
                        {(m.text || !m.image_url) && (
                          <div className="px-4 py-2.5">
                            {m.text && (
                              <p className="font-golos text-sm leading-relaxed">
                                {m.text}
                              </p>
                            )}
                            <div
                              className={`flex items-center gap-2 mt-1 ${
                                isOp ? "justify-end" : ""
                              }`}
                            >
                              <p
                                className={`font-golos text-[10px] ${
                                  isOp ? "text-coal/50" : "text-white/25"
                                }`}
                              >
                                {m.time}
                              </p>
                              <p
                                className={`font-golos text-[10px] uppercase tracking-wider ${
                                  isOp ? "text-coal/40" : "text-white/20"
                                }`}
                              >
                                {isOp ? "вы" : "клиент"}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      {isOp && (
                        <div className="w-7 h-7 rounded-full bg-amber/20 border border-amber/30 flex items-center justify-center shrink-0 mt-1 ml-2">
                          <Icon
                            name="Headphones"
                            size={12}
                            className="text-amber"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              <div className="border-t border-white/[0.08] bg-background px-4 sm:px-6 py-4 shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={txt}
                    onChange={(e) => setTxt(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && !e.shiftKey && sendReply()
                    }
                    placeholder="Введите ответ клиенту..."
                    autoComplete="off"
                    className="flex-1 bg-white/5 border border-white/10 focus:border-amber/40 rounded-xl px-4 py-3 font-golos text-sm text-white placeholder:text-white/25 outline-none transition min-w-0"
                  />
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) sendPhoto(f);
                      e.target.value = "";
                    }}
                  />
                  <button
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className="w-11 h-11 flex items-center justify-center rounded-xl border border-white/10 hover:border-amber/30 text-white/30 hover:text-amber transition disabled:opacity-30 shrink-0"
                  >
                    {uploading ? (
                      <Icon
                        name="Loader"
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Icon name="Paperclip" size={16} />
                    )}
                  </button>
                  <button
                    onClick={sendReply}
                    disabled={sending || !txt.trim()}
                    className="h-11 px-5 bg-amber text-coal font-oswald font-bold text-sm tracking-wider rounded-xl hover:bg-amber/90 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0 flex items-center gap-2"
                  >
                    <Icon name="Send" size={15} />
                    <span className="hidden sm:inline">Отправить</span>
                  </button>
                </div>
                <p className="mt-2 font-golos text-[11px] text-white/15">
                  Enter — отправить · Обновление каждые 3 сек
                </p>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
