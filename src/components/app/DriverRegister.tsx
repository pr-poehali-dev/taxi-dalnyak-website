import { useEffect, useState } from "react";
import { appCall, formatPhone } from "@/lib/appApi";
import { compressPhoto } from "@/lib/photo";
import { Btn, Field } from "./ui";
import Icon from "@/components/ui/icon";
import { reachGoal } from "@/lib/metrika";
import { ConsentCheckbox } from "./DriverConsent";

export const PHOTO_SLOTS = [
  { key: "license", label: "Права, лицевая сторона" },
  { key: "license_back", label: "Права, оборот" },
  { key: "sts", label: "СТС, лицевая сторона" },
  { key: "sts_back", label: "СТС, оборот" },
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
  const [consent, setConsent] = useState(false);
  const [sms, setSms] = useState(false);
  const [codeStep, setCodeStep] = useState(false);
  const [code, setCode] = useState("");
  const [wait, setWait] = useState(0);

  useEffect(() => {
    appCall<{ sms_login?: boolean }>("config").then((c) => setSms(!!c.sms_login)).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (wait <= 0) return;
    const id = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(id);
  }, [wait]);

  const sendCode = async () => {
    setBusy(true);
    setErr("");
    try {
      await appCall("driver_send_code", { phone: f.phone, purpose: "register" });
      setCodeStep(true);
      setCode("");
      setWait(60);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const pick = async (key: string, file?: File) => {
    if (!file) return;
    try {
      const data = await compressPhoto(file);
      setPhotos((p) => ({ ...p, [key]: data }));
    } catch (e) {
      setErr((e as Error).message);
    }
  };

  const ready = f.name && f.car_model && f.car_plate && f.phone.replace(/\D/g, "").length === 11 && (sms || f.password.length >= 8) && PHOTO_SLOTS.every((s) => photos[s.key]) && consent;

  const submit = async () => {
    if (sms && !codeStep) { await sendCode(); return; }
    setBusy(true);
    setErr("");
    try {
      const r = await appCall<{ token: string }>("driver_register", { ...f, photos, pd_consent: consent, code });
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
        onChange={(e) => { setF({ ...f, phone: formatPhone(e.target.value) }); setCodeStep(false); }} placeholder="+7 (___) ___-__-__" />
      {!sms && <Field label="Пароль (не короче 8 символов)" type="password" autoComplete="new-password" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />}
      <Field label="Марка и модель авто" value={f.car_model} onChange={(e) => setF({ ...f, car_model: e.target.value })} placeholder="Toyota Camry" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Госномер" value={f.car_plate} onChange={(e) => setF({ ...f, car_plate: e.target.value })} placeholder="А123ВС77" />
        <Field label="Цвет" value={f.car_color} onChange={(e) => setF({ ...f, car_color: e.target.value })} placeholder="Чёрный" />
      </div>

      <h2 className="pt-2 text-sm font-extrabold uppercase text-neutral-400">Фотографии (все 8)</h2>
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

      <ConsentCheckbox checked={consent} onChange={setConsent} />
      {sms && codeStep && (
        <div className="space-y-2 rounded-2xl bg-neutral-100 p-3">
          <p className="text-sm font-semibold">Мы отправили код в СМС на {f.phone}</p>
          <Field label="Код из СМС" inputMode="numeric" autoComplete="one-time-code" maxLength={4} value={code} autoFocus
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="____" className="text-center text-2xl tracking-[0.5em]" />
          <button type="button" disabled={wait > 0 || busy} onClick={sendCode} className="text-sm font-bold text-sky-700 disabled:text-neutral-400">{wait > 0 ? `Отправить снова через ${wait} с` : "Отправить код снова"}</button>
        </div>
      )}
      {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
      <Btn onClick={submit} disabled={!ready || busy || (sms && codeStep && code.length < 4)} className="w-full">
        {busy ? (sms && !codeStep ? "Отправляем код..." : "Отправляем фото...") : sms && !codeStep ? "Подтвердить номер по СМС" : "Отправить на проверку"}
      </Btn>
    </div>
  );
}
