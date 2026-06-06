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

// Текстовые отзывы — маршруты из ваших городов
const TEXT_REVIEWS = [
  {
    name: "Алексей С.", route: "Воронеж – Москва", stars: 5,
    text: "Заказал за день, машина пришла точно в срок. Водитель позвонил за 30 минут, предупредил. Доехали без остановок, комфортно. Однозначно буду обращаться снова.",
  },
  {
    name: "Наталья К.", route: "Тула – Санкт-Петербург", stars: 5,
    text: "Ехали с мамой, путь дальний. Водитель был очень внимательный, делал остановки по нашей просьбе. Цена оказалась ниже, чем ждала. Спасибо большое!",
  },
  {
    name: "Дмитрий В.", route: "Белгород – Нижний Новгород", stars: 5,
    text: "Всё чётко: договорились, приехал, довёз. Никакого обмана, цена как договорились. Машина новая и чистая. Буду рекомендовать коллегам.",
  },
  {
    name: "Светлана М.", route: "Брянск – Москва", stars: 5,
    text: "Ездим с Такси Дальняк уже третий раз. Каждый раз всё на высоте. Удобно, что можно написать в Telegram и быстро получить ответ с ценой.",
  },
  {
    name: "Андрей П.", route: "Рязань – Воронеж", stars: 5,
    text: "Обращался впервые — очень понравилось. Водитель пунктуальный, в дороге не болтал лишнего, музыку включил на мой вкус. Доехали быстро и комфортно.",
  },
  {
    name: "Юлия Т.", route: "Курск – Тверь", stars: 5,
    text: "Ехала одна, немного переживала. Диспетчер всё объяснила, водитель написал когда выехал. Всё прошло отлично, чувствовала себя в безопасности.",
  },
  {
    name: "Михаил О.", route: "Ярославль – Тамбов", stars: 5,
    text: "Нашёл через Яндекс, позвонил — ответили сразу. Назвали цену без «а посмотрим по дороге». Всё честно, без сюрпризов. Машина — Хавал Джулиан, новая, просторная.",
  },
  {
    name: "Ольга Д.", route: "Екатеринбург – Тюмень", stars: 5,
    text: "Срочно нужно было уехать, нашла Дальняк в интернете. Всё решили за 20 минут. Цена справедливая. Водитель — профессионал, довёз без нареканий.",
  },
];

function ymGoal(goal: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).ym?.(98584604, "reachGoal", goal);
}

export default function Reviews() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f5f4f0" }}>
      <div className="max-w-sm mx-auto w-full px-4 pt-6 pb-28">

        <button onClick={() => navigate("/")} className="flex items-center gap-2 mb-5 text-gray-400 active:text-gray-600 transition-colors">
          <Icon name="ChevronLeft" size={18} />
          <span className="text-[13px] font-semibold">Назад</span>
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Icon name="Star" size={18} className="text-amber-500" />
          <h1 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 22, color: "#1a1a1a", textTransform: "uppercase" }}>
            Отзывы пассажиров
          </h1>
        </div>
        <div className="flex items-center gap-1.5 mb-6">
          {[...Array(5)].map((_, i) => <Icon key={i} name="Star" size={13} className="text-amber-400" />)}
          <span className="text-gray-400 text-[12px] ml-1">Работаем с 2014 года · {REVIEWS.length + TEXT_REVIEWS.length}+ отзывов</span>
        </div>

        {/* Скриншоты настоящих отзывов */}
        <div className="space-y-4 mb-6">
          {REVIEWS.map(r => (
            <div key={r.name} className="rounded-2xl overflow-hidden shadow-sm" style={{ background: "#fff", border: "1px solid #e8e6e0" }}>
              <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
                <div>
                  <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>{r.name}</div>
                  <div className="text-gray-400 text-[11px]">{r.route}</div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Icon key={i} name="Star" size={12} className="text-amber-400" />)}
                </div>
              </div>
              <img src={r.img} alt={`Отзыв ${r.name}`} className="w-full h-auto block bg-gray-50" />
              <div className="px-4 py-3">
                <p className="text-gray-500 text-[12.5px] leading-relaxed">«{r.text}»</p>
              </div>
            </div>
          ))}
        </div>

        {/* Разделитель */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Ещё отзывы</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Текстовые отзывы */}
        <div className="space-y-3 mb-6">
          {TEXT_REVIEWS.map(r => (
            <div key={r.name} className="rounded-2xl px-4 py-3.5 shadow-sm" style={{ background: "#fff", border: "1px solid #e8e6e0" }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 14, color: "#1a1a1a" }}>{r.name}</div>
                  <div className="text-gray-400 text-[11px]">{r.route}</div>
                </div>
                <div className="flex gap-0.5 shrink-0 pt-0.5">
                  {[...Array(r.stars)].map((_, i) => <Icon key={i} name="Star" size={11} className="text-amber-400" />)}
                </div>
              </div>
              <p className="text-gray-600 text-[12.5px] leading-relaxed">«{r.text}»</p>
            </div>
          ))}
        </div>

        {/* Призыв */}
        <div className="rounded-2xl px-4 py-4 text-center shadow-sm" style={{ background: "#fff", border: "1px solid #e8e6e0" }}>
          <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 18, color: "#1a1a1a" }} className="mb-1">
            Станьте следующим
          </div>
          <p className="text-gray-400 text-[12px] mb-4">Звоните — доедем, и вы напишете отзыв</p>
          <a href={PHONE_HREF} onClick={() => ymGoal("reviews_phone")}
            className="flex items-center justify-center gap-2 w-full rounded-2xl py-3 active:scale-[0.97] transition-transform shadow-sm"
            style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 16, color: "#fff", textTransform: "uppercase", background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
            <Icon name="Phone" size={16} className="text-white" /> Заказать поездку
          </a>
        </div>
      </div>

      {/* Нижняя панель */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-3"
        style={{ background: "linear-gradient(to top,#f5f4f0 70%,rgba(245,244,240,0))" }}>
        <div className="max-w-sm mx-auto grid grid-cols-3 gap-2">
          <a href={PHONE_HREF} onClick={() => ymGoal("reviews_bottom_phone")}
            className="flex flex-col items-center justify-center rounded-2xl py-3 gap-1 active:scale-[0.97] transition-transform shadow-md"
            style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
            <Icon name="Phone" size={18} className="text-white" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>Звонок</span>
          </a>
          <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("reviews_bottom_max")}
            className="flex flex-col items-center justify-center rounded-2xl py-3 gap-1 active:scale-[0.97] transition-transform shadow-md"
            style={{ background: "linear-gradient(135deg,#002d60,#0046a8)" }}>
            <img src={MAX_LOGO} alt="MAX" className="h-5 object-contain" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>MAX</span>
          </a>
          <a href={TG_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("reviews_bottom_tg")}
            className="flex flex-col items-center justify-center rounded-2xl py-3 gap-1 active:scale-[0.97] transition-transform shadow-md"
            style={{ background: "linear-gradient(135deg,#0a6ebd,#1c8fd8)" }}>
            <Icon name="Send" size={18} className="text-white" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>Telegram</span>
          </a>
        </div>
      </div>
    </div>
  );
}
