<script setup>
const { user } = useAuth()
const toast = useToast()

onMounted(() => {
    const { $echo } = useNuxtApp()
    if (!$echo) return

    // Listen for the specific user's notifications (Private Channel)
    $echo.private(`App.Models.User.${user.value.id}`)
        .notification((notification) => {
            const config = {
                pendingorder: { color: 'primary', icon: 'i-lucide-utensils' },
                cancelorder: { color: 'rose', icon: 'i-lucide-x-circle' },
                movestock: { color: 'amber', icon: 'i-lucide-truck' },
                krequest: { color: 'cyan', icon: 'i-lucide-clipboard-list' },
                sales: { color: 'emerald', icon: 'i-lucide-banknote' }
            }[notification.type] || { color: 'gray', icon: 'i-lucide-bell' }

            toast.add({
                title: notification.title,
                description: notification.body,
                color: config.color,
                icon: config.icon,
                // Action: Click notification to go to relevant page
                onClick: () => handleNotificationClick(notification)
            })

            playNotificationSound(notification.type)
        })

    $echo.private(`waiter.${user.value?.id}`)
        .listen('OrderReady', (e) => {
            toast.add({
                title: 'Order Ready! 🍽️',
                description: `Table ${e.sale.table_number} of floor ${e.sale.floor_number} is ready to serve.`,
                color: 'primary'
            })
        })

    $echo.channel('inventory')
        .listen('ProductStatusChanged', (e) => {
            const productStore = useProductStore()
            productStore.toggleSoldOutLocally(e.productId, e.isSoldOut)

            toast.add({
                title: 'Menu Update',
                description: `An item was just marked as ${e.isSoldOut ? 'Sold Out' : 'Available'}`,
                color: 'info'
            })
        })

    const handleNotificationClick = (n) => {
        if (n.type === 'pendingorder') navigateTo('/kitchen')
        if (n.type === 'movestock') navigateTo('/inventory/transfer/' + n.move_id)
    // etc...
    }
})
</script>

<template>
    <div>
        <UHeader>
            <template #left>
                <NuxtLink to="/">
                    <AppLogo class="w-auto h-12 shrink-0" />
                </NuxtLink>
            </template>

            <template #default>
                <TemplateMenu />
            </template>

            <template #right>
                <UColorModeButton />

                <UButton
                    icon="i-lucide-log-out"
                    color="neutral"
                    variant="ghost"
                    @click="useAuth().logout()"
                />
            </template>
        </UHeader>

        <UMain>
            <slot />
        </UMain>

        <UFooter>
            <template #default>
                <p class="text-sm text-muted">
                    Built with Nuxt UI by Carlsson Studio • © {{ new Date().getFullYear() }}
                </p>
            </template>
        </UFooter>
    </div>
</template>
