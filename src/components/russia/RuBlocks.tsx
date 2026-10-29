import Icon from "@/components/ui/icon";
import type { RouteItem } from "./routes";

const H2 = "text-2xl sm:text-3xl font-bold uppercase text-center";
const OSWALD = { fontFamily: "Oswald, sans-serif" };
const CARD = { background: "#15151b", border: "1px solid rgba(255,255,255,0.08)" };
const fmt = (n: number) => n.toLocaleString("ru-RU");

export function RuWhat({ minKm }: { minKm: number }) {
  return (
    <section className="px-5 py-8 max-w-xl mx-auto">
      <h2 className={H2} style={OSWALD}>Это такси межгород</h2>
      <p className="mt-3 text-center text-[15px] text-white/70">Забираем у подъезда в вашем городе и везём в другой город. Не по городу.</p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4" style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)" }}>
          <div className="flex items-center gap-2 font-extrabold text-emerald-400"><Icon name="CircleCheck" size={18} /> Возим</div>
          <ul className="mt-3 space-y-2 text-[14px] font-semibold text-white/85 leading-snug">
            <li>Из города в город от {minKm} км</li>
            <li>В другую область и регион</li>
            <li>В Крым, ДНР, ЛНР</li>
            <li>Из аэропорта и вокзала в другой город</li>
          </ul>
        </div>
        <div className="rounded-2xl p-4" style={{ background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.28)" }}>
          <div className="flex items-center gap-2 font-extrabold text-red-400"><Icon name="CircleX" size={18} /> Не возим</div>
          <ul className="mt-3 space-y-2 text-[14px] font-semibold text-white/70 leading-snug">
            <li>Поездки по городу</li>
            <li>В соседний район</li>
            <li>Короче {minKm} км</li>
            <li>С попутчиками</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

export function RuRoutes({ routes, title, onPick }: { routes: RouteItem[]; title: string; onPick: () => void }) {
  if (!routes.length) return null;
  return (
    <section className="px-5 py-8 max-w-xl mx-auto">
      <h2 className={H2} style={OSWALD}>{title}</h2>
      <div className="mt-6 space-y-3">
        {routes.map((r, i) => (
          <button key={r.from + r.to} type="button" onClick={onPick}
            className="w-full flex items-center justify-between gap-3 rounded-2xl px-4 py-3.5 text-left active:scale-[0.98] transition"
            style={i === 0 ? { background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.4)" } : CARD}>
            <span className="min-w-0">
              <span className="block font-extrabold leading-tight">{r.from} → {r.to}</span>
              <span className="block text-xs text-white/55 mt-1">≈ {fmt(r.km)} км · {r.hours} ч в пути</span>
            </span>
            <span className="shrink-0 flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-extrabold uppercase" style={{ background: "linear-gradient(135deg,#fcd34d,#f59e0b)", color: "#111" }}>
              <Icon name="Phone" size={13} /> Цена
            </span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-white/50">Вашего маршрута нет в списке? Звоните, ездим по всей России.</p>
    </section>
  );
}

const STEPS = [
  { icon: "MessageSquare", title: "Позвоните или напишите", text: "Скажите, откуда, куда и когда ехать. Это займёт минуту." },
  { icon: "BadgeCheck", title: "Получите цену", text: "Диспетчер называет точную сумму и класс машины. Цена фиксируется." },
  { icon: "Car", title: "Машина приезжает к подъезду", text: "Данные водителя присылаем заранее. Оплата при посадке." },
];

export function RuSteps() {
  return (
    <section className="px-5 py-8 max-w-xl mx-auto">
      <h2 className={H2} style={OSWALD}>Заказ за 3 шага</h2>
      <div className="mt-6 space-y-3">
        {STEPS.map((s, i) => (
          <div key={s.title} className="flex gap-4 items-start rounded-2xl p-4" style={CARD}>
            <span className="relative w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#fcd34d,#f59e0b)", color: "#111" }}>
              <Icon name={s.icon} fallback="Check" size={20} />
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-white text-black text-[11px] font-extrabold flex items-center justify-center">{i + 1}</span>
            </span>
            <div>
              <h3 className="font-extrabold">{s.title}</h3>
              <p className="text-white/70 text-[14px] leading-snug mt-0.5">{s.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const WHY = [
  { icon: "Lock", title: "Цена не меняется", text: "Ни пробки, ни ночь, ни ожидание в пути не влияют на сумму." },
  { icon: "Route", title: "Прямой рейс", text: "Без пересадок и вокзалов. От двери до двери." },
  { icon: "Luggage", title: "Багаж без доплат", text: "Чемоданы, коляски, животные. Минивэн для семьи и вещей." },
  { icon: "Coffee", title: "Остановки по просьбе", text: "Заправка, кафе, туалет: когда скажете." },
  { icon: "Baby", title: "Детское кресло", text: "Скажите при заказе, привезём бесплатно." },
  { icon: "Banknote", title: "Оплата на месте", text: "Наличные или перевод при посадке. Предоплата не нужна." },
];

export function RuWhy() {
  return (
    <section className="px-5 py-8 max-w-xl mx-auto">
      <h2 className={H2} style={OSWALD}>Почему едут с нами</h2>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {WHY.map((w) => (
          <div key={w.title} className="rounded-2xl p-4" style={CARD}>
            <Icon name={w.icon} fallback="Check" size={22} className="text-amber-400" />
            <h3 className="mt-2 font-extrabold text-[15px] leading-tight">{w.title}</h3>
            <p className="mt-1 text-white/65 text-[13px] leading-snug">{w.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const CLASSES = [
  { name: "Стандарт", cars: "Kia Rio, Hyundai Solaris, VW Polo", seats: "до 4 мест" },
  { name: "Комфорт", cars: "Toyota Camry, Kia K5, Skoda Octavia", seats: "до 4 мест" },
  { name: "Минивэн", cars: "Hyundai Starex, VW Caravelle", seats: "до 7 мест" },
];

export function RuCars() {
  return (
    <section className="px-5 py-8 max-w-xl mx-auto">
      <h2 className={H2} style={OSWALD}>Машины для трассы</h2>
      <div className="mt-6 space-y-3">
        {CLASSES.map((c) => (
          <div key={c.name} className="flex items-center gap-4 rounded-2xl p-4" style={CARD}>
            <span className="w-11 h-11 rounded-xl bg-amber-400/15 flex items-center justify-center shrink-0">
              <Icon name={c.name === "Минивэн" ? "Bus" : "CarFront"} size={22} className="text-amber-300" />
            </span>
            <div className="min-w-0">
              <div className="flex items-baseline gap-2">
                <h3 className="font-extrabold">{c.name}</h3>
                <span className="text-xs text-white/50">{c.seats}</span>
              </div>
              <p className="text-white/65 text-[13px] leading-snug">{c.cars} или аналог</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-xs text-white/50">Машины чистые, с кондиционером и проверены перед дальней дорогой</p>
    </section>
  );
}

export function RuStats() {
  const items = [
    { v: "с 2014", t: "возим межгород" },
    { v: "24/7", t: "приём заказов" },
    { v: "0 ₽", t: "предоплата" },
  ];
  return (
    <section className="px-5 max-w-xl mx-auto">
      <div className="grid grid-cols-3 gap-2 rounded-2xl p-4" style={CARD}>
        {items.map((i) => (
          <div key={i.t} className="text-center">
            <div className="text-2xl font-bold text-amber-400" style={OSWALD}>{i.v}</div>
            <div className="text-[11px] text-white/60 font-semibold leading-tight mt-0.5">{i.t}</div>
          </div>
        ))}
      </div>
    </section>
  );
}