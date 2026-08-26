import Icon from "@/components/ui/icon";
import { MIN_PRICE, RATE_STANDARD } from "@/lib/pricing";

const GOLD = "#c9a84c";
const GOLD2 = "#e8c96a";

export interface PriceGuideRoute {
  route: string;
  from: number;
}

interface Props {
  routes?: PriceGuideRoute[];
  note?: string;
}

// Ориентиры «от» — отсекают неплатёжеспособных, но не заменяют диспетчера:
// точную цену маршрута человек всё равно узнаёт только по звонку.
const DEFAULT_ROUTES: PriceGuideRoute[] = [
  { route: "Москва – Воронеж", from: 18900 },
  { route: "Москва – Курск", from: 18600 },
  { route: "Москва – Санкт-Петербург", from: 25600 },
  { route: "Москва – Ростов-на-Дону", from: 39900 },
];

export default function PriceGuide({ routes = DEFAULT_ROUTES, note }: Props) {
  return (
    <div
      className="rounded-3xl p-5"
      style={{
        background: "linear-gradient(135deg,rgba(201,168,76,0.07),rgba(201,168,76,0.02))",
        border: "1px solid rgba(201,168,76,0.22)",
      }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
        <span
          style={{
            fontFamily: "Oswald",
            color: "#fff",
            fontSize: 15,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Сколько это стоит
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2.5 mb-3">
        <div
          className="rounded-2xl px-3.5 py-3"
          style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.28)" }}
        >
          <div style={{ fontFamily: "Oswald", color: GOLD2, fontSize: 22, fontWeight: 900, lineHeight: 1 }}>
            {MIN_PRICE.toLocaleString("ru")} ₽
          </div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10.5, marginTop: 4 }}>
            минимальный заказ
          </div>
        </div>
        <div
          className="rounded-2xl px-3.5 py-3"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: 22, fontWeight: 900, lineHeight: 1 }}>
            от {RATE_STANDARD} ₽<span style={{ fontSize: 13 }}>/км</span>
          </div>
          <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 10.5, marginTop: 4 }}>
            цена фиксируется до выезда
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        {routes.map((r) => (
          <div
            key={r.route}
            className="flex items-center justify-between rounded-xl px-3.5 py-2.5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span style={{ color: "rgba(255,255,255,0.75)", fontSize: 12.5, fontWeight: 600 }}>
              {r.route}
            </span>
            <span
              style={{
                fontFamily: "Oswald",
                color: GOLD2,
                fontSize: 14,
                fontWeight: 800,
                whiteSpace: "nowrap",
              }}
            >
              от {r.from.toLocaleString("ru")} ₽
            </span>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-2 mt-3.5">
        <Icon name="Info" size={12} style={{ color: GOLD, flexShrink: 0, marginTop: 2 }} />
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, lineHeight: 1.5 }}>
          {note ?? "Цены ориентировочные — зависят от класса авто, направления и даты. Точную стоимость своего маршрута узнайте у диспетчера."}
        </span>
      </div>
    </div>
  );
}
