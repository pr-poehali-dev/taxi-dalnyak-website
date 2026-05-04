import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { Header } from "@/components/taxi/Header";
import { HeroSection } from "@/components/taxi/HeroSection";
import { MainSections } from "@/components/taxi/MainSections";
import AlisaChat, { AlisaChatHandle } from "@/components/AlisaChat";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function getAllUtmParams(): Record<string, string> {
  const params = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  params.forEach((v, k) => {
    if (k.startsWith("utm_")) {
      const val = v.trim();
      if (!val || val.startsWith("{") || val.endsWith("}")) return;
      utm[k] = val;
    }
  });
  return utm;
}

export default function Index() {
  const [section, setSection] = useState("hero");
  const [menuOpen, setMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const [pwaEvt, setPwaEvt] = useState<BeforeInstallPromptEvent | null>(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);
  const [pwaDismissed, setPwaDismissed] = useState(false);

  const utmRef = useRef<Record<string, string>>({});
  const alisaRef = useRef<AlisaChatHandle>(null);

  useEffect(() => {
    utmRef.current = getAllUtmParams();

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setPwaInstalled(standalone);

    const handler = (e: Event) => {
      e.preventDefault();
      setPwaEvt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  useEffect(() => {
    const sections = ["hero", "tariffs", "why", "reviews", "contacts"];
    const onScroll = () => {
      const y = window.scrollY + 120;
      let cur = "hero";
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= y) cur = id;
      }
      setSection(cur);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleGo = useCallback((id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleInstall = useCallback(async () => {
    if (!pwaEvt) return;
    await pwaEvt.prompt();
    const res = await pwaEvt.userChoice;
    if (res.outcome === "accepted") setPwaInstalled(true);
    setPwaEvt(null);
  }, [pwaEvt]);

  const handleDismissPwa = useCallback(() => setPwaDismissed(true), []);

  const openChat = useCallback(() => setChatOpen(true), []);
  const closeChat = useCallback(() => setChatOpen(false), []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <Header
        section={section}
        menuOpen={menuOpen}
        pwaEvt={pwaDismissed ? null : pwaEvt}
        pwaInstalled={pwaInstalled}
        onGo={handleGo}
        onMenuToggle={() => setMenuOpen((v) => !v)}
        onInstall={handleInstall}
        onDismissPwa={handleDismissPwa}
      />

      <main className="pt-14">
        <HeroSection onGo={handleGo} />
        <MainSections onGo={handleGo} />
      </main>

      {/* Плавающая кнопка чата с Алисой */}
      {!chatOpen && (
        <button
          onClick={openChat}
          className="fixed z-40 right-4 bottom-24 md:bottom-6 flex items-center gap-2 bg-amber text-coal font-bold px-4 py-3.5 rounded-full shadow-2xl shadow-amber/30 hover:scale-[1.03] active:scale-[0.97] transition"
          style={{ fontFamily: "Oswald" }}
          aria-label="Открыть чат с Алисой"
        >
          <span className="relative flex">
            <span className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white text-[15px] font-black">А</span>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-amber" />
          </span>
          <span className="hidden sm:inline text-sm uppercase tracking-wide">Спросить Алису</span>
        </button>
      )}

      {/* Окно чата */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 md:inset-auto md:right-5 md:bottom-5 md:w-[380px] md:h-[620px] md:rounded-3xl overflow-hidden shadow-2xl bg-[#F5F2ED] flex flex-col border border-black/10">
          <button
            onClick={closeChat}
            className="absolute top-2.5 right-2.5 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/70 hover:bg-black text-white"
            aria-label="Закрыть чат"
          >
            <Icon name="X" size={18} />
          </button>
          <AlisaChat ref={alisaRef} utm={utmRef.current} />
        </div>
      )}
    </div>
  );
}
