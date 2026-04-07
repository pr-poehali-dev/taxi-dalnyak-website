import { useState, useEffect } from "react";
import { Header } from "@/components/taxi/Header";
import { HeroSection } from "@/components/taxi/HeroSection";
import { MainSections } from "@/components/taxi/MainSections";
import { NAV } from "@/components/taxi/constants";

export default function Index() {
  const [section, setSection] = useState("hero");
  const [menuOpen, setMenuOpen] = useState(false);
  const [pwaEvt, setPwaEvt] = useState<Event | null>(null);
  const [pwaInstalled, setPwaInstalled] = useState(false);

  // PWA install prompt
  useEffect(() => {
    const h = (e: Event) => { e.preventDefault(); setPwaEvt(e); };
    window.addEventListener("beforeinstallprompt", h);
    window.addEventListener("appinstalled", () => setPwaInstalled(true));
    return () => window.removeEventListener("beforeinstallprompt", h);
  }, []);

  // Активная секция при скролле
  useEffect(() => {
    const fn = () => {
      for (const n of [...NAV].reverse()) {
        const el = document.getElementById(n.id);
        if (el && window.scrollY >= el.offsetTop - 140) { setSection(n.id); break; }
      }
    };
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setSection(id);
    setMenuOpen(false);
  };

  const doInstall = async () => {
    if (!pwaEvt) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (pwaEvt as any).prompt();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { outcome } = await (pwaEvt as any).userChoice;
    if (outcome === "accepted") setPwaInstalled(true);
    setPwaEvt(null);
  };

  const doShare = () => {
    if (navigator.share) {
      navigator.share({ title: "Такси Дальняк", text: "Межгородное такси от 200 км. Фиксированная цена.", url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href).then(() => alert("Ссылка скопирована!"));
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white" style={{ fontFamily: "'Golos Text', sans-serif" }}>
      <Header
        section={section}
        menuOpen={menuOpen}
        pwaEvt={pwaEvt}
        pwaInstalled={pwaInstalled}
        onGo={go}
        onMenuToggle={() => setMenuOpen(v => !v)}
        onInstall={doInstall}
        onDismissPwa={() => setPwaEvt(null)}
      />
      <HeroSection onGo={go} />
      <MainSections onGo={go} onShare={doShare} />
    </div>
  );
}
