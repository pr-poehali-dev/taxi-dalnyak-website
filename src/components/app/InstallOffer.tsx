import Icon from "@/components/ui/icon";

const PERKS = [
  { icon: "Gift", text: "Бонусные км с каждой поездки, оплачивайте ими часть цены" },
  { icon: "BellRing", text: "Уведомление, когда водитель найден и машина подъехала" },
  { icon: "Zap", text: "Заказ в одно касание прямо с экрана телефона" },
];

export default function InstallOffer({ onOpen, onClose }: { onOpen: () => void; onClose?: () => void }) {
  return (
    <div className="relative rounded-3xl bg-neutral-900 p-4 text-white shadow-lg">
      {onClose && (
        <button onClick={onClose} aria-label="Скрыть" className="absolute right-3 top-3 text-neutral-500"><Icon name="X" size={18} /></button>
      )}
      <div className="flex items-center gap-3 pr-6">
        <img src="/app-icon-192.png" alt="" className="h-12 w-12 shrink-0 rounded-2xl" />
        <div>
          <div className="text-[15px] font-extrabold leading-tight">Установите приложение Дальняк</div>
          <div className="text-xs text-neutral-400">Бесплатно, без магазина приложений, за 10 секунд</div>
        </div>
      </div>
      <ul className="mt-3 space-y-2">
        {PERKS.map((p) => (
          <li key={p.text} className="flex items-start gap-2.5 text-sm text-neutral-100">
            <Icon name={p.icon} size={18} className="mt-0.5 shrink-0 text-[#fcd34d]" />
            {p.text}
          </li>
        ))}
      </ul>
      <button onClick={onOpen} className="mt-4 w-full rounded-2xl bg-[#fcd34d] py-3 text-[15px] font-extrabold text-neutral-900">Установить приложение</button>
    </div>
  );
}
