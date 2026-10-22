const CACHE = "dalnyak-v6";
const ASSETS = ["/", "/index.html"];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  // Картинки — cache-first, долгий TTL
  if (url.hostname === "cdn.poehali.dev") {
    e.respondWith(
      caches.open(CACHE).then(async c => {
        const cached = await c.match(e.request);
        if (cached) return cached;
        try {
          const fresh = await fetch(e.request);
          c.put(e.request, fresh.clone());
          return fresh;
        } catch {
          return cached || new Response("", { status: 503 });
        }
      })
    );
    return;
  }
  // HTML/JS/CSS — network-first, fallback cache
  if (e.request.mode === "navigate" || url.pathname.match(/\.(js|css|woff2?)$/)) {
    e.respondWith(
      fetch(e.request).then(r => {
        caches.open(CACHE).then(c => c.put(e.request, r.clone()));
        return r;
      }).catch(() => caches.match(e.request).then(c => c || caches.match("/")))
    );
  }
});
self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { title: "Такси Дальняк", body: e.data ? e.data.text() : "" }; }
  e.waitUntil(Promise.all([
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => list.forEach(c => c.postMessage({ type: "push", title: d.title, body: d.body }))),
    self.registration.showNotification(d.title || "Такси Дальняк", {
      body: d.body || "",
      icon: "/app-icon-192.png",
      badge: "/app-badge.png",
      tag: d.tag || "taxi",
      renotify: true,
      requireInteraction: true,
      vibrate: (d.url || "").indexOf("/app/driver") === 0 ? [800, 300, 800, 300, 800, 300, 800, 300, 800] : [300, 150, 300, 150, 300],
      silent: false,
      data: { url: (d.tag || "").indexOf("chat-") === 0 ? (d.url || "/app/client") + "?chat=1" : (d.url || "/app/client") },
    })
  ]));
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "/app/client";
  e.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(list => {
      const base = url.split("?")[0];
      for (const c of list) {
        if (c.url.includes(base) && "focus" in c) {
          if (url !== base) c.postMessage({ type: "open-chat" });
          return c.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
