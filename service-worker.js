// Service Worker for Dash Bash Utility PWA
// Version 1.3.0 - Update this version number with each release
const VERSION = '1.3.0';
const CACHE_NAME = `dashbash-v${VERSION}`;
const urlsToCache = [
  './',
  './index.html',
  './favicon.svg',
  './manifest.json'
];

// Install event - cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        // Try to cache each URL individually, don't fail if one fails
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => {
              console.log('Failed to cache:', url, err);
            });
          })
        );
      })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first strategy for HTML, cache first for assets
self.addEventListener('fetch', event => {
  // Skip caching for external resources to avoid CORS issues
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Network-first strategy for HTML files to ensure fresh content
  if (event.request.mode === 'navigate' || event.request.url.includes('.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Update cache with fresh version
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, fall back to cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // Cache-first strategy for other assets
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // Return cached version but update in background
          fetch(event.request).then(fetchResponse => {
            if (fetchResponse && fetchResponse.status === 200) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, fetchResponse);
              });
            }
          }).catch(() => {});
          return response;
        }
        
        // Not in cache, fetch from network
        return fetch(event.request).then(response => {
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }
          
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          
          return response;
        });
      })
  );
});

// Message event - handle skip waiting
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});