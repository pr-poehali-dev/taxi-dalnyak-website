import { useState } from "react";
import LpCta, { type LpLinks } from "./LpCta";

const TARIFFS = [
  { name: "Стандарт", rate: 32 },
  { name: "Комфорт", rate: 37 },
  { name: "Комфорт+", rate: 42 },
  { name: "Минивэн", rate: 57 },
];

const fmt = (n: number) => n.toLocaleString("ru-RU");

export default function LpCalc({ links, onLead }: { links: LpLinks; onLead: (c: string) => void }) {
  const [km, setKm] = useState("500");
  const [t, setT] = useState(0);
  const dist = Math.max(0, Math.min(5000, Number(km.replace(/\D/g, "")) || 0));
  const price = dist * TARIFFS[t].rate;

  return (
    <section id="calc" className="px-5 py-10 max-w-xl mx-auto scroll-mt-4">
      <h2 className="text-2xl sm:text-3xl font-bold uppercase text-center" style={{ fontFamily: "Oswald, sans-serif" }}>
        Прикиньте цену за 5 секунд
      </h2>

      <div className="mt-6 rounded-3xl p-5" style={{ background: "#14141a", border: "1px solid rgba(255,255,255,0.1)" }}>
        <label className="block text-xs font-bold uppercase text-white/60">Расстояние, км</label>
        <input
          inputMode="numeric"
          value={km}
          onChange={(e) => setKm(e.target.value)}
          className="mt-2 w-full rounded-xl px-4 py-3 text-2xl font-extrabold outline-none"
          style={{ background: "#0a0a0e", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
        />

        <div className="mt-4 grid grid-cols-2 gap-2">
          {TARIFFS.map((x, i) => (
            <button
              key={x.name}
              type="button"
              onClick={() => setT(i)}
              className="rounded-xl py-2.5 text-sm font-bold transition"
              style={i === t ? { background: "#f59e0b", color: "#111" } : { background: "#0a0a0e", color: "#fff", border: "1px solid rgba(255,255,255,0.15)" }}
            >
              {x.name} · {x.rate} ₽/км
            </button>
          ))}
        </div>

        <div className="mt-5 text-center">
          <div className="text-xs font-bold uppercase text-white/60">Ориентировочно</div>
          <div className="text-5xl font-extrabold text-amber-400" style={{ fontFamily: "Oswald, sans-serif" }}>
            {fmt(price)} ₽
          </div>
          <p className="mt-1 text-xs text-white/60">Точную цену назовём до поездки и зафиксируем</p>
        </div>

        <div className="mt-5">
          <LpCta links={links} onLead={onLead} size="md" />
        </div>
      </div>
    </section>
  );
}
