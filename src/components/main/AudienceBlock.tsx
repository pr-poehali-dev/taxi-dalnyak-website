import Icon from "@/components/ui/icon";

const ITEMS = [
  {
    icon: "Shield",
    title: "Такси для военнослужащих",
    text: "Отвезём бойца домой в отпуск или обратно в часть. Встретим на вокзале, в аэропорту, у КПП или в пункте сбора. Едем в Москву, Ростов-на-Дону, Воронеж, Белгород, Курск, Краснодар и другие города.",
  },
  {
    icon: "MapPin",
    title: "На новые территории",
    text: "Междугороднее такси в Донецк, Луганск, Мариуполь, Мелитополь, Бердянск, Херсон и Запорожскую область. Маршрут и цену согласуем заранее.",
  },
  {
    icon: "Users",
    title: "Для родных и семей военных",
    text: "Поможем семье доехать к военнослужащему на госпиталь, присягу или встречу, а также забрать близкого после лечения. Перевезём вещи, поедем с детьми, остановимся по пути.",
  },
  {
    icon: "Briefcase",
    title: "Вахта и командировки",
    text: "Перевозка вахтовиков, строителей и сотрудников компаний в другой город. Работаем по договору, выдаём закрывающие документы.",
  },
];

export default function AudienceBlock() {
  return (
    <section id="military" className="px-6 pt-12 pb-6 max-w-xl mx-auto scroll-mt-4">
      <h2 className="text-center text-2xl sm:text-3xl font-bold uppercase" style={{ fontFamily: "Oswald, sans-serif" }}>
        Такси межгород для военных и вахтовиков
      </h2>
      <p className="mt-4 text-center text-base font-bold text-white/85">
        Дальние поездки по России, ДНР, ЛНР, Запорожской и Херсонской областям по фиксированной цене, без предоплаты.
      </p>
      <div className="mt-8 space-y-5">
        {ITEMS.map((it) => (
          <article key={it.title} className="flex gap-4 rounded-xl p-4" style={{ background: "#14141a", border: "1px solid rgba(251,191,36,0.25)" }}>
            <span className="w-12 h-12 shrink-0 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#fcd34d,#f59e0b)" }}>
              <Icon name={it.icon} size={24} style={{ color: "#111" }} />
            </span>
            <div>
              <h3 className="text-lg font-extrabold text-sky-400 leading-tight">{it.title}</h3>
              <p className="mt-1.5 text-sm font-semibold leading-relaxed text-white/85">{it.text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
