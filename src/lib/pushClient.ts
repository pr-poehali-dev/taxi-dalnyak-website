import { appCall, Role } from "./appApi";

function b64ToBytes(s: string) {
  const pad = "=".repeat((4 - (s.length % 4)) % 4);
  const raw = atob((s + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

function toB64(buf: ArrayBuffer | null) {
  if (!buf) return "";
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export const pushSupported = () => "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

export const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || (navigator as unknown as { standalone?: boolean }).standalone === true;

export const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

export async function subscribePush(role: Role, token: string): Promise<boolean> {
  if (!pushSupported() || Notification.permission !== "granted") return false;
  const cfg = await appCall<{ vapid_public: string }>("config");
  const reg = await navigator.serviceWorker.ready;
  let sub = await reg.pushManager.getSubscription();
  if (!sub) {
    sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64ToBytes(cfg.vapid_public) });
  }
  await appCall(`${role === "dispatcher" ? "disp" : role}_push_subscribe`, {
    endpoint: sub.endpoint,
    p256dh: toB64(sub.getKey("p256dh")),
    auth: toB64(sub.getKey("auth")),
  }, token);
  return true;
}

export async function askNotifications(): Promise<NotificationPermission> {
  if (!("Notification" in window)) return "denied";
  return Notification.requestPermission();
}

export function askLocation(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(false);
    navigator.geolocation.getCurrentPosition(() => resolve(true), () => resolve(false), { enableHighAccuracy: true, timeout: 15000 });
  });
}

let deferred: (Event & { prompt: () => Promise<void> }) | null = null;
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferred = e as typeof deferred;
});

export const canInstallNatively = () => !!deferred;

export async function installApp() {
  if (!deferred) return false;
  await deferred.prompt();
  deferred = null;
  return true;
}
