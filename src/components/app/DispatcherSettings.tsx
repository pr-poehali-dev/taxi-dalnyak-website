import { useState } from "react";
import { Btn, Field } from "./ui";
import { TARIFF_LIST } from "@/lib/appApi";

interface Cfg {
  rates: Record<string, Record<string, number>>; min_price: number; commission_pct: number; priority_price: number;
  priority_days: number; priority_delay_sec: number; dispatcher_alert_min: number; cancel_limit_24h: number; cancel_limit_7d: number;
  payment_info: string; support_telegram: string; support_max: string;
}

export default function DispatcherSettings({ cfg, onSave }: { cfg: Cfg; onSave: (c: Cfg) => void }) {
  const [c, setC] = useState<Cfg>(JSON.parse(JSON.stringify(cfg)));
  const num = (k: keyof Cfg, label: string) => (
    <Field label={label} inputMode="numeric" value={String(c[k])} onChange={(e) => setC({ ...c, [k]: Number(e.target.value.replace(/\D/g, "")) })} />
  );
  const setRate = (region: string, t: string, v: string) =>
    setC({ ...c, rates: { ...c.rates, [region]: { ...c.rates[region], [t]: Number(v.replace(/\D/g, "")) } } });

  return (
    <div className="space-y-3">
      {(["regular", "new"] as const).map((region) => (
        <div key={region} className="rounded-3xl bg-white p-4 shadow-sm">
          <h3 className="mb-2 font-extrabold">{region === "regular" ? "Тариф по России, ₽ за км" : "Новые территории, ₽ за км"}</h3>
          <div className="grid grid-cols-3 gap-2">
            {TARIFF_LIST.map((t) => (
              <Field key={t.id} label={t.name} inputMode="numeric" value={String(c.rates[region][t.id])} onChange={(e) => setRate(region, t.id, e.target.value)} />
            ))}
          </div>
        </div>
      ))}
      <div className="grid grid-cols-2 gap-2 rounded-3xl bg-white p-4 shadow-sm">
        {num("min_price", "Минимальная цена, ₽")}
        {num("commission_pct", "Комиссия, %")}
        {num("priority_price", "Приоритет, ₽")}
        {num("priority_days", "Срок приоритета, дней")}
        {num("priority_delay_sec", "Задержка для остальных, сек")}
        {num("dispatcher_alert_min", "Напомнить мне о заказе без водителя, мин")}
        {num("cancel_limit_24h", "Отказов за сутки до блока")}
        {num("cancel_limit_7d", "Отказов за неделю до блока")}
      </div>
      <div className="space-y-2 rounded-3xl bg-white p-4 shadow-sm">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-neutral-500">Реквизиты для пополнения (видят водители)</span>
          <textarea value={c.payment_info} onChange={(e) => setC({ ...c, payment_info: e.target.value })} rows={3}
            className="w-full rounded-2xl bg-neutral-100 p-3 text-[15px] font-semibold outline-none focus:ring-2 focus:ring-[#fcd34d]" />
        </label>
        <Field label="Telegram поддержки (ссылка или @имя)" value={c.support_telegram} onChange={(e) => setC({ ...c, support_telegram: e.target.value })} />
        <Field label="MAX поддержки (ссылка)" value={c.support_max} onChange={(e) => setC({ ...c, support_max: e.target.value })} />
      </div>
      <Btn onClick={() => onSave(c)} className="w-full">Сохранить настройки</Btn>
    </div>
  );
}
