<script setup>
const route = useRoute()
const { data: categories } = await useApi('/api/pos/categories')
const activeCategory = ref('NS') // Default to Nasi
const search = ref('')

// Fetch products based on category
const { data: products } = await useApi(() => `/api/pos/products?category=${activeCategory.value}`);

// Local Ticket State (using Pinia or a composable)
const ticket = ref([])
const addToTicket = (product) => {
    const existing = ticket.value.find(item => item['product-code'] === product['product-code']);
    if (existing) {
        existing.qty++
    } else {
        ticket.value.push({ ...product, qty: 1, note: '' })
    }
}

const submitOrder = async () => {
    // Logic to POST to Laravel /api/sales
    // This will create a 'sales' record and multiple 'sales-record' items
}
</script>

<template>
    <div class="flex h-screen bg-slate-100 overflow-hidden">
        <aside class="w-24 bg-white border-r flex flex-col items-center py-6 gap-4">
            <button v-for="cat in categories" :key="cat['category-code']"
                :class="['w-16 h-16 rounded-2xl flex flex-col items-center justify-center transition-all',
                    activeCategory === cat['category-code'] ? 'bg-primary text-white shadow-lg' : 'bg-slate-50 text-slate-400']"
                @click="activeCategory = cat['category-code']">
                <span class="text-[10px] font-black uppercase tracking-tighter">{{ cat['category-name'] }}</span>
            </button>
        </aside>

        <main class="flex-1 p-6 overflow-y-auto">
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div v-for="prod in products" :key="prod['product-code']" :class="['bg-white p-4 rounded-3xl border-b-4 border-slate-200 cursor-pointer hover:border-primary transition-all',
                    prod['product-soldout'] ? 'opacity-50 grayscale pointer-events-none' : '']"
                    @click="addToTicket(prod)">
                    <div class="h-32 bg-slate-50 rounded-2xl mb-3 flex items-center justify-center text-slate-200">
                        <component :is="prod['category-code'] === 'NS' ? 'NasiIcon' : 'MieIcon'" size="40" />
                    </div>
                    <h3 class="font-black uppercase italic text-sm leading-tight">{{ prod['product-name'] }}</h3>
                    <p class="text-xs font-bold text-slate-400 mt-1">Rp {{ (prod['product-price'] / 1000).toFixed(0) }}k
                    </p>
                </div>
            </div>
        </main>

        <aside class="w-96 bg-white border-l flex flex-col">
            <div class="p-6 border-b">
                <h2 class="text-xl font-black uppercase italic italic tracking-tighter">Table {{ route.params.tableId }}
                </h2>
                <p class="text-[10px] font-bold text-slate-400 uppercase">Waitress: Demo Waitress</p>
            </div>

            <div class="flex-1 overflow-y-auto p-6 space-y-4">
                <div v-for="item in ticket" :key="item['product-code']" class="flex justify-between items-start group">
                    <div class="flex-1">
                        <h4 class="text-sm font-black uppercase italic">{{ item['product-name'] }}</h4>
                        <input v-model="item.note" placeholder="Add note..."
                            class="text-[10px] text-slate-400 bg-transparent border-none p-0 focus:ring-0 w-full" />
                    </div>
                    <div class="flex items-center gap-3">
                        <button class="text-slate-300 hover:text-red-500" @click="item.qty--">-</button>
                        <span class="text-sm font-black">{{ item.qty }}</span>
                        <button class="text-slate-300 hover:text-primary" @click="item.qty++">+</button>
                    </div>
                </div>
            </div>

            <div class="p-6 bg-slate-50 border-t space-y-4">
                <div class="flex justify-between font-black uppercase italic">
                    <span>Subtotal</span>
                    <span>Rp {{ticket.reduce((acc, i) => acc + (i['product-price'] * i.qty), 0).toLocaleString('id-ID')
                        }}</span>
                </div>
                <button
                    class="w-full bg-primary text-white py-5 rounded-2xl font-black uppercase italic text-sm shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all"
                    @click="submitOrder">
                    Send to Kitchen
                </button>
            </div>
        </aside>
    </div>
</template>