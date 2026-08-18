import Icon from "@/components/ui/icon";

const GOLD = "#c9a84c";
const GOLD2 = "#e8c96a";
const NAVY = "#0b0b0d";

const STEPS = [
  {
    icon: "PhoneCall",
    title: "Звоните — называем цену",
    desc: "Диспетчер считает маршрут и сразу говорит точную сумму. Она фиксируется и в дороге не меняется.",
  },
  {
    icon: "CarFront",
    title: "Машина приезжает",
    desc: "Номер машины и телефон водителя приходят заранее. Никаких денег до подачи вы не переводите.",
  },
  {
    icon: "Wallet",
    title: "Платите на месте",
    desc: "Наличными или переводом на карту — как вам удобнее. Оплата водителю по факту поездки.",
  },
];

const FACTS = [
  { icon: "ShieldCheck", text: "Предоплату не берём" },
  { icon: "Lock", text: "Цена зафиксирована" },
  { icon: "Receipt", text: "Чек самозанятого" },
  { icon: "Building2", text: "Безнал для компаний" },
];

export default function PaymentBlock() {
  return (
    <div style={{ background: NAVY }}>
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-8 pb-0">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
          <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Как проходит оплата
          </span>
        </div>

        <div
          className="rounded-2xl p-4 mb-3 flex items-start gap-3"
          style={{ background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.25)" }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "rgba(74,222,128,0.15)" }}
          >
            <Icon name="BadgeCheck" size={19} style={{ color: "#4ade80" }} />
          </div>
          <div>
            <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: 16, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Никакой предоплаты
            </div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.6, marginTop: 3 }}>
              Вы ничего не переводите заранее. Оплачиваете поездку водителю на месте — наличными или на карту.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
          {STEPS.map((s, i) => (
            <div
              key={s.title}
              className="rounded-2xl p-4"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <div className="flex items-center gap-2.5 mb-2.5">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}
                >
                  <Icon name={s.icon as "PhoneCall"} size={16} style={{ color: NAVY }} />
                </div>
                <span
                  style={{ fontFamily: "Oswald", color: "rgba(255,255,255,0.25)", fontSize: 22, fontWeight: 900, lineHeight: 1 }}
                >
                  {i + 1}
                </span>
              </div>
              <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: 14, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em" }}>
                {s.title}
              </div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12.5, lineHeight: 1.6, marginTop: 5 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FACTS.map((f) => (
            <div
              key={f.text}
              className="flex items-center gap-2.5 rounded-2xl px-4 py-3.5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <Icon name={f.icon as "ShieldCheck"} size={15} style={{ color: GOLD, flexShrink: 0 }} />
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, lineHeight: 1.35 }}>
                {f.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
