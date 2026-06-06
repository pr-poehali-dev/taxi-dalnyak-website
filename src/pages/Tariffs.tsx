import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const PHONE_HREF = "tel:+79956455125";
const TG_HREF    = "https://t.me/Mezhgorod1816";
const MAX_HREF   = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";
const MAX_LOGO   = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/cf5e3e58-7d83-4d19-8c48-f91922395adf.png";

const TARIFF_IMGS = {
  standart:   "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/39d043f8-acde-4a27-a69c-ebe03e8bd403.jpg",
  comfort:    "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/238966ba-ee86-4f06-bc36-0872f043ebfb.jpg",
  comfortplus:"https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/38f8c2aa-ebc6-4a58-bedb-3322efbce272.jpg",
  minivan:    "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/92a14984-9eac-4b0c-aa50-8c49af1c12b7.jpg",
};

const TARIFFS = [
  {
    id: "standart", name: "Стандарт", desc: "Рио · Поло · Солярис",
    seats: 4, luggage: "1–2 сумки", color: "#f59e0b",
    features: ["Кондиционер", "Музыка", "Зарядка USB"],
  },
  {
    id: "comfort", name: "Комфорт", desc: "Хавал Джулиан 2025",
    seats: 4, luggage: "2–3 сумки", color: "#22D3EE", badge: "Популярный",
    features: ["Широкий салон", "Кресло детское", "Климат-контроль"],
  },
  {
    id: "comfortplus", name: "Комфорт+", desc: "Toyota Camry 70 кузов",
    seats: 4, luggage: "3–4 сумки", color: "#A78BFA", badge: "Бизнес",
    features: ["Кожаный салон", "Тихий ход", "Деловые поездки"],
  },
  {
    id: "minivan", name: "Минивэн", desc: "Hyundai Staria 2022",
    seats: 7, luggage: "Много багажа", color: "#34D399", badge: "Группа",
    features: ["7 мест", "Большой багажник", "Семьи и группы"],
  },
];

function ymGoal(goal: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).ym?.(98584604, "reachGoal", goal);
}

export default function Tariffs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f5f4f0" }}>
      <div className="max-w-sm mx-auto w-full px-4 pt-6 pb-28">

        <button onClick={() => navigate("/")} className="flex items-center gap-2 mb-6 text-gray-400 active:text-gray-600 transition-colors">
          <Icon name="ChevronLeft" size={18} />
          <span className="text-[13px] font-semibold">Назад</span>
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Icon name="Car" size={18} className="text-amber-500" />
          <h1 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 22, color: "#1a1a1a", textTransform: "uppercase" }}>
            Тарифы
          </h1>
        </div>
        <p className="text-gray-400 text-[12px] mb-5">Все автомобили не старше 10 лет</p>

        <div className="space-y-4 mb-6">
          {TARIFFS.map(t => (
            <div key={t.id} className="rounded-2xl overflow-hidden shadow-sm" style={{ background: "#fff", border: "1px solid #e8e6e0" }}>
              {/* фото авто */}
              <div className="relative w-full" style={{ height: 150 }}>
                <img src={TARIFF_IMGS[t.id as keyof typeof TARIFF_IMGS]} alt={t.name}
                  className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 30%, rgba(255,255,255,0.85) 100%)" }} />
                {t.badge && (
                  <div className="absolute top-3 left-3 rounded-full px-2.5 py-1"
                    style={{ background: `${t.color}22`, border: `1px solid ${t.color}66` }}>
                    <span style={{ color: t.color, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.badge}</span>
                  </div>
                )}
              </div>
              <div className="px-4 pb-4">
                <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 18, color: "#1a1a1a" }}>{t.name}</div>
                <div className="text-gray-400 text-[12px] mb-3">{t.desc}</div>
                <div className="flex gap-4 mb-3">
                  <div className="flex items-center gap-1.5">
                    <Icon name="Users" size={13} style={{ color: t.color }} />
                    <span className="text-[12px] font-semibold" style={{ color: t.color }}>{t.seats} места</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Icon name="Luggage" size={13} className="text-gray-400" />
                    <span className="text-gray-500 text-[12px]">{t.luggage}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {t.features.map(f => (
                    <span key={f} className="text-[10px] font-semibold rounded-full px-2.5 py-1"
                      style={{ background: "#f5f4f0", color: "#6b7280", border: "1px solid #e8e6e0" }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl px-4 py-3 mb-6 flex items-center gap-2 shadow-sm"
          style={{ background: "rgba(245,158,11,0.07)", border: "1px solid rgba(245,158,11,0.28)" }}>
          <Icon name="Tag" size={14} className="text-amber-500 shrink-0" />
          <span className="text-amber-600 text-[12px] font-bold">Фиксированная стоимость — без счётчика и сюрпризов</span>
        </div>
      </div>

      {/* нижняя панель */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-3"
        style={{ background: "linear-gradient(to top,#f5f4f0 70%,rgba(245,244,240,0))" }}>
        <div className="max-w-sm mx-auto grid grid-cols-3 gap-2">
          <a href={PHONE_HREF} onClick={() => ymGoal("tariffs_phone")}
            className="flex flex-col items-center justify-center rounded-2xl py-3 gap-1 active:scale-[0.97] transition-transform shadow-md"
            style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
            <Icon name="Phone" size={18} className="text-white" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>Звонок</span>
          </a>
          <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("tariffs_max")}
            className="flex flex-col items-center justify-center rounded-2xl py-3 gap-1 active:scale-[0.97] transition-transform shadow-md"
            style={{ background: "linear-gradient(135deg,#002d60,#004aad)", border: "1px solid rgba(0,119,255,0.4)" }}>
            <img src={MAX_LOGO} alt="MAX" className="h-5 object-contain" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>MAX</span>
          </a>
          <a href={TG_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("tariffs_tg")}
            className="flex flex-col items-center justify-center rounded-2xl py-3 gap-1 active:scale-[0.97] transition-transform shadow-md"
            style={{ background: "linear-gradient(135deg,#0a3d54,#0f6090)", border: "1px solid rgba(34,158,217,0.3)" }}>
            <Icon name="Send" size={18} className="text-[#4fc3f7]" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>Telegram</span>
          </a>
        </div>
      </div>
    </div>
  );
}
