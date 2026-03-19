<script setup lang="ts">
import type { StationNotificationPayload } from '~/types/notifications'

const { $echo } = useNuxtApp()
const toast = useToast()
const { user } = useAuth()

onMounted(() => {
    // Determine which channels this user should listen to
    const channels = ['staff-alerts']
    if (user.value?.type === 'ADMIN') channels.push('admin')
    if (user.value?.type === 'KITCHEN') channels.push('kitchen')
    if (user.value?.type === 'WAITER' || user.value?.type === 'CASHIER') channels.push(`waiter.${user.value.id}`)

    channels.forEach((channelName) => {
        $echo.channel(channelName)
            .listen('.notification.received', (payload: StationNotificationPayload) => {
                handleNotification(payload)
            })
    })
})

const playNotificationSound = (type: string) => {
    let fileName = 'general-alert.mp3'

    if (type === 'pendingorder') fileName = 'new-order.mp3'
    if (type === 'cancelorder') fileName = 'warning.mp3'
    if (type === 'sales' && user.value?.type === 'ADMIN') fileName = 'cash-register.mp3'

    const audio = new Audio(`/sounds/${fileName}`)
    audio.play().catch(() => console.warn('Autoplay blocked: user must interact with page first.'))
}

const getActionsForType = (payload: StationNotificationPayload) => {
    const actions = []

    if (payload['sales-id']) {
        actions.push({
            label: 'View Order',
            click: () => navigateTo(`/orders/${payload['sales-id']}`)
        })
    }

    if (payload.type === 'krequest') {
        actions.push({
            label: 'Review Request',
            click: () => navigateTo('/inventory/requests')
        })
    }

    return actions
}

const handleNotification = (payload: StationNotificationPayload) => {
    // 1. Play Sound
    playNotificationSound(payload.type)

    // 2. Global UI Feedback (Toast)
    toast.add({
        title: payload.title,
        description: payload.body,
        color: getNotificationColor(payload.type),
        actions: getActionsForType(payload)
    })

    // 3. Logic-specific updates (e.g., Sold Out)
    if (payload.type === 'soldout' || payload.type === 'available') {
        const productStore = useProductStore()
        productStore.syncStatus(payload.data.id, payload.type === 'soldout')
    }
}

const getNotificationColor = (type: string) => {
    const map = {
        sales: 'primary' as const,
        pendingorder: 'warning' as const,
        cancelorder: 'error' as const,
        krequest: 'warning' as const,
        movestock: 'secondary' as const,
        soldout: 'error' as const,
        prepare: 'info' as const,
        available: 'success' as const
    }
    return (map as Record<string, 'error' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'neutral'>)[type] || 'neutral'
}
</script>
