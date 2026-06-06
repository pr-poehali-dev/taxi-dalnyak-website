import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

const LOGO     = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/3a499542-747a-49d2-808e-4c137548c76e.jpg";
const MAX_LOGO = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/cf5e3e58-7d83-4d19-8c48-f91922395adf.png";
const CAR_IMG  = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/files/091d3d1c-1649-4d9e-8958-1a624bf8f371.jpg";
const REVIEW_1 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/b0eb5050-a05a-4647-8442-4b839d45161f.jpg";
const REVIEW_2 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/fedc4281-a106-4024-9369-8a03712c92a3.jpg";
const REVIEW_3 = "https://cdn.poehali.dev/projects/9a191476-ae87-4212-b94d-a888af0fbed6/bucket/ac322d91-fd27-4c11-b86f-f28e85ec3df0.jpg";

const PHONE      = "8 (995) 645-51-25";
const PHONE_HREF = "tel:+79956455125";
const TG_HREF    = "https://t.me/Mezhgorod1816";
const MAX_HREF   = "https://max.ru/u/f9LHodD0cOKIko3lZjdQ_mlLJBf8rzj3cvuBPPKZdqdK6ei4enFM6C8eSpw";

const CITIES = [
  "Москва", "Санкт-Петербург", "Белгород", "Брянск", "Владимир",
  "Воронеж", "Калуга", "Кострома", "Курск", "Липецк",
  "Рязань", "Тамбов", "Тверь", "Тула", "Ярославль",
  "Вологда", "Нижний Новгород", "Ижевск", "Новосибирск",
  "Омск", "Екатеринбург", "Тюмень", "Челябинск",
  "Богучарский р-н", "Тоцкий р-н", "Новые территории",
];

const REVIEWS = [
  { name: "Валерия", route: "Москва – Новомичуринск", img: REVIEW_1 },
  { name: "Ирина",   route: "Лен. область – СПб",     img: REVIEW_3 },
  { name: "Евгений", route: "Межгород по России",      img: REVIEW_2 },
];

function getStartCount() {
  const d = new Date();
  const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  return 12 + (seed % 19);
}

function ymGoal(goal: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).ym?.(98584604, "reachGoal", goal);
}

export default function Quick() {
  const [pulse, setPulse] = useState(false);
  const [count, setCount] = useState(getStartCount());
  const [mins, setMins]   = useState(7);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showIosHint, setShowIosHint]     = useState(false);
  const [isInstalled, setIsInstalled]     = useState(false);

  useEffect(() => {
    document.title = "Такси Дальняк — Межгород по России";
    const p = setInterval(() => setPulse(v => !v), 2000);
    const c = setInterval(() => {
      setCount(n => n + 1);
      setMins(Math.floor(Math.random() * 11) + 2);
    }, (Math.random() * 3 + 2) * 60000);
    const m = setInterval(() => setMins(v => v >= 40 ? 5 : v + 1), 60000);

    const standalone = window.matchMedia("(display-mode: standalone)").matches
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      || (window.navigator as any).standalone === true;
    if (standalone) setIsInstalled(true);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onPrompt = (e: any) => { e.preventDefault(); setInstallPrompt(e); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => {
      clearInterval(p); clearInterval(c); clearInterval(m);
      window.removeEventListener("beforeinstallprompt", onPrompt);
    };
  }, []);

  async function handleInstall() {
    ymGoal("install_click");
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      setInstallPrompt(null);
      return;
    }
    setShowIosHint(true);
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#f5f4f0" }}>

      {/* фоновое фото — очень слабо, только текстура */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img src={CAR_IMG} alt="" className="w-full h-full object-cover opacity-[0.04]" style={{ objectPosition: "center 38%" }} />
      </div>

      <div className="relative z-10 flex flex-col max-w-sm mx-auto w-full px-4 pt-7 pb-36">

        {/* ── ШАПКА ── */}
        <div className="flex items-center gap-3 mb-5">
          <img src={LOGO} alt="Дальняк" className="w-12 h-12 rounded-2xl object-cover shrink-0 shadow-md" />
          <div className="flex-1">
            <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 18, color: "#1a1a1a", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Такси Дальняк
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`w-1.5 h-1.5 rounded-full bg-emerald-500 transition-opacity duration-700 ${pulse ? "opacity-100" : "opacity-30"}`} />
              <span className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">Диспетчер на связи</span>
            </div>
          </div>
        </div>

        {/* ── СЧЁТЧИК ── */}
        <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-5 shadow-sm"
          style={{ background: "#fff", border: "1px solid #e8e6e0" }}>
          <div className="flex -space-x-2 shrink-0">
            {[REVIEW_1, REVIEW_2, REVIEW_3].map((img, i) => (
              <img key={i} src={img} alt="" className="w-7 h-7 rounded-full object-cover" style={{ border: "2px solid #fff" }} />
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <span style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 15, color: "#1a1a1a" }}>{count} пассажира</span>
            <span className="text-gray-500 text-[12px]"> сегодня доехали с нами</span>
          </div>
          <div className="text-right shrink-0">
            <div className="text-gray-400 text-[10px]">последний</div>
            <div className="text-amber-600 text-[11px] font-bold">{mins} мин назад</div>
          </div>
        </div>

        {/* ── КНОПКА УСТАНОВКИ ── */}
        {!isInstalled && (
          <button onClick={handleInstall}
            className="flex items-center gap-3 w-full rounded-2xl px-4 py-3 mb-5 shadow-sm text-left active:scale-[0.98] transition-transform"
            style={{ background: "#fff", border: "1px solid #e8e6e0" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-amber-500">
              <Icon name="Download" size={18} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-gray-800 font-bold text-[13px]">Добавить на главный экран</div>
              <div className="text-gray-400 text-[11px]">Чтобы не потерять — в один тап</div>
            </div>
            <Icon name="ChevronRight" size={16} className="text-amber-500 shrink-0" />
          </button>
        )}

        {/* ── ЗАГОЛОВОК ── */}
        <div className="mb-4">
          <div className="text-amber-600 text-[10px] font-black uppercase tracking-[0.25em] mb-2">
            Межгород · от 200 км · Россия и Новые территории
          </div>
          <h1 style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: "clamp(32px,9.5vw,48px)", lineHeight: 1.05, color: "#1a1a1a", textTransform: "uppercase" }}>
            Заказать такси<br />
            <span style={{ color: "#d97706" }}>из города в город</span>
          </h1>
          <p className="text-gray-500 text-[13px] mt-2.5 leading-relaxed">
            Звони или пиши — ответим сразу, назовём цену
          </p>
        </div>

        {/* ── 3 ФАКТА ── */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { top: "Новые авто",  bot: "до 10 лет",    icon: "Car" },
            { top: "12 лет",      bot: "на рынке",      icon: "Trophy" },
            { top: "Фикс. цена",  bot: "без счётчика",  icon: "BadgeCheck" },
          ].map(f => (
            <div key={f.top} className="flex flex-col items-center rounded-2xl py-3 px-2 gap-1 shadow-sm"
              style={{ background: "#fff", border: "1px solid #e8e6e0" }}>
              <Icon name={f.icon as "Car"} size={18} className="text-amber-500 mb-0.5" />
              <span style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 12, color: "#1a1a1a", textAlign: "center", lineHeight: 1.1 }}>{f.top}</span>
              <span className="text-gray-400 text-[10px] text-center leading-tight">{f.bot}</span>
            </div>
          ))}
        </div>

        {/* ── ЯКОРЬ ── */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-[11px] font-semibold">Такси. Не попутка. Не доставка.</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* ── КНОПКА ПОЗВОНИТЬ ── */}
        <a href={PHONE_HREF} onClick={() => ymGoal("phone_click")}
          className="relative flex flex-col items-center justify-center w-full rounded-3xl py-6 mb-3 active:scale-[0.97] transition-transform select-none overflow-hidden"
          style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)", boxShadow: "0 4px 20px rgba(245,158,11,0.35), 0 2px 8px rgba(0,0,0,0.1)" }}>
          <div className="absolute inset-0 rounded-3xl" style={{ boxShadow: pulse ? "0 0 0 10px rgba(245,158,11,0.12)" : "0 0 0 0px rgba(245,158,11,0)", transition: "box-shadow 0.8s ease" }} />
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <Icon name="PhoneCall" size={22} className="text-white" />
            </div>
            <div style={{ fontFamily: "Oswald", fontWeight: 900, fontSize: 28, color: "#fff", textTransform: "uppercase" }}>
              Позвонить
            </div>
          </div>
          <div className="text-white/80 text-[13px] font-bold">{PHONE}</div>
        </a>

        {/* ── ИЛИ НАПИШИ ── */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">или напиши</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* ── MAX + TG ── */}
        <div className="grid grid-cols-2 gap-3 mb-7">
          <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("max_click")}
            className="relative flex flex-col items-center justify-center rounded-2xl py-5 gap-2 active:scale-[0.97] transition-transform shadow-sm"
            style={{ background: "linear-gradient(135deg,#002d60,#0046a8)", border: "1px solid rgba(0,70,168,0.3)" }}>
            <div className="absolute top-2 right-2 rounded-full px-1.5 py-0.5 bg-amber-400">
              <span className="text-[8px] font-black text-white uppercase tracking-wide">Чаще пишут</span>
            </div>
            <img src={MAX_LOGO} alt="MAX" className="h-7 object-contain" />
            <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 15, color: "#fff", textTransform: "uppercase" }}>Написать в MAX</div>
          </a>
          <a href={TG_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("tg_click")}
            className="flex flex-col items-center justify-center rounded-2xl py-5 gap-2 active:scale-[0.97] transition-transform shadow-sm"
            style={{ background: "linear-gradient(135deg,#0a6ebd,#1c8fd8)", border: "1px solid rgba(28,143,216,0.3)" }}>
            <Icon name="Send" size={26} className="text-white" />
            <div style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 15, color: "#fff", textTransform: "uppercase" }}>Telegram</div>
          </a>
        </div>

        {/* ── ГОРОДА ПРИСУТСТВИЯ ── */}
        <div className="mb-7">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="MapPin" size={15} className="text-amber-500" />
            <span style={{ fontFamily: "Oswald" }} className="text-gray-800 font-bold uppercase tracking-wide text-sm">Города присутствия</span>
          </div>
          <div className="rounded-2xl px-4 py-4 shadow-sm" style={{ background: "#fff", border: "1px solid #e8e6e0" }}>
            <div className="flex flex-wrap gap-2">
              {CITIES.map(city => (
                <span key={city}
                  className={`text-[11px] font-semibold rounded-full px-2.5 py-1 ${city === "Новые территории" ? "bg-amber-100 text-amber-700 border border-amber-200" : "bg-gray-100 text-gray-600"}`}>
                  {city}
                </span>
              ))}
            </div>
            <p className="text-gray-400 text-[11px] mt-3">
              Подбираем маршрут из любой точки — уточните у диспетчера
            </p>
          </div>
        </div>

        {/* ── ССЫЛКИ ── */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">Хочу узнать подробнее</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>
        <div className="grid grid-cols-3 gap-2 mb-8">
          {[
            { label: "Калькулятор", icon: "Calculator", href: "/calc" },
            { label: "Тарифы",      icon: "Car",        href: "/tariffs" },
            { label: "Отзывы",      icon: "Star",       href: "/reviews" },
          ].map(l => (
            <a key={l.href} href={l.href}
              className="flex flex-col items-center gap-1.5 rounded-2xl py-3 shadow-sm active:scale-[0.97] transition-transform"
              style={{ background: "#fff", border: "1px solid #e8e6e0" }}>
              <Icon name={l.icon as "Car"} size={18} className="text-amber-500" />
              <span className="text-gray-600 text-[11px] font-semibold text-center leading-tight">{l.label}</span>
            </a>
          ))}
        </div>

        {/* ── ОТЗЫВЫ НА ГЛАВНОЙ ── */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon name="Star" size={15} className="text-amber-500" />
            <span style={{ fontFamily: "Oswald" }} className="text-gray-800 font-bold uppercase tracking-wide text-sm">Отзывы пассажиров</span>
          </div>
          <a href="/reviews" className="text-amber-600 text-[11px] font-bold flex items-center gap-0.5">
            Все <Icon name="ChevronRight" size={12} />
          </a>
        </div>
        <div className="space-y-4">
          {REVIEWS.map(r => (
            <div key={r.name} className="rounded-2xl overflow-hidden shadow-sm" style={{ background: "#fff", border: "1px solid #e8e6e0" }}>
              <div className="flex items-center justify-between px-4 pt-3 pb-2.5">
                <div>
                  <div style={{ fontFamily: "Oswald", fontWeight: 700, fontSize: 15, color: "#1a1a1a" }}>{r.name}</div>
                  <div className="text-gray-400 text-[11px]">{r.route}</div>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => <Icon key={i} name="Star" size={11} className="text-amber-400" />)}
                </div>
              </div>
              <img src={r.img} alt={`Отзыв ${r.name}`} className="w-full h-auto block bg-gray-50" />
            </div>
          ))}
        </div>

      </div>

      {/* ── НИЖНЯЯ ПАНЕЛЬ ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-5 pt-3"
        style={{ background: "linear-gradient(to top,#f5f4f0 70%,rgba(245,244,240,0))" }}>
        <div className="max-w-sm mx-auto grid grid-cols-3 gap-2">
          <a href={PHONE_HREF} onClick={() => ymGoal("bottom_phone")}
            className="flex flex-col items-center justify-center rounded-2xl py-3 gap-1 active:scale-[0.97] transition-transform shadow-md"
            style={{ background: "linear-gradient(135deg,#f59e0b,#fbbf24)" }}>
            <Icon name="Phone" size={18} className="text-white" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>Звонок</span>
          </a>
          <a href={MAX_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("bottom_max")}
            className="flex flex-col items-center justify-center rounded-2xl py-3 gap-1 active:scale-[0.97] transition-transform shadow-md"
            style={{ background: "linear-gradient(135deg,#002d60,#0046a8)" }}>
            <img src={MAX_LOGO} alt="MAX" className="h-5 object-contain" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>MAX</span>
          </a>
          <a href={TG_HREF} target="_blank" rel="noopener noreferrer" onClick={() => ymGoal("bottom_tg")}
            className="flex flex-col items-center justify-center rounded-2xl py-3 gap-1 active:scale-[0.97] transition-transform shadow-md"
            style={{ background: "linear-gradient(135deg,#0a6ebd,#1c8fd8)" }}>
            <Icon name="Send" size={18} className="text-white" />
            <span style={{ fontFamily: "Oswald", fontSize: 12, color: "#fff", fontWeight: 800, textTransform: "uppercase" }}>Telegram</span>
          </a>
        </div>
      </div>

      {/* ── МОДАЛКА iOS ── */}
      {showIosHint && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center px-4 pb-6"
          style={{ background: "rgba(0,0,0,0.45)" }} onClick={() => setShowIosHint(false)}>
          <div className="max-w-sm w-full rounded-3xl p-5 shadow-xl bg-white" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Icon name="Smartphone" size={18} className="text-amber-500" />
                <span style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 16, color: "#1a1a1a", textTransform: "uppercase" }}>Установка на iPhone</span>
              </div>
              <button onClick={() => setShowIosHint(false)} className="text-gray-400">
                <Icon name="X" size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {[
                { n: "1", text: "Нажмите кнопку «Поделиться»", icon: "Share" },
                { n: "2", text: "Выберите «На экран Домой»",   icon: "SquarePlus" },
                { n: "3", text: "Нажмите «Добавить» — готово!", icon: "Check" },
              ].map(s => (
                <div key={s.n} className="flex items-center gap-3 rounded-2xl px-3 py-2.5 bg-gray-50">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 bg-amber-500">
                    <span style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 14, color: "#fff" }}>{s.n}</span>
                  </div>
                  <span className="text-gray-700 text-[13px] flex-1">{s.text}</span>
                  <Icon name={s.icon as "Share"} size={16} className="text-amber-500 shrink-0" />
                </div>
              ))}
            </div>
            <button onClick={() => setShowIosHint(false)}
              className="w-full mt-4 rounded-2xl py-3 active:scale-[0.98] transition-transform bg-amber-500"
              style={{ fontFamily: "Oswald", fontWeight: 800, fontSize: 15, color: "#fff", textTransform: "uppercase" }}>
              Понятно
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
