import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";
import { askNotifications, isIos, isStandalone, pushSupported, subscribePush } from "@/lib/pushClient";
import type { Role } from "@/lib/appApi";

export default function PushBanner({ role, token }: { role: Role; token: string }) {
  const [perm, setPerm] = useState<NotificationPermission>(typeof Notification !== "undefined" ? Notification.permission : "denied");

  useEffect(() => {
    if (perm === "granted") subscribePush(role, token).catch(() => undefined);
  }, [perm, role, token]);

  if (!pushSupported() || perm === "granted") return null;
  if (isIos() && !isStandalone()) return null;

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-3 ring-1 ring-red-200">
      <Icon name="BellOff" size={22} className="shrink-0 text-red-600" />
      <div className="flex-1 text-sm">
        <div className="font-extrabold text-red-700">Уведомления выключены</div>
        <div className="text-red-600">{perm === "denied" ? "Разрешите их в настройках браузера для этого сайта" : "Вы не узнаете о заказах и сообщениях при закрытом приложении"}</div>
      </div>
      {perm !== "denied" && (
        <button onClick={async () => setPerm(await askNotifications())} className="rounded-xl bg-red-600 px-3 py-2 text-sm font-bold text-white">Включить</button>
      )}
    </div>
  );
}
