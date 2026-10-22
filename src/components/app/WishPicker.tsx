import Icon from "@/components/ui/icon";

const QUICK = [
  "Toyota Camry", "Hongqi", "Kia Optima / K5", "Высокая проходимость", "Для лежачего пассажира",
  "Большой багажник", "С детским креслом", "Можно с собакой", "Некурящий водитель", "Машина не старше 2020",
];

export default function WishPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const add = (q: string) => {
    if (value.toLowerCase().includes(q.toLowerCase())) return;
    onChange(value ? `${value}, ${q}` : q);
  };
  return (
    <div className="space-y-2.5 rounded-3xl bg-amber-50 p-4 ring-1 ring-amber-200">
      <div className="flex items-start gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white"><Icon name="Sparkles" size={18} /></span>
        <div>
          <div className="font-extrabold text-neutral-900">Какую машину хотите?</div>
          <div className="text-xs text-amber-900">Водители увидят пожелание и откликнутся. Вы посмотрите машины, рейтинг и выберете сами</div>
        </div>
      </div>
      <textarea value={value} onChange={(e) => onChange(e.target.value.slice(0, 200))} rows={2}
        placeholder="Например: Камри или Хунчи, с большим багажником"
        className="w-full resize-none rounded-2xl bg-white px-3 py-2.5 text-[15px] font-semibold text-neutral-900 outline-none ring-1 ring-amber-200 placeholder:text-neutral-400 focus:ring-2 focus:ring-amber-500" />
      <div className="flex flex-wrap gap-1.5">
        {QUICK.map((q) => (
          <button key={q} type="button" onClick={() => add(q)}
            className="rounded-full bg-white px-3 py-1.5 text-xs font-bold text-neutral-800 ring-1 ring-amber-200 active:bg-amber-100">+ {q}</button>
        ))}
      </div>
    </div>
  );
}
