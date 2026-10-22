import { useEffect } from "react";
import Icon from "@/components/ui/icon";
import { KppList, useKpp } from "@/components/app/KppQueue";
import { reachGoal } from "@/lib/metrika";

const TIPS = [
  "Паспорт РФ на каждого пассажира, у детей — свидетельство о рождении или паспорт",
  "Пропуск или прописка для въезда в некоторые районы — уточните у диспетчера",
  "Не везите оружие, крупные суммы наличных без декларации и запрещённые вещества",
  "Будьте готовы к досмотру багажа и проверке телефона",
];

export default function KppOnline() {
  const { items, reload } = useKpp(45000);

  useEffect(() => {
    document.title = "Очереди на КПП онлайн — Весело-Вознесенка, Успенка, Изварино | Дальняк";
  }, []);

  const share = async () => {
    reachGoal("kpp_share");
    const url = `${window.location.origin}/kpp-online`;
    const text = "Очереди на КПП прямо сейчас — водители отмечают онлайн:";
    if (navigator.share) {
      try { await navigator.share({ title: "Очереди на КПП", text, url }); return; } catch { return; }
    }
    try { await navigator.clipboard.writeText(`${text} ${url}`); window.alert("Ссылка скопирована"); } catch { window.prompt("Скопируйте ссылку", url); }
  };

  const withData = (items || []).filter((k) => k.minutes !== null).length;

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="mx-auto max-w-md space-y-4 p-4 pb-16">
        <div className="flex items-center justify-between pt-2">
          <a href="/" className="text-lg font-extrabold">Дальняк</a>
          <button onClick={reload} aria-label="Обновить" className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"><Icon name="RefreshCw" size={18} /></button>
        </div>

        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-extrabold text-red-600">
            <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> ОНЛАЙН
          </div>
          <h1 className="mt-2 text-[26px] font-extrabold leading-tight">Очереди на КПП прямо сейчас</h1>
          <p className="mt-1 text-sm text-neutral-500">Время ожидания отмечают наши водители, которые стоят на пунктах пропуска. Данные за последние 6 часов.</p>
        </div>

        <div className="rounded-3xl bg-white p-4 shadow-sm">
          {items ? <KppList items={items} /> : <p className="py-6 text-center text-sm text-neutral-500">Загрузка...</p>}
          {items && withData === 0 && <p className="mt-2 rounded-2xl bg-neutral-50 p-3 text-xs text-neutral-500">Свежих отметок пока нет. Водители добавляют их, когда стоят на КПП.</p>}
        </div>

        <button onClick={share} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-sky-500 py-3.5 text-[15px] font-extrabold text-white">
          <Icon name="Share2" size={18} /> Отправить тем, кто едет
        </button>

        <a href="/" onClick={() => reachGoal("kpp_to_app")} className="block rounded-3xl bg-neutral-900 p-5 text-white">
          <div className="text-lg font-extrabold">Едете через КПП?</div>
          <p className="mt-1 text-sm text-neutral-300">Наш водитель сам выберет пункт пропуска с самой короткой очередью. Цена фиксируется сразу, без доплат за ожидание.</p>
          <div className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-[#fcd34d] px-4 py-2.5 font-extrabold text-neutral-900">
            Узнать цену <Icon name="ArrowRight" size={18} />
          </div>
        </a>

        <div className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="mb-2 font-extrabold">Что взять с собой на КПП</div>
          <ul className="space-y-2 text-sm text-neutral-700">
            {TIPS.map((t) => (
              <li key={t} className="flex gap-2"><Icon name="Check" size={16} className="mt-0.5 shrink-0 text-emerald-600" />{t}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
