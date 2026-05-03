import { useState, useEffect, useRef, useCallback } from "react";
import Icon from "@/components/ui/icon";
import AlisaChat from "@/components/AlisaChat";
import { getAllUtmParams, parseKeyword } from "@/lib/utm";

const LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/eed871f1-fcfc-4342-ba10-6d3337b98fe4.jpg";
const HERO_BG = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/e72b842e-823b-4b0b-8118-1f1329cf7e61.jpg";

function trackGoal(goal: string) {
  try {
    const w = window as unknown as { ym?: (id: number, action: string, goal: string) => void };
    if (w.ym) w.ym(108400932, "reachGoal", goal);
  } catch {
    /* noop */
  }
}

export default function Index() {
  const utmRef = useRef<Record<string, string>>({});
  const [route, setRoute] = useState("");
  const [fromCity, setFromCity] = useState("");
  const [toCity, setToCity] = useState("");

  const [chatOpen, setChatOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState<string>("");
  const [pulseTrigger, setPulseTrigger] = useState(0);

  useEffect(() => {
    utmRef.current = getAllUtmParams();
    const params = new URLSearchParams(window.location.search);
    const term = params.get("utm_term") || params.get("keyword") || "";
    const parsed = parseKeyword(term);
    if (parsed.display) setRoute(parsed.display);
    if (parsed.from) setFromCity(parsed.from);
    if (parsed.to) setToCity(parsed.to);

    // Триггер пульсации внимания каждые 12 сек, если чат не открыт
    const t = setInterval(() => setPulseTrigger((p) => p + 1), 12000);
    return () => clearInterval(t);
  }, []);

  const openChat = useCallback(
    (preset?: string, goal?: string) => {
      if (goal) trackGoal(goal);
      setInitialMessage(preset || "");
      setChatOpen(true);
    },
    [],
  );

  const heroTitle = fromCity && toCity
    ? `Такси ${fromCity} → ${toCity}`
    : route
    ? `Такси ${route}`
    : "Межгороднее такси";

  return (
    <div className="min-h-screen bg-[#F5F2ED] text-[#1a1a1a] font-golos overflow-x-hidden pb-24">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-black/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={LOGO} alt="Дальняк" className="w-9 h-9 rounded-lg object-cover" />
          <div>
            <div className="font-oswald text-[15px] font-bold uppercase tracking-wider leading-none">Дальняк</div>
            <div className="text-[10.5px] text-black/50 font-golos">межгород · 24/7</div>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-green-50 border border-green-200">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[11px] text-green-700 font-bold font-golos">Алиса онлайн</span>
        </div>
      </header>

      {/* HERO */}
      <section className="relative px-4 pt-6 pb-8">
        <div
          className="absolute inset-0 -z-10 opacity-25"
          style={{
            backgroundImage: `url(${HERO_BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-[#F5F2ED]/40 via-[#F5F2ED]/80 to-[#F5F2ED]" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 border border-black/10 mb-4">
          <Icon name="Sparkles" size={14} className="text-amber-500" />
          <span className="text-[12px] font-golos font-bold text-[#1a1a1a]">
            ИИ-менеджер посчитает за 30 секунд
          </span>
        </div>

        <h1 className="font-oswald text-[34px] leading-[1.05] font-bold uppercase tracking-tight mb-3">
          {heroTitle}
        </h1>

        <p className="font-golos text-[15px] text-black/70 mb-5 leading-snug">
          Не звоните, не пишите в мессенджеры. Алиса спросит маршрут, посчитает по карте и оформит заказ —{" "}
          <span className="font-bold text-[#1a1a1a]">прямо здесь, в чате</span>.
        </p>

        {/* Главный CTA — гигантская кнопка к Алисе */}
        <button
          type="button"
          onClick={() =>
            openChat(
              fromCity && toCity
                ? `Здравствуйте! Нужно такси из ${fromCity} в ${toCity}.`
                : route
                ? `Здравствуйте! Нужно такси ${route}.`
                : "",
              "hero_main_cta",
            )
          }
          className="w-full bg-amber-400 text-[#1a1a1a] py-5 px-5 rounded-3xl shadow-xl active:scale-[0.98] transition-all relative overflow-hidden group"
          style={{
            boxShadow: "0 12px 30px rgba(251, 191, 36, 0.5), 0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <span
            key={pulseTrigger}
            className="absolute inset-0 rounded-3xl border-2 border-amber-300 animate-ping opacity-60 pointer-events-none"
            style={{ animationDuration: "1.4s", animationIterationCount: 1 }}
          />
          <div className="relative flex items-center justify-between gap-3">
            <div className="text-left">
              <div className="font-oswald text-[19px] font-bold uppercase leading-tight">
                Узнать цену у Алисы
              </div>
              <div className="font-golos text-[12.5px] text-black/70 mt-0.5">
                ответит за 30 сек · без звонков
              </div>
            </div>
            <div className="w-12 h-12 rounded-full bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
              <Icon name="MessageCircle" size={22} className="text-amber-400" />
            </div>
          </div>
        </button>

        {/* Trust micro-row */}
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="bg-white rounded-xl py-2.5 px-2 border border-black/5">
            <div className="font-oswald font-bold text-[16px]">50К+</div>
            <div className="text-[10.5px] text-black/55 font-golos leading-tight">поездок</div>
          </div>
          <div className="bg-white rounded-xl py-2.5 px-2 border border-black/5">
            <div className="font-oswald font-bold text-[16px]">5 лет</div>
            <div className="text-[10.5px] text-black/55 font-golos leading-tight">на рынке</div>
          </div>
          <div className="bg-white rounded-xl py-2.5 px-2 border border-black/5">
            <div className="font-oswald font-bold text-[16px]">24/7</div>
            <div className="text-[10.5px] text-black/55 font-golos leading-tight">диспетчер</div>
          </div>
        </div>
      </section>

      {/* Преимущества Алисы — почему писать ей выгодно */}
      <section className="px-4 mb-6">
        <div className="bg-white rounded-3xl p-5 border border-black/5">
          <h2 className="font-oswald text-[20px] font-bold uppercase mb-4 leading-tight">
            Почему лучше написать Алисе
          </h2>
          <ul className="space-y-3">
            {[
              { icon: "Zap", title: "Цена за 30 секунд", text: "Алиса считает по реальной карте, а не «от фонаря»" },
              { icon: "ShieldCheck", title: "Цена не растёт", text: "Зафиксируется сразу — не вырастет даже в пробке" },
              { icon: "Phone", title: "Без звонков", text: "Не нужно никому звонить и ждать на линии" },
              { icon: "Clock", title: "Машина за 30 минут", text: "Подача быстрее, чем у обычных диспетчеров" },
              { icon: "FileText", title: "Закрывающие документы", text: "С QR-кодом — для отчётности и командировок" },
            ].map((it) => (
              <li key={it.title} className="flex gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0">
                  <Icon name={it.icon} size={18} className="text-amber-600" />
                </div>
                <div>
                  <div className="font-oswald text-[14.5px] font-bold uppercase">{it.title}</div>
                  <div className="font-golos text-[13px] text-black/65 leading-snug">{it.text}</div>
                </div>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => openChat("", "advantages_cta")}
            className="mt-4 w-full py-3 rounded-2xl bg-[#1a1a1a] text-white font-oswald text-[14px] font-bold uppercase active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            <Icon name="MessageCircle" size={16} />
            Узнать стоимость моей поездки
          </button>
        </div>
      </section>

      {/* Готовые сценарии — каждый ведёт в чат с предзаполненным вопросом */}
      <section className="px-4 mb-6">
        <h2 className="font-oswald text-[20px] font-bold uppercase mb-3 leading-tight">
          Спросите Алису
        </h2>
        <div className="grid grid-cols-2 gap-2.5">
          {[
            { q: "Сколько стоит до Москвы?", icon: "MapPin", preset: "Сколько стоит до Москвы?" },
            { q: "Машина с детским креслом", icon: "Baby", preset: "Нужна машина с детским креслом, посчитайте поездку" },
            { q: "Минивэн на 6 человек", icon: "Users", preset: "Нужен минивэн на 6 человек, посчитайте стоимость" },
            { q: "Документы для бухгалтерии", icon: "Receipt", preset: "Нужны закрывающие документы с QR, посчитайте поездку" },
            { q: "Можно с животным?", icon: "Dog", preset: "Можно ли с небольшим питомцем? Посчитайте поездку" },
            { q: "Поездка ночью", icon: "Moon", preset: "Нужно выехать ночью, посчитайте стоимость" },
          ].map((it) => (
            <button
              key={it.q}
              type="button"
              onClick={() => openChat(it.preset, "scenario_cta")}
              className="bg-white rounded-2xl p-3.5 text-left border border-black/5 active:scale-[0.97] transition-transform"
            >
              <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center mb-2">
                <Icon name={it.icon} size={16} className="text-amber-600" />
              </div>
              <div className="font-oswald text-[12.5px] font-bold uppercase leading-tight">{it.q}</div>
              <div className="text-[11px] text-amber-700 font-golos mt-1.5 flex items-center gap-1">
                спросить
                <Icon name="ArrowRight" size={11} />
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Тарифы — без цен, только что входит */}
      <section className="px-4 mb-6">
        <h2 className="font-oswald text-[20px] font-bold uppercase mb-3 leading-tight">
          Классы машин
        </h2>
        <div className="space-y-2.5">
          {[
            { name: "Стандарт", desc: "Седан · до 3 пассажиров · кондиционер, музыка, зарядка", icon: "Car" },
            { name: "Комфорт", desc: "Просторный салон · до 4 пассажиров · идеален для длинных поездок", icon: "Car" },
            { name: "Комфорт+", desc: "Премиум · до 4 пассажиров · максимум удобства", icon: "Crown" },
            { name: "Минивэн", desc: "До 8 человек · большой багаж · семья или компания", icon: "Bus" },
          ].map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => openChat(`Расскажите про класс «${c.name}» и посчитайте поездку`, "tariff_cta")}
              className="w-full bg-white rounded-2xl p-4 flex items-center gap-3 border border-black/5 active:scale-[0.98] transition-transform text-left"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1a1a1a] flex items-center justify-center flex-shrink-0">
                <Icon name={c.icon} size={22} className="text-amber-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-oswald text-[15px] font-bold uppercase">{c.name}</div>
                <div className="font-golos text-[12px] text-black/60 leading-tight">{c.desc}</div>
              </div>
              <Icon name="ChevronRight" size={18} className="text-black/30 flex-shrink-0" />
            </button>
          ))}
        </div>
      </section>

      {/* Социальные доказательства */}
      <section className="px-4 mb-6">
        <h2 className="font-oswald text-[20px] font-bold uppercase mb-3 leading-tight">
          Что говорят клиенты
        </h2>
        <div className="space-y-2.5">
          {[
            { name: "Ирина", city: "Ростов → Москва", text: "Заказала через чат за 2 минуты, машина приехала вовремя. Цена не изменилась." },
            { name: "Сергей", city: "Краснодар → Сочи", text: "Удобно, что не надо звонить. Алиса сразу всё посчитала и прислала контакты водителя." },
            { name: "Анна", city: "Воронеж → Москва", text: "Ехали с ребёнком, кресло было бесплатно. Водитель аккуратный, не разгонялся." },
          ].map((r) => (
            <div key={r.name} className="bg-white rounded-2xl p-4 border border-black/5">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-[12px] font-bold text-amber-700">
                  {r.name[0]}
                </div>
                <div>
                  <div className="font-oswald text-[13px] font-bold uppercase leading-tight">{r.name}</div>
                  <div className="text-[11px] text-black/50 font-golos leading-tight">{r.city}</div>
                </div>
                <div className="ml-auto flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Icon key={i} name="Star" size={12} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-[13px] text-black/75 font-golos leading-snug">«{r.text}»</p>
            </div>
          ))}
        </div>
      </section>

      {/* Финальный блок — снова к Алисе */}
      <section className="px-4 mb-6">
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] rounded-3xl p-6 text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-amber-400/20 blur-3xl" />
          <h3 className="font-oswald text-[22px] font-bold uppercase leading-tight mb-2 relative">
            Готовы ехать?
          </h3>
          <p className="font-golos text-[14px] text-white/75 mb-5 relative">
            Напишите Алисе маршрут — она посчитает по карте и закрепит за вами машину за пару минут.
          </p>
          <button
            type="button"
            onClick={() => openChat("", "final_cta")}
            className="w-full bg-amber-400 text-[#1a1a1a] py-4 rounded-2xl font-oswald text-[15px] font-bold uppercase active:scale-95 transition-transform flex items-center justify-center gap-2 relative"
          >
            <Icon name="MessageCircle" size={18} />
            Открыть чат с Алисой
          </button>
          <div className="mt-3 text-center text-[11.5px] text-white/55 font-golos">
            ⚡ Среднее время ответа — 28 секунд
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-4 py-5 text-center text-[11px] text-black/45 font-golos">
        © {new Date().getFullYear()} Такси «Дальняк» · Межгороднее такси по всей России
      </footer>

      {/* STICKY BOTTOM CTA — всегда виден */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-gradient-to-t from-[#F5F2ED] via-[#F5F2ED]/95 to-transparent pb-3 pt-5 px-4 pointer-events-none">
        <button
          type="button"
          onClick={() => openChat("", "sticky_cta")}
          className="pointer-events-auto w-full bg-[#1a1a1a] text-white py-4 rounded-2xl font-oswald font-bold text-[15px] uppercase tracking-wide active:scale-95 transition-transform flex items-center justify-center gap-2 shadow-2xl border border-amber-400/30"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400" />
          </span>
          <Icon name="MessageCircle" size={18} className="text-amber-400" />
          Написать Алисе — узнать цену
        </button>
      </div>

      {/* Чат с Алисой */}
      <AlisaChat
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        initialUserMessage={initialMessage}
        utm={utmRef.current}
        routeFrom={fromCity}
        routeTo={toCity}
        onOrdered={() => trackGoal("order_completed")}
      />
    </div>
  );
}
