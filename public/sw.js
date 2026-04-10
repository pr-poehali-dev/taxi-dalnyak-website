const CACHE = "dalnyak-v1";
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
