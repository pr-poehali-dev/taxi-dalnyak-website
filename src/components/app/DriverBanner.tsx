import Icon from "@/components/ui/icon";
import { reachGoal } from "@/lib/metrika";

export default function DriverBanner() {
  return (
    <a href="/app/driver" onClick={() => reachGoal("app_driver_banner")} className="relative mt-6 block overflow-hidden rounded-[28px] bg-neutral-900 text-white shadow-lg">
      <img src="/app/driver-banner.webp" alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
      <div className="relative p-5">
        <span className="inline-block rounded-full bg-[#fcd34d] px-3 py-1 text-xs font-extrabold text-neutral-900">Работа водителем</span>
        <h3 className="mt-3 max-w-[16rem] text-2xl font-extrabold leading-tight text-white">Зарабатывайте на своём авто</h3>
        <ul className="mt-2 max-w-[15rem] space-y-1 text-sm text-neutral-200">
          <li>Междугородние заказы с высокой ценой</li>
          <li>Свободный график, вы сами выбираете заказы</li>
          <li>Комиссия сервиса всего 20%</li>
        </ul>
        <span className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-[#fcd34d] px-5 py-3 font-extrabold text-neutral-900">
          Стать водителем <Icon name="ArrowRight" size={18} />
        </span>
      </div>
    </a>
  );
}
