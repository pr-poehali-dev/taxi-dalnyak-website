import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Btn } from "./ui";
import { PHOTO_SLOTS } from "./DriverRegister";
import { compressPhoto } from "@/lib/photo";

export default function DocsRecheck({ fields, note, onSend }: {
  fields: string[]; note: string | null; onSend: (p: Record<string, string>) => Promise<void>;
}) {
  const [photos, setPhotos] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const slots = PHOTO_SLOTS.filter((s) => fields.includes(s.key));

  const pick = async (key: string, file?: File) => {
    if (!file) return;
    try { const d = await compressPhoto(file); setPhotos((p) => ({ ...p, [key]: d })); } catch (e) { setErr((e as Error).message); }
  };

  const send = async () => {
    setBusy(true);
    setErr("");
    try { await onSend(photos); setPhotos({}); } catch (e) { setErr((e as Error).message); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-3 rounded-3xl bg-red-50 p-4 ring-2 ring-red-200">
      <div className="flex items-center gap-2 font-extrabold text-red-700"><Icon name="Camera" size={20} /> Переснимите документы</div>
      {note && <p className="text-sm font-semibold text-red-800">Комментарий диспетчера: {note}</p>}
      <div className="grid grid-cols-2 gap-3">
        {slots.map((s) => (
          <label key={s.key} className="relative flex aspect-[4/3] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-red-300 bg-white text-center text-xs font-bold text-neutral-600">
            {photos[s.key] ? <img src={photos[s.key]} alt={s.label} className="absolute inset-0 h-full w-full object-cover" /> : <><Icon name="Camera" size={22} /><span className="mt-1 px-2">{s.label}</span></>}
            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => pick(s.key, e.target.files?.[0])} />
          </label>
        ))}
      </div>
      {err && <p className="text-sm font-semibold text-red-600">{err}</p>}
      <Btn onClick={send} disabled={busy || Object.keys(photos).length === 0} className="w-full">{busy ? "Отправляем..." : "Отправить фото"}</Btn>
    </div>
  );
}
