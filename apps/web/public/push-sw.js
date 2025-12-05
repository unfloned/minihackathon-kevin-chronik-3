// Push notification handler - imported by the main service worker

self.addEventListener('push', (event) => {
    if (!event.data) return;

    try {
        const data = event.data.json();

        const options = {
            body: data.body,
            icon: data.icon || '/pwa-192x192.png',
            badge: data.badge || '/pwa-192x192.png',
            tag: data.tag,
            data: data.data,
            vibrate: [100, 50, 100],
            requireInteraction: false,
        };

        event.waitUntil(
            self.registration.showNotification(data.title, options)
        );
    } catch (err) {
        console.error('[Push SW] Push event error:', err);
    }
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const data = event.notification.data || {};
    let targetUrl = '/app';

    // Route based on notification data
    if (data.type === 'habit') {
        targetUrl = '/app/habits';
    } else if (data.type === 'deadline') {
        targetUrl = '/app/deadlines';
    } else if (data.type === 'subscription') {
        targetUrl = '/app/subscriptions';
    } else if (data.url) {
        targetUrl = data.url;
    }

    // Handle action buttons
    if (event.action === 'complete' && data.habitId) {
        targetUrl = '/app/habits';
    } else if (event.action === 'snooze') {
        return;
    }

    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.navigate(targetUrl);
                    return client.focus();
                }
            }
            return self.clients.openWindow(targetUrl);
        })
    );
});
