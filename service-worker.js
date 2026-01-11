// Service Worker for Dash Bash Utility PWA (network-first shell with versioned cache)
const APP_VERSION = "1.11.6"; // Critical fixes + performance improvements
const CORE_CACHE = `dashbash-core-${APP_VERSION}`;
const RUNTIME_CACHE = `dashbash-runtime-${APP_VERSION}`;
const PRECACHE_URLS = [
  "./",
  "./favicon.svg",
  "./manifest.json",
  // Intentionally exclude index.html & styles.css from precache to force network-first each load
];

// Message handler for client communication (version checks, skip waiting)
self.addEventListener("message", (event) => {
  const { type, expected, reason } = event.data || {};

  if (type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (type === "VERSION_CHECK") {
    const versionMatch = APP_VERSION === expected;
    event.source?.postMessage({
      type: "VERSION_INFO",
      version: APP_VERSION,
      expected,
      match: versionMatch,
      reason,
    });
  }
});

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

  // Always network-first for HTML shell, main stylesheet, and compiled JS to avoid stale UI
  const isShell = req.mode === "navigate" || /index\.html$/.test(url.pathname);
  const isStyle = url.pathname.endsWith("/styles.css");
  const isCompiledJS = url.pathname.endsWith("/dash-bash-compiled.js");

  if (isShell || isStyle || isCompiledJS) {
    event.respondWith(
      (async () => {
        try {
          const netResp = await fetch(req, { cache: "no-store" });
          if (isStyle || isCompiledJS) {
            const cache = await caches.open(RUNTIME_CACHE);
            try {
              await cache.put(req, netResp.clone());
            } catch (err) {
              if (err.name === "QuotaExceededError") {
                console.warn("[SW] Cache quota exceeded, clearing runtime cache");
                await caches.delete(RUNTIME_CACHE);
              }
            }
          }
          return netResp;
        } catch (e) {
          if (isStyle || isCompiledJS) {
            const cache = await caches.open(RUNTIME_CACHE);
            const cached = await cache.match(req);
            if (cached) return cached;
            return new Response(
              isCompiledJS
                ? "/* Offline: dash-bash-compiled.js unavailable */"
                : "/* Offline: styles.css unavailable */",
              {
                status: 503,
                headers: {
                  "Content-Type": isCompiledJS
                    ? "application/javascript"
                    : "text/css",
                },
              }
            );
          }
          const cache = await caches.open(CORE_CACHE);
          const cached = await cache.match("./");
          // Always return a response - never throw or return undefined
          return cached || new Response("Offline - Please check your connection", {
            status: 503,
            headers: { "Content-Type": "text/html" },
          });
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
        .then(async (resp) => {
          if (resp && resp.status === 200 && resp.type === "basic") {
            try {
              await cache.put(req, resp.clone());
            } catch (err) {
              // Handle quota exceeded - log but don't break the response
              if (err.name === "QuotaExceededError") {
                console.warn("[SW] Cache quota exceeded, clearing runtime cache");
                await caches.delete(RUNTIME_CACHE);
              }
            }
          }
          return resp;
        })
        .catch(() => cached || null);
      // Ensure we always return a valid response or null (never undefined)
      return cached || (await fetchPromise) || new Response("Offline", { status: 503 });
    })()
  );
});
