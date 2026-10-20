import func2url from "../../backend/func2url.json";

const URL_API = (func2url as Record<string, string>)["taxi-api"];

export type Role = "client" | "driver" | "dispatcher";

export class AppApiError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.code = code;
  }
}

export async function appCall<T = any>(action: string, body: Record<string, unknown> = {}, token?: string | null): Promise<T> {
  const res = await fetch(URL_API, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { "X-Auth-Token": token } : {}) },
    body: JSON.stringify({ action, ...body }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new AppApiError(res.status, data.error || "Ошибка соединения");
  return data as T;
}

export const TRIP_STATUS: Record<string, string> = {
  new: "Ищем водителя",
  assigned: "Водитель назначен",
  arrived: "Водитель на месте",
  in_progress: "В пути",
  done: "Завершён",
  cancelled: "Отменён",
};

export const DRIVER_STATUS: Record<string, string> = {
  pending: "На проверке",
  approved: "Одобрен",
  rejected: "Отклонён",
};

export function money(v: number | string | null | undefined) {
  return `${Math.round(Number(v || 0)).toLocaleString("ru-RU")} ₽`;
}

export function formatPhone(raw: string) {
  let d = raw.replace(/\D/g, "");
  if (d.startsWith("8")) d = "7" + d.slice(1);
  if (!d.startsWith("7")) d = "7" + d;
  d = d.slice(0, 11);
  const p = [d.slice(1, 4), d.slice(4, 7), d.slice(7, 9), d.slice(9, 11)];
  let out = "+7";
  if (p[0]) out += ` (${p[0]}`;
  if (p[0].length === 3) out += ")";
  if (p[1]) out += ` ${p[1]}`;
  if (p[2]) out += `-${p[2]}`;
  if (p[3]) out += `-${p[3]}`;
  return out;
}
