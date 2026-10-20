import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Btn } from "./ui";
import { reachGoal } from "@/lib/metrika";
import { canInstallNatively, installApp, isIos, isStandalone } from "@/lib/pushClient";

export const isMobile = () => /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);
export const needsInstall = () => isMobile() && !isStandalone();

export default function InstallGate({ who }: { who: string }) {
  const [, force] = useState(0);
  const ios = isIos();
  const native = canInstallNatively();

  const install = async () => {
    await installApp();
    reachGoal("app_install");
    force((n) => n + 1);
  };

  return (
    <div className="fixed inset-0 z-[4000] flex flex-col overflow-y-auto bg-white p-6 text-neutral-900" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="m-auto w-full max-w-sm text-center">
        <span className="mx-auto flex h-24 w-24 items-center justify-center rounded-[28px] bg-[#fcd34d]">
          <Icon name="Smartphone" size={44} />
        </span>
        <h1 className="mt-6 text-2xl font-extrabold text-neutral-900">Установите приложение</h1>
        <p className="mt-2 text-neutral-600">{who} работает только из установленного приложения. Так вы получаете уведомления о заказах, даже когда телефон заблокирован.</p>

        {ios ? (
          <ol className="mt-6 space-y-3 rounded-3xl bg-neutral-100 p-4 text-left text-sm font-semibold text-neutral-800">
            <li>1. Откройте эту страницу в Safari.</li>
            <li>2. Нажмите кнопку «Поделиться» внизу экрана.</li>
            <li>3. Выберите «На экран Домой».</li>
            <li>4. Откройте приложение «Дальняк» с экрана телефона.</li>
          </ol>
        ) : native ? (
          <Btn onClick={install} className="mt-6 w-full text-lg">Установить приложение</Btn>
        ) : (
          <ol className="mt-6 space-y-3 rounded-3xl bg-neutral-100 p-4 text-left text-sm font-semibold text-neutral-800">
            <li>1. Откройте меню браузера (три точки вверху).</li>
            <li>2. Выберите «Установить приложение» или «Добавить на главный экран».</li>
            <li>3. Откройте приложение «Дальняк» с экрана телефона.</li>
          </ol>
        )}
      </div>
    </div>
  );
}
