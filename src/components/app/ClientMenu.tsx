import Icon from "@/components/ui/icon";
import { useBackClose } from "@/lib/useBackClose";
import SupportLinks from "./SupportLinks";

export type MenuAction = "profile" | "history" | "promo" | "bonus" | "help";

export default function ClientMenu({ name, phone, bonusKm, telegram, max, onPick, onLogout, onClose }: {
  name: string; phone: string; bonusKm: number; telegram?: string; max?: string;
  onPick: (a: MenuAction) => void; onLogout: () => void; onClose: () => void;
}) {
  useBackClose(onClose);
  const items: { k: MenuAction; icon: string; label: string; hint?: string }[] = [
    { k: "profile", icon: "UserRound", label: "Мой профиль" },
    { k: "history", icon: "History", label: "История заказов" },
    { k: "promo", icon: "Ticket", label: "Промокоды" },
    { k: "bonus", icon: "Gift", label: "Копи-км и друзья", hint: `${bonusKm} км` },
    { k: "help", icon: "CircleHelp", label: "Как пользоваться" },
  ];
  return (
    <div className="fixed inset-0 z-[2800]" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute inset-y-0 left-0 flex w-[84%] max-w-sm animate-in slide-in-from-left flex-col overflow-y-auto bg-white text-neutral-900 shadow-2xl">
        <div className="bg-neutral-900 px-5 pb-5 pt-10 text-white">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fcd34d] text-2xl font-extrabold text-neutral-900">{(name || "Д")[0].toUpperCase()}</span>
          <div className="mt-3 text-xl font-extrabold text-white">{name || "Пассажир"}</div>
          <div className="text-sm text-neutral-400">{phone}</div>
        </div>
        <div className="flex-1 py-2">
          {items.map((i) => (
            <button key={i.k} onClick={() => onPick(i.k)} className="flex w-full items-center gap-4 px-5 py-4 text-left active:bg-neutral-100">
              <Icon name={i.icon} fallback="Circle" size={22} className="text-neutral-700" />
              <span className="flex-1 text-[16px] font-bold">{i.label}</span>
              {i.hint && <span className="rounded-full bg-[#fcd34d] px-2.5 py-0.5 text-xs font-extrabold">{i.hint}</span>}
            </button>
          ))}
          <div className="px-5 pt-4"><SupportLinks telegram={telegram} max={max} /></div>
        </div>
        <button onClick={onLogout} className="flex items-center gap-4 border-t border-neutral-100 px-5 py-4 text-left text-neutral-500 active:bg-neutral-100">
          <Icon name="LogOut" size={20} /><span className="font-bold">Выйти</span>
        </button>
      </div>
    </div>
  );
}
