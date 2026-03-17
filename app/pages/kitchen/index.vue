<script setup lang="ts">
import type { KitchenTicket, KitchenTicketItem, Product, ApiResponse } from '~/types/master'

const { $echo } = useNuxtApp() // Assuming you have an Echo plugin
const { user } = useAuth()

const branch = user.value?.username.split('_')[0]
const station = user.value?.username.split('_')[1]
// Real-time active orders
const { data: activeOrders } = await useLazyAsyncData<ApiResponse<KitchenTicket[]>, Error, KitchenTicket[]>(
    'kitchen-tickets',
    () => useApi<ApiResponse<KitchenTicket[]>>('/api/kitchen/tickets', { params: { station } }),
    {
        default: () => [], // Solves 'Object is possibly undefined'
        transform: res => res.data // If your API wraps response in a { data: [] }
    }
)

// Sold out state
const { data: allProducts } = await useApi<{ data: Product[] }>('/api/products')

const products = computed(() => allProducts || [])
const soldOutProducts = ref<Product[]>([])

const playChime = () => {
    const audio = new Audio('/sounds/new-order.mp3')
    audio.play().catch(() => {}) // Handle browser autoplay blocking
}

// Initialize soldOutProducts from the fetched data
onMounted(() => {
    soldOutProducts.value = products.value.filter(p => p.soldout === 1)

    if (!$echo) return

    // Listen for new orders for this specific kitchen station
    $echo.channel(`kitchen.${branch}.${station}`)
        // Specify the type instead of 'any' to fix 'Unexpected any'
        .listen('OrderDispatched', (e: { ticket: KitchenTicket }) => {
            // Use .value to fix 'Cannot assign to constant'
            if (activeOrders.value) {
                activeOrders.value = [e.ticket, ...activeOrders.value]
            }
            playChime()
        })
        .listen('OrderUpdated', (e: { sales_id: number, items: KitchenTicketItem[] }) => {
            if (!activeOrders.value) return

            const index = activeOrders.value.findIndex(o => o.sales_id === e.sales_id)
            if (index !== -1 && activeOrders.value[index]) {
                activeOrders.value[index].items = e.items
            }
        })
})

watch(soldOutProducts, async (newVal, oldVal) => {
    // Skip if oldVal is undefined (initial setup)
    if (!oldVal) return

    // Find what changed
    const added = newVal.filter(n => !oldVal.find(o => o.id === n.id))
    const removed = oldVal.filter(o => !newVal.find(n => n.id === o.id))

    for (const item of added) {
        await useApi(`/api/products/${item.id}/soldout`, {
            method: 'POST',
            body: { soldout: 1 }
        })
    }

    for (const item of removed) {
        await useApi(`/api/products/${item.id}/soldout`, {
            method: 'POST',
            body: { soldout: 0 }
        })
    }
}, { deep: true })
</script>

<template>
    <UContainer class="p-6 min-h-screen">
        <header class="flex justify-between items-center mb-6">
            <div class="flex items-center gap-4">
                <h1 class="text-3xl font-black italic uppercase tracking-tighter text-primary">
                    Kitchen Command
                </h1>
                <UBadge
                    color="success"
                    variant="subtle"
                    pulse
                >
                    Live
                </UBadge>
            </div>
        </header>

        <div class="grid grid-cols-4 gap-6">
            <div class="col-span-4 lg:col-span-3 space-y-4">
                <div
                    v-if="!activeOrders || !activeOrders.length"
                    class="grid grid-cols-2 gap-4"
                >
                    <USkeleton
                        v-for="i in 4"
                        :key="i"
                        class="h-64 rounded-3xl"
                    />
                </div>

                <div
                    v-else
                    class="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <KitchenOrderCard
                        v-for="order in activeOrders"
                        :key="order.id"
                        :order="order"
                    />
                </div>
            </div>

            <div class="col-span-4 lg:col-span-1 space-y-6">
                <section class="p-6 lg:p-3 rounded-2xl border border-primary-500/20">
                    <h3 class="text-xs font-black uppercase mb-4 tracking-widest">
                        Sold Out Items
                    </h3>
                    <USelectMenu
                        v-model="soldOutProducts"
                        multiple
                        :items="products"
                        label-key="name"
                        placeholder="Search item to mark as sold out..."
                        class="mb-4"
                    />
                    <div class="flex flex-wrap gap-2">
                        <UChip
                            v-for="item in soldOutProducts"
                            :key="item.id"
                            color="error"
                        >
                            <UBadge
                                color="neutral"
                                variant="solid"
                                size="xs"
                                class="font-black uppercase italic"
                            >
                                {{ item.name }}
                            </UBadge>
                        </UChip>
                    </div>
                </section>

                <section class="p-6 lg:p-3 rounded-2xl border border-primary-500/20">
                    <h3 class="text-xs font-black uppercase mb-4 tracking-widest">
                        Recipe Batching
                    </h3>
                    <p class="text-xs mb-4 italic">
                        Convert raw ingredients into prepared stock (e.g. Sambal, Marinated Chicken).
                    </p>
                    <UButton
                        block
                        @click="navigateTo('/kitchen/prepare')"
                    >
                        Open Prepare Tool
                    </UButton>
                </section>
            </div>
        </div>
    </UContainer>
</template>
