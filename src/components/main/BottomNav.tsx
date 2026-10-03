import Icon from "@/components/ui/icon";

const ITEMS = [
  { href: "#home", label: "Главная", icon: "House" },
  { href: "#contacts", label: "Контакты", icon: "Phone" },
  { href: "#tariffs", label: "Тарифы", icon: "Car" },
  { href: "/reviews", label: "Отзывы", icon: "MessageSquareText" },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-black/95 backdrop-blur border-t-2 border-violet-600">
      <div className="max-w-xl mx-auto grid grid-cols-4">
        {ITEMS.map((it) => (
          <a key={it.label} href={it.href} className="flex flex-col items-center gap-1 py-2.5 text-[11px] text-white/85 active:text-white">
            <Icon name={it.icon} size={20} className="text-amber-400" />
            {it.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
