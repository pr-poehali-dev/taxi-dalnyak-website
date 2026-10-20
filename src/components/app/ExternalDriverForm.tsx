import { useState } from "react";
import { Btn, Field } from "./ui";
import { formatPhone } from "@/lib/appApi";

export interface ExternalDriver { name: string; phone: string; car_model: string; car_plate: string; car_color: string; eta_minutes: string }

export default function ExternalDriverForm({ onSubmit, onCancel }: { onSubmit: (v: ExternalDriver) => void; onCancel: () => void }) {
  const [v, setV] = useState<ExternalDriver>({ name: "", phone: "", car_model: "", car_plate: "", car_color: "", eta_minutes: "" });
  const set = (k: keyof ExternalDriver, val: string) => setV((x) => ({ ...x, [k]: val }));
  const ok = v.name.trim() && v.car_model.trim() && v.car_plate.trim();
  return (
    <div className="space-y-2 rounded-2xl bg-amber-50 p-3">
      <div className="font-extrabold text-amber-900">Водитель не из системы</div>
      <p className="text-xs text-amber-800">Клиент увидит имя, марку и номер машины. Телефон водителя клиенту покажется кнопкой «Позвонить».</p>
      <Field label="Имя водителя" value={v.name} onChange={(e) => set("name", e.target.value)} placeholder="Сергей" />
      <Field label="Телефон водителя" type="tel" value={v.phone} onFocus={() => !v.phone && set("phone", "+7")} onChange={(e) => set("phone", formatPhone(e.target.value))} placeholder="+7 (___) ___-__-__" />
      <Field label="Марка и модель" value={v.car_model} onChange={(e) => set("car_model", e.target.value)} placeholder="Toyota Camry" />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Госномер" value={v.car_plate} onChange={(e) => set("car_plate", e.target.value)} placeholder="А123ВС77" />
        <Field label="Цвет" value={v.car_color} onChange={(e) => set("car_color", e.target.value)} placeholder="Чёрный" />
      </div>
      <Field label="Приедет через, минут (необязательно)" inputMode="numeric" value={v.eta_minutes} onChange={(e) => set("eta_minutes", e.target.value.replace(/\D/g, ""))} placeholder="30" />
      <div className="flex gap-2">
        <Btn disabled={!ok} onClick={() => onSubmit(v)} className="flex-1 !py-3">Отдать заказ</Btn>
        <Btn kind="ghost" onClick={onCancel} className="!py-3">Отмена</Btn>
      </div>
    </div>
  );
}
