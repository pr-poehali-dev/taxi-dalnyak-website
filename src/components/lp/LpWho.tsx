import Icon from "@/components/ui/icon";

const ITEMS = [
  { icon: "Briefcase", text: "Бизнес и командировки" },
  { icon: "Users", text: "Семьи с детьми" },
  { icon: "Palmtree", text: "Отпуск и дача" },
  { icon: "Plane", text: "Аэропорт и вокзал" },
  { icon: "Package", text: "Переезд с вещами" },
  { icon: "HardHat", text: "Вахта и сотрудники" },
  { icon: "HeartPulse", text: "Лечение и госпиталь" },
  { icon: "Shield", text: "Военнослужащие и их семьи" },
];

export default function LpWho() {
  return (
    <section className="px-5 py-8 max-w-xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold uppercase text-center" style={{ fontFamily: "Oswald, sans-serif" }}>
        Возим всех
      </h2>
      <p className="mt-3 text-center text-[15px] text-white/70">
        Любые цели поездки. Важно одно: дальний маршрут и готовность оплатить комфортную дорогу.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        {ITEMS.map((i) => (
          <div key={i.text} className="flex items-center gap-3 rounded-2xl px-3 py-3" style={{ background: "#14141a", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Icon name={i.icon} fallback="Check" size={20} className="text-amber-300 shrink-0" />
            <span className="text-sm font-bold leading-tight">{i.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
