import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Btn } from "./ui";
import { reachGoal } from "@/lib/metrika";
import { trackStep } from "@/lib/funnel";
import { canInstallNatively, installApp, isIos, isStandalone } from "@/lib/pushClient";

export const isMobile = () => /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
export const needsInstall = () => isMobile() && !isStandalone();

export default function InstallGate({ appName, other, onClose }: { who?: string; appName: string; other?: { href: string; text: string }; onClose?: () => void }) {
  const [, force] = useState(0);
  const ios = isIos();
  const native = canInstallNatively();

  const install = async () => {
    await installApp();
    reachGoal("app_install");
    trackStep("install");
    force((n) => n + 1);
  };

  const isClient = appName === "Дальняк";
  return (
    <div className="fixed inset-0 z-[4000] flex flex-col overflow-y-auto bg-neutral-950 text-white" style={{ fontFamily: "Manrope, sans-serif" }}>
      {isClient && <img src="/app/client-hero.webp" alt="" className="absolute inset-x-0 top-0 h-[55vh] w-full object-cover opacity-50" />}
      <div className="absolute inset-x-0 top-0 h-[55vh] bg-gradient-to-b from-transparent via-neutral-950/40 to-neutral-950" />
      {onClose && (
        <button onClick={onClose} aria-label="Закрыть" className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white">
          <Icon name="X" size={22} />
        </button>
      )}
      <div className="relative m-auto w-full max-w-sm px-6 py-10 text-center">
        <img src={isClient ? "/app-icon-192.png" : "/app-icon-driver-192.png"} alt="" className="mx-auto h-24 w-24 rounded-[26px] shadow-2xl ring-4 ring-white/10" />
        <h1 className="mt-6 text-[28px] font-extrabold leading-tight text-white">{isClient ? "Такси Дальняк в вашем телефоне" : "Дальняк Водитель"}</h1>
        <p className="mt-2 text-[15px] text-neutral-300">
          {isClient ? "Заказ междугороднего такси за минуту, цена до поездки, машина на карте." : "Заказы, баланс и чат с пассажирами в одном приложении."}
        </p>
        <ul className="mt-5 space-y-2 text-left text-sm font-semibold text-neutral-100">
          {(isClient
            ? ["Бонусы Копи-км с каждой поездки, только в приложении", "Уведомление, когда машина подъехала, даже при заблокированном экране", "Заказ в одно касание с экрана телефона"]
            : ["Сигнал о новых заказах", "Свободный график", "Междугородние заказы с хорошей ценой"]).map((x) => (
            <li key={x} className="flex items-center gap-2"><Icon name="CircleCheck" size={18} className="shrink-0 text-[#fcd34d]" />{x}</li>
          ))}
        </ul>

        <div className="mt-7">
          {ios ? (
            <ol className="space-y-3 rounded-3xl bg-white/10 p-4 text-left text-sm font-semibold text-white">
              <li>1. Откройте эту страницу в Safari.</li>
              <li>2. Нажмите «Поделиться» внизу экрана.</li>
              <li>3. Выберите «На экран Домой».</li>
              <li>4. Откройте «{appName}» с экрана телефона.</li>
            </ol>
          ) : native ? (
            <Btn onClick={install} className="w-full text-lg">Установить «{appName}»</Btn>
          ) : (
            <ol className="space-y-3 rounded-3xl bg-white/10 p-4 text-left text-sm font-semibold text-white">
              <li>1. Откройте меню браузера (три точки вверху).</li>
              <li>2. Выберите «Установить приложение» или «Добавить на главный экран».</li>
              <li>3. Откройте «{appName}» с экрана телефона.</li>
            </ol>
          )}
        </div>
        <p className="mt-4 text-xs text-neutral-400">Это бесплатно и занимает несколько секунд. Магазин приложений не нужен.</p>
        {onClose && <button onClick={onClose} className="mt-5 w-full rounded-2xl py-3 text-sm font-bold text-neutral-300 underline underline-offset-4">Продолжить в браузере, без бонусов</button>}
        {other && !onClose && <p className="mt-4 rounded-2xl bg-white/10 p-3 text-xs font-semibold text-neutral-200">{other.text}</p>}
      </div>
    </div>
  );
}
