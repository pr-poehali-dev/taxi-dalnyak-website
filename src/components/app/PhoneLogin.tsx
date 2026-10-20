import { useState } from "react";
import { appCall, formatPhone } from "@/lib/appApi";
import { Btn, Field } from "./ui";

interface Props {
  action: "client_login" | "driver_login";
  withName?: boolean;
  withPassword?: boolean;
  hint: string;
  onToken: (t: string) => void;
  extra?: React.ReactNode;
}

export default function PhoneLogin({ action, withName, withPassword, hint, onToken, extra }: Props) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr("");
    try {
      const r = await appCall<{ token: string }>(action, { phone, name, password });
      onToken(r.token);
    } catch (e2) {
      setErr((e2 as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-3 p-5">
      <h1 className="pt-6 text-2xl font-extrabold">Вход по номеру телефона</h1>
      <p className="text-sm text-neutral-500">{hint}</p>
      {withName && <Field label="Как вас зовут" value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" />}
      <Field label="Телефон" type="tel" inputMode="tel" value={phone} onFocus={() => !phone && setPhone("+7")}
        onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="+7 (___) ___-__-__" />
      {withPassword && <Field label="Пароль" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />}
      {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
      <Btn type="submit" disabled={busy || phone.replace(/\D/g, "").length < 11 || (withPassword && password.length < 8)} className="w-full">
        {busy ? "Входим..." : "Продолжить"}
      </Btn>
      <p className="text-center text-xs text-neutral-400">Подтверждение по СМС появится позже.</p>
      {extra}
    </form>
  );
}
