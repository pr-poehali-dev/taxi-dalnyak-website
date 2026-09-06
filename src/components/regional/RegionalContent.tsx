import Icon from "@/components/ui/icon";
import PriceGuide from "@/components/PriceGuide";
import { GOLD, GOLD2, ROUTES_PREVIEW, type RegionConfig } from "@/components/regional/shared";

interface Props {
  config: RegionConfig;
  allRoutes: boolean;
  setAllRoutes: (fn: (v: boolean) => boolean) => void;
  reviews: { name: string; route: string; text: string; img: string }[];
}

export default function RegionalContent({ config, allRoutes, setAllRoutes, reviews }: Props) {
  return (
    <>
      {/* ВАЖНО */}
      <section className={`px-4 pt-6 max-w-5xl mx-auto w-full ${config.short ? "pb-5" : "pb-0"}`}>
        <div className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <div className="flex items-center gap-2 mb-3">
            <Icon name="AlertCircle" size={13} style={{ color: "rgba(255,255,255,0.25)" }} />
            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em" }}>Важно знать</span>
          </div>
          <div className="space-y-2">
            {[
              { ok: false, text: "Поездками с попутчиками мы не занимаемся" },
              { ok: false, text: "Короткие внутренние поездки не выполняем" },
              { ok: true,  text: `Работаем только на дальних маршрутах — от ${config.minKm ?? 200} км` },
            ].map(item => (
              <div key={item.text} className="flex items-start gap-2.5">
                <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: item.ok ? "rgba(74,222,128,0.12)" : "rgba(239,68,68,0.12)", border: `1px solid ${item.ok ? "rgba(74,222,128,0.3)" : "rgba(239,68,68,0.3)"}` }}>
                  <Icon name={item.ok ? "Check" : "X"} size={10} style={{ color: item.ok ? "#4ade80" : "#ef4444" }} />
                </div>
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 1.5 }}>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {config.priceGuide && (
        <section className="px-4 pt-5 pb-1 max-w-5xl mx-auto w-full">
          <PriceGuide routes={config.priceGuide} note={config.priceNote} />
        </section>
      )}

      {config.rateTable && (
        <section className="px-4 pt-5 pb-0 max-w-5xl mx-auto w-full">
          <div className="rounded-3xl p-5" style={{ background: "linear-gradient(135deg,rgba(201,168,76,0.07),rgba(201,168,76,0.02))", border: "1px solid rgba(201,168,76,0.22)" }}>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
              <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                {config.rateTable.title ?? "Тарифы за километр"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {config.rateTable.rows.map(r => (
                <div key={r.name} className="rounded-2xl px-4 py-3.5" style={{ background: "rgba(7,11,20,0.5)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{r.name}</div>
                  {r.desc && <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 10.5, marginTop: 1 }}>{r.desc}</div>}
                  <div style={{ fontFamily: "Oswald", color: GOLD2, fontSize: 22, fontWeight: 900, lineHeight: 1.1, marginTop: 5 }}>
                    {r.rate} ₽<span style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.35)" }}>/км</span>
                  </div>
                </div>
              ))}
            </div>
            {config.rateTable.note && (
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 11.5, lineHeight: 1.6, marginTop: 12 }}>{config.rateTable.note}</p>
            )}
          </div>
        </section>
      )}

      {!config.short && <>
      {/* ДИСПЕТЧЕР */}
      <section className="px-4 pt-5 pb-0 max-w-5xl mx-auto w-full">
        <div className="rounded-2xl p-5" style={{ background: `linear-gradient(135deg,rgba(201,168,76,0.08),rgba(201,168,76,0.03))`, border: `1px solid rgba(201,168,76,0.2)` }}>
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
              <Icon name="Headphones" size={20} style={{ color: "#0a0f1e" }} />
            </div>
            <div>
              <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: 15, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>
                Диспетчер <span style={{ color: GOLD }}>Алексей</span> — на связи 24/7
              </div>
              <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, lineHeight: 1.7 }}>
                Если вам необходимо уехать далеко в другой город — Алексей с радостью{" "}
                <span style={{ color: "rgba(255,255,255,0.9)" }}>назначит машину</span>,{" "}
                <span style={{ color: "rgba(255,255,255,0.9)" }}>просчитает стоимость маршрута</span>{" "}
                и ответит на все дополнительные вопросы.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* УТП */}
      <section className="px-4 pt-5 pb-0 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "Zap",         text: "Срочная подача" },
            { icon: "Calendar",    text: "Предзаказ без брони" },
            { icon: "Receipt",     text: "Чек самозанятого" },
            { icon: "ShieldCheck", text: "Работаем с 2014 года" },
          ].map(item => (
            <div key={item.text} className="flex items-start gap-2.5 rounded-2xl px-4 py-3.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <Icon name={item.icon as "Zap"} size={15} style={{ color: GOLD, flexShrink: 0, marginTop: 1 }} />
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, lineHeight: 1.4 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* О РЕГИОНЕ */}
      <section className="px-4 pt-5 pb-0 max-w-5xl mx-auto w-full">
        <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
            <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{config.aboutTitle ?? `Такси из ${config.cityRod}`}</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.8, marginBottom: 14 }}>{config.about}</p>
          <div className="space-y-2">
            {config.features.map(f => (
              <div key={f} className="flex items-start gap-2.5">
                <Icon name="ChevronRight" size={12} style={{ color: GOLD, flexShrink: 0, marginTop: 2 }} />
                <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, lineHeight: 1.5 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* РЕЙТИНГИ */}
      <section className="px-4 pt-5 pb-0 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-2 gap-3">
          {[
            { name: "Карты", icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="#fff"/><circle cx="12" cy="9" r="2.5" fill="#ff4433"/></svg>, bg: "linear-gradient(135deg,#ff4433,#ff6b35)" },
            { name: "2ГИС", icon: <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 10, fontWeight: 900 }}>2ГИС</span>, bg: "linear-gradient(135deg,#00b956,#008f42)" },
          ].map(r => (
            <div key={r.name} className="rounded-2xl px-4 py-4 flex flex-col gap-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: r.bg }}>{r.icon}</div>
                <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{r.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 26, fontWeight: 900, lineHeight: 1 }}>4.8</span>
                <div className="flex gap-0.5 mt-0.5">
                  {[1,2,3,4].map(i => <Icon key={i} name="Star" size={12} style={{ color: GOLD }} className="fill-[#c9a84c]" />)}
                  <div className="relative" style={{ width: 12, height: 12, overflow: "hidden" }}>
                    <Icon name="Star" size={12} style={{ color: "rgba(255,255,255,0.12)", position: "absolute" }} />
                    <div style={{ width: "80%", overflow: "hidden", position: "absolute" }}>
                      <Icon name="Star" size={12} style={{ color: GOLD }} className="fill-[#c9a84c]" />
                    </div>
                  </div>
                </div>
              </div>
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10 }}>Средняя оценка организации</span>
            </div>
          ))}
        </div>
      </section>

      {/* МАРШРУТЫ */}
      <section className="px-4 pt-6 pb-0 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
          <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>{config.routesTitle ?? `Маршруты из ${config.cityRod}`}</span>
        </div>
        <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 11, marginBottom: 12, fontStyle: "italic" }}>{config.routesNote ?? "Часть направлений — выезжаем по всей России"}</p>
        <div className="flex flex-wrap gap-2">
          {config.routes.map((r, i) => (
            <span key={r} className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
              style={{
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.55)", fontSize: 11, fontWeight: 600,
                display: !allRoutes && i >= ROUTES_PREVIEW ? "none" : undefined,
              }}>
              <Icon name="MapPin" size={9} style={{ color: GOLD, flexShrink: 0 }} />{r}
            </span>
          ))}
        </div>
        {config.routes.length > ROUTES_PREVIEW && (
          <button onClick={() => setAllRoutes(v => !v)}
            className="flex items-center gap-2 rounded-full px-4 py-2 mt-3"
            style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.3)", color: GOLD2, fontSize: 12, fontWeight: 700 }}>
            <Icon name={allRoutes ? "ChevronUp" : "ChevronDown"} size={13} />
            {allRoutes ? "Свернуть список" : `Показать все направления (${config.routes.length})`}
          </button>
        )}
      </section>

      </>}

      {/* СОТРУДНИКИ ПО ДОГОВОРУ */}
      {config.corporate && (
        <section className="px-4 pt-5 pb-0 max-w-5xl mx-auto w-full">
          <div className="rounded-2xl p-5" style={{ background: "linear-gradient(135deg,rgba(201,168,76,0.09),rgba(201,168,76,0.02))", border: "1px solid rgba(201,168,76,0.22)" }}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
                <Icon name="FileCheck2" size={18} style={{ color: "#0a0f1e" }} />
              </div>
              <div>
                <div style={{ fontFamily: "Oswald", color: "#fff", fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", lineHeight: 1.2 }}>Перевозка сотрудников</div>
                <div style={{ color: GOLD, fontSize: 11, fontWeight: 700, marginTop: 2 }}>Между регионами · по договору</div>
              </div>
            </div>

            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.75, marginBottom: 14 }}>
              Возим сотрудников компаний на дальние расстояния: командировки, вахтовые заезды и смены, доставка бригад между регионами. Работаем официально — договор, безналичная оплата, закрывающие документы для бухгалтерии.
            </p>

            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                { icon: "FileSignature", text: "Договор с юрлицами и ИП" },
                { icon: "Landmark",      text: "Безналичный расчёт" },
                { icon: "Receipt",       text: "Закрывающие документы" },
                { icon: "CalendarClock", text: "Регулярные рейсы по графику" },
              ].map(item => (
                <div key={item.text} className="flex items-start gap-2 rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                  <Icon name={item.icon as "Receipt"} size={14} style={{ color: GOLD, flexShrink: 0, marginTop: 1 }} />
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 11.5, fontWeight: 600, lineHeight: 1.4 }}>{item.text}</span>
                </div>
              ))}
            </div>

            <div className="rounded-xl px-4 py-3" style={{ background: "rgba(7,11,20,0.5)", border: "1px solid rgba(255,255,255,0.07)" }}>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Реквизиты</div>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                <div className="flex items-baseline gap-1.5">
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11.5 }}>ИНН</span>
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: "0.02em" }}>183209197326</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11.5 }}>ОГРНИП</span>
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 700, letterSpacing: "0.02em" }}>326180000068152</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}


      {/* ОТЗЫВЫ */}
      <section className="px-4 pt-6 pb-32 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-1 h-5 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
          <span style={{ fontFamily: "Oswald", color: "#fff", fontSize: 15, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Отзывы пассажиров</span>
        </div>
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.name} className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <img src={r.img} alt={r.name} loading="lazy" className="w-full block" />
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{r.name}</div>
                    <div style={{ color: GOLD, fontSize: 11, marginTop: 1 }}>{r.route}</div>
                  </div>
                  <div className="flex gap-0.5">
                    {[1,2,3,4,5].map(i => <Icon key={i} name="Star" size={13} style={{ color: GOLD }} className="fill-[#c9a84c]" />)}
                  </div>
                </div>
                <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.7 }}>{r.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
