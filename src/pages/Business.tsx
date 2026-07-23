import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

declare global { interface Window { ym?: (id: number, action: string, goal: string) => void; } }

function ymGoal(goal: string) {
  if (typeof window.ym === "function") window.ym(108400932, "reachGoal", goal);
}

const LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/3a499542-747a-49d2-808e-4c137548c76e.jpg";

const PHONE      = "+7 (995) 645-51-25";
const PHONE_HREF = "tel:+79956455125";
const TG_HREF     = "https://t.me/Mezhgorod1816";
const VK_HREF     = "https://vk.com/dalnyack";

const NAVY   = "#0a0f1e";
const CARD   = "#131b2e";
const GOLD   = "#c9a84c";
const GOLD2  = "#e8c96a";

const CITIES = [
  "Москва","Санкт-Петербург","Белгород","Брянск","Владимир",
  "Воронеж","Калуга","Кострома","Курск","Липецк",
  "Рязань","Тамбов","Тверь","Тула","Ярославль",
  "Вологда","Нижний Новгород","Ижевск","Новосибирск",
  "Омск","Екатеринбург","Тюмень","Челябинск",
  "Богучарский р-н","Тоцкий р-н","Новые территории",
];

const WHY = [
  { icon: "ShieldCheck", title: "100% предоставление авто", desc: "Гарантируем подачу автомобиля. Если авто не предоставлено — выплачиваем неустойку по договору." },
  { icon: "FileCheck2",  title: "Работаем по договору",     desc: "Официальное оформление, договор-оферта, закрывающие документы для бухгалтерии." },
  { icon: "Clock",       title: "Круглосуточный диспетчер", desc: "Принимаем и подтверждаем заявки в любое время, включая праздники и выходные." },
  { icon: "MapPin",      title: "30+ городов присутствия",  desc: "Межгородние перевозки по России — от Москвы и СПб до Урала и Сибири." },
];

const TERMS = [
  { icon: "Percent",  title: "Предоплата 30%",        desc: "Вносится при бронировании поездки для подтверждения заказа." },
  { icon: "Ban",       title: "Невозврат предоплаты", desc: "Если бронь отменена менее чем за 4 часа до начала поездки — предоплата не возвращается." },
  { icon: "AlertTriangle", title: "Штраф за срыв подачи", desc: "Если автомобиль не назначен за 1 час до выезда по нашей вине — компенсируем 50% предоплаты." },
  { icon: "ShieldCheck", title: "Неустойка при непредоставлении", desc: "Если автомобиль не предоставлен полностью — возвращаем 100% предоплаты и выплачиваем неустойку." },
];

export default function Business() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: NAVY, fontFamily: "Inter, sans-serif" }}>

      {/* ══ ХЕДЕР ══ */}
      <div className={`sticky top-0 z-30 transition-all duration-300 ${scrolled ? "py-2 shadow-2xl" : "py-4"}`}
        style={{ background: scrolled ? "rgba(10,15,30,0.95)" : "rgba(10,15,30,0.8)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(201,168,76,0.15)" }}>
        <div className="max-w-5xl mx-auto px-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="" className="w-9 h-9 rounded-xl object-cover" style={{ border: `1.5px solid ${GOLD}` }} />
            <div>
              <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 14, color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Такси Дальняк
              </div>
              <div style={{ color: GOLD, fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Для юридических лиц</div>
            </div>
          </div>
          <a href={PHONE_HREF} onClick={() => ymGoal("b2b_call")}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 transition-transform hover:scale-105"
            style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
            <Icon name="Phone" size={14} style={{ color: NAVY }} />
            <span className="hidden sm:inline" style={{ fontFamily: "Oswald", fontSize: 13, color: NAVY, fontWeight: 800, textTransform: "uppercase" }}>{PHONE}</span>
            <span className="sm:hidden" style={{ fontFamily: "Oswald", fontSize: 13, color: NAVY, fontWeight: 800, textTransform: "uppercase" }}>Звонок</span>
          </a>
        </div>
      </div>

      {/* ══ HERO ══ */}
      <div className="px-5 pt-14 pb-10 max-w-5xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6"
          style={{ background: "rgba(201,168,76,0.1)", border: `1px solid rgba(201,168,76,0.3)` }}>
          <Icon name="Briefcase" size={13} style={{ color: GOLD }} />
          <span style={{ color: GOLD2, fontSize: 12, fontWeight: 700 }}>Работаем с юридическими лицами и ИП</span>
        </div>

        <h1 style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: "clamp(30px,5vw,58px)", lineHeight: 1.05, color: "#fff", textTransform: "uppercase", letterSpacing: "-0.01em", marginBottom: 20 }}>
          Заказать трансфер<br />
          <span style={{ color: GOLD }}>из города в город</span>
        </h1>

        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: "clamp(14px,2vw,17px)", lineHeight: 1.7, maxWidth: 600, marginBottom: 32 }}>
          Организуем межгородние перевозки для компаний и предпринимателей: командировки, встречи партнёров,
          регулярные корпоративные поездки. Заключаем договор, работаем официально, гарантируем подачу автомобиля.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <a href={PHONE_HREF} onClick={() => ymGoal("b2b_call")}
            className="flex items-center justify-center gap-3 rounded-2xl px-7 py-4 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})`, boxShadow: `0 4px 28px rgba(201,168,76,0.4)` }}>
            <Icon name="Phone" size={18} style={{ color: NAVY }} />
            <span style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 15, color: NAVY, textTransform: "uppercase" }}>Обсудить сотрудничество</span>
          </a>
          <a href={TG_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("b2b_tg")}
            className="flex items-center justify-center gap-2 rounded-2xl px-6 py-4 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg,#0e6da8,#1a8fc2)" }}>
            <Icon name="Send" size={16} className="text-white" />
            <span style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 14, color: "#fff", textTransform: "uppercase" }}>Написать в Telegram</span>
          </a>
        </div>
      </div>

      {/* ══ ПОЧЕМУ МЫ ══ */}
      <div className="px-5 pb-10 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
          <h2 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: "clamp(18px,3vw,24px)", color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Почему стоит обратиться к нам
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {WHY.map(w => (
            <div key={w.title} className="rounded-2xl p-5" style={{ background: CARD, border: `1px solid rgba(201,168,76,0.15)` }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: "rgba(201,168,76,0.12)" }}>
                <Icon name={w.icon as "Star"} size={18} style={{ color: GOLD }} />
              </div>
              <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 15, color: "#fff", textTransform: "uppercase", letterSpacing: "0.03em", marginBottom: 6 }}>
                {w.title}
              </div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.65 }}>{w.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ УСЛОВИЯ РАБОТЫ ══ */}
      <div className="px-5 pb-10 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
          <h2 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: "clamp(18px,3vw,24px)", color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Условия бронирования
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {TERMS.map(t => (
            <div key={t.title} className="rounded-2xl p-5 flex items-start gap-3" style={{ background: CARD, border: `1px solid rgba(255,255,255,0.06)` }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: "rgba(201,168,76,0.12)" }}>
                <Icon name={t.icon as "Star"} size={16} style={{ color: GOLD }} />
              </div>
              <div>
                <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 14, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: 4 }}>
                  {t.title}
                </div>
                <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12.5, lineHeight: 1.6 }}>{t.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Оплата и рассрочка */}
        <div className="rounded-2xl p-6 flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
          style={{ background: `linear-gradient(135deg,rgba(201,168,76,0.1),rgba(201,168,76,0.03))`, border: `1px solid rgba(201,168,76,0.25)` }}>
          <div className="flex items-start gap-3">
            <Icon name="CreditCard" size={24} style={{ color: GOLD, flexShrink: 0, marginTop: 2 }} />
            <div>
              <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 15, color: "#fff", textTransform: "uppercase", marginBottom: 4 }}>
                Оплата бронирования
              </div>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.6, maxWidth: 480 }}>
                Ссылку на оплату предоплаты (30% от стоимости поездки) присылает менеджер после согласования заявки.
                Также доступна рассрочка платежа от Т-Банка.
              </p>
            </div>
          </div>
          <a href={PHONE_HREF} onClick={() => ymGoal("b2b_payment_link")}
            className="flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 whitespace-nowrap transition-transform hover:scale-105 w-full md:w-auto"
            style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
            <Icon name="Link" size={15} style={{ color: NAVY }} />
            <span style={{ fontFamily: "Oswald", fontSize: 13, color: NAVY, fontWeight: 800, textTransform: "uppercase" }}>Получить ссылку на оплату</span>
          </a>
        </div>
      </div>

      {/* ══ ГОРОДА ПРИСУТСТВИЯ ══ */}
      <div className="px-5 pb-10 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-6 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
          <h2 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: "clamp(18px,3vw,24px)", color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Города присутствия
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {CITIES.map(c => (
            <span key={c} className="rounded-full px-3.5 py-2" style={{ background: CARD, border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.65)", fontSize: 12.5 }}>
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* ══ ПАРТНЁРЫ ══ */}
      <div className="px-5 pb-10 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-6 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
          <h2 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: "clamp(18px,3vw,24px)", color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Наши партнёры
          </h2>
        </div>
        <div className="rounded-2xl p-6" style={{ background: CARD, border: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.7 }}>
            Раздел партнёров и клиентов компании в разработке — логотипы и названия появятся здесь после согласования.
          </p>
        </div>
      </div>

      {/* ══ ДОГОВОР И РЕКВИЗИТЫ ══ */}
      <div className="px-5 pb-14 max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-1 h-6 rounded-full" style={{ background: `linear-gradient(${GOLD},${GOLD2})` }} />
          <h2 style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: "clamp(18px,3vw,24px)", color: "#fff", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Документы и реквизиты
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl p-6" style={{ background: CARD, border: "1px solid rgba(201,168,76,0.15)" }}>
            <div className="flex items-center gap-3 mb-3">
              <Icon name="FileText" size={20} style={{ color: GOLD }} />
              <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 15, color: "#fff", textTransform: "uppercase" }}>Договор оферты</div>
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.65, marginBottom: 16 }}>
              Работаем по договору-оферте. Полный текст договора можно скачать и ознакомиться с условиями перед бронированием.
            </p>
            <button disabled
              className="flex items-center gap-2 rounded-xl px-5 py-3 opacity-60 cursor-not-allowed w-full sm:w-auto justify-center"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
              <Icon name="Download" size={15} style={{ color: "rgba(255,255,255,0.6)" }} />
              <span style={{ fontFamily: "Oswald", fontSize: 13, color: "rgba(255,255,255,0.6)", fontWeight: 700, textTransform: "uppercase" }}>Договор скоро появится</span>
            </button>
          </div>

          <div className="rounded-2xl p-6" style={{ background: CARD, border: "1px solid rgba(201,168,76,0.15)" }}>
            <div className="flex items-center gap-3 mb-3">
              <Icon name="Building2" size={20} style={{ color: GOLD }} />
              <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 15, color: "#fff", textTransform: "uppercase" }}>Реквизиты</div>
            </div>
            <div className="space-y-2" style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, lineHeight: 1.7 }}>
              <div>ИП, статус подтверждён</div>
              <div className="flex items-center gap-2">
                <Icon name="MapPin" size={13} style={{ color: GOLD }} />
                <span>Офис: г. Ижевск</span>
              </div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 8 }}>
                ИНН и ОГРНИП будут указаны после предоставления данных
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ ФУТЕР / CTA ══ */}
      <div className="mt-auto" style={{ background: "#050810", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-5xl mx-auto px-5 py-8 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <img src={LOGO} alt="" className="w-10 h-10 rounded-xl object-cover" style={{ border: `1.5px solid ${GOLD}` }} />
            <div>
              <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 15, color: "#fff", textTransform: "uppercase" }}>Такси Дальняк</div>
              <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>Межгородние перевозки для бизнеса · г. Ижевск</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href={PHONE_HREF} onClick={() => ymGoal("b2b_call")}
              className="flex items-center gap-2 rounded-xl px-5 py-3 transition-transform hover:scale-105"
              style={{ background: `linear-gradient(135deg,${GOLD},${GOLD2})` }}>
              <Icon name="Phone" size={15} style={{ color: NAVY }} />
              <span style={{ fontFamily: "Oswald", fontSize: 14, color: NAVY, fontWeight: 800, textTransform: "uppercase" }}>{PHONE}</span>
            </a>
            <a href={VK_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("b2b_footer_vk")}
              className="flex items-center gap-2 rounded-xl px-4 py-3 transition-transform hover:scale-105"
              style={{ background: "linear-gradient(135deg,#1a3a6b,#2456a4)" }}>
              <Icon name="Users" size={15} className="text-white" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
