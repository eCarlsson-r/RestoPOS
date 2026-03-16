<script setup lang="ts">
import type { KitchenTicket, Product } from '~/types/master'

const { user } = useAuth()
// Real-time active orders
const { data: activeOrders } = await useApi<{ data: KitchenTicket[] }>(
    '/api/kitchen/tickets?station=' + user.value?.username.split('_')[1]
)

// Sold out state
const { data: allProducts } = await useApi<{ data: Product[] }>('/api/products')

const products = computed(() => allProducts || [])
const soldOutProducts = ref<Product[]>([])

// Initialize soldOutProducts from the fetched data
onMounted(() => {
    soldOutProducts.value = products.value.filter(p => p.soldout === 1)
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
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
