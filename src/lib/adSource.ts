// Запоминаем, из какой рекламы пришёл посетитель, и выдаём ему короткий код.
// Этот код уходит вместе с ним в Telegram/Макс и потом связывает оплату с кампанией.

const KEY = "ad_source_v1";
const YM_ID = 111028538;

export interface AdSource {
  visitKey: string;
  ymClientId?: string;
  yclid?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  landingPage?: string;
  referrer?: string;
  createdAt: string;
}

function makeKey(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 6; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

function read(): AdSource | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AdSource) : null;
  } catch {
    return null;
  }
}

function write(v: AdSource) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* приватный режим браузера — просто работаем без сохранения */
  }
}

/** Код клиента из cookie Метрики — доступен сразу, без ожидания загрузки счётчика. */
export function getYmClientIdSync(): string | undefined {
  const m = document.cookie.match(/(?:^|;\s*)_ym_uid=(\d+)/);
  return m ? m[1] : undefined;
}

/** Идентификатор посетителя в Яндекс.Метрике (нужен для передачи оплат). */
export function getYmClientId(): Promise<string | undefined> {
  return new Promise((resolve) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ym = (window as any).ym;
    const cookieId = getYmClientIdSync();
    if (typeof ym !== "function") return resolve(cookieId);
    let done = false;
    const finish = (v?: string) => {
      if (!done) {
        done = true;
        resolve(v);
      }
    };
    window.setTimeout(() => finish(cookieId), 4000);
    try {
      ym(YM_ID, "getClientID", (id: string) => finish(id));
    } catch {
      finish(cookieId);
    }
  });
}

/** Источник текущего визита: первый рекламный клик побеждает, но свежая реклама его перебивает. */
export function captureAdSource(): AdSource {
  const q = new URLSearchParams(window.location.search);
  const get = (k: string) => q.get(k) || undefined;

  const hasFreshAd = Boolean(get("utm_source") || get("yclid") || get("gclid"));
  const saved = read();

  if (saved && !hasFreshAd) return saved;

  const source: AdSource = {
    visitKey: saved && !hasFreshAd ? saved.visitKey : makeKey(),
    yclid: get("yclid") || get("gclid") || saved?.yclid,
    utmSource: get("utm_source") || (hasFreshAd ? undefined : saved?.utmSource),
    utmMedium: get("utm_medium") || (hasFreshAd ? undefined : saved?.utmMedium),
    utmCampaign: get("utm_campaign") || (hasFreshAd ? undefined : saved?.utmCampaign),
    utmTerm: get("utm_term") || (hasFreshAd ? undefined : saved?.utmTerm),
    utmContent: get("utm_content") || (hasFreshAd ? undefined : saved?.utmContent),
    landingPage: window.location.pathname,
    referrer: document.referrer || undefined,
    createdAt: saved && !hasFreshAd ? saved.createdAt : new Date().toISOString(),
  };

  write(source);
  return source;
}

export function getAdSource(): AdSource {
  return read() || captureAdSource();
}

/** Короткий код визита — его клиент передаёт в мессенджере. */
export function getVisitKey(): string {
  return getAdSource().visitKey;
}
