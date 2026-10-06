import Icon from "@/components/ui/icon";

const FAQ = [
  { q: "Цена может измениться в пути?", a: "Нет. Стоимость называем до поездки и она не меняется — ни из-за пробок, ни ночью." },
  { q: "Нужна ли предоплата?", a: "Нет. Оплата при посадке в автомобиль — наличными или переводом." },
  { q: "Можно заказать заранее?", a: "Да, без доплаты. Назовите дату и время — машина приедет вовремя." },
  { q: "Поедете в ДНР, ЛНР, Запорожье, Херсон?", a: "Да, ездим на новые территории и по всей России." },
  { q: "Будут ли попутчики?", a: "Нет. Это индивидуальный трансфер: машина только для вас." },
];

export interface FaqItem {
  q: string;
  a: string;
}

export default function LpFaq({ extra = [] }: { extra?: FaqItem[] }) {
  const list = [...extra, ...FAQ];
  return (
    <section className="px-5 py-8 max-w-xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold uppercase text-center" style={{ fontFamily: "Oswald, sans-serif" }}>
        Частые вопросы
      </h2>
      <div className="mt-6 space-y-3">
        {list.map((f) => (
          <details key={f.q} className="group rounded-2xl px-4 py-3.5" style={{ background: "#14141a", border: "1px solid rgba(255,255,255,0.1)" }}>
            <summary className="flex items-center justify-between gap-3 cursor-pointer list-none font-bold">
              {f.q}
              <Icon name="ChevronDown" size={18} className="shrink-0 text-amber-400 transition group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-[15px] text-white/75 leading-snug">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
