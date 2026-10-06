import Icon from "@/components/ui/icon";
import LpCta, { type LpLinks } from "./LpCta";

const HERO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/b9e41dff-bcd4-4590-98e3-349a9d051abb.jpg";

const FACTS = [
  { icon: "HandCoins", text: "Цена фиксируется до поездки" },
  { icon: "BadgeCheck", text: "Без предоплаты — платите при посадке" },
  { icon: "AlarmClock", text: "Подача от 30 минут, 24/7" },
];

export default function LpHero({ links, onLead }: { links: LpLinks; onLead: (c: string) => void }) {
  return (
    <section className="relative overflow-hidden">
      <img src={HERO} alt="Междугороднее такси Дальняк" className="absolute inset-0 w-full h-full object-cover object-[22%_center]" {...({ fetchpriority: "high" } as Record<string, string>)} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black" />

      <div className="relative z-10 px-5 pt-6 pb-10 max-w-xl mx-auto">
        <div className="flex items-center justify-between">
          <img src="/logo-dalnyak.webp" alt="Такси Дальняк" width={600} height={371} className="w-24 rounded-xl" />
          <a href={links.phone} onClick={() => onLead("phone")} className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
            <Icon name="Phone" size={16} /> +7 995 645-51-25
          </a>
        </div>

        <div className="mt-8 inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-3 py-1.5 text-xs font-bold">
          <Icon name="Star" size={14} style={{ color: "#f59e0b", fill: "#f59e0b" }} />
          Реальные отзывы клиентов — ниже на странице
        </div>

        <h1 className="mt-4 text-[34px] sm:text-5xl font-bold uppercase leading-[1.05]" style={{ fontFamily: "Oswald, sans-serif" }}>
          Такси межгород <span className="text-amber-400">по фиксированной цене</span>
        </h1>
        <p className="mt-4 text-base sm:text-lg font-semibold text-white/90 leading-snug">
          В любой город России, а также в ДНР, ЛНР, Запорожье и Херсон. Домой из отпуска, в часть, на вахту.
        </p>

        <ul className="mt-5 space-y-2.5">
          {FACTS.map((f) => (
            <li key={f.text} className="flex items-center gap-3 text-[15px] font-bold">
              <span className="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center shrink-0">
                <Icon name={f.icon} fallback="Check" size={16} className="text-amber-300" />
              </span>
              {f.text}
            </li>
          ))}
        </ul>

        <div className="mt-7">
          <LpCta links={links} onLead={onLead} />
          <p className="mt-3 text-center text-xs text-white/60">Ответим за 5 минут и назовём точную цену</p>
        </div>
      </div>
    </section>
  );
}
