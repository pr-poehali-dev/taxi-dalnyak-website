import Icon from "@/components/ui/icon";
import { reachGoal } from "@/lib/metrika";

export default function DriverBanner() {
  return (
    <a href="/app/driver" onClick={() => reachGoal("app_driver_banner")}
      className="flex items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-3.5 text-[15px] font-extrabold text-white">
      Стать водителем <Icon name="ArrowRight" size={18} />
    </a>
  );
}
