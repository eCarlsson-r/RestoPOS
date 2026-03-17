<script setup>
const { user } = useAuth()
const toast = useToast()

onMounted(() => {
    const { $echo } = useNuxtApp()
    if (!$echo) return

    // 1. Order Ready Notification
    $echo.private(`waiter.${user.value?.id}`)
        .listen('OrderReady', (e) => {
            toast.add({
                title: 'Order Ready! 🍽️',
                description: `Table ${e.sale.table_number} of floor ${e.sale.floor_number} is ready to serve.`,
                color: 'primary'
            })
        })

    // 2. Help/Waiter Call Notification
    $echo.channel('staff-alerts')
        .listen('WaiterCalled', (e) => {
            toast.add({
                title: 'Table Service Needed',
                description: `Table ${e.table_number} of floor ${e.floor_number} is calling for a waiter.`,
                icon: 'i-lucide-hand',
                color: 'secondary'
            })
        })
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
