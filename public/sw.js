// public/sw.js

// --- 1. CACHING CONFIGURATION (The New Part) ---
const CACHE_NAME = 'sj10-cache-v2'; // Updated version name
const urlsToCache = [
  '/',
  '/explore',
  '/category',
  '/offline.html', // This is the fallback page we'll create
  '/logo.gif',
  '/favicon.ico',
];

// --- 2. INSTALL EVENT: Cache the "App Shell" ---
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// --- 3. ACTIVATE EVENT: Clean up old caches ---
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// --- 4. FETCH EVENT: Intercept requests and serve from cache ---
self.addEventListener('fetch', (event) => {
  // We don't cache API calls or non-GET requests
  if (event.request.url.includes('/api/') || event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // If it's in the cache, serve it immediately (super fast!)
        if (response) {
          return response;
        }

        // If not in cache, fetch from the network
        return fetch(event.request)
          .then((networkResponse) => {
            // And cache the new response for next time
            return caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
          })
          .catch(() => {
            // If network fails, show the offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
          });
      })
  );
});


// --- 5. PUSH NOTIFICATION LOGIC (Your Existing Code) ---
self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/logo.png',
      badge: '/badge.png',
      vibrate: [100, 50, 100],
      data: {
        url: data.url || '/orders' 
      }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});