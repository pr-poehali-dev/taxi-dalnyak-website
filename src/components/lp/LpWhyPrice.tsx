import Icon from "@/components/ui/icon";

const ITEMS = [
  { icon: "Route", title: "Дорога в обе стороны", text: "Водитель едет к вам, везёт вас и возвращается домой. Мы закладываем весь путь, а не только километры с пассажиром." },
  { icon: "Clock", title: "Время водителя", text: "Дальний рейс занимает у человека целый день или больше. Водитель отдыхает по графику, чтобы вы ехали безопасно." },
  { icon: "CarFront", title: "Хороший автомобиль", text: "Чистая машина с кондиционером, подготовленная к трассе: шины, масло, тормоза проверены перед рейсом." },
  { icon: "ShieldCheck", title: "Ответственность", text: "Едете только вы, без попутчиков. Водитель отвечает за маршрут, сроки и вашу безопасность." },
];

export default function LpWhyPrice({ city }: { city: string }) {
  return (
    <section className="px-5 py-8 max-w-xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold uppercase text-center" style={{ fontFamily: "Oswald, sans-serif" }}>
        Почему цена именно такая
      </h2>
      <p className="mt-3 text-center text-[15px] text-white/70">
        Межгород из {city} — это не такси «по счётчику». Вот за что вы платите.
      </p>
      <div className="mt-6 space-y-3">
        {ITEMS.map((i) => (
          <div key={i.title} className="flex gap-4 rounded-2xl p-4" style={{ background: "#14141a", border: "1px solid rgba(255,255,255,0.08)" }}>
            <span className="w-11 h-11 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0">
              <Icon name={i.icon} fallback="Check" size={20} className="text-amber-300" />
            </span>
            <div>
              <h3 className="font-extrabold text-base">{i.title}</h3>
              <p className="text-white/75 text-sm leading-snug mt-1">{i.text}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-4 text-center text-sm font-semibold text-amber-300">
        Цену называем до выезда и фиксируем. В дороге она не меняется.
      </p>
    </section>
  );
}
