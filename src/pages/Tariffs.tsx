import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const PHONE_HREF = "tel:+79956455125";
const VK_HREF    = "https://vk.com/dalnyack";
const MAX_HREF   = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";
const MAX_LOGO   = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/cf5e3e58-7d83-4d19-8c48-f91922395adf.png";

const NAVY  = "#0a0f1e";
const CARD  = "#131b2e";
const GOLD  = "#c9a84c";
const GOLD2 = "#e8c96a";
const BORDER = "rgba(201,168,76,0.18)";

const TARIFF_IMGS = {
  standart:    "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/39d043f8-acde-4a27-a69c-ebe03e8bd403.jpg",
  comfort:     "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/238966ba-ee86-4f06-bc36-0872f043ebfb.jpg",
  comfortplus: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/38f8c2aa-ebc6-4a58-bedb-3322efbce272.jpg",
  minivan:     "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/92a14984-9eac-4b0c-aa50-8c49af1c12b7.jpg",
};

const TARIFFS = [
  {
    id: "standart", name: "Стандарт", desc: "Рио · Поло · Солярис",
    seats: 4, luggage: "1–2 места", accent: "#60a5fa",
    badge: null,
    features: ["Кондиционер", "USB зарядка", "Музыка по запросу"],
  },
  {
    id: "comfort", name: "Комфорт", desc: "Хавал Джулиан 2025",
    seats: 4, luggage: "2–3 места", accent: GOLD,
    badge: "Популярный",
    features: ["Широкий салон", "Детское кресло", "Климат-контроль"],
  },
  {
    id: "comfortplus", name: "Комфорт+", desc: "Toyota Camry 70",
    seats: 4, luggage: "3–4 места", accent: "#a78bfa",
    badge: "Бизнес",
    features: ["Кожаный салон", "Тихий ход", "Деловые поездки"],
  },
  {
    id: "minivan", name: "Минивэн", desc: "Hyundai Staria 2022",
    seats: 7, luggage: "Много багажа", accent: "#34d399",
    badge: "Группа",
    features: ["7 пассажирских мест", "Большой багажник", "Семьи и компании"],
  },
];

function ymGoal(goal: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).ym?.(98584604, "reachGoal", goal);
}

export default function Tariffs() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: NAVY, fontFamily: "Inter, sans-serif" }}>
      <div className="max-w-sm mx-auto w-full px-4 pt-5 pb-32">

        <button onClick={() => navigate("/")}
          className="flex items-center gap-2 mb-6 active:opacity-60 transition-opacity"
          style={{ color: "rgba(255,255,255,0.4)" }}>
          <Icon name="ChevronLeft" size={18} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>Назад</span>
        </button>

        <div className="mb-7">
          <div style={{ color: GOLD, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em" }} className="mb-2">
            Наш автопарк
          </div>
          <h1 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 28, color: "#fff", textTransform: "uppercase" }}>
            Тарифы
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>
            Все автомобили не старше 10 лет · Фиксированная цена
          </p>
        </div>

        <div className="space-y-5 mb-6">
          {TARIFFS.map(t => (
            <div key={t.id} className="rounded-2xl overflow-hidden"
              style={{ background: CARD, border: t.badge === "Популярный" ? `1px solid rgba(201,168,76,0.45)` : BORDER }}>

              {/* фото */}
              <div className="relative" style={{ height: 170 }}>
                <img src={TARIFF_IMGS[t.id as keyof typeof TARIFF_IMGS]} alt={t.name}
                  className="w-full h-full object-cover" />
                <div className="absolute inset-0"
                  style={{ background: `linear-gradient(to bottom, rgba(10,15,30,0.1) 0%, rgba(10,15,30,0.85) 100%)` }} />

                {t.badge && (
                  <div className="absolute top-3 left-3 rounded-full px-2.5 py-1"
                    style={{ background: t.badge === "Популярный" ? `linear-gradient(135deg,${GOLD},${GOLD2})` : "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.2)" }}>
                    <span style={{ fontSize: 10, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", color: t.badge === "Популярный" ? NAVY : "#fff" }}>
                      {t.badge}
                    </span>
                  </div>
                )}

                {/* название поверх фото */}
                <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                  <div>
                    <div style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 22, color: "#fff", textTransform: "uppercase" }}>{t.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }}>{t.desc}</div>
                  </div>
                  <div className="flex items-center gap-1.5 rounded-xl px-2.5 py-1.5"
                    style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}>
                    <Icon name="Users" size={12} style={{ color: t.accent }} />
                    <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{t.seats} места</span>
                  </div>
                </div>
              </div>

              {/* характеристики */}
              <div className="px-4 py-4">
                <div className="flex items-center gap-2 mb-3">
                  <Icon name="Luggage" size={13} style={{ color: "rgba(255,255,255,0.3)" }} />
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{t.luggage}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {t.features.map(f => (
                    <span key={f} className="flex items-center gap-1 rounded-full px-2.5 py-1"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <span style={{ color: t.accent, fontSize: 8 }}>●</span>
                      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 10, fontWeight: 600 }}>{f}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* плашка честной цены */}
        <div className="rounded-2xl px-4 py-4 flex items-center gap-3" style={{ background: `linear-gradient(135deg,rgba(201,168,76,0.1),rgba(201,168,76,0.05))`, border: `1px solid rgba(201,168,76,0.3)` }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
            <Icon name="Tag" size={18} style={{ color: NAVY }} />
          </div>
          <div>
            <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 14, color: "#fff" }}>Фиксированная цена</div>
            <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, marginTop: 1 }}>Называем стоимость до поездки — без счётчика и сюрпризов</div>
          </div>
        </div>
      </div>

      {/* нижняя панель */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-2"
        style={{ background: `linear-gradient(to top, ${NAVY} 65%, transparent)` }}>
        <div className="max-w-sm mx-auto space-y-2">
          <a href={PHONE_HREF} onClick={() => ymGoal("tariffs_phone")}
            className="flex items-center justify-center gap-2 w-full rounded-2xl py-4 active:scale-[0.97] transition-transform"
            style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow: "0 4px 20px rgba(201,168,76,0.4)" }}>
            <Icon name="Phone" size={18} style={{ color: NAVY }} />
            <span style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 17, color: NAVY, textTransform: "uppercase" }}>Позвонить диспетчеру</span>
          </a>
          <div className="grid grid-cols-2 gap-2">
            <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("tariffs_max")}
              className="flex items-center justify-center gap-2 rounded-2xl py-3 active:scale-[0.97] transition-transform"
              style={{ background: "linear-gradient(135deg,#001a3d,#003080)", border: "1px solid rgba(0,80,200,0.4)" }}>
              <img src={MAX_LOGO} alt="MAX" className="h-5 object-contain" />
              <span style={{ fontFamily: "Oswald", fontSize: 13, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>MAX</span>
            </a>
            <a href={VK_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("tariffs_vk")}
              className="flex items-center justify-center gap-2 rounded-2xl py-3 active:scale-[0.97] transition-transform"
              style={{ background: "linear-gradient(135deg,#1a3a6b,#2456a4)", border: "1px solid rgba(36,86,164,0.5)" }}>
              <Icon name="Users" size={15} className="text-white" />
              <span style={{ fontFamily: "Oswald", fontSize: 13, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>ВКонтакте</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}