import { useState } from "react";
import Icon from "@/components/ui/icon";
import { DriverConsentText, DriverPolicyText } from "@/pages/DriverPrivacy";
import { ClientConsentText, ClientPolicyText } from "@/pages/ClientPrivacy";

export function ConsentCheckbox({ checked, onChange, who = "driver" }: { checked: boolean; onChange: (v: boolean) => void; who?: "driver" | "client" }) {
  const client = who === "client";
  const Consent = client ? ClientConsentText : DriverConsentText;
  const Policy = client ? ClientPolicyText : DriverPolicyText;
  const [doc, setDoc] = useState<null | "consent" | "policy">(null);
  return (
    <>
      <div className="flex items-start gap-3 rounded-2xl bg-neutral-100 p-3">
        <input id={`pd-consent-${who}`} type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-neutral-900" />
        <label htmlFor={`pd-consent-${who}`} className="text-sm text-neutral-700">
          Я ознакомлен(а) с{" "}
          <button type="button" onClick={() => setDoc("policy")} className="font-bold text-sky-700 underline">Политикой обработки персональных данных</button>{" "}
          и даю{" "}
          <button type="button" onClick={() => setDoc("consent")} className="font-bold text-sky-700 underline">согласие на обработку</button>{" "}
          {client ? "моих персональных данных (152-ФЗ)" : "моих данных, включая фото водительского удостоверения и СТС (152-ФЗ)"}
        </label>
      </div>
      {!client && (
        <div className="flex items-start gap-2 text-xs text-neutral-500">
          <Icon name="ShieldCheck" size={16} className="shrink-0 text-emerald-600" />
          Фото документов шифруются сразу при загрузке и доступны только диспетчеру сервиса. Пассажиры их не видят.
        </div>
      )}
      {doc && (
        <div className="fixed inset-0 z-[6000] flex flex-col bg-white">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <b className="text-neutral-900">{doc === "consent" ? "Согласие на обработку данных" : "Политика обработки данных"}</b>
            <button type="button" onClick={() => setDoc(null)} aria-label="Закрыть" className="p-1"><Icon name="X" size={22} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">{doc === "consent" ? <Consent /> : <Policy />}</div>
          <div className="border-t p-4">
            <button type="button" onClick={() => { onChange(true); setDoc(null); }} className="w-full rounded-2xl bg-[#fcd34d] py-3.5 font-extrabold text-neutral-900">Ознакомлен(а), согласен(на)</button>
          </div>
        </div>
      )}
    </>
  );
}

export default function DriverConsentGate({ onAgree }: { onAgree: () => Promise<void> }) {
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <div className="fixed inset-0 z-[4500] flex items-end bg-black/60">
      <div className="max-h-[92vh] w-full space-y-3 overflow-y-auto rounded-t-[28px] bg-white p-5 pb-8">
        <div className="flex items-center gap-2 text-lg font-extrabold text-neutral-900"><Icon name="ShieldCheck" size={22} className="text-emerald-600" />Защита ваших данных</div>
        <p className="text-sm text-neutral-600">
          Мы обновили правила хранения документов: фото прав и СТС теперь хранятся в зашифрованном виде. По закону о персональных данных
          нам нужно ваше согласие на их обработку, чтобы вы могли и дальше получать заказы.
        </p>
        <ConsentCheckbox checked={ok} onChange={setOk} />
        {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
        <button disabled={!ok || busy} onClick={async () => { setBusy(true); setErr(""); try { await onAgree(); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); } }}
          className="w-full rounded-2xl bg-neutral-900 py-3.5 font-extrabold text-white disabled:opacity-40">{busy ? "Сохраняем..." : "Продолжить"}</button>
      </div>
    </div>
  );
}
