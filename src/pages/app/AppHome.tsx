import Icon from "@/components/ui/icon";

const ROLES = [
  { href: "/app/client", icon: "User", title: "Я пассажир", text: "Заказать поездку по межгороду" },
  { href: "/app/driver", icon: "Car", title: "Я водитель", text: "Регистрация и заказы на линии" },
  { href: "/app/dispatcher", icon: "Headset", title: "Я диспетчер", text: "Управление заказами и водителями" },
];

export default function AppHome() {
  return (
    <div className="min-h-screen bg-neutral-50 p-5 text-neutral-900" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="mx-auto max-w-md pt-10">
        <h1 className="text-3xl font-extrabold">Такси Дальняк</h1>
        <p className="mt-1 text-neutral-500">Прототип приложения. Выберите, кем войти.</p>
        <div className="mt-6 space-y-3">
          {ROLES.map((r) => (
            <a key={r.href} href={r.href} className="flex items-center gap-4 rounded-3xl bg-white p-5 shadow-sm active:scale-[0.99]">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fcd34d]"><Icon name={r.icon} fallback="User" size={24} /></span>
              <span>
                <span className="block text-lg font-extrabold">{r.title}</span>
                <span className="text-sm text-neutral-500">{r.text}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
