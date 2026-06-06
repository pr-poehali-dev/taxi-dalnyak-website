import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const PHONE_HREF = "tel:+79956455125";
const TG_HREF    = "https://t.me/Mezhgorod1816";
const MAX_HREF   = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";
const MAX_LOGO   = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/cf5e3e58-7d83-4d19-8c48-f91922395adf.png";

const REVIEW_1 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/b0eb5050-a05a-4647-8442-4b839d45161f.jpg";
const REVIEW_2 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/fedc4281-a106-4024-9369-8a03712c92a3.jpg";
const REVIEW_3 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/ac322d91-fd27-4c11-b86f-f28e85ec3df0.jpg";

const REVIEWS = [
  {
    name: "Валерия", route: "Москва – Новомичуринск",
    text: "Очень переживала — зимой с ребёнком, первый раз на такое расстояние. Всё прошло замечательно! Машину нашли быстро, водитель Иван — замечательный человек. Довёз идеально!",
    img: REVIEW_1,
  },
  {
    name: "Ирина", route: "ЛО Кировский р-н – Санкт-Петербург",
    text: "Позвонила в две компании — ничего не нашли. На третий раз нашла Такси Дальняк через Telegram. Водитель очень вежливый, машина в идеальном состоянии.",
    img: REVIEW_3,
  },
  {
    name: "Евгений", route: "Межгород по России",
    text: "Рекомендую! Удобная и быстрая доставка, комфортабельный авто. Пацаны отвечают за время, комфорт и стоимость. От всей семьи — Спасибо, друзья!",
    img: REVIEW_2,
  },
];

function ymGoal(goal: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).ym?.(98584604, "reachGoal", goal);
}

export default function Reviews() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#09090e" }}>
      <div className="max-w-sm mx-auto w-full px-4 pt-6 pb-28">

        <button onClick={() => navigate("/")} className="flex items-center gap-2 mb-6 text-white/40 active:text-white/80 transition-colors">
          <Icon name="ChevronLeft" size={18} />
          <span className="text-[13px] font-semibold">Назад</span>
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Icon name="Star" size={18} className="text-[#F5A800]" />
          <h1 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 22, color: "#fff", textTransform: "uppercase" }}>
            Отзывы пассажиров
          </h1>
        </div>
        <div className="flex items-center gap-1.5 mb-6">
          {[...Array(5)].map((_, i) => <Icon key={i} name="Star" size={13} className="text-[#F5A800]" />)}
          <span className="text-white/40 text-[12px] ml-1">Работаем с 2014 года</span>
        </div>

        <div className="space-y-5 mb-6">
          {REVIEWS.map(r => (
            <div key={r.name} className="rounded-2xl overflow-hidden" style={{ background: "#111018", border: "1px solid rgba(255,255,255,0.07)" }}>
              {/* шапка с именем */}
              <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
                <div>
                  <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 16, color: "#fff" }}>{r.name}</div>
                  <div className="text-white/40 text-[11px]">{r.route}</div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Icon key={i} name="Star" size={12} className="text-[#F5A800]" />)}
                </div>
              </div>
              {/* скриншот отзыва — целиком, без обрезки */}
              <img src={r.img} alt={`Отзыв ${r.name}`} className="w-full h-auto block" style={{ background: "#0d0d12" }} />
              <div className="px-4 py-3.5">
                <p className="text-white/55 text-[12.5px] leading-relaxed">«{r.text}»</p>
              </div>
            </div>
          ))}
        </div>

        {/* призыв */}
        <div className="rounded-2xl px-4 py-4 text-center" style={{ background: "#111018", border: "1px solid rgba(245,168,0,0.18)" }}>
          <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 18, color: "#fff" }} className="mb-1">
            Станьте следующим
          </div>
          <p className="text-white/40 text-[12px] mb-4">Звоните — доедем и вы напишете отзыв</p>
          <a href={PHONE_HREF} onClick={() => ymGoal("reviews_phone")}
            className="flex items-center justify-center gap-2 w-full rounded-2xl py-3 active:scale-[0.97] transition-transform"
            style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 16, color: "#09090e", textTransform: "uppercase", background: "#F5A800" }}>
            <Icon name="Phone" size={16} className="text-[#09090e]" /> Заказать поездку
          </a>
        </div>
      </div>

      {/* нижняя панель */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-3"
        style={{ background: "linear-gradient(to top,#09090e 70%,transparent)" }}>
        <div className="max-w-sm mx-auto grid grid-cols-3 gap-2">
          <a href={PHONE_HREF} onClick={() => ymGoal("reviews_bottom_phone")}
            className="flex flex-col items-center justify-center rounded-2xl py-3 gap-1 active:scale-[0.97] transition-transform"
            style={{ background: "#F5A800", boxShadow: "0 4px 20px rgba(245,168,0,0.4)" }}>
            <Icon name="Phone" size={18} className="text-[#09090e]" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#09090e", fontWeight: 800, textTransform: "uppercase" }}>Звонок</span>
          </a>
          <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("reviews_bottom_max")}
            className="flex flex-col items-center justify-center rounded-2xl py-3 gap-1 active:scale-[0.97] transition-transform"
            style={{ background: "linear-gradient(135deg,#002d60,#004aad)", border: "1px solid rgba(0,119,255,0.4)" }}>
            <img src={MAX_LOGO} alt="MAX" className="h-5 object-contain" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>MAX</span>
          </a>
          <a href={TG_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("reviews_bottom_tg")}
            className="flex flex-col items-center justify-center rounded-2xl py-3 gap-1 active:scale-[0.97] transition-transform"
            style={{ background: "linear-gradient(135deg,#0a3d54,#0f6090)", border: "1px solid rgba(34,158,217,0.3)" }}>
            <Icon name="Send" size={18} className="text-[#4fc3f7]" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>Telegram</span>
          </a>
        </div>
      </div>
    </div>
  );
}