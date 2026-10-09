import Icon from "@/components/ui/icon";

const ITEMS = [
  { icon: "Wallet", text: "Без предоплаты" },
  { icon: "Lock", text: "Цена не меняется" },
  { icon: "Timer", text: "Подача от 30 минут" },
  { icon: "Clock", text: "Круглосуточно" },
];

export default function LpTrust() {
  return (
    <section className="px-5 py-5 max-w-xl mx-auto">
      <div className="grid grid-cols-2 gap-2">
        {ITEMS.map((i) => (
          <div key={i.text} className="flex items-center gap-2.5 rounded-xl px-3 py-2.5" style={{ background: "#14141a", border: "1px solid rgba(255,255,255,0.08)" }}>
            <Icon name={i.icon} fallback="Check" size={18} className="text-amber-300 shrink-0" />
            <span className="text-[13px] font-bold">{i.text}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
