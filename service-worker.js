// Service Worker for Dash Bash Utility PWA (network-first shell with versioned cache)
const APP_VERSION = "1.9.0";
const CORE_CACHE = `dashbash-core-${APP_VERSION}`;
const RUNTIME_CACHE = `dashbash-runtime-${APP_VERSION}`;
const PRECACHE_URLS = [
  "./",
  "./favicon.svg",
  "./manifest.json",
  // Intentionally exclude index.html & styles.css from precache to force network-first each load
];

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CORE_CACHE);
      await Promise.all(
        PRECACHE_URLS.map((u) =>
          cache.add(u).catch((err) => console.warn("Precache miss", u, err))
        )
      );
    })()
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => ![CORE_CACHE, RUNTIME_CACHE].includes(k))
          .map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

// Fetch event - serve from cache when offline
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (url.origin !== location.origin) {
    return; // allow default fetch (no respondWith) to not interfere
  }

  // Always network-first for HTML shell and main stylesheet to avoid stale UI
  const isShell = req.mode === "navigate" || /index\.html$/.test(url.pathname);
  const isStyle = url.pathname.endsWith("/styles.css");

  if (isShell || isStyle) {
    event.respondWith(
      (async () => {
        try {
          const netResp = await fetch(req, { cache: "no-store" });
          return netResp;
        } catch (e) {
          const cache = await caches.open(CORE_CACHE);
          const cached = await cache.match("./");
          if (cached) return cached;
          throw e;
        }
      })()
    );
    return;
  }

  // Runtime cache: cache-first with background update
  event.respondWith(
    (async () => {
      const cache = await caches.open(RUNTIME_CACHE);
      const cached = await cache.match(req);
      const fetchPromise = fetch(req)
        .then((resp) => {
          if (resp && resp.status === 200 && resp.type === "basic") {
            cache.put(req, resp.clone());
          }
          return resp;
        })
        .catch(() => cached);
      return cached || fetchPromise;
    })()
  );
});
