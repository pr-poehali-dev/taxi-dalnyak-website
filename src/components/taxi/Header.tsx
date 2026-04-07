import Icon from "@/components/ui/icon";
import { NAV, LOGO, TG_HREF, WA_HREF, PHONE, PHONE_HREF, MAX_HREF, VK_HREF } from "./constants";

interface HeaderProps {
  section: string;
  menuOpen: boolean;
  pwaEvt: Event | null;
  pwaInstalled: boolean;
  onGo: (id: string) => void;
  onMenuToggle: () => void;
  onInstall: () => void;
  onDismissPwa: () => void;
}

function cls(...args: (string | false | undefined)[]) {
  return args.filter(Boolean).join(" ");
}

export function Header({
  section,
  menuOpen,
  pwaEvt,
  pwaInstalled,
  onGo,
  onMenuToggle,
  onInstall,
  onDismissPwa,
}: HeaderProps) {
  return (
    <>
      {/* ── Баннер «Добавить на экран» ── */}
      {pwaEvt && !pwaInstalled && (
        <div className="fixed bottom-20 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
          <div className="pointer-events-auto w-full max-w-sm bg-[#1a1a1a] border border-amber/40 rounded-2xl shadow-2xl flex items-center gap-3 px-4 py-3.5">
            <img src={LOGO} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-white" style={{ fontFamily: "Oswald" }}>Добавить на главный экран</p>
              <p className="text-xs text-white/50 mt-0.5">Быстрый доступ без браузера</p>
            </div>
            <button onClick={onInstall} className="bg-amber text-coal font-bold text-xs px-4 py-2 rounded-xl shrink-0 hover:bg-amber/90 transition" style={{ fontFamily: "Oswald" }}>
              Добавить
            </button>
            <button onClick={onDismissPwa} className="text-white/30 hover:text-white p-1 shrink-0"><Icon name="X" size={14} /></button>
          </div>
        </div>
      )}

      {/* ── Фиксированная нижняя панель CTA (мобиль) ── */}
      <div className="fixed bottom-0 inset-x-0 z-40 md:hidden border-t border-white/10 bg-[#0a0a0a]/95 backdrop-blur-xl px-3 py-2.5 flex gap-2">
        <a href={PHONE_HREF} className="flex-1 flex items-center justify-center gap-1.5 bg-amber text-coal font-bold text-sm py-3 rounded-xl active:scale-[0.97] transition" style={{ fontFamily: "Oswald" }}>
          <Icon name="Phone" size={16} />Звонок
        </a>
        <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 bg-[#005FF9] text-white font-bold text-sm py-3 rounded-xl active:scale-[0.97] transition" style={{ fontFamily: "Oswald" }}>
          MAX
        </a>
        <a href={WA_HREF} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 bg-green-600 text-white font-bold text-sm py-3 rounded-xl active:scale-[0.97] transition" style={{ fontFamily: "Oswald" }}>
          <Icon name="MessageCircle" size={16} />WhatsApp
        </a>
      </div>

      {/* ── Навигация ── */}
      <header className="fixed top-0 inset-x-0 z-40 border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <button onClick={() => onGo("hero")} className="flex items-center gap-2 shrink-0">
            <img src={LOGO} alt="" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-black text-base tracking-widest text-white uppercase hidden sm:block" style={{ fontFamily: "Oswald" }}>Дальняк</span>
          </button>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map(n => (
              <button key={n.id} onClick={() => onGo(n.id)}
                className={cls("px-3 py-1.5 rounded-lg text-sm transition-colors", section === n.id ? "text-amber bg-amber/10" : "text-white/50 hover:text-white hover:bg-white/5")}>
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1.5 bg-[#005FF9] hover:bg-[#1a70ff] text-white font-bold text-xs px-3 py-2 rounded-xl transition" style={{ fontFamily: "Oswald" }}>
              MAX — написать
            </a>
            <a href={PHONE_HREF} className="hidden sm:flex items-center gap-1.5 bg-amber text-coal font-bold text-xs px-3 py-2 rounded-xl transition hover:bg-amber/90" style={{ fontFamily: "Oswald" }}>
              <Icon name="Phone" size={13} />{PHONE}
            </a>
            <button onClick={onMenuToggle} className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg text-white/60 hover:text-white">
              <Icon name={menuOpen ? "X" : "Menu"} size={20} />
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-white/10 bg-[#0a0a0a]/98 backdrop-blur-xl">
            <div className="px-4 py-3 space-y-1">
              {NAV.map(n => (
                <button key={n.id} onClick={() => onGo(n.id)}
                  className={cls("w-full text-left px-4 py-3 rounded-xl text-sm transition", section === n.id ? "text-amber bg-amber/10" : "text-white/60 hover:text-white hover:bg-white/5")}>
                  {n.label}
                </button>
              ))}
              <div className="pt-2 pb-1 space-y-2">
                <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center font-black text-sm bg-[#005FF9] text-white py-3 rounded-xl" style={{ fontFamily: "Oswald" }}>
                  Написать в MAX
                </a>
                <a href={TG_HREF} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 font-bold text-sm border border-white/10 text-white/50 py-3 rounded-xl" style={{ fontFamily: "Oswald" }}>
                  <Icon name="Send" size={14} />Telegram
                </a>
              </div>
            </div>
          </div>
        )}
      </header>

      <div className="sr-only">
        <a href={VK_HREF}>ВКонтакте</a>
        <a href={TG_HREF}>Telegram</a>
      </div>
    </>
  );
}
