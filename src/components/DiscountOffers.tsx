import Icon from "@/components/ui/icon";

const GOLD = "#c9a84c";
const GOLD2 = "#e8c96a";

interface Props {
  phoneHref: string;
  onCall?: () => void;
}

export default function DiscountOffers({ phoneHref, onCall }: Props) {
  return (
    <section className="px-4 pt-5 pb-0 max-w-5xl mx-auto w-full space-y-3">
      {/* ЗА СОСЛУЖИВЦА */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "linear-gradient(135deg,rgba(201,168,76,0.12),rgba(201,168,76,0.02))",
          border: "1px solid rgba(201,168,76,0.3)",
        }}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}
          >
            <Icon name="Users" size={18} style={{ color: "#0a0f1e" }} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "Oswald",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                lineHeight: 1.2,
              }}
            >
              Приведи своего — получи 2 500 ₽
            </div>
            <div style={{ color: GOLD, fontSize: 11, fontWeight: 700, marginTop: 2 }}>
              Скидка обоим · с каждой поездки
            </div>
          </div>
        </div>

        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.75, marginBottom: 14 }}>
          Порекомендовал нас другу или сослуживцу — он называет диспетчеру твоё имя и номер.
          Он получает 2 500 ₽ скидки на свою поездку, ты — 2 500 ₽ на следующую свою.
          Сколько человек привёл — столько скидок и накопил, они суммируются.
        </p>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { n: "1", text: "Он звонит и называет твоё имя" },
            { n: "2", text: "Ему сразу минус 2 500 ₽" },
            { n: "3", text: "Тебе 2 500 ₽ на следующий рейс" },
          ].map((s) => (
            <div
              key={s.n}
              className="rounded-xl px-3 py-3"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <div
                style={{
                  fontFamily: "Oswald",
                  color: GOLD2,
                  fontSize: 18,
                  fontWeight: 900,
                  lineHeight: 1,
                  marginBottom: 6,
                }}
              >
                {s.n}
              </div>
              <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 11, fontWeight: 600, lineHeight: 1.4 }}>
                {s.text}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-start gap-2">
          <Icon name="Info" size={12} style={{ color: GOLD, flexShrink: 0, marginTop: 2 }} />
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, lineHeight: 1.55 }}>
            Скидка действует на поездки от 500 км. Накопленные скидки не сгорают.
            Назвать того, кто порекомендовал, нужно до выезда — задним числом не оформляем.
          </span>
        </div>
      </div>

      {/* ОБРАТНЫЙ РЕЙС */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(201,168,76,0.15)", border: `1px solid ${GOLD}55` }}
          >
            <Icon name="ArrowLeftRight" size={17} style={{ color: GOLD2 }} />
          </div>
          <div>
            <div
              style={{
                fontFamily: "Oswald",
                color: "#fff",
                fontSize: 15,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                lineHeight: 1.2,
              }}
            >
              Обратный рейс — минус 5 000 ₽
            </div>
            <div style={{ color: GOLD, fontSize: 11, fontWeight: 700, marginTop: 2 }}>
              Если бронируешь дату сразу
            </div>
          </div>
        </div>

        <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.75, marginBottom: 14 }}>
          Знаешь, когда поедешь обратно — назови дату при первом заказе. Мы ставим рейс в график
          и держим за тобой машину. Цена обратной дороги фиксируется в день брони и не меняется,
          даже если на эту дату будет ажиотаж.
        </p>

        <div
          className="rounded-xl px-4 py-3.5 mb-3"
          style={{ background: "rgba(7,11,20,0.5)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div
            style={{
              color: "rgba(255,255,255,0.35)",
              fontSize: 10,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: 8,
            }}
          >
            Пример на 1 000 км
          </div>
          <div className="flex items-center justify-between mb-1.5">
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12.5, fontWeight: 600 }}>
              Дорога туда
            </span>
            <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 15, fontWeight: 800 }}>
              32 000 ₽
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12.5, fontWeight: 600 }}>
              Обратно, с бронью даты
            </span>
            <span className="flex items-baseline gap-2">
              <span
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: 12,
                  textDecoration: "line-through",
                }}
              >
                32 000
              </span>
              <span style={{ fontFamily: "Oswald", color: GOLD2, fontSize: 17, fontWeight: 900 }}>
                27 000 ₽
              </span>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { icon: "CalendarCheck", text: "Машина закреплена за датой" },
            { icon: "ShieldCheck", text: "Подменим водителя, но приедем" },
            { icon: "Lock", text: "Цена зафиксирована при брони" },
            { icon: "Wallet", text: "Оплата каждой поездки отдельно" },
          ].map((item) => (
            <div
              key={item.text}
              className="flex items-start gap-2 rounded-xl px-3 py-2.5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Icon
                name={item.icon as "Lock"}
                size={14}
                style={{ color: GOLD, flexShrink: 0, marginTop: 1 }}
              />
              <span
                style={{ color: "rgba(255,255,255,0.7)", fontSize: 11.5, fontWeight: 600, lineHeight: 1.4 }}
              >
                {item.text}
              </span>
            </div>
          ))}
        </div>

        <a
          href={phoneHref}
          onClick={onCall}
          className="flex items-center justify-center gap-2 rounded-xl py-3.5 w-full"
          style={{
            background: `linear-gradient(135deg,${GOLD},${GOLD2})`,
            boxShadow: "0 4px 18px rgba(201,168,76,0.3)",
          }}
        >
          <Icon name="Phone" size={17} style={{ color: "#0a0f1e" }} />
          <span
            style={{
              fontFamily: "Oswald",
              color: "#0a0f1e",
              fontSize: 15,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Забронировать обе поездки
          </span>
        </a>

        <div className="flex items-start gap-2 mt-3">
          <Icon name="Info" size={12} style={{ color: GOLD, flexShrink: 0, marginTop: 2 }} />
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, lineHeight: 1.55 }}>
            Скидка на обратный рейс — при бронировании обеих поездок сразу, на маршруты от 500 км.
            Дату обратной дороги можно перенести один раз бесплатно, предупредив за сутки.
          </span>
        </div>
      </div>
    </section>
  );
}
