import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

const LEAD_API = "https://functions.poehali.dev/08fe4061-ac7e-4404-8a08-788b739d491b";
const LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/eed871f1-fcfc-4342-ba10-6d3337b98fe4.jpg";
const HERO_BG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/070823e8-a973-4123-b1f4-998332b7edef.jpg";
const MAX_LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/c12972fd-7c56-4a6f-9266-e44e65c003fa.jpeg";

const PHONE = "8 (995) 645-51-25";
const PHONE_HREF = "tel:+79956455125";
const TG = "https://t.me/Mezhgorod1816";
const MAX_URL = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";

function getAllUtmParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  params.forEach((v, k) => {
    if (k.startsWith("utm_")) utm[k] = v;
  });
  return utm;
}

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  const d = digits.startsWith("8") || digits.startsWith("7") ? digits : "7" + digits;
  const p = d.slice(0, 11);
  let out = "+7";
  if (p.length > 1) out += " (" + p.slice(1, 4);
  if (p.length >= 4) out += ") " + p.slice(4, 7);
  if (p.length >= 7) out += "-" + p.slice(7, 9);
  if (p.length >= 9) out += "-" + p.slice(9, 11);
  return out;
}

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function Index() {
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  const utmRef = useRef<Record<string, string>>({});

  useEffect(() => {
    utmRef.current = getAllUtmParams();

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const trackGoal = useCallback((goal: string) => {
    try {
      const w = window as unknown as { ym?: (id: number, action: string, goal: string) => void };
      if (w.ym) w.ym(108400932, "reachGoal", goal);
    } catch {
      /* noop */
    }
  }, []);

  const submit = useCallback(
    async (e?: React.FormEvent) => {
      if (e) e.preventDefault();
      setError("");
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 10) {
        setError("Введите корректный номер телефона");
        return;
      }
      setSubmitting(true);
      try {
        const res = await fetch(LEAD_API, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "callback",
            phone,
            utm: utmRef.current,
            page: window.location.href,
          }),
        });
        const data = await res.json();
        if (data.ok) {
          setSubmitted(true);
          trackGoal("callback");
        } else {
          setError("Не удалось отправить. Позвоните: " + PHONE);
        }
      } catch {
        setError("Не удалось отправить. Позвоните: " + PHONE);
      }
      setSubmitting(false);
    },
    [phone, trackGoal],
  );

  const handleInstall = useCallback(async () => {
    if (installPrompt) {
      await installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === "accepted") {
        trackGoal("pwa_install");
        setIsInstalled(true);
      }
      setInstallPrompt(null);
    } else {
      setShowIosHint(true);
    }
  }, [installPrompt, trackGoal]);

  return (
    <div className="min-h-screen bg-[#F8F5F0] text-[#1a1a1a] relative overflow-hidden">
      {/* Subtle hero image — top portion, soft */}
      <div className="absolute inset-x-0 top-0 h-[38vh] sm:h-[44vh] z-0 overflow-hidden">
        <img
          src={HERO_BG}
          alt=""
          className="w-full h-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/25 to-[#F8F5F0]" />
      </div>

      {/* Decorative gradient blob */}
      <div className="absolute -right-20 top-1/3 w-72 h-72 rounded-full bg-amber/20 blur-3xl z-0" aria-hidden />
      <div className="absolute -left-20 bottom-0 w-72 h-72 rounded-full bg-blue-400/15 blur-3xl z-0" aria-hidden />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col px-4 py-5 sm:py-8">
        {/* Top: logo + install */}
        <header className="flex items-center justify-between mb-5 sm:mb-8 max-w-md sm:max-w-xl w-full mx-auto">
          <div className="flex items-center gap-2.5">
            <img
              src={LOGO}
              alt="Дальняк"
              className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-lg"
              width={44}
              height={44}
            />
            <div>
              <div className="font-oswald text-lg font-bold text-white uppercase tracking-wider leading-none drop-shadow-md">
                Дальняк
              </div>
              <div className="text-[10px] text-white/90 font-golos mt-0.5 drop-shadow">Межгород 24/7</div>
            </div>
          </div>

          {!isInstalled && (
            <button
              onClick={handleInstall}
              className="flex items-center gap-1.5 bg-white/95 hover:bg-white border border-white text-[#1a1a1a] font-golos text-xs font-semibold px-3 py-2 rounded-lg transition-all active:scale-95 shadow-md"
            >
              <Icon name="Download" size={13} className="text-amber" />
              <span className="hidden sm:inline">Добавить на экран</span>
              <span className="sm:hidden">Ярлык</span>
            </button>
          )}
        </header>

        {/* Hero card */}
        <main className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md sm:max-w-xl mx-auto">
            <div className="text-center mb-5 sm:mb-6">
              <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur border border-green-500/30 rounded-full px-3 py-1.5 mb-4 shadow-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-green-700 font-golos text-xs font-semibold">
                  Диспетчер онлайн · ответим за 2 минуты
                </span>
              </div>

              <h1 className="font-oswald text-[36px] leading-[1] sm:text-5xl font-bold text-white uppercase mb-3 drop-shadow-xl">
                Междугороднее
                <br />
                <span className="text-amber">такси</span>
              </h1>
              <p className="font-golos text-white text-sm sm:text-base max-w-sm mx-auto drop-shadow-lg font-medium">
                Фиксированная цена · Подача от 30 минут · Без предоплаты
              </p>
            </div>

            {/* Main white card */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.25)] border border-black/5">
              {/* Big phone button — pulsing */}
              <a
                href={PHONE_HREF}
                onClick={() => trackGoal("call")}
                className="relative flex items-center justify-center gap-3 w-full bg-amber text-[#1a1a1a] font-oswald text-2xl sm:text-3xl uppercase font-bold py-5 rounded-2xl active:scale-[0.98] transition-transform shadow-xl shadow-amber/40 mb-4 pulse-big"
              >
                <Icon name="Phone" size={26} className="fill-[#1a1a1a]" />
                <span className="tracking-wide">{PHONE}</span>
              </a>

              {/* "Узнать стоимость" label */}
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-black/15 to-transparent" />
                <p className="text-[#1a1a1a]/60 font-golos text-xs uppercase tracking-widest font-semibold whitespace-nowrap">
                  Узнать стоимость
                </p>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-black/15 to-transparent" />
              </div>

              {/* Messenger buttons */}
              <div className="grid grid-cols-2 gap-2.5 mb-4">
                <a
                  href={TG}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackGoal("tg")}
                  className="flex items-center justify-center gap-2 py-4 rounded-xl font-oswald text-base uppercase font-bold active:scale-95 transition-transform"
                  style={{
                    background: "linear-gradient(135deg, #2AABEE 0%, #229ED9 100%)",
                    color: "#fff",
                    boxShadow: "0 8px 20px rgba(42,171,238,0.35)",
                  }}
                >
                  <TelegramLogo />
                  <span>Telegram</span>
                </a>
                <a
                  href={MAX_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackGoal("max")}
                  className="flex items-center justify-center gap-2 py-3 rounded-xl font-oswald text-base uppercase font-bold active:scale-95 transition-transform bg-white border-2 border-black/10"
                  style={{
                    boxShadow: "0 8px 20px rgba(100, 50, 200, 0.18)",
                  }}
                >
                  <img
                    src={MAX_LOGO}
                    alt="MAX"
                    className="h-7 w-auto object-contain"
                    loading="lazy"
                  />
                </a>
              </div>

              {/* Divider */}
              <div className="h-px bg-black/8 mb-4" />

              {/* Callback form */}
              {!submitted ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-10 h-10 rounded-full bg-amber/15 border border-amber/30 flex items-center justify-center shrink-0">
                      <Icon name="PhoneCall" size={18} className="text-amber" />
                    </div>
                    <div>
                      <div className="font-oswald text-[#1a1a1a] font-bold uppercase text-sm sm:text-base leading-tight">
                        Перезвоните мне
                      </div>
                      <div className="text-black/55 text-xs font-golos">
                        Наберём в течение 2 минут
                      </div>
                    </div>
                  </div>
                  <form onSubmit={submit} className="space-y-2.5">
                    <div className="relative">
                      <Icon
                        name="Phone"
                        size={16}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber"
                      />
                      <input
                        type="tel"
                        inputMode="tel"
                        placeholder="+7 (___) ___-__-__"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        className="w-full bg-[#F5F2ED] border-2 border-transparent focus:border-amber focus:bg-white rounded-xl pl-10 pr-3 py-3.5 text-[#1a1a1a] placeholder:text-black/35 font-golos text-base outline-none transition-all"
                        required
                      />
                    </div>

                    {error && (
                      <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-red-700 text-xs font-golos">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-amber hover:bg-amber/90 text-[#1a1a1a] font-oswald text-base uppercase font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-amber/30"
                    >
                      {submitting ? (
                        <>
                          <Icon name="Loader2" size={16} className="animate-spin" />
                          Отправляем...
                        </>
                      ) : (
                        <>
                          Жду звонка
                          <Icon name="ArrowRight" size={16} />
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-black/40 text-center font-golos">
                      Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
                    </p>
                  </form>
                </>
              ) : (
                <div className="text-center py-3">
                  <div className="w-14 h-14 mx-auto rounded-full bg-green-100 border-2 border-green-500 flex items-center justify-center mb-2">
                    <Icon name="Check" size={26} className="text-green-600" />
                  </div>
                  <h3 className="font-oswald text-lg font-bold text-[#1a1a1a] uppercase mb-1">
                    Заявка принята
                  </h3>
                  <p className="text-black/60 font-golos text-sm">
                    Диспетчер наберёт вас в течение 2 минут
                  </p>
                </div>
              )}
            </div>

            {/* Trust micro-row */}
            <div className="flex items-center justify-center gap-4 mt-5 text-[11px] text-black/55 font-golos">
              <div className="flex items-center gap-1">
                <Icon name="Star" size={12} className="text-amber fill-amber" />
                <span className="font-semibold">4.8 · 2340 отзывов</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-black/25" />
              <div className="flex items-center gap-1">
                <Icon name="Shield" size={12} className="text-amber" />
                <span className="font-semibold">С 2019 года</span>
              </div>
            </div>
          </div>
        </main>

        <footer className="max-w-md sm:max-w-xl w-full mx-auto mt-6 text-center text-[10px] text-black/35 font-golos">
          &copy; {new Date().getFullYear()} Такси Дальняк · Межгородные перевозки
        </footer>
      </div>

      {/* iOS install hint modal */}
      {showIosHint && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowIosHint(false)}
        >
          <div
            className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-oswald text-lg font-bold text-[#1a1a1a] uppercase">
                Добавить на экран
              </h3>
              <button
                onClick={() => setShowIosHint(false)}
                className="text-black/40 hover:text-black"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            <p className="text-black/70 text-sm font-golos mb-4">
              Чтобы добавить ярлык Такси Дальняк на главный экран телефона:
            </p>
            <ol className="space-y-2.5 text-sm text-[#1a1a1a] font-golos mb-4">
              <li className="flex gap-2.5">
                <span className="w-6 h-6 rounded-full bg-amber text-[#1a1a1a] font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <span>
                  Нажмите кнопку{" "}
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-black/5 rounded">
                    <Icon name="Share" size={14} className="text-amber" />
                  </span>{" "}
                  «Поделиться» в браузере
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="w-6 h-6 rounded-full bg-amber text-[#1a1a1a] font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <span>Выберите «На экран Домой» / «Добавить на главный экран»</span>
              </li>
              <li className="flex gap-2.5">
                <span className="w-6 h-6 rounded-full bg-amber text-[#1a1a1a] font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <span>Нажмите «Добавить» — готово!</span>
              </li>
            </ol>
            <button
              onClick={() => setShowIosHint(false)}
              className="w-full bg-amber text-[#1a1a1a] font-oswald text-base uppercase font-bold py-3 rounded-xl"
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TelegramLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  );
}
