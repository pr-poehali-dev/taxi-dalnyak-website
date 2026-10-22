import { useState } from "react";
import Icon from "@/components/ui/icon";

export default function DriverInvite({ callsign, invited, trips }: { callsign: string; invited: number; trips: number }) {
  const [copied, setCopied] = useState(false);
  const link = `${window.location.origin}/app/client?ref=D${callsign}`;
  const text = `Езжу на межгороде. Закажите поездку в другой город в приложении — цена сразу, водитель от двери до двери: ${link}`;

  const share = async () => {
    const nav = navigator as Navigator & { share?: (d: { title: string; text: string; url: string }) => Promise<void> };
    if (nav.share) {
      try { await nav.share({ title: "Такси Дальняк", text, url: link }); return; } catch { /* отменили */ }
    }
    try { await navigator.clipboard.writeText(text); } catch { window.prompt("Скопируйте ссылку", text); }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="rounded-3xl bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fcd34d]"><Icon name="UserPlus" size={22} /></span>
        <div>
          <div className="font-extrabold">Пригласи пассажиров</div>
          <div className="text-xs text-neutral-500">Знакомые, попутчики, клиенты с прошлых поездок</div>
        </div>
      </div>
      <p className="mt-3 text-sm text-neutral-600">
        Отправьте свою ссылку. Пассажир, который зарегистрируется по ней, закрепится за вами. Диспетчер это видит и в первую очередь предлагает вам его заказы.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-center">
        <div className="rounded-2xl bg-neutral-50 p-3"><div className="text-xl font-extrabold">{invited}</div><div className="text-xs text-neutral-500">Пришло по ссылке</div></div>
        <div className="rounded-2xl bg-neutral-50 p-3"><div className="text-xl font-extrabold">{trips}</div><div className="text-xs text-neutral-500">Их поездок</div></div>
      </div>
      <button onClick={share} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 py-3.5 font-extrabold text-white">
        <Icon name={copied ? "Check" : "Share2"} size={18} />{copied ? "Ссылка скопирована" : "Поделиться ссылкой"}
      </button>
    </div>
  );
}
