import Icon from "@/components/ui/icon";
import {
  GOLD, GOLD2, HERO_IMG, LOGO, REGIONS,
  ymGoal, ymLead,
  type RegionConfig, type UtmParams,
} from "@/components/regional/shared";

interface Props {
  config: RegionConfig;
  splash: boolean;
  menuOpen: boolean;
  setMenuOpen: (fn: (v: boolean) => boolean) => void;
  queryRoute: { from: string; to: string } | null;
  PHONE: string;
  PHONE_HREF: string;
  utmParams: UtmParams;
  source?: string;
}

export default function RegionalHero({
  config, splash, menuOpen, setMenuOpen, queryRoute, PHONE, PHONE_HREF, utmParams, source,
}: Props) {
  return (
    <>
      {/* СПЛЭШ */}
      <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-500 ${splash ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        style={{ background: "#070b14" }}>
        <img src={LOGO} alt="" className="w-20 h-20 rounded-2xl object-cover mb-4" style={{ boxShadow: `0 0 40px rgba(201,168,76,0.4)` }} />
        <div style={{ fontFamily: "Oswald", color: GOLD, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.5em", fontWeight: 700 }}>Такси</div>
        <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: 32, textTransform: "uppercase", fontWeight: 900, lineHeight: 1 }}>Дальняк</div>
        <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 6 }}>{config.splashSub ?? `${config.city} · Межгородское такси`}</div>
        <div className="w-32 h-0.5 mt-5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="h-full rounded-full splash-line" style={{ background: `linear-gradient(to right,${GOLD},${GOLD2})` }} />
        </div>
        <style>{`@keyframes splashLine{from{transform:translateX(-100%)}to{transform:translateX(0)}}.splash-line{animation:splashLine 0.85s ease-out forwards}`}</style>
      </div>

      {/* ШАПКА */}
      <header style={{ background: "rgba(7,11,20,0.97)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(201,168,76,0.12)", position: "sticky", top: 0, zIndex: 50 }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src={LOGO} alt="Такси Дальняк" className="w-9 h-9 rounded-xl object-cover" style={{ border: `1.5px solid rgba(201,168,76,0.5)` }} />
            <div>
              <div style={{ fontFamily: "Oswald", color: GOLD, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.4em", fontWeight: 700, lineHeight: 1 }}>Такси</div>
              <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: 17, textTransform: "uppercase", fontWeight: 900, lineHeight: 1, marginTop: 1 }}>Дальняк</div>
            </div>
          </a>
          <div className="flex items-center gap-2">
            <a href={PHONE_HREF} className="hidden md:flex items-center gap-2 rounded-xl px-4 py-2"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
              <Icon name="Phone" size={13} style={{ color: "#0a0f1e" }} />
              <span style={{ fontFamily: "Oswald", color: "#0a0f1e", fontSize: 13, fontWeight: 800, textTransform: "uppercase" }}>{PHONE}</span>
            </a>
            <button onClick={() => setMenuOpen(v => !v)}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2"
              style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.2)" }}>
              <Icon name="Globe" size={14} style={{ color: GOLD }} />
              <span style={{ fontFamily: "Oswald", color: GOLD, fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>Города</span>
              <Icon name={menuOpen ? "ChevronUp" : "ChevronDown"} size={12} style={{ color: GOLD }} />
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="max-w-5xl mx-auto px-4 pb-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
            <div className="pt-3 flex flex-wrap gap-2">
              {REGIONS.map(r => (
                <a key={r.href} href={r.href}
                  className="rounded-full px-3 py-1.5 text-[11px] font-semibold transition-all"
                  style={r.href === `/${config.slug}` ? { background: `linear-gradient(135deg,${GOLD},${GOLD2})`, color: "#0a0f1e" } : { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
                  {r.label}
                </a>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* HERO — ЗАГОЛОВОК ВВЕРХУ */}
      <section style={{ background: "linear-gradient(180deg,#0d1220 0%,#070b14 100%)" }}>
        <div className="max-w-5xl mx-auto px-4 pt-7 pb-0">

          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 mb-4"
            style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)" }}>
            <Icon name="MapPin" size={12} style={{ color: GOLD }} />
            <span style={{ color: GOLD, fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.2em" }}>{queryRoute ? `${queryRoute.from} – ${queryRoute.to} · Ваш маршрут` : config.badge ?? `${config.city} · Межгородское такси`}</span>
          </div>

          <h1 style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: "clamp(24px,6vw,52px)", lineHeight: 1.0, textTransform: "uppercase", color: "#fff", letterSpacing: "-0.01em", marginBottom: 10 }}>
            {queryRoute ? (
              <>Такси{" "}<span style={{ color: GOLD }}>{queryRoute.from} — {queryRoute.to}</span>{" "}по фиксированной цене</>
            ) : config.h1 ? (
              <span dangerouslySetInnerHTML={{ __html: config.h1.replace(/\[gold\](.*?)\[\/gold\]/g, `<span style="color:${GOLD}">$1</span>`) }} />
            ) : (
              <>Заказать автомобиль с водителем{" "}<span style={{ color: GOLD }}>из {config.cityRod}</span>{" "}в другой город</>
            )}
          </h1>

          <p style={{ fontFamily: "Oswald", color: GOLD2, fontSize: "clamp(13px,2.5vw,18px)", fontWeight: 600, marginBottom: 4 }}>
            {queryRoute ? `Прямой рейс ${queryRoute.from} – ${queryRoute.to} · Круглосуточно` : config.sub ?? "От 200 км · Большой опыт в перевозках"}
          </p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.6, maxWidth: 560, marginBottom: 20 }}>
            {queryRoute
              ? `Выполняем маршрут ${queryRoute.from} – ${queryRoute.to}. Цену фиксируем до выезда — она не меняется из-за пробок, ночного времени и времени в пути. Машина едет только за вами, без попутчиков.`
              : config.lead ?? "Свои водители на дальних рейсах — седаны, кроссоверы и минивэны. Фиксированная стоимость без счётчика и сюрпризов."}
          </p>

          {/* ОФФЕР — КУПОН НА ОБРАТНУЮ ДОРОГУ */}
          {config.offerBack && (
            <div className="mb-5" style={{ maxWidth: 560 }}>
              <div className="relative" style={{ filter: "drop-shadow(0 10px 30px rgba(0,0,0,0.5))" }}>
                {/* корешок купона */}
                <div className="flex items-stretch rounded-t-2xl overflow-hidden relative z-10" style={{ border: `1px solid ${GOLD}44`, borderBottom: "none", background: "#0d1220" }}>

                  {/* левая часть — номинал */}
                  <div className="relative flex flex-col items-center justify-center px-4 py-5 shrink-0"
                    style={{ background: `linear-gradient(160deg,${GOLD} 0%,${GOLD2} 100%)`, minWidth: 104 }}>
                    <div style={{ fontFamily: "Oswald", color: "#0a0f1e", fontSize: 38, fontWeight: 900, lineHeight: 0.85, letterSpacing: "-0.02em" }}>20<span style={{ fontSize: 22 }}>%</span></div>
                    <div style={{ color: "rgba(10,15,30,0.7)", fontSize: 9.5, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.14em", marginTop: 6 }}>скидка</div>
                    <div className="w-9 h-px my-2.5" style={{ background: "rgba(10,15,30,0.25)" }} />
                    <Icon name="ArrowLeftRight" size={15} style={{ color: "rgba(10,15,30,0.75)" }} />
                    <div style={{ color: "rgba(10,15,30,0.7)", fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 5, textAlign: "center", lineHeight: 1.3 }}>обратный<br />рейс</div>
                  </div>

                  {/* перфорация */}
                  <div className="relative shrink-0" style={{ width: 1, background: `repeating-linear-gradient(to bottom, ${GOLD}55 0 6px, transparent 6px 12px)` }}>
                    <div className="absolute rounded-full" style={{ width: 14, height: 14, background: "#070b14", top: -7, left: -6.5 }} />
                    <div className="absolute rounded-full" style={{ width: 14, height: 14, background: "#070b14", bottom: -7, left: -6.5 }} />
                  </div>

                  {/* правая часть — суть */}
                  <div className="flex-1 px-4 py-4 min-w-0">
                    <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: "clamp(15px,4vw,19px)", fontWeight: 900, textTransform: "uppercase", lineHeight: 1.1, letterSpacing: "-0.01em" }}>
                      Дорога домой и обратно
                    </div>
                    <div style={{ color: GOLD2, fontSize: 11.5, fontWeight: 700, marginTop: 3 }}>
                      Забронируйте сразу две поездки
                    </div>

                    <div className="flex items-baseline gap-2 flex-wrap mt-3">
                      <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 12.5 }}>1 000 км:</span>
                      <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, textDecoration: "line-through" }}>34 000</span>
                      <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 22, fontWeight: 900, lineHeight: 1 }}>27 200 ₽</span>
                    </div>
                    <div style={{ color: GOLD, fontSize: 11, fontWeight: 700, marginTop: 4 }}>
                      Выгода 6 800 ₽ на обратном пути
                    </div>
                  </div>
                </div>

                {/* низ купона — условия и кнопка */}
                <div className="rounded-b-2xl px-4 pt-3.5 pb-4"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderTop: "none", marginTop: -6 }}>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3">
                    {["Машина закреплена за датой", "Цена зафиксирована", "Платите за каждую поездку отдельно"].map(t => (
                      <div key={t} className="flex items-center gap-1.5">
                        <Icon name="Check" size={11} style={{ color: GOLD, flexShrink: 0 }} />
                        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 10.5, fontWeight: 600 }}>{t}</span>
                      </div>
                    ))}
                  </div>
                  <a href={PHONE_HREF}
                    onClick={() => { ymGoal("offer_back_call", { city: config.slug }); ymLead("phone", utmParams, source); }}
                    className="flex items-center justify-center gap-2 rounded-xl py-3 w-full"
                    style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                    <Icon name="Phone" size={15} style={{ color: "#0a0f1e" }} />
                    <span style={{ fontFamily: "Oswald", color: "#0a0f1e", fontSize: 14, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.04em" }}>Забронировать туда-обратно</span>
                  </a>
                  <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 9.5, lineHeight: 1.5, marginTop: 8 }}>
                    Маршруты от 500 км · обе поездки бронируются сразу · дату обратной дороги можно перенести один раз бесплатно
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ФОТО */}
          <div className="relative rounded-3xl overflow-hidden" style={{ maxHeight: 460 }}>
            <img src={HERO_IMG} alt={config.heroAlt ?? `Комфортная поездка из ${config.cityRod}`} {...{ fetchpriority: "high" }}
              className="w-full object-cover" style={{ maxHeight: 460, objectPosition: "center 15%" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to right,rgba(7,11,20,0.6) 0%,transparent 45%,rgba(7,11,20,0.15) 100%)" }} />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to top,rgba(7,11,20,0.95) 0%,transparent 45%)" }} />

            <div className="absolute bottom-5 left-5 right-5">
              <div className="grid grid-cols-3 gap-2 max-w-xs">
                {[{ val: "12+", label: "лет на рынке" }, { val: "50к+", label: "поездок" }, { val: "4.8★", label: "рейтинг" }].map(s => (
                  <div key={s.val} className="rounded-xl py-2 px-2 text-center" style={{ background: "rgba(7,11,20,0.75)", backdropFilter: "blur(8px)", border: `1px solid rgba(201,168,76,0.2)` }}>
                    <div style={{ fontFamily: "Oswald", color: GOLD2, fontSize: 17, fontWeight: 900, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 9, marginTop: 2 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute top-4 right-4 rounded-xl px-3 py-1.5" style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
              <span style={{ fontFamily: "Oswald", color: "#0a0f1e", fontSize: 10, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.06em" }}>С персональным водителем</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
