import { useEffect, useState } from "react";
import { appCall, money, TARIFF_NAME } from "@/lib/appApi";
import { useBackClose } from "@/lib/useBackClose";
import Icon from "@/components/ui/icon";
import { Badge, Btn, Field, tripTone } from "./ui";
import { TRIP_STATUS } from "@/lib/appApi";

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  useBackClose(onClose);
  return (
    <div className="fixed inset-0 z-[2900] flex flex-col bg-neutral-50 text-neutral-900" style={{ fontFamily: "Manrope, sans-serif" }}>
      <div className="flex items-center gap-2 bg-white px-3 py-3 shadow-sm">
        <button onClick={onClose} aria-label="Назад" className="flex h-10 w-10 items-center justify-center"><Icon name="ArrowLeft" size={22} /></button>
        <div className="text-lg font-extrabold">{title}</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 pb-16">{children}</div>
    </div>
  );
}

interface H {
  id: number; from_text: string; to_text: string; status: string; price: number; tariff: string; created_at: string;
  driver_name: string | null; car_model: string | null; car_plate: string | null; distance_km: number | null;
}

export function HistoryPanel({ token, onClose }: { token: string; onClose: () => void }) {
  const [list, setList] = useState<H[] | null>(null);
  useEffect(() => { appCall<{ trips: H[] }>("client_history", {}, token).then((r) => setList(r.trips)).catch(() => setList([])); }, [token]);
  return (
    <Sheet title="История заказов" onClose={onClose}>
      {list === null && <p className="py-10 text-center text-neutral-400">Загружаем...</p>}
      {list && list.length === 0 && <p className="rounded-3xl bg-white p-6 text-center text-sm text-neutral-500">Поездок пока не было. Первая поездка будет здесь.</p>}
      <div className="space-y-2">
        {list?.map((h) => (
          <div key={h.id} className="rounded-3xl bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-neutral-400">
              <span>{new Date(h.created_at).toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" })} · №{h.id}</span>
              <Badge tone={tripTone(h.status)}>{TRIP_STATUS[h.status]}</Badge>
            </div>
            <div className="mt-2 flex gap-2 text-sm"><span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" /><span>{h.from_text}</span></div>
            <div className="mt-1 flex gap-2 text-sm font-bold"><span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-neutral-900" /><span>{h.to_text}</span></div>
            <div className="mt-2 flex items-center justify-between border-t border-neutral-100 pt-2 text-sm">
              <span className="text-neutral-500">{TARIFF_NAME[h.tariff]}{h.distance_km ? ` · ${h.distance_km} км` : ""}</span>
              <b>{money(h.price)}</b>
            </div>
            {h.driver_name && <div className="mt-1 text-xs text-neutral-500">{h.driver_name}, {h.car_model} {h.car_plate}</div>}
          </div>
        ))}
      </div>
    </Sheet>
  );
}

export function PromoPanel({ token, onClose, onDone }: { token: string; onClose: () => void; onDone: () => void }) {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const apply = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const r = await appCall<{ message: string }>("client_apply_code", { code }, token);
      setMsg({ ok: true, text: r.message });
      setCode("");
      onDone();
    } catch (e) { setMsg({ ok: false, text: (e as Error).message }); }
    setBusy(false);
  };
  return (
    <Sheet title="Промокоды" onClose={onClose}>
      <div className="space-y-3 rounded-3xl bg-white p-4 shadow-sm">
        <p className="text-sm text-neutral-600">Введите промокод или код друга. Промокод начислит километры на ваш счёт.</p>
        <Field value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Например, DALNYAK" autoCapitalize="characters" />
        {msg && <p className={`rounded-2xl p-3 text-sm font-semibold ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>{msg.text}</p>}
        <Btn onClick={apply} disabled={busy || code.trim().length < 3} className="w-full">{busy ? "Проверяем..." : "Применить"}</Btn>
      </div>
    </Sheet>
  );
}

interface B { km: number; ref_code: string; earn_pct: number; max_pct: number; ref_km: number; friends: number; log: { id: number; amount: number; reason: string; created_at: string }[] }

export function BonusPanel({ token, onClose }: { token: string; onClose: () => void }) {
  const [b, setB] = useState<B | null>(null);
  useEffect(() => { appCall<B>("client_bonus", {}, token).then(setB).catch(() => undefined); }, [token]);
  const link = b ? `${window.location.origin}/app/client?ref=${b.ref_code}` : "";
  const share = async () => {
    if (!b) return;
    const text = `Езжу в Дальняк: междугороднее такси по фиксированной цене. Мой код ${b.ref_code}: после первой поездки получим по ${b.ref_km} км.`;
    if (navigator.share) { try { await navigator.share({ title: "Такси Дальняк", text, url: link }); return; } catch { return; } }
    try { await navigator.clipboard.writeText(`${text} ${link}`); window.alert("Ссылка скопирована. Отправьте её другу."); } catch { window.prompt("Скопируйте ссылку", link); }
  };
  return (
    <Sheet title="Копи-км" onClose={onClose}>
      {!b ? <p className="py-10 text-center text-neutral-400">Загружаем...</p> : (
        <div className="space-y-3">
          <div className="rounded-3xl bg-neutral-900 p-5 text-white">
            <div className="text-xs font-bold uppercase text-neutral-400">Ваш счёт</div>
            <div className="mt-1 text-4xl font-extrabold text-[#fcd34d]">{b.km} км</div>
            <p className="mt-2 text-sm text-neutral-300">Километры можно потратить на следующую поездку: скидка до {b.max_pct}% от стоимости заказа.</p>
          </div>
          <div className="space-y-2 rounded-3xl bg-white p-4 text-sm shadow-sm">
            <div className="font-extrabold">Как копить</div>
            <div className="flex gap-2"><Icon name="Car" size={18} className="mt-0.5 shrink-0" /><span>За каждую завершённую поездку возвращаем {b.earn_pct}% от её километров.</span></div>
            <div className="flex gap-2"><Icon name="Users" size={18} className="mt-0.5 shrink-0" /><span>Пригласите друга: после его первой поездки вы оба получите по {b.ref_km} км.</span></div>
            <div className="flex gap-2"><Icon name="Ticket" size={18} className="mt-0.5 shrink-0" /><span>Промокоды тоже начисляют километры.</span></div>
          </div>
          <div className="rounded-3xl bg-white p-4 shadow-sm">
            <div className="text-xs font-bold uppercase text-neutral-400">Ваш код для друзей</div>
            <div className="mt-1 text-3xl font-extrabold tracking-widest">{b.ref_code}</div>
            <div className="mt-1 text-sm text-neutral-500">Друзей приглашено: {b.friends}</div>
            <Btn onClick={share} className="mt-3 w-full">Поделиться с другом</Btn>
          </div>
          {b.log.length > 0 && (
            <div className="rounded-3xl bg-white p-4 shadow-sm">
              <div className="mb-2 font-extrabold">История начислений</div>
              {b.log.map((l) => (
                <div key={l.id} className="flex items-center justify-between border-t border-neutral-100 py-2 text-sm first:border-0">
                  <span className="min-w-0 pr-2"><span className="block truncate font-semibold">{l.reason}</span><span className="text-xs text-neutral-400">{new Date(l.created_at).toLocaleDateString("ru-RU")}</span></span>
                  <b className={l.amount > 0 ? "text-emerald-600" : "text-neutral-700"}>{l.amount > 0 ? "+" : ""}{l.amount} км</b>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}

export function ProfilePanel({ token, name, phone, onClose, onDone }: { token: string; name: string; phone: string; onClose: () => void; onDone: () => void }) {
  const [v, setV] = useState(name);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);
  const save = async () => {
    setErr("");
    try { await appCall("client_update_profile", { name: v }, token); setOk(true); onDone(); } catch (e) { setErr((e as Error).message); }
  };
  return (
    <Sheet title="Мой профиль" onClose={onClose}>
      <div className="space-y-3 rounded-3xl bg-white p-4 shadow-sm">
        <Field label="Как к вам обращаться" value={v} onChange={(e) => { setV(e.target.value); setOk(false); }} maxLength={80} placeholder="Имя" />
        <div>
          <span className="mb-1 block text-xs font-semibold text-neutral-500">Телефон для входа</span>
          <div className="rounded-2xl bg-neutral-100 px-4 py-3.5 text-[15px] font-semibold text-neutral-500">{phone}</div>
          <p className="mt-1 text-xs text-neutral-400">Чтобы сменить номер, напишите в поддержку.</p>
        </div>
        {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
        <Btn onClick={save} disabled={!v.trim() || v.trim() === name} className="w-full">{ok ? "Сохранено" : "Сохранить"}</Btn>
      </div>
    </Sheet>
  );
}
