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
  enroute: "Водитель выехал",
  arrived: "Водитель на месте",
  in_progress: "В пути",
  done: "Завершён",
  cancelled: "Отменён",
};

export const DRIVER_STATUS: Record<string, string> = {
  pending: "На проверке",
  approved: "Одобрен",
  rejected: "Отклонён",
  blocked: "Заблокирован",
};

export type Tariff = "standard" | "comfort" | "minivan";
export const TARIFF_LIST: { id: Tariff; name: string; cars: string; seats: string; img: string; icon: string }[] = [
  { id: "standard", name: "Стандарт", cars: "Kia Rio, Hyundai Solaris, VW Polo, Skoda Rapid", seats: "Седан, до 4 пассажиров", img: "/app/car-standard.webp", icon: "Car" },
  { id: "comfort", name: "Комфорт", cars: "Toyota Camry, Kia K5, Skoda Octavia, Hyundai Sonata", seats: "Просторный салон, до 4 пассажиров", img: "/app/car-comfort.webp", icon: "Car" },
  { id: "minivan", name: "Минивэн", cars: "Kia Carnival, Hyundai Staria, Hyundai Starex, Toyota Alphard", seats: "До 6 пассажиров, много багажа", img: "/app/car-minivan.webp", icon: "Bus" },
];
export const TARIFF_NAME: Record<string, string> = { standard: "Стандарт", comfort: "Комфорт", minivan: "Минивэн" };

export function whenText(iso: string | null | undefined) {
  if (!iso) return "Сейчас";
  return new Date(iso).toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
}

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
