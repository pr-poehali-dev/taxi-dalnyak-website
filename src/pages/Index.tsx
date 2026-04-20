import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";

const LEAD_API = "https://functions.poehali.dev/08fe4061-ac7e-4404-8a08-788b739d491b";
const LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/eed871f1-fcfc-4342-ba10-6d3337b98fe4.jpg";
const HERO_BG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/070823e8-a973-4123-b1f4-998332b7edef.jpg";

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
      const ua = navigator.userAgent || "";
      const isIOS = /iPad|iPhone|iPod/.test(ua);
      if (isIOS) setShowIosHint(true);
      else setShowIosHint(true);
    }
  }, [installPrompt, trackGoal]);

  return (
    <div className="min-h-screen bg-coal text-white relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src={HERO_BG}
          alt=""
          className="w-full h-full object-cover"
          fetchPriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/85 to-black/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col px-4 py-5 sm:py-8">
        {/* Top: logo + install */}
        <header className="flex items-center justify-between mb-6 sm:mb-8 max-w-md sm:max-w-xl w-full mx-auto">
          <div className="flex items-center gap-2.5">
            <img
              src={LOGO}
              alt="Дальняк"
              className="w-11 h-11 rounded-full object-cover ring-2 ring-amber/60"
              width={44}
              height={44}
            />
            <div>
              <div className="font-oswald text-lg font-bold text-amber uppercase tracking-wider leading-none">
                Дальняк
              </div>
              <div className="text-[10px] text-white/50 font-golos mt-0.5">Межгород 24/7</div>
            </div>
          </div>

          {!isInstalled && (
            <button
              onClick={handleInstall}
              className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-golos text-xs font-semibold px-3 py-2 rounded-lg transition-all active:scale-95"
            >
              <Icon name="Download" size={13} />
              <span className="hidden sm:inline">Добавить на экран</span>
              <span className="sm:hidden">Ярлык</span>
            </button>
          )}
        </header>

        {/* Hero card */}
        <main className="flex-1 flex items-center justify-center">
          <div className="w-full max-w-md sm:max-w-xl mx-auto">
            <div className="text-center mb-5">
              <div className="inline-flex items-center gap-2 bg-green-500/15 border border-green-500/30 rounded-full px-3 py-1 mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
                <span className="text-green-300 font-golos text-xs font-medium">
                  Диспетчер онлайн — ответим за 2 минуты
                </span>
              </div>

              <h1 className="font-oswald text-[38px] leading-[0.95] sm:text-5xl font-bold text-white uppercase mb-3">
                Междугороднее
                <br />
                <span className="text-amber">такси</span>
              </h1>
              <p className="font-golos text-white/70 text-sm sm:text-base max-w-sm mx-auto">
                Фиксированная цена · Подача от 30 минут · Без предоплаты
              </p>
            </div>

            {/* Big phone button — pulsing */}
            <a
              href={PHONE_HREF}
              onClick={() => trackGoal("call")}
              className="relative flex items-center justify-center gap-3 w-full bg-amber text-coal font-oswald text-2xl sm:text-3xl uppercase font-bold py-5 rounded-2xl active:scale-[0.98] transition-transform shadow-2xl shadow-amber/40 mb-3 pulse-big"
            >
              <Icon name="Phone" size={26} className="fill-coal" />
              <span className="tracking-wide">{PHONE}</span>
            </a>

            {/* Messenger buttons — brand colors, large logos */}
            <div className="grid grid-cols-2 gap-2.5 mb-3">
              <a
                href={TG}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackGoal("tg")}
                className="flex items-center justify-center gap-2 py-4 rounded-xl font-oswald text-base uppercase font-bold active:scale-95 transition-transform shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #2AABEE 0%, #229ED9 100%)",
                  color: "#fff",
                  boxShadow: "0 6px 20px rgba(42,171,238,0.35)",
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
                className="flex items-center justify-center gap-2 py-4 rounded-xl font-oswald text-base uppercase font-bold active:scale-95 transition-transform shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #1470FF 0%, #005FF9 100%)",
                  color: "#fff",
                  boxShadow: "0 6px 20px rgba(20,112,255,0.35)",
                }}
              >
                <MaxLogo />
                <span>MAX</span>
              </a>
            </div>

            {/* CTA — узнать стоимость */}
            <a
              href={TG}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackGoal("price_tg")}
              className="flex items-center justify-center gap-2 w-full bg-white/10 hover:bg-white/15 border border-amber/40 text-amber font-oswald text-base uppercase font-bold py-4 rounded-xl active:scale-[0.98] transition-all mb-5"
            >
              <Icon name="Calculator" size={18} />
              Узнать стоимость поездки
            </a>

            {/* Callback form */}
            <div className="bg-black/50 backdrop-blur-md border border-amber/25 rounded-2xl p-4 sm:p-5 shadow-2xl">
              {!submitted ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-9 h-9 rounded-full bg-amber/20 border border-amber/40 flex items-center justify-center shrink-0">
                      <Icon name="PhoneCall" size={16} className="text-amber" />
                    </div>
                    <div>
                      <div className="font-oswald text-white font-bold uppercase text-sm sm:text-base leading-tight">
                        Перезвоните мне
                      </div>
                      <div className="text-white/50 text-xs font-golos">Наберём в течение 2 минут</div>
                    </div>
                  </div>
                  <form onSubmit={submit} className="space-y-2.5">
                    <div className="relative">
                      <Icon
                        name="Phone"
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-amber/70"
                      />
                      <input
                        type="tel"
                        inputMode="tel"
                        placeholder="+7 (___) ___-__-__"
                        value={phone}
                        onChange={(e) => setPhone(formatPhone(e.target.value))}
                        className="w-full bg-coal/80 border border-amber/20 focus:border-amber rounded-xl pl-10 pr-3 py-3.5 text-white placeholder:text-white/40 font-golos text-base outline-none transition-colors"
                        required
                      />
                    </div>

                    {error && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 text-red-300 text-xs font-golos">
                        {error}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-amber text-coal font-oswald text-base uppercase font-bold py-3.5 rounded-xl hover:bg-amber/90 transition-all active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-amber/30"
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
                    <p className="text-[10px] text-white/40 text-center font-golos">
                      Нажимая кнопку, вы соглашаетесь с обработкой персональных данных
                    </p>
                  </form>
                </>
              ) : (
                <div className="text-center py-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center mb-2">
                    <Icon name="Check" size={24} className="text-green-400" />
                  </div>
                  <h3 className="font-oswald text-lg font-bold text-white uppercase mb-1">
                    Заявка принята
                  </h3>
                  <p className="text-white/70 font-golos text-sm">
                    Диспетчер наберёт вас в течение 2 минут
                  </p>
                </div>
              )}
            </div>

            {/* Trust micro-row */}
            <div className="flex items-center justify-center gap-4 mt-5 text-[11px] text-white/50 font-golos">
              <div className="flex items-center gap-1">
                <Icon name="Star" size={12} className="text-amber fill-amber" />
                <span>4.8 / 2340 отзывов</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-white/20" />
              <div className="flex items-center gap-1">
                <Icon name="Shield" size={12} className="text-amber" />
                <span>С 2019 года</span>
              </div>
            </div>
          </div>
        </main>

        <footer className="max-w-md sm:max-w-xl w-full mx-auto mt-6 text-center text-[10px] text-white/30 font-golos">
          &copy; {new Date().getFullYear()} Такси Дальняк · Межгородные перевозки
        </footer>
      </div>

      {/* iOS install hint modal */}
      {showIosHint && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowIosHint(false)}
        >
          <div
            className="bg-card border border-amber/30 rounded-2xl p-5 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-oswald text-lg font-bold text-white uppercase">
                Добавить на экран
              </h3>
              <button
                onClick={() => setShowIosHint(false)}
                className="text-white/40 hover:text-white"
              >
                <Icon name="X" size={20} />
              </button>
            </div>
            <p className="text-white/70 text-sm font-golos mb-4">
              Чтобы добавить ярлык Такси Дальняк на главный экран телефона:
            </p>
            <ol className="space-y-2.5 text-sm text-white/80 font-golos mb-4">
              <li className="flex gap-2.5">
                <span className="w-6 h-6 rounded-full bg-amber text-coal font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <span>
                  Нажмите кнопку{" "}
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white/10 rounded">
                    <Icon name="Share" size={14} className="text-amber" />
                  </span>{" "}
                  «Поделиться» в браузере
                </span>
              </li>
              <li className="flex gap-2.5">
                <span className="w-6 h-6 rounded-full bg-amber text-coal font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <span>Выберите «На экран Домой» / «Добавить на главный экран»</span>
              </li>
              <li className="flex gap-2.5">
                <span className="w-6 h-6 rounded-full bg-amber text-coal font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <span>Нажмите «Добавить» — готово!</span>
              </li>
            </ol>
            <button
              onClick={() => setShowIosHint(false)}
              className="w-full bg-amber text-coal font-oswald text-base uppercase font-bold py-3 rounded-xl"
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

function MaxLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 20L7.5 4h3.2l1.3 10L13.3 4h3.2L21 20h-3l-2.7-10.5L14 20h-2.5L10 9.5 7.5 20H3z"
        fill="currentColor"
      />
    </svg>
  );
}
