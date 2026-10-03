import Icon from "@/components/ui/icon";

const ITEMS = [
  {
    icon: "HandCoins",
    title: "Фиксированная цена",
    text: "Стоимость поездки известна заранее и не меняется во время движения — ни из-за пробок, ни из-за ночного времени.",
  },
  {
    icon: "AlarmClock",
    title: "Подача автомобиля от 30 минут",
    text: "Подтверждаем заказ в течение 5 минут. Автомобиль подаётся в указанное время и место. Можно сделать предварительный заказ — доплачивать за это не нужно!",
  },
  {
    icon: "BadgeCheck",
    title: "Без предоплат",
    text: "Никаких предоплат! Оплата поездки производится только при посадке в автомобиль — наличными или переводом.",
  },
  {
    icon: "UserRound",
    title: "Без попутчиков",
    text: "Индивидуальный трансфер: машина едет только с вами и только по вашему маршруту, без пересадок и подсадок.",
  },
];

export default function AdvantagesBlock() {
  return (
    <section id="advantages" className="px-6 pt-12 pb-6 max-w-xl mx-auto text-center scroll-mt-4">
      <h2 className="text-2xl sm:text-3xl font-bold uppercase" style={{ fontFamily: "Oswald, sans-serif" }}>
        Почему выбирают нас
      </h2>
      <p className="mt-3 text-lg font-bold uppercase text-white/85">Наши преимущества</p>

      <div className="mt-10 space-y-12">
        {ITEMS.map((it) => (
          <div key={it.title}>
            <div
              className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
              style={{ background: "linear-gradient(135deg,#fcd34d,#f59e0b)", boxShadow: "0 0 35px rgba(251,191,36,0.35)" }}
            >
              <Icon name={it.icon} fallback="CircleCheck" size={44} style={{ color: "#111" }} />
            </div>
            <h3 className="mt-6 text-xl font-extrabold text-sky-400">{it.title}</h3>
            <p className="mt-3 text-base font-bold leading-relaxed text-white/90">{it.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
