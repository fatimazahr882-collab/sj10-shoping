// public/sw.js - SJ10 Enterprise Service Worker (Rich Image Web Push + Resilient Cache)
const CACHE_NAME = 'sj10-cache-v3';

// Only cache essential static assets that always exist
const urlsToCache = [
  '/',
  '/favicon.ico'
];

// --- 1. INSTALL: Safe Non-Crashing Cache ---
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Individual cache fetch so missing URLs never break service worker installation!
      return Promise.allSettled(
        urlsToCache.map(url => cache.add(url).catch(err => console.warn(`Cache skip for ${url}`)))
      );
    })
  );
});

// --- 2. ACTIVATE: Claim Clients Immediately ---
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// --- 3. FETCH: Safe Cache Fallback ---
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/') || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Return null or cached home if offline
        return caches.match('/');
      });
    })
  );
});

// --- 4. 🟢 ULTRA-LUXURY RICH-IMAGE PUSH NOTIFICATION LOGIC ---
self.addEventListener('push', function (event) {
  if (!event.data) return;

  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = { title: 'SJ10 Update', body: event.data.text() };
  }

  const title = data.title || 'SJ10 Marketplace';
  const options = {
    body: data.body || 'You have a new update on your order.',
    icon: data.icon || '/logo192.png',
    badge: data.badge || '/badge.png',
    image: data.image || null, // 🟢 LARGE BANNER IMAGE (App Jaisi Tasweer!)
    vibrate: [200, 100, 200],
    tag: data.tag || `sj10-notif-${Date.now()}`,
    renotify: true,
    requireInteraction: true, // Screen par tab tak rukay jab tak user click na kare
    data: {
      url: data.url || data.action_url || '/orders'
    },
    actions: [
      { action: 'open', title: 'View Details 📦' }
    ]
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// --- 5. NOTIFICATION CLICK HANDLER ---
self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/orders';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If already open, focus it
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});