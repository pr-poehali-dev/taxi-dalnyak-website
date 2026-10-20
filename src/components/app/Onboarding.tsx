import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { Btn } from "./ui";
import {
  askLocation, askNotifications, canInstallNatively, installApp, isIos, isStandalone, pushSupported, subscribePush,
} from "@/lib/pushClient";
import type { Role } from "@/lib/appApi";
import { reachGoal } from "@/lib/metrika";

interface Props {
  role: Role;
  token: string;
  needLocation: boolean;
  onDone: () => void;
}

export default function Onboarding({ role, token, needLocation, onDone }: Props) {
  const [installed, setInstalled] = useState(isStandalone());
  const [notif, setNotif] = useState(typeof Notification !== "undefined" ? Notification.permission : "denied");
  const [geo, setGeo] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const ios = isIos();
  const canPush = pushSupported() && (!ios || installed);

  useEffect(() => {
    if (notif === "granted") subscribePush(role, token).then(() => reachGoal("app_push_on")).catch(() => undefined);
  }, [notif, role, token]);

  const doInstall = async () => {
    if (canInstallNatively()) {
      await installApp();
      setInstalled(isStandalone());
    }
  };

  const doNotif = async () => {
    setBusy(true);
    const r = await askNotifications();
    setNotif(r);
    setBusy(false);
  };

  const doGeo = async () => {
    setBusy(true);
    setGeo(await askLocation());
    setBusy(false);
  };

  const notifOk = notif === "granted";
  const geoOk = !needLocation || geo === true;
  const allowSkip = !canPush && !pushSupported();
  const ready = (notifOk || allowSkip) && geoOk;

  const Step = ({ icon, title, text, done, action, label, disabled }: {
    icon: string; title: string; text: string; done: boolean; action?: () => void; label?: string; disabled?: boolean;
  }) => (
    <div className="flex gap-3 rounded-3xl bg-white p-4 shadow-sm">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${done ? "bg-emerald-100 text-emerald-700" : "bg-[#fcd34d]"}`}>
        <Icon name={done ? "Check" : icon} fallback="Bell" size={22} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-extrabold">{title}</div>
        <div className="text-sm text-neutral-500">{text}</div>
        {!done && action && (
          <button onClick={action} disabled={busy || disabled} className="mt-2 rounded-xl bg-neutral-900 px-4 py-2 text-sm font-bold text-white disabled:opacity-40">
            {label}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[3000] overflow-y-auto bg-neutral-50 p-5 text-neutral-900" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="mx-auto max-w-md space-y-3 pb-10 pt-6">
        <h1 className="text-2xl font-extrabold">Настроим приложение</h1>
        <p className="text-sm text-neutral-500">Три быстрых шага, чтобы не пропустить ни одного сообщения о заказе.</p>

        <Step icon="Smartphone" title="Установите на экран «Домой»" done={installed}
          text={ios ? "В Safari нажмите «Поделиться», затем «На экран Домой». Без этого уведомления на iPhone не работают." : canInstallNatively() ? "Приложение будет открываться как обычное, в один касание." : "В меню браузера выберите «Установить приложение» или «Добавить на главный экран»."}
          action={ios ? undefined : doInstall} label="Установить" disabled={!canInstallNatively() && !ios} />

        <Step icon="Bell" title="Разрешите уведомления" done={notifOk}
          text={ios && !installed ? "Сначала установите приложение на экран «Домой», потом включите уведомления." : notif === "denied" ? "Уведомления запрещены. Включите их в настройках браузера для этого сайта." : role === "driver" ? "Новые заказы и сообщения придут, даже если приложение закрыто." : "Мы сообщим, что машина выехала, приехала и о сообщениях водителя."}
          action={doNotif} label="Разрешить уведомления" disabled={!canPush || notif === "denied"} />

        {needLocation && (
          <Step icon="MapPin" title="Разрешите геолокацию" done={geo === true}
            text={geo === false ? "Доступ закрыт. Включите геолокацию в настройках телефона и браузера." : role === "driver" ? "Клиент видит, как вы подъезжаете, а система находит заказы рядом." : "Мы определим точку подачи автоматически, не придётся вводить адрес."}
            action={doGeo} label="Разрешить геолокацию" />
        )}

        <Btn onClick={onDone} disabled={!ready} className="mt-2 w-full text-lg">Продолжить</Btn>
      </div>
    </div>
  );
}
