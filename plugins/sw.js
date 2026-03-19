self.addEventListener('push', (event) => {
    const data = event.data.json()

    // This wakes up the phone/OS notification
    self.registration.showNotification(data.title, {
        body: data.body,
        icon: '/icons/icon-192x192.png',
        data: {
            url: data.url || '/admin/notifications',
            type: data.type
        }
    })
})

self.addEventListener('notificationclick', (event) => {
    event.notification.close()
    event.waitUntil(
        self.clients.openWindow(event.notification.data.url)
    )
})
