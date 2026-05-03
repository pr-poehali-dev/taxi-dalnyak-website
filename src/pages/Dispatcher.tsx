import { useEffect, useState, useCallback, useRef } from "react";
import Icon from "@/components/ui/icon";

const API = "https://functions.poehali.dev/751993fc-4343-4a2b-8920-f5e64cc0269f";
const TOKEN_KEY = "dispatcher_token";

interface Session {
  session_id: string;
  last_message_at: string;
  created_at: string;
  route_from?: string | null;
  route_to?: string | null;
  distance_km?: number | null;
  car_class?: string | null;
  quoted_price?: number | null;
  phone?: string | null;
  pickup_date?: string | null;
  pickup_time?: string | null;
  pax_count?: number | null;
  extras?: string | null;
  is_ordered?: boolean;
  needs_operator?: boolean;
  operator_active?: boolean;
  unread_for_operator?: number;
  last_assistant_message?: string | null;
  drop_stage?: string | null;
  messages_count?: number | null;
  utm_source?: string | null;
  utm_term?: string | null;
}

interface Message {
  role: string; // user | assistant | bot | operator
  text: string;
  ts?: string | null;
}

interface SessionFull extends Session {
  has_toll?: boolean;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  user_agent?: string | null;
  ip_address?: string | null;
  messages: Message[];
}

interface Stats {
  waiting: number;
  active: number;
  recent: number;
  orders_today: number;
  sessions_today: number;
}

let _ac: AudioContext | null = null;
function beep(times = 2) {
  try {
    if (!_ac) _ac = new AudioContext();
    if (_ac.state === "suspended") _ac.resume();
    for (let i = 0; i < times; i++) {
      const o = _ac.createOscillator();
      const g = _ac.createGain();
      o.connect(g);
      g.connect(_ac.destination);
      o.frequency.value = 880;
      const t = _ac.currentTime + i * 0.18;
      g.gain.setValueAtTime(0.3, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
      o.start(t);
      o.stop(t + 0.2);
    }
  } catch {
    /* noop */
  }
}

function fmtTime(iso?: string | null) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) {
      return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
    }
    return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" }) + " " +
           d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function timeSince(iso?: string | null) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "только что";
  if (min < 60) return `${min} мин назад`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} ч назад`;
  return `${Math.floor(h / 24)} д назад`;
}

export default function Dispatcher() {
  const [token, setToken] = useState<string>(() => localStorage.getItem(TOKEN_KEY) || "");
  const [pwd, setPwd] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");
  const [selected, setSelected] = useState<SessionFull | null>(null);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [filter, setFilter] = useState<"all" | "needs">("all");

  const prevWaitingRef = useRef(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiCall = useCallback(
    async (path: string, opts?: RequestInit) => {
      const url = path.includes("?") ? `${API}${path}&token=${encodeURIComponent(token)}` : `${API}${path}?token=${encodeURIComponent(token)}`;
      const res = await fetch(url, {
        ...opts,
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Token": token,
          ...(opts?.headers || {}),
        },
      });
      if (res.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        setToken("");
        throw new Error("unauthorized");
      }
      return res.json();
    },
    [token],
  );

  // Login
  const handleLogin = useCallback(async () => {
    setAuthLoading(true);
    setAuthError("");
    try {
      const res = await fetch(`${API}?action=login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pwd }),
      });
      const data = await res.json();
      if (data.ok && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        setToken(data.token);
      } else {
        setAuthError("Неверный пароль");
      }
    } catch {
      setAuthError("Не удалось подключиться. Попробуйте ещё раз.");
    } finally {
      setAuthLoading(false);
    }
  }, [pwd]);

  // Загрузка списка
  const loadList = useCallback(async () => {
    if (!token) return;
    try {
      const data = await apiCall(`?action=list${filter === "needs" ? "&only_needs=1" : ""}`);
      setSessions(data.sessions || []);
      const statsData = await apiCall("?action=stats");
      setStats(statsData);
      // beep, если появились новые ожидающие
      if (statsData.waiting > prevWaitingRef.current) {
        beep(3);
      }
      prevWaitingRef.current = statsData.waiting;
    } catch {
      /* noop */
    }
  }, [token, apiCall, filter]);

  // Загрузка деталей выбранного
  const loadSelected = useCallback(async () => {
    if (!token || !selectedId) {
      setSelected(null);
      return;
    }
    try {
      const data = await apiCall(`?action=session&session_id=${encodeURIComponent(selectedId)}`);
      setSelected(data);
      // Скролл вниз
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });
      }, 50);
    } catch {
      /* noop */
    }
  }, [token, selectedId, apiCall]);

  useEffect(() => {
    if (!token) return;
    loadList();
    const t = setInterval(loadList, 4000);
    return () => clearInterval(t);
  }, [token, loadList]);

  useEffect(() => {
    if (!selectedId || !token) return;
    loadSelected();
    const t = setInterval(loadSelected, 3000);
    return () => clearInterval(t);
  }, [selectedId, token, loadSelected]);

  const handleJoin = useCallback(async () => {
    if (!selectedId) return;
    await apiCall("?action=join", {
      method: "POST",
      body: JSON.stringify({ session_id: selectedId }),
    });
    loadSelected();
  }, [selectedId, apiCall, loadSelected]);

  const handleLeave = useCallback(async () => {
    if (!selectedId) return;
    if (!confirm("Передать клиента обратно Алисе?")) return;
    await apiCall("?action=leave", {
      method: "POST",
      body: JSON.stringify({ session_id: selectedId }),
    });
    loadSelected();
  }, [selectedId, apiCall, loadSelected]);

  const handleSend = useCallback(async () => {
    if (!selectedId || !draft.trim() || sending) return;
    setSending(true);
    try {
      await apiCall("?action=send", {
        method: "POST",
        body: JSON.stringify({ session_id: selectedId, text: draft.trim() }),
      });
      setDraft("");
      loadSelected();
    } finally {
      setSending(false);
    }
  }, [selectedId, draft, sending, apiCall, loadSelected]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setSelectedId("");
    setSelected(null);
  }, []);

  // ---------- LOGIN SCREEN ----------
  if (!token) {
    return (
      <div className="min-h-[100dvh] bg-[#1a1a1a] text-white flex items-center justify-center px-4 font-golos">
        <div className="w-full max-w-sm bg-white text-[#1a1a1a] rounded-2xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 flex items-center justify-center">
              <Icon name="Headphones" size={20} className="text-[#1a1a1a]" />
            </div>
            <div>
              <div className="font-oswald text-[18px] font-bold uppercase leading-none">Диспетчер</div>
              <div className="text-[11px] text-black/55">Дальняк · контроль Алисы</div>
            </div>
          </div>
          <input
            type="password"
            value={pwd}
            onChange={(e) => setPwd(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder="Пароль"
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-[#F5F2ED] text-[15px] focus:outline-none focus:ring-2 focus:ring-amber-400 mb-3"
          />
          {authError && <div className="text-red-600 text-[12px] mb-3">{authError}</div>}
          <button
            type="button"
            onClick={handleLogin}
            disabled={authLoading}
            className="w-full py-3 rounded-xl bg-amber-400 font-oswald font-bold uppercase text-[14px] active:scale-95 transition-transform disabled:opacity-50"
          >
            {authLoading ? "Вход…" : "Войти"}
          </button>
        </div>
      </div>
    );
  }

  // ---------- MAIN UI ----------
  const filtered = filter === "needs"
    ? sessions.filter((s) => s.needs_operator || s.operator_active)
    : sessions;

  return (
    <div className="h-[100dvh] bg-[#F5F2ED] text-[#1a1a1a] font-golos flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-black/10 px-3 py-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-400 flex items-center justify-center">
            <Icon name="Headphones" size={16} className="text-[#1a1a1a]" />
          </div>
          <div>
            <div className="font-oswald text-[14px] font-bold uppercase leading-none">Диспетчер</div>
            <div className="text-[10px] text-black/55">Дальняк</div>
          </div>
        </div>
        {stats && (
          <div className="flex items-center gap-2 text-[11px]">
            {stats.waiting > 0 && (
              <span className="px-2 py-1 rounded-full bg-red-500 text-white font-bold animate-pulse">
                🆘 {stats.waiting}
              </span>
            )}
            {stats.active > 0 && (
              <span className="px-2 py-1 rounded-full bg-green-500 text-white font-bold">
                💬 {stats.active}
              </span>
            )}
            <span className="px-2 py-1 rounded-full bg-black/5 hidden sm:inline">
              📦 {stats.orders_today} сегодня
            </span>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="text-[11px] text-black/55 hover:text-black px-2 py-1"
          title="Выйти"
        >
          <Icon name="LogOut" size={14} />
        </button>
      </header>

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar — sessions list */}
        <aside
          className={`${selectedId ? "hidden md:flex" : "flex"} w-full md:w-[340px] flex-shrink-0 border-r border-black/10 bg-white flex-col`}
        >
          <div className="px-3 py-2 border-b border-black/5 flex gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`flex-1 px-3 py-1.5 rounded-full text-[12px] font-bold uppercase font-oswald ${
                filter === "all" ? "bg-[#1a1a1a] text-white" : "bg-black/5 text-black/60"
              }`}
            >
              Все
            </button>
            <button
              type="button"
              onClick={() => setFilter("needs")}
              className={`flex-1 px-3 py-1.5 rounded-full text-[12px] font-bold uppercase font-oswald ${
                filter === "needs" ? "bg-red-500 text-white" : "bg-black/5 text-black/60"
              }`}
            >
              {stats && stats.waiting > 0 ? `🆘 Зовут (${stats.waiting})` : "Зовут"}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <div className="text-center text-black/45 text-[12px] py-8 px-4">
                Пока пусто. Когда Алиса попросит подключиться — появится тут.
              </div>
            )}
            {filtered.map((s) => {
              const isSelected = s.session_id === selectedId;
              const route = s.route_from && s.route_to
                ? `${s.route_from} → ${s.route_to}`
                : s.route_from || s.route_to || "Маршрут не задан";
              return (
                <button
                  key={s.session_id}
                  type="button"
                  onClick={() => setSelectedId(s.session_id)}
                  className={`w-full text-left px-3 py-2.5 border-b border-black/5 hover:bg-black/[0.02] transition-colors ${
                    isSelected ? "bg-amber-50" : ""
                  } ${s.needs_operator ? "border-l-4 border-l-red-500" : s.operator_active ? "border-l-4 border-l-green-500" : ""}`}
                >
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <div className="font-oswald font-bold text-[13px] uppercase truncate flex-1">
                      {route}
                    </div>
                    <div className="text-[10px] text-black/45 whitespace-nowrap">
                      {timeSince(s.last_message_at)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap text-[10.5px]">
                    {s.needs_operator && (
                      <span className="px-1.5 py-0.5 rounded bg-red-500 text-white font-bold">🆘 ЗОВЁТ</span>
                    )}
                    {s.operator_active && (
                      <span className="px-1.5 py-0.5 rounded bg-green-500 text-white font-bold">💬 ВЕДЁТЕ</span>
                    )}
                    {s.is_ordered && (
                      <span className="px-1.5 py-0.5 rounded bg-blue-500 text-white font-bold">✅ ЗАКАЗ</span>
                    )}
                    {(s.unread_for_operator || 0) > 0 && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-400 text-[#1a1a1a] font-bold">
                        +{s.unread_for_operator}
                      </span>
                    )}
                    {s.phone && (
                      <span className="text-black/55">📞 +{s.phone}</span>
                    )}
                    {s.distance_km && (
                      <span className="text-black/45">{s.distance_km} км</span>
                    )}
                  </div>
                  {s.last_assistant_message && (
                    <div className="text-[11px] text-black/55 truncate mt-0.5">
                      Алиса: {s.last_assistant_message}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Chat panel */}
        <main className={`${selectedId ? "flex" : "hidden md:flex"} flex-1 flex-col min-w-0 bg-[#F5F2ED]`}>
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-black/45 text-[13px]">
              Выбери диалог слева
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="bg-white border-b border-black/10 px-3 py-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedId("")}
                  className="md:hidden p-1 -ml-1"
                  aria-label="Назад"
                >
                  <Icon name="ChevronLeft" size={20} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="font-oswald text-[14px] font-bold uppercase truncate">
                    {selected.route_from && selected.route_to
                      ? `${selected.route_from} → ${selected.route_to}`
                      : "Маршрут не задан"}
                  </div>
                  <div className="text-[11px] text-black/55 flex items-center gap-2 flex-wrap">
                    {selected.phone && <a href={`tel:+${selected.phone}`} className="text-blue-600">+{selected.phone}</a>}
                    {selected.pickup_date && <span>📅 {selected.pickup_date}</span>}
                    {selected.pickup_time && <span>🕐 {selected.pickup_time}</span>}
                    {selected.distance_km && <span>{selected.distance_km} км</span>}
                    {selected.quoted_price && <span>{Math.round(selected.quoted_price)} ₽</span>}
                  </div>
                </div>
                {selected.operator_active ? (
                  <button
                    type="button"
                    onClick={handleLeave}
                    className="px-3 py-1.5 rounded-full bg-black/5 text-[11px] font-bold uppercase font-oswald active:scale-95"
                  >
                    Вернуть Алисе
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleJoin}
                    className="px-3 py-1.5 rounded-full bg-amber-400 text-[#1a1a1a] text-[11px] font-bold uppercase font-oswald active:scale-95"
                  >
                    Подключиться
                  </button>
                )}
              </div>

              {/* Memory card */}
              {(selected.extras || selected.pax_count || selected.car_class || selected.drop_stage) && (
                <div className="bg-amber-50 border-b border-amber-200 px-3 py-2 text-[11.5px]">
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                    {selected.car_class && <span>🚗 <b>{selected.car_class}</b></span>}
                    {selected.pax_count && <span>👥 {selected.pax_count} пасс.</span>}
                    {selected.extras && <span>📝 {selected.extras}</span>}
                    {selected.drop_stage && <span className="text-red-600">⚠️ {selected.drop_stage}</span>}
                  </div>
                </div>
              )}

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
                {selected.messages.map((m, i) => {
                  const isClient = m.role === "user";
                  const isOperator = m.role === "operator";
                  return (
                    <div key={i} className={`flex ${isClient ? "justify-start" : "justify-end"}`}>
                      <div className="max-w-[80%]">
                        <div className="text-[10px] text-black/45 px-2 mb-0.5">
                          {isClient ? "Клиент" : isOperator ? "Вы" : "Алиса"} · {fmtTime(m.ts)}
                        </div>
                        <div
                          className={`px-3 py-2 rounded-2xl text-[14px] leading-snug whitespace-pre-wrap break-words ${
                            isClient
                              ? "bg-white border border-black/5 rounded-bl-md"
                              : isOperator
                              ? "bg-blue-500 text-white rounded-br-md"
                              : "bg-amber-200 text-[#1a1a1a] rounded-br-md"
                          }`}
                        >
                          {m.text}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="bg-white border-t border-black/10 px-3 py-2.5 flex items-center gap-2">
                <input
                  type="text"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={selected.operator_active ? "Ответить клиенту…" : "Подключитесь, чтобы писать"}
                  className="flex-1 px-4 py-2.5 rounded-full bg-[#F5F2ED] text-[15px] focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                  style={{ fontSize: "16px" }}
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={sending || !draft.trim()}
                  className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center disabled:opacity-40 active:scale-95"
                  aria-label="Отправить"
                >
                  <Icon name="Send" size={16} className="text-white" />
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
