import Icon from "@/components/ui/icon";

const ITEMS = [
  { icon: "MessageSquareOff", title: "Не просим отзывы", text: "Довезли, попрощались. Никаких «поставьте пять звёзд» и сообщений после поездки." },
  { icon: "Ban", title: "Не донимаем вопросами", text: "Не спрашиваем «а обратно поедете?» и не навязываем следующий заказ. Нужна будет поездка — вы сами нас найдёте." },
  { icon: "Volume1", title: "Едем так, как удобно вам", text: "Хотите поговорить — поговорим. Хотите тишину или поспать — водитель не будет мешать." },
  { icon: "UserCheck", title: "Только вы в машине", text: "Без попутчиков и остановок ради чужих заказов. Остановки по пути — по вашему желанию." },
];

export default function LpCalm() {
  return (
    <section className="px-5 py-8 max-w-xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold uppercase text-center" style={{ fontFamily: "Oswald, sans-serif" }}>
        Едем спокойно, без навязчивости
      </h2>
      <div className="mt-6 grid gap-3">
        {ITEMS.map((i) => (
          <div key={i.title} className="flex gap-4 items-start">
            <span className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg,#fcd34d,#f59e0b)", color: "#111" }}>
              <Icon name={i.icon} fallback="Check" size={18} />
            </span>
            <div>
              <h3 className="font-extrabold text-base">{i.title}</h3>
              <p className="text-white/75 text-[15px] leading-snug mt-0.5">{i.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
