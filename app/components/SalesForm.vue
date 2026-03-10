<script setup lang="ts">
import { ref } from 'vue'

interface Category {
    'category-code': string
    'category-name': string
}

interface Product {
    'product-code': string
    'product-name': string
    'product-price': number
    'product-soldout': boolean
    'category-code': string
}

interface TicketItem extends Product {
    qty: number
    note: string
}

const route = useRoute()
const { data: categories } = await useApi<{ data: Category[] }>('/api/pos/categories')
const activeCategory = ref('NS') // Default to Nasi
const search = ref('')

const products = ref<Product[]>([])

const fetchProducts = async () => {
    const { data } = await useApi<{ data: Product[] }>(`/api/pos/products?category=${activeCategory.value}&q=${search.value}`)
    products.value = data || []
}

// Watch both category and search for changes
watch([activeCategory, search], fetchProducts)

// Initial fetch
await fetchProducts()

// Local Ticket State
const ticket = ref<TicketItem[]>([])

const addToTicket = (product: Product) => {
    const existing = ticket.value.find(item => item['product-code'] === product['product-code'])
    if (existing) {
        existing.qty++
    } else {
        ticket.value.push({
            ...product,
            qty: 1,
            note: ''
        })
    }
}

const submitOrder = async () => {
    // Logic to POST to Laravel /api/sales
    // This will create a 'sales' record and multiple 'sales-record' items
}
</script>

<template>
    <div class="flex h-screen bg-neutral-100 overflow-hidden">
        <aside class="w-24 bg-white border-r flex flex-col items-center py-6 gap-4">
            <UButton
                v-for="cat in categories"
                :key="cat['category-code']"
                :color="activeCategory === cat['category-code'] ? 'primary' : 'neutral'"
                :variant="activeCategory === cat['category-code'] ? 'solid' : 'ghost'"
                class="w-16 h-16 rounded-2xl flex flex-col items-center justify-center p-0"
                @click="activeCategory = cat['category-code']"
            >
                <span class="text-[10px] font-black uppercase tracking-tighter">
                    {{ cat['category-name'] }}
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
                    :key="prod['product-code']"
                    :class="[
                        'cursor-pointer hover:ring-2 hover:ring-primary transition-all rounded-3xl overflow-hidden',
                        prod['product-soldout'] ? 'opacity-50 grayscale pointer-events-none' : ''
                    ]"
                    :ui="{ body: 'p-4' }"
                    @click="addToTicket(prod)"
                >
                    <div class="h-32 bg-neutral-50 rounded-2xl mb-3 flex items-center justify-center text-neutral-200">
                        <UIcon
                            :name="prod['category-code'] === 'NS' ? 'i-lucide-bowl' : 'i-lucide-utensils'"
                            class="w-10 h-10"
                        />
                    </div>
                    <h3 class="font-black uppercase italic text-sm leading-tight">
                        {{ prod['product-name'] }}
                    </h3>
                    <p class="text-xs font-bold text-neutral-400 mt-1">
                        Rp {{ (prod['product-price'] / 1000).toFixed(0) }}k
                    </p>
                </UCard>
            </div>
        </main>

        <aside class="w-96 bg-white border-l flex flex-col">
            <div class="p-6 border-b">
                <h2 class="text-xl font-black uppercase italic tracking-tighter">
                    Table {{ route.params.tableId }}
                </h2>
                <p class="text-[10px] font-bold text-neutral-400 uppercase">
                    Waitress: Demo Waitress
                </p>
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-4">
                <div
                    v-for="item in ticket"
                    :key="item['product-code']"
                    class="flex justify-between items-start group"
                >
                    <div class="flex-1">
                        <h4 class="text-sm font-black uppercase italic">
                            {{ item['product-name'] }}
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
                            @click="item.qty--"
                        />
                        <span class="text-sm font-black">{{ item.qty }}</span>
                        <UButton
                            variant="ghost"
                            color="primary"
                            icon="i-lucide-plus"
                            size="xs"
                            @click="item.qty++"
                        />
                    </div>
                </div>
            </div>

            <div class="p-6 bg-neutral-50 border-t space-y-4">
                <div class="flex justify-between font-black uppercase italic">
                    <span>Subtotal</span>
                    <span>
                        Rp {{ ticket.reduce((acc, i) => acc + (i['product-price'] * i.qty), 0).toLocaleString('id-ID')
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
