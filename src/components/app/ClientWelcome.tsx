import Icon from "@/components/ui/icon";

const PERKS: { icon: string; title: string; text: string }[] = [
  { icon: "BadgeCheck", title: "Цена известна заранее", text: "Фиксированная стоимость за километр, без накруток в дороге" },
  { icon: "Wallet", title: "Оплата наличными или переводом", text: "Рассчитываетесь напрямую с водителем, предоплаты нет" },
  { icon: "Car", title: "Стандарт, Комфорт и Минивэн", text: "Сами выбираете класс авто под вашу поездку" },
  { icon: "Clock", title: "Заказ и подача 24/7", text: "Можно заказать сейчас или на нужное время" },
];

export default function ClientWelcome({ children }: { children?: React.ReactNode }) {
  return (
    <div>
      <div className="relative overflow-hidden bg-neutral-950 text-white">
        <img src="/app/client-hero.webp" alt="" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/50 to-neutral-950/20" />
        <div className="relative px-5 pb-8 pt-10">
          <span className="inline-block rounded-full bg-[#fcd34d] px-3 py-1 text-xs font-extrabold text-neutral-900">От 200 км по всей России</span>
          <h1 className="mt-4 max-w-[20rem] text-[34px] font-extrabold uppercase leading-[1.05] text-white">Междугороднее <span className="text-[#fcd34d]">такси по России</span></h1>
          <p className="mt-3 max-w-[20rem] text-[15px] text-neutral-200">Закажите машину за минуту и увидите цену до поездки.</p>
        </div>
      </div>

      <div className="relative -mt-4 rounded-t-[28px] bg-neutral-50 px-5 pb-10 pt-6">
        <div className="grid grid-cols-2 gap-3">
          {PERKS.map((p) => (
            <div key={p.title} className="rounded-3xl bg-white p-4 shadow-sm">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fcd34d] text-neutral-900"><Icon name={p.icon} fallback="Check" size={20} /></span>
              <div className="mt-3 text-[15px] font-extrabold leading-tight text-neutral-900">{p.title}</div>
              <div className="mt-1 text-xs leading-snug text-neutral-500">{p.text}</div>
            </div>
          ))}
        </div>
        <div className="mt-5">{children}</div>
      </div>
    </div>
  );
}
