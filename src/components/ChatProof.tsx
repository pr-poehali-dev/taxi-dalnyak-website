import Icon from "@/components/ui/icon";

const GOLD = "#c9a84c";
const GOLD2 = "#e8c96a";

const SHOTS = [
  {
    img: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/b0eb5050-a05a-4647-8442-4b839d45161f.jpg",
    name: "Валерия",
    route: "Москва – Новомичуринск",
  },
  {
    img: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/ac322d91-fd27-4c11-b86f-f28e85ec3df0.jpg",
    name: "Ирина",
    route: "Ленинградская обл. – СПб",
  },
  {
    img: "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/fedc4281-a106-4024-9369-8a03712c92a3.jpg",
    name: "Евгений",
    route: "Межгород по России",
  },
];

export default function ChatProof() {
  return (
    <div style={{ background: "#08080a" }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-8 pb-0">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
          <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Живые переписки с пассажирами
          </span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 12.5, lineHeight: 1.6, marginBottom: 16 }}>
          Не переписанные отзывы, а скриншоты реальных диалогов — как есть, вместе со временем и именами.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SHOTS.map((s) => (
            <div
              key={s.name}
              className="rounded-2xl overflow-hidden"
              style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center justify-between px-4 pt-3.5 pb-3 gap-2">
                <div className="min-w-0">
                  <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 14, color: "#fff" }}>{s.name}</div>
                  <div style={{ color: GOLD, fontSize: 10.5, marginTop: 1 }}>{s.route}</div>
                </div>
                <div
                  className="flex items-center gap-1 rounded-full px-2 py-1 shrink-0"
                  style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.25)" }}
                >
                  <Icon name="BadgeCheck" size={11} style={{ color: "#4ade80" }} />
                  <span style={{ color: "#4ade80", fontSize: 9.5, fontWeight: 700 }}>Скриншот</span>
                </div>
              </div>
              <img
                src={s.img}
                alt={`Переписка с пассажиром: ${s.route}`}
                loading="lazy"
                decoding="async"
                className="w-full h-auto block"
                style={{ background: "#0d1220" }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
