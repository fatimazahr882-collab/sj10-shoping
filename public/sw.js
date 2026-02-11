// public/sw.js

self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || '/logo.gif',
      badge: '/badge.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        // ✅ FIX: Ensure this URL matches your Next.js folder structure
        // If you have src/app/orders/track/[id]/page.tsx -> use /orders/track/ID
        // If not, just use /orders to go to the list.
        url: data.url || '/orders' 
      }
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  // Open the URL saved in data.url
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});