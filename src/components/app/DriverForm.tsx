import { useState } from "react";
import { Btn, Field } from "./ui";
import { TARIFF_LIST, formatPhone } from "@/lib/appApi";

export interface DriverFormValue {
  name: string; callsign: string; phone: string; car_model: string; car_plate: string; car_color: string; tariffs: string[];
}

export default function DriverForm({ initial, editing, onSave, onCancel }: {
  initial?: Partial<DriverFormValue>; editing?: boolean; onSave: (v: DriverFormValue) => void; onCancel: () => void;
}) {
  const [v, setV] = useState<DriverFormValue>({
    name: "", callsign: "", phone: "", car_model: "", car_plate: "", car_color: "", tariffs: ["standard"], ...initial,
  });
  const toggle = (id: string) => setV({ ...v, tariffs: v.tariffs.includes(id) ? v.tariffs.filter((x) => x !== id) : [...v.tariffs, id] });
  const ok = v.name.trim() && v.car_model.trim() && v.car_plate.trim() && (editing || v.phone.replace(/\D/g, "").length === 11);
  return (
    <div className="space-y-2 rounded-3xl bg-white p-4 shadow-sm">
      <h3 className="font-extrabold">{editing ? "Данные водителя" : "Новый водитель"}</h3>
      <div className="grid grid-cols-[1fr_120px] gap-2">
        <Field label="Имя водителя" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} />
        <Field label="Позывной №" inputMode="numeric" value={v.callsign} maxLength={6} onChange={(e) => setV({ ...v, callsign: e.target.value.replace(/\D/g, "") })} placeholder="авто" />
      </div>
      {!editing && <Field label="Телефон" type="tel" inputMode="tel" value={v.phone} onFocus={() => !v.phone && setV({ ...v, phone: "+7" })}
        onChange={(e) => setV({ ...v, phone: formatPhone(e.target.value) })} placeholder="+7 (___) ___-__-__" />}
      <Field label="Марка и модель" value={v.car_model} onChange={(e) => setV({ ...v, car_model: e.target.value })} placeholder="Kia Rio" />
      <div className="grid grid-cols-2 gap-2">
        <Field label="Госномер" value={v.car_plate} onChange={(e) => setV({ ...v, car_plate: e.target.value })} placeholder="А123ВС77" />
        <Field label="Цвет" value={v.car_color} onChange={(e) => setV({ ...v, car_color: e.target.value })} placeholder="Белый" />
      </div>
      {!editing && (
        <div className="flex gap-2">
          {TARIFF_LIST.map((t) => (
            <button key={t.id} type="button" onClick={() => toggle(t.id)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-bold ${v.tariffs.includes(t.id) ? "bg-neutral-900 text-white" : "bg-neutral-100 text-neutral-500"}`}>{t.name}</button>
          ))}
        </div>
      )}
      <div className="flex gap-2 pt-1">
        <Btn onClick={() => onSave(v)} disabled={!ok} className="flex-[2]">{editing ? "Сохранить" : "Добавить водителя"}</Btn>
        <Btn kind="ghost" onClick={onCancel} className="flex-1">Отмена</Btn>
      </div>
    </div>
  );
}
