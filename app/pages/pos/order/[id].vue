<script setup lang="ts">
import { ref } from 'vue'
import { watchDebounced } from '@vueuse/core'
import type { Category, Product } from '~/types/master'

const route = useRoute()
const { data: categories } = await useApi<{ data: Category[] }>('/api/categories')
const activeCategory = ref(1) // Default to Nasi
const search = ref('')
const products = ref<Product[]>([])

const fetchProducts = async () => {
    let productURL = `/api/products?category=${activeCategory.value}`
    if (search.value) productURL += `&q=${search.value}`
    const { data } = await useApi<{ data: Product[] }>(productURL)
    products.value = data || []
}

// Watch both category and search for changes
watchDebounced(
    [activeCategory, search],
    fetchProducts,
    { debounce: 300, maxWait: 1000 }
)

// Initial fetch
await fetchProducts()

// Accessing Auth/Session State
const { user } = useAuth()
const orderStore = useOrderStore()
const salesId = ref<number | null>(Number(route.query.salesId) || null) // Store this if adding to existing table

if (salesId.value) {
    orderStore.loadBasket(salesId.value)
}

const submitOrder = async () => {
    await orderStore.sendToKitchen(
        salesId.value,
        user?.value?.employee?.branch?.id || 1,
        route.params.id
    )
}
</script>

<template>
    <div class="flex h-screen bg-neutral-100 overflow-hidden">
        <aside class="w-24 bg-white border-r flex flex-col items-center py-6 gap-4">
            <UButton
                v-for="cat in categories"
                :key="cat.id"
                :color="activeCategory === cat.id ? 'primary' : 'neutral'"
                :variant="activeCategory === cat.id ? 'solid' : 'ghost'"
                class="w-16 h-16 rounded-2xl flex flex-col items-center justify-center p-0"
                @click="activeCategory = cat.id"
            >
                <span class="text-[10px] font-black uppercase tracking-tighter">
                    {{ cat.name }}
                </span>
            </UButton>
        </aside>

        <main class="flex-1 p-6 overflow-y-auto">
            <div class="mb-6">
                <UInput
                    v-model="search"
                    icon="i-lucide-search"
                    placeholder="Search menu..."
                    size="xl"
                    :ui="{ base: 'rounded-2xl bg-white border-none shadow-sm font-bold uppercase italic tracking-tighter' }"
                />
            </div>

            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <UCard
                    v-for="prod in products"
                    :key="prod.id"
                    :class="[
                        'relative cursor-pointer hover:ring-2 hover:ring-primary transition-all rounded-3xl overflow-hidden',
                        prod.soldout ? 'opacity-50 grayscale pointer-events-none' : ''
                    ]"
                    @click="orderStore.addToBasket(prod)"
                >
                    <div class="absolute top-3 right-3 flex gap-1">
                        <span
                            :class="prod.category?.kitchen_process === 'KTCN' ? 'bg-orange-500' : 'bg-blue-500'"
                            class="text-[8px] font-black text-white px-2 py-0.5 rounded-full shadow-sm"
                        >
                            {{ prod.category?.kitchen_process === 'KTCN' ? 'Kitchen' : 'Bartender' }}
                        </span>
                    </div>

                    <div class="h-28 bg-neutral-50 rounded-2xl mb-3 flex items-center justify-center">
                        <img
                            v-if="prod.image"
                            :src="prod.image"
                            class="h-full w-full object-cover rounded-2xl"
                        >
                        <UIcon
                            v-else
                            name="i-lucide-utensils"
                            class="w-8 h-8 text-neutral-200"
                        />
                    </div>

                    <h3 class="font-black uppercase italic text-xs leading-tight min-h-8">
                        {{ prod.name }}
                    </h3>

                    <div class="flex justify-between items-center mt-2">
                        <p class="text-[10px] font-bold text-primary italic uppercase">
                            Rp {{ (prod.price).toLocaleString('id-ID') }}
                        </p>
                        <UIcon
                            v-if="!prod.soldout"
                            name="i-lucide-plus-circle"
                            class="w-4 h-4 text-neutral-300"
                        />
                    </div>
                </UCard>
            </div>
        </main>

        <aside class="w-96 bg-white border-l flex flex-col">
            <div class="p-6 border-b">
                <h2 class="text-xl font-black uppercase italic tracking-tighter">
                    Table {{ route.params.id }}
                </h2>
                <p class="text-[10px] font-bold text-neutral-400 uppercase">
                    Waitress: {{ orderStore.employee || user?.employee?.name }}
                </p>
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-4">
                <div
                    v-for="item in orderStore.basket"
                    :key="item.id"
                    class="flex justify-between items-start group"
                >
                    <div class="flex-1">
                        <h4 class="text-sm font-black uppercase italic">
                            {{ item.name }}
                        </h4>
                        <UInput
                            v-model="item.note"
                            placeholder="Add note..."
                            variant="none"
                            size="xs"
                            class="p-0"
                            :ui="{ base: 'text-[10px] text-neutral-400 p-0 h-auto' }"
                        />
                    </div>
                    <div class="flex items-center gap-3">
                        <UButton
                            variant="ghost"
                            color="neutral"
                            icon="i-lucide-minus"
                            size="xs"
                            @click="orderStore.removeFromBasket(item)"
                        />
                        <span class="text-sm font-black">{{ item.qty }}</span>
                        <UButton
                            variant="ghost"
                            color="primary"
                            icon="i-lucide-plus"
                            size="xs"
                            @click="orderStore.addToBasket(item)"
                        />
                    </div>
                </div>
            </div>

            <div class="p-6 bg-neutral-50 border-t space-y-4">
                <div class="flex justify-between font-black uppercase italic">
                    <span>Subtotal</span>
                    <span>
                        Rp {{ orderStore.basket.reduce((acc, i) => acc + (i.price * i.qty), 0).toLocaleString('id-ID')
                        }}
                    </span>
                </div>
                <UButton
                    block
                    size="xl"
                    label="Send to Kitchen"
                    color="primary"
                    class="py-5 font-black uppercase italic text-sm shadow-xl shadow-primary/20"
                    @click="submitOrder"
                />
            </div>
        </aside>
    </div>
</template>
