import { useLocation } from "@tanstack/react-router";

const TEXT: Record<string, { title: string; sub: string }> = {
  driver: { title: "Дальняк Водитель", sub: "Приложение для водителей Такси Дальняк: заказы, маршруты и связь с диспетчером." },
  office: { title: "Дальняк Диспетчер", sub: "Рабочее место диспетчера Такси Дальняк." },
  calc: { title: "Калькулятор", sub: "Расчёт стоимости междугородней поездки для диспетчера Такси Дальняк." },
  track: { title: "Такси Дальняк", sub: "Отслеживание поездки: где машина и когда она приедет." },
  client: {
    title: "Такси Дальняк — заказать такси межгород",
    sub: "Междугороднее такси по России от 200 км. Цена известна заранее, оплата наличными или переводом, подача 24/7. Звоните +7 (995) 645-51-25.",
  },
};

function kind(path: string) {
  if (path.startsWith("/app/driver")) return "driver";
  if (path.startsWith("/app/office-k7x2")) return "office";
  if (path.startsWith("/app/calc-k7x2")) return "calc";
  if (path.startsWith("/track/")) return "track";
  return "client";
}

// Заглушка на время загрузки страниц-приложений (они работают только в браузере) —
// как прежний fallback Suspense; текст скрыт визуально и нужен поисковикам и скринридерам.
export default function AppPending() {
  const { pathname } = useLocation();
  const t = TEXT[kind(pathname)];
  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0f" }}>
      <div className="sr-only">
        <h1>{t.title}</h1>
        <p>{t.sub}</p>
      </div>
    </div>
  );
}
