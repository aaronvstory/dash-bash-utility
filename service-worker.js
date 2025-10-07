// Service Worker for Dash Bash Utility PWA (network-first shell with versioned cache)
const APP_VERSION = "1.8.10";
const CORE_CACHE = `dashbash-core-${APP_VERSION}`;
const RUNTIME_CACHE = `dashbash-runtime-${APP_VERSION}`;
const PRECACHE_URLS = [
  "./",
  `./favicon.svg?v=${APP_VERSION}`,
  `./manifest.json?v=${APP_VERSION}`,
  // Intentionally exclude index.html & styles.css from precache to force network-first each load
];

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CORE_CACHE);
        await Promise.all(
          PRECACHE_URLS.map(async (u) => {
            try {
              const response = await fetch(u, { cache: "no-store" });
              if (response && response.ok) {
                await cache.put(u, response);
              } else {
                console.info("[SW] Skipping precache", u, response?.status);
              }
            } catch (err) {
              console.info("[SW] Skipping precache", u, err?.message ?? err);
            }
          })
        );
      } catch (err) {
        console.warn("[SW] Precache setup failed", err);
      }
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

self.addEventListener("message", (event) => {
  const data = event.data || {};
  if (data.type === "VERSION_CHECK") {
    const respond = async () => {
      const client = event.source || (await self.clients.get(data.clientId));
      if (client && client.postMessage) {
        client.postMessage({
          type: "VERSION_INFO",
          version: APP_VERSION,
          cacheKeys: await caches.keys(),
        });
      }
    };
    event.waitUntil(respond());
  } else if (data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
