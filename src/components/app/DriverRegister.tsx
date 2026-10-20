import { useState } from "react";
import { appCall, formatPhone } from "@/lib/appApi";
import { compressPhoto } from "@/lib/photo";
import { Btn, Field } from "./ui";
import Icon from "@/components/ui/icon";
import { reachGoal } from "@/lib/metrika";

export const PHOTO_SLOTS = [
  { key: "license", label: "Водительское удостоверение" },
  { key: "sts", label: "СТС" },
  { key: "car_front", label: "Авто спереди" },
  { key: "car_back", label: "Авто сзади" },
  { key: "car_left", label: "Авто слева" },
  { key: "car_right", label: "Авто справа" },
];

export default function DriverRegister({ onToken, onBack }: { onToken: (t: string) => void; onBack: () => void }) {
  const [f, setF] = useState({ name: "", phone: "", car_model: "", car_plate: "", car_color: "", password: "" });
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const pick = async (key: string, file?: File) => {
    if (!file) return;
    try {
      const data = await compressPhoto(file);
      setPhotos((p) => ({ ...p, [key]: data }));
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const ready = f.name && f.car_model && f.car_plate && f.phone.replace(/\D/g, "").length === 11 && f.password.length >= 8 && PHOTO_SLOTS.every((s) => photos[s.key]);

  const submit = async () => {
    setBusy(true);
    setErr("");
    try {
      const r = await appCall<{ token: string }>("driver_register", { ...f, photos });
      reachGoal("app_driver_signup");
      onToken(r.token);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md space-y-3 p-5">
      <button onClick={onBack} className="text-sm font-semibold text-neutral-500">← Назад</button>
      <h1 className="text-2xl font-extrabold">Регистрация водителя</h1>
      <Field label="Имя и фамилия" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <Field label="Телефон" type="tel" value={f.phone} onFocus={() => !f.phone && setF({ ...f, phone: "+7" })}
        onChange={(e) => setF({ ...f, phone: formatPhone(e.target.value) })} placeholder="+7 (___) ___-__-__" />
      <Field label="Пароль (не короче 8 символов)" type="password" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
      <Field label="Марка и модель авто" value={f.car_model} onChange={(e) => setF({ ...f, car_model: e.target.value })} placeholder="Toyota Camry" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Госномер" value={f.car_plate} onChange={(e) => setF({ ...f, car_plate: e.target.value })} placeholder="А123ВС77" />
        <Field label="Цвет" value={f.car_color} onChange={(e) => setF({ ...f, car_color: e.target.value })} placeholder="Чёрный" />
      </div>

      <h2 className="pt-2 text-sm font-extrabold uppercase text-neutral-400">Фотографии (все 6)</h2>
      <div className="grid grid-cols-2 gap-3">
        {PHOTO_SLOTS.map((s) => (
          <label key={s.key} className="relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-neutral-300 bg-white text-center text-xs font-bold text-neutral-500">
            {photos[s.key] ? (
              <img src={photos[s.key]} alt={s.label} className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <>
                <Icon name="Camera" size={22} />
                <span className="mt-1 px-2">{s.label}</span>
              </>
            )}
            {photos[s.key] && <span className="absolute bottom-0 left-0 right-0 bg-black/60 py-1 text-[11px] text-white">{s.label}</span>}
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => pick(s.key, e.target.files?.[0])} />
          </label>
        ))}
      </div>

      {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
      <Btn onClick={submit} disabled={!ready || busy} className="w-full">{busy ? "Отправляем фото..." : "Отправить на проверку"}</Btn>
    </div>
  );
}
