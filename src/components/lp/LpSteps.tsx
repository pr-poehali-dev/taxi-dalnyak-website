const STEPS = [
  { n: "1", title: "Напишите или позвоните", text: "Назовите маршрут и время — это 30 секунд." },
  { n: "2", title: "Узнайте цену и из чего она состоит", text: "Диспетчер назовёт стоимость и объяснит её. Подтвердим заказ за 5 минут." },
  { n: "3", title: "Садитесь и платите на месте", text: "Предоплаты нет. Едете только вы, без попутчиков." },
];

export default function LpSteps() {
  return (
    <section className="px-5 py-8 max-w-xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold uppercase text-center" style={{ fontFamily: "Oswald, sans-serif" }}>
        Как это работает
      </h2>
      <div className="mt-6 space-y-4">
        {STEPS.map((s) => (
          <div key={s.n} className="flex gap-4 items-start">
            <span
              className="w-11 h-11 rounded-full flex items-center justify-center font-extrabold text-lg shrink-0"
              style={{ background: "linear-gradient(135deg,#fcd34d,#f59e0b)", color: "#111" }}
            >
              {s.n}
            </span>
            <div>
              <h3 className="font-extrabold text-lg">{s.title}</h3>
              <p className="text-white/75 text-[15px] leading-snug mt-0.5">{s.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
