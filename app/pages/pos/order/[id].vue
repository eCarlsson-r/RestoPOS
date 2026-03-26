<script setup lang="ts">
import { ref } from 'vue'
import { watchDebounced } from '@vueuse/core'
import type { ApiResponse, Category, Product, Sale } from '~/types/master'

const route = useRoute()
const api = useApi()
const { data: categories } = await useApi<{ data: Category[] }>('categories')
const activeCategory = ref(1) // Default to Nasi
const isPaymentModalOpen = ref(false)
const search = ref('')
const products = ref<Product[]>([])
const printStore = usePrintStore()

const fetchProducts = async () => {
    let productURL = `products?category=${activeCategory.value}`
    if (salesId.value) productURL += `&sales_id=${salesId.value}`
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
const buffetInfo = ref<{ id: number, included_ids: number[] } | null>(null)

// 1. Fetch current sale details to see if it's a buffet
if (salesId.value) {
    const { data: saleData } = await useApi<{ data: Sale }>(`sales/${salesId.value}`)
    if (saleData?.buffet) {
        buffetInfo.value = {
            id: saleData.buffet.id,
            included_ids: saleData.buffet.products?.map((p: Product) => p.id) || []
        }
    }
    orderStore.loadBasket(salesId.value)
}

const toast = useToast()

const handleAddProduct = (prod: Product) => {
    const isIncluded = orderStore.addProductToBasket(prod)

    // Show warning if it's an Ala Carte item being added to a Buffet Table
    if (orderStore.activeBuffet && !isIncluded) {
        toast.add({
            title: 'Ala Carte Item Added',
            description: `${prod.name} is NOT included in this buffet package and will be charged full price.`,
            color: 'success',
            icon: 'i-lucide-alert-triangle'
        })
    }
}

const submitOrder = async () => {
    const { sentItems } = await orderStore.sendToKitchen(
        salesId.value,
        user?.value?.employee?.branch?.id || 1,
        route.params.id
    )

    try {
        const data = await api<ApiResponse<Sale[]>>(`sales/orders/${salesId.value}`)
        if (data && data.data[0]) {
            console.info(sentItems)
            data.data[0].records = sentItems
            await printStore.triggerPrint(data.data[0], 'captain')
        }
    } catch (e) {
        console.error('Failed to print captain order', e)
        alert('Could not print kitchen ticket')
    } finally {
        navigateTo('/pos/floor-map')
        orderStore.clearBasket()
    }
}
</script>

<template>
    <div class="flex h-dvh bg-neutral-100 overflow-hidden">
        <aside class="w-24 bg-default border-r flex flex-col items-center py-6 gap-4">
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
                    :ui="{ base: 'rounded-2xl bg-default border-none shadow-sm font-bold uppercase italic tracking-tighter' }"
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
                    @click="handleAddProduct(prod)"
                >
                    <div
                        v-if="orderStore.activeBuffet"
                        class="absolute top-3 left-3"
                    >
                        <UBadge
                            v-if="orderStore.activeBuffet.product_ids.includes(prod.id)"
                            color="success"
                            variant="solid"
                            size="xs"
                            class="font-black italic uppercase text-[8px]"
                        >
                            Included
                        </UBadge>
                        <UBadge
                            v-else
                            color="neutral"
                            variant="outline"
                            size="xs"
                            class="font-black italic uppercase text-[8px] bg-white"
                        >
                            Ala Carte
                        </UBadge>
                    </div>
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
                            v-if="prod.files && prod.files.length > 0"
                            :src="prod.files[0]?.url"
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

        <aside class="w-96 bg-default border-l flex flex-col">
            <div class="p-6 border-b">
                <div class="grid grid-cols-2 justify-between">
                    <div>
                        <h2 class="text-xl font-black uppercase italic tracking-tighter">
                            Table {{ route.params.id }}
                        </h2>
                        <p class="text-[10px] font-bold text-neutral-400 uppercase">
                            Waitress: {{ orderStore.employee || user?.employee?.name }}
                        </p>
                    </div>

                    <UButton
                        v-if="user?.type === 'CASHIER'"
                        block
                        size="xl"
                        label="Bayar"
                        color="success"
                        class="py-2 font-black uppercase italic"
                        @click="isPaymentModalOpen = true"
                    />
                </div>
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-4">
                <div
                    v-for="item in orderStore.basket"
                    :key="item.id"
                    class="flex justify-between items-start group"
                >
                    <div class="flex-1">
                        <h4 class="text-sm font-black uppercase italic">
                            {{ item.item?.name }}
                        </h4>
                        <UInput
                            v-model="item.item_note"
                            placeholder="Add note..."
                            variant="none"
                            size="xs"
                            class="p-0"
                            :ui="{ base: 'text-[10px] text-neutral-400 p-0 h-auto' }"
                        />
                    </div>
                    <div class="flex items-center gap-2">
                        <span
                            v-if="item.printed_at"
                            class="text-[10px] bg-slate-100 px-2 rounded-full text-slate-400"
                        >
                            IN KITCHEN
                        </span>
                        <span
                            v-else
                            class="text-[10px] bg-amber-100 px-2 rounded-full text-amber-600 animate-pulse"
                        >
                            NEW
                        </span>
                    </div>
                    <div class="flex items-center gap-3">
                        <UButton
                            variant="ghost"
                            color="neutral"
                            icon="i-lucide-minus"
                            size="xs"
                            @click="orderStore.removeFromBasket(item)"
                        />
                        <span class="text-sm font-black">{{ item.quantity }}</span>
                        <UButton
                            v-if="item.item && item.item_type === 'product'"
                            variant="ghost"
                            color="primary"
                            icon="i-lucide-plus"
                            size="xs"
                            @click="orderStore.addProductToBasket(item.item)"
                        />
                        <UButton
                            v-if="item.item && item.item_type === 'package'"
                            variant="ghost"
                            color="primary"
                            icon="i-lucide-plus"
                            size="xs"
                            @click="orderStore.addPackageToBasket(item.item)"
                        />
                    </div>
                </div>
            </div>

            <div class="p-6 bg-default-50 border-t space-y-4">
                <div class="flex justify-between font-black uppercase italic">
                    <span>Subtotal</span>
                    <span>
                        Rp {{ orderStore.basket.reduce((acc, i) => acc + (i.item_price * i.quantity), 0).toLocaleString('id-ID')
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

        <UModal
            v-model:open="isPaymentModalOpen"
            class="w-full"
        >
            <template #content>
                <PaymentForm
                    :total-amount="orderStore.basket.reduce((acc, i) => acc + (i.item_price * i.quantity), 0)"
                    :sales-id="salesId!"
                    :order-data="{ branch: user?.employee?.branch, items: orderStore.basket }"
                    @success="isPaymentModalOpen = false; navigateTo('/pos/floor-map')"
                    @close="isPaymentModalOpen = false"
                />
            </template>
        </UModal>
    </div>
</template>
