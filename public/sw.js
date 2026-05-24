/* Roommat Admin — Web Push service worker */

self.addEventListener('push', (event) => {
  let data = {
    title: 'Roommat Admin',
    body: '',
    url: '/dashboard/properties',
    icon: '/favicon.ico',
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      if (parsed && typeof parsed === 'object') {
        data = { ...data, ...parsed };
      }
    } catch {
      const text = event.data.text();
      if (text) data.body = text;
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Roommat Admin', {
      body: data.body || '',
      icon: data.icon || '/favicon.ico',
      badge: '/favicon.ico',
      tag: data.notificationId ? `roommat-admin-${data.notificationId}` : 'roommat-admin-notification',
      renotify: true,
      data: {
        url: data.url || '/dashboard/properties',
        notificationId: data.notificationId,
        type: data.type,
      },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetPath = event.notification.data?.url || '/dashboard/properties';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        const absolute =
          targetPath.startsWith('http') ? targetPath : `${self.location.origin}${targetPath}`;
        return self.clients.openWindow(absolute);
      }
      return undefined;
    }),
  );
});
