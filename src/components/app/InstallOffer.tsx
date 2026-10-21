export default function InstallOffer({ onOpen, compact }: { onOpen: () => void; compact?: boolean }) {
  return (
    <button onClick={onOpen} className="flex w-full items-center gap-3 rounded-2xl bg-neutral-900 p-3 text-left text-white shadow-sm">
      <img src="/app-icon-192.png" alt="" className="h-11 w-11 shrink-0 rounded-xl" />
      <span className="flex-1">
        <span className="block text-sm font-extrabold">Установите приложение, это бесплатно</span>
        {!compact && <span className="block text-xs text-neutral-300">Копите бонусные км с каждой поездки и узнавайте о подаче машины</span>}
      </span>
      <span className="rounded-xl bg-[#fcd34d] px-3 py-2 text-xs font-extrabold text-neutral-900">Установить</span>
    </button>
  );
}
