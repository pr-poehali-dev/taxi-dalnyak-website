import { useEffect, useState } from "react";
import { appCall, formatPhone } from "@/lib/appApi";
import { Btn, Field } from "./ui";
import { reachGoal } from "@/lib/metrika";
import { ConsentCheckbox } from "./DriverConsent";

interface Props {
  action: "client_login" | "driver_login";
  withName?: boolean;
  withPassword?: boolean;
  hint: string;
  onToken: (t: string) => void;
  extra?: React.ReactNode;
  heading?: string;
  bare?: boolean;
}

export default function PhoneLogin({ action, withName, withPassword, hint, onToken, extra, heading, bare }: Props) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [sms, setSms] = useState(false);
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [code, setCode] = useState("");
  const [wait, setWait] = useState(0);
  const isClient = action === "client_login";
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    appCall<{ sms_login?: boolean }>("config").then((c) => setSms(!!c.sms_login)).catch(() => undefined);
  }, [action]);

  useEffect(() => {
    if (wait <= 0) return;
    const id = window.setTimeout(() => setWait((w) => w - 1), 1000);
    return () => window.clearTimeout(id);
  }, [wait]);

  const sendCode = async () => {
    setBusy(true);
    setErr("");
    try {
      await appCall(isClient ? "client_send_code" : "driver_send_code", { phone, pd_consent: consent });
      setStep("code");
      setCode("");
      setWait(60);
    } catch (e2) {
      setErr((e2 as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sms && step === "phone") { await sendCode(); return; }
    setBusy(true);
    setErr("");
    try {
      const r = await appCall<{ token: string; is_new?: boolean }>(action, { phone, name, password, code, ref: localStorage.getItem("app_ref") || undefined, ...(isClient ? { pd_consent: consent } : {}) });
      if (action === "client_login" && r.is_new) reachGoal("app_signup");
      onToken(r.token);
    } catch (e2) {
      setErr((e2 as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto max-w-md space-y-3 p-5">
      {!bare && <h1 className={`${heading ? "pt-1" : "pt-6"} text-2xl font-extrabold`}>{heading || "Вход по номеру телефона"}</h1>}
      {!bare && <p className="text-sm text-neutral-500">{sms && !isClient ? "Введите номер телефона, указанный при регистрации. Мы пришлём код в СМС." : hint}</p>}
      {step === "phone" && withName && <Field label="Как вас зовут" value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" />}
      {step === "phone" && <Field label="Телефон" type="tel" inputMode="tel" value={phone} onFocus={() => !phone && setPhone("+7")}
        onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="+7 (___) ___-__-__" />}
      {step === "code" && (
        <>
          <p className="rounded-2xl bg-neutral-100 p-3 text-sm font-semibold">Мы отправили код в СМС на {phone}</p>
          <Field label="Код из СМС" inputMode="numeric" autoComplete="one-time-code" maxLength={4} value={code} autoFocus
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="____" className="text-center text-2xl tracking-[0.5em]" />
          <div className="flex items-center justify-between text-sm">
            <button type="button" onClick={() => { setStep("phone"); setErr(""); }} className="font-semibold text-neutral-500">Изменить номер</button>
            <button type="button" disabled={wait > 0 || busy} onClick={sendCode} className="font-bold text-sky-700 disabled:text-neutral-400">{wait > 0 ? `Отправить снова через ${wait} с` : "Отправить код снова"}</button>
          </div>
        </>
      )}
      {withPassword && !sms && <Field label="Пароль" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />}
      {isClient && step === "phone" && <ConsentCheckbox who="client" checked={consent} onChange={setConsent} />}
      {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
      <Btn type="submit" disabled={busy || phone.replace(/\D/g, "").length < 11 || (isClient && !consent) || (withPassword && !sms && password.length < 8) || (step === "code" && code.length < 4)} className="w-full">
        {busy ? "Подождите..." : sms ? (step === "phone" ? "Получить код в СМС" : "Войти") : "Продолжить"}
      </Btn>
      {extra}
    </form>
  );
}
