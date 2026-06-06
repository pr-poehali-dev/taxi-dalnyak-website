import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const PHONE_HREF = "tel:+79956455125";
const TG_HREF    = "https://t.me/Mezhgorod1816";
const MAX_HREF   = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";
const MAX_LOGO   = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/cf5e3e58-7d83-4d19-8c48-f91922395adf.png";
const REVIEW_1   = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/b0eb5050-a05a-4647-8442-4b839d45161f.jpg";
const REVIEW_2   = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/fedc4281-a106-4024-9369-8a03712c92a3.jpg";
const REVIEW_3   = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/ac322d91-fd27-4c11-b86f-f28e85ec3df0.jpg";

const NAVY  = "#0a0f1e";
const CARD  = "#131b2e";
const GOLD  = "#c9a84c";
const GOLD2 = "#e8c96a";
const BORDER = "rgba(201,168,76,0.18)";

const PHOTO_REVIEWS = [
  { name: "Валерия", route: "Москва – Новомичуринск",       img: REVIEW_1 },
  { name: "Ирина",   route: "Ленинградская обл. – СПб",     img: REVIEW_3 },
  { name: "Евгений", route: "Межгород по России",            img: REVIEW_2 },
];

const TEXT_REVIEWS = [
  { name: "Алексей С.", route: "Воронеж – Москва", stars: 5,
    text: "Заказал за день, машина пришла точно в срок. Водитель позвонил за 30 минут, предупредил. Доехали без остановок, комфортно. Буду обращаться снова." },
  { name: "Наталья К.", route: "Тула – Санкт-Петербург", stars: 5,
    text: "Ехали с мамой, путь дальний. Водитель очень внимательный, делал остановки по нашей просьбе. Цена оказалась ниже, чем ожидала. Спасибо!" },
  { name: "Дмитрий В.", route: "Белгород – Нижний Новгород", stars: 5,
    text: "Всё чётко: договорились, приехал, довёз. Никакого обмана, цена как договорились. Машина новая и чистая. Буду рекомендовать коллегам." },
  { name: "Светлана М.", route: "Брянск – Москва", stars: 5,
    text: "Ездим с Такси Дальняк уже третий раз. Каждый раз всё на высоте. Удобно, что можно написать в Telegram и быстро получить ответ с ценой." },
  { name: "Андрей П.", route: "Рязань – Воронеж", stars: 5,
    text: "Обращался впервые — очень понравилось. Водитель пунктуальный, в дороге не болтал лишнего, музыку включил на мой вкус. Доехали быстро." },
  { name: "Юлия Т.", route: "Курск – Тверь", stars: 5,
    text: "Ехала одна, немного переживала. Диспетчер всё объяснила, водитель написал когда выехал. Всё прошло отлично, чувствовала себя в безопасности." },
  { name: "Михаил О.", route: "Ярославль – Тамбов", stars: 5,
    text: "Нашёл через Яндекс, позвонил — ответили сразу. Назвали цену без «а посмотрим». Всё честно, без сюрпризов. Машина новая, просторная." },
  { name: "Ольга Д.", route: "Екатеринбург – Тюмень", stars: 5,
    text: "Срочно нужно было уехать. Всё решили за 20 минут. Цена справедливая. Водитель — профессионал, довёз без нареканий. Рекомендую!" },
];

function ymGoal(goal: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).ym?.(98584604, "reachGoal", goal);
}

function Stars({ n = 5 }: { n?: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(n)].map((_, i) => <Icon key={i} name="Star" size={11} style={{ color: GOLD }} />)}
    </div>
  );
}

export default function Reviews() {
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

        {/* заголовок */}
        <div className="mb-6">
          <div style={{ color: GOLD, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.3em" }} className="mb-2">
            Клиенты о нас
          </div>
          <h1 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 28, color: "#fff", textTransform: "uppercase" }}>
            Отзывы
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Stars />
            <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>
              {PHOTO_REVIEWS.length + TEXT_REVIEWS.length}+ отзывов · с 2014 года
            </span>
          </div>
        </div>

        {/* рейтинговые карточки */}
        <div className="grid grid-cols-3 gap-2 mb-7">
          {[
            { value: "4.9", label: "Рейтинг", sub: "из 5.0" },
            { value: `${PHOTO_REVIEWS.length + TEXT_REVIEWS.length}+`, label: "Отзывов", sub: "от клиентов" },
            { value: "98%", label: "Рекомендуют", sub: "друзьям" },
          ].map(s => (
            <div key={s.value} className="flex flex-col items-center rounded-2xl py-3.5 px-1" style={{ background: CARD, border: BORDER }}>
              <span style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 20, color: GOLD, lineHeight: 1 }}>{s.value}</span>
              <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, marginTop: 3 }}>{s.label}</span>
              <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 9, marginTop: 1 }}>{s.sub}</span>
            </div>
          ))}
        </div>

        {/* фото-отзывы */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1" style={{ background: `linear-gradient(to right,${GOLD},transparent)` }} />
          <span style={{ color: GOLD, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em" }}>Скриншоты</span>
          <div className="h-px flex-1" style={{ background: `linear-gradient(to left,${GOLD},transparent)` }} />
        </div>
        <div className="space-y-4 mb-7">
          {PHOTO_REVIEWS.map(r => (
            <div key={r.name} className="rounded-2xl overflow-hidden" style={{ background: CARD, border: BORDER }}>
              <div className="flex items-center justify-between px-4 pt-4 pb-3">
                <div>
                  <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 15, color: "#fff" }}>{r.name}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{r.route}</div>
                </div>
                <Stars />
              </div>
              <img src={r.img} alt={`Отзыв ${r.name}`} className="w-full h-auto block" style={{ background: "#0d1220" }} />
            </div>
          ))}
        </div>

        {/* текстовые отзывы */}
        <div className="flex items-center gap-2 mb-4">
          <div className="h-px flex-1" style={{ background: `linear-gradient(to right,${GOLD},transparent)` }} />
          <span style={{ color: GOLD, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em" }}>Отзывы клиентов</span>
          <div className="h-px flex-1" style={{ background: `linear-gradient(to left,${GOLD},transparent)` }} />
        </div>
        <div className="space-y-3 mb-7">
          {TEXT_REVIEWS.map(r => (
            <div key={r.name} className="rounded-2xl px-4 py-4" style={{ background: CARD, border: BORDER }}>
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div>
                  <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 14, color: "#fff" }}>{r.name}</div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11 }}>{r.route}</div>
                </div>
                <Stars n={r.stars} />
              </div>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 12.5, lineHeight: 1.6 }}>«{r.text}»</p>
            </div>
          ))}
        </div>

        {/* призыв */}
        <div className="rounded-2xl px-4 py-5 text-center" style={{ background: CARD, border: `1px solid rgba(201,168,76,0.3)` }}>
          <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 20, color: "#fff", textTransform: "uppercase" }} className="mb-1">
            Станьте следующим
          </div>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 16 }}>
            Звоните — доедем, и вы напишете свой отзыв
          </p>
          <a href={PHONE_HREF} onClick={() => ymGoal("reviews_cta")}
            className="flex items-center justify-center gap-2 w-full rounded-2xl py-4 active:scale-[0.97] transition-transform"
            style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow: "0 4px 20px rgba(201,168,76,0.35)" }}>
            <Icon name="Phone" size={18} style={{ color: NAVY }} />
            <span style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 17, color: NAVY, textTransform: "uppercase" }}>Заказать поездку</span>
          </a>
        </div>
      </div>

      {/* нижняя панель */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-2"
        style={{ background: `linear-gradient(to top, ${NAVY} 65%, transparent)` }}>
        <div className="max-w-sm mx-auto space-y-2">
          <a href={PHONE_HREF} onClick={() => ymGoal("reviews_bottom_phone")}
            className="flex items-center justify-center gap-2 w-full rounded-2xl py-4 active:scale-[0.97] transition-transform"
            style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow: "0 4px 20px rgba(201,168,76,0.4)" }}>
            <Icon name="Phone" size={18} style={{ color: NAVY }} />
            <span style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 17, color: NAVY, textTransform: "uppercase" }}>Позвонить диспетчеру</span>
          </a>
          <div className="grid grid-cols-2 gap-2">
            <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("reviews_bottom_max")}
              className="flex items-center justify-center gap-2 rounded-2xl py-3 active:scale-[0.97] transition-transform"
              style={{ background: "linear-gradient(135deg,#001a3d,#003080)", border: "1px solid rgba(0,80,200,0.4)" }}>
              <img src={MAX_LOGO} alt="MAX" className="h-5 object-contain" />
              <span style={{ fontFamily: "Oswald", fontSize: 13, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>MAX</span>
            </a>
            <a href={TG_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("reviews_bottom_tg")}
              className="flex items-center justify-center gap-2 rounded-2xl py-3 active:scale-[0.97] transition-transform"
              style={{ background: "linear-gradient(135deg,#005f8e,#0088cc)", border: "1px solid rgba(0,136,204,0.35)" }}>
              <Icon name="Send" size={15} className="text-white" />
              <span style={{ fontFamily: "Oswald", fontSize: 13, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>Telegram</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
