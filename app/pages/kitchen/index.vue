<script setup lang="ts">
import type { KitchenTicket, Product, ApiResponse, StockMove } from '~/types/master'

const { user } = useAuth()

// Safely split username
const branch = computed(() => user.value?.username?.split('_')[0] || '')
const station = computed(() => user.value?.username?.split('_')[1] || '')

// 1. Fetch orders (Lazy, no await)
const { data: activeOrders, refresh } = useLazyAsyncData<KitchenTicket[]>(
    'kitchen-tickets',
    () => useApi<ApiResponse<KitchenTicket[]>>('kitchen/tickets', {
        params: { station: station.value }
    }).then(res => res.data),
    {
        default: () => [],
        watch: [station]
    }
)

// 2. Fetch movements (Lazy, no await)
const { data: incomingStockMovement, refresh: refreshMovement } = useLazyAsyncData<StockMove[]>(
    'incoming-stock-movement',
    () => useApi<ApiResponse<StockMove[]>>('kitchen/movement', {
        params: { branch: branch.value, station: station.value }
    }).then(res => res.data),
    {
        default: () => [],
        watch: [branch, station]
    }
)

// 3. Fetch products using useAsyncData
const { data: allProducts } = useAsyncData('products-list', () => useApi<{ data: Product[] }>('products'))

const products = computed(() => allProducts.value?.data || [])
const soldOutProducts = ref<Product[]>([])

// Initialize soldOutProducts from the fetched data
onMounted(() => {
    if (products.value) {
        soldOutProducts.value = products.value.filter(p => p.soldout === 1)
    }
})

watch(soldOutProducts, async (newVal, oldVal) => {
    // Skip if oldVal is undefined (initial setup)
    if (!oldVal) return

    // Find what changed
    const added = newVal.filter(n => !oldVal.find(o => o.id === n.id))
    const removed = oldVal.filter(o => !newVal.find(n => n.id === o.id))

    for (const item of added) {
        await useApi(`products/${item.id}/soldout`, {
            method: 'POST',
            body: { soldout: 1 }
        })
    }

    for (const item of removed) {
        await useApi(`products/${item.id}/soldout`, {
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
                    v-if="!activeOrders?.length"
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
                        @refresh="refresh()"
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
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xs font-black uppercase mb-4 tracking-widest">
                            Incoming Stock Movement
                        </h3>
                        <UButton
                            color="primary"
                            variant="solid"
                            size="xs"
                            icon="i-lucide-refresh-cw"
                            @click="refreshMovement()"
                        />
                    </div>
                    <p class="text-xs mb-4 italic">
                        Approved requests are stocking the requested items, please confirm.
                    </p>
                    <div
                        v-if="(incomingStockMovement?.length ?? 0) > 0"
                        class="grid grid-cols-2 md:grid-cols-1 gap-4"
                    >
                        <IncomingTransferCard
                            v-for="item in incomingStockMovement"
                            :key="item.id"
                            :transfer="item"
                            @refresh="refreshMovement()"
                        />
                    </div>
                </section>
            </div>
        </div>
    </UContainer>
</template>
