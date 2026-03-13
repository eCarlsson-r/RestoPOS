<script setup>
const { data: suppliers } = await useApi('/api/suppliers')
const { data: ingredients } = await useApi('/api/ingredients')

const form = ref({
    branch_code: 'DMBRC',
    supplier_id: null,
    date: new Date().toISOString().split('T')[0],
    items: [
        { code: '', qty: 0, price: 0, total: 0 }
    ]
})

const addItem = () => {
    form.value.items.push({ code: '', qty: 0, price: 0, total: 0 })
}

const calculateRow = (index) => {
    const item = form.value.items[index]
    item.total = item.qty * item.price
}

const grandTotal = computed(() => {
    return form.value.items.reduce((acc, item) => acc + item.total, 0)
})

const submitPurchase = async () => {
    await useApi('/api/admin/purchase', {
        method: 'POST',
        body: form.value
    })
    alert('Purchase recorded. Stock updated in MAIN storage.')
    navigateTo('/admin/stock/list')
}
</script>

<template>
    <UContainer class="p-6">
        <div class="flex justify-between items-end mb-10">
            <div>
                <h1 class="text-4xl font-black uppercase italic tracking-tighter">
                    Input Pembelian
                </h1>
                <p class="text-slate-400 font-bold text-xs uppercase">
                    Restock Ingredients to MAIN Storage
                </p>
            </div>
            <div class="text-right">
                <p class="text-[10px] font-black text-slate-400 uppercase">
                    Total Invoice
                </p>
                <p class="text-4xl font-black text-primary">
                    Rp {{ grandTotal.toLocaleString() }}
                </p>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-6 mb-10">
            <div>
                <label class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Supplier</label>
                <select
                    v-model="form.supplier_id"
                    class="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 ring-secondary"
                >
                    <option
                        v-for="s in suppliers"
                        :key="s.id"
                        :value="s.id"
                    >
                        {{ s.name }}
                    </option>
                </select>
            </div>
            <div>
                <label class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Tanggal Invoice</label>
                <input
                    v-model="form.date"
                    type="date"
                    class="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 ring-indigo-500"
                >
            </div>
        </div>

        <div class="space-y-3 mb-10">
            <div
                v-for="(item, idx) in form.items"
                :key="idx"
                class="flex gap-4 items-end bg-slate-50 p-4 rounded-2xl"
            >
                <div class="flex-1">
                    <label class="text-[10px] font-black text-slate-400 uppercase">Bahan</label>
                    <select
                        v-model="item.code"
                        class="w-full bg-transparent border-none font-bold"
                    >
                        <option
                            v-for="i in ingredients"
                            :key="i.code"
                            :value="i.code"
                        >
                            {{ i.name }}
                        </option>
                    </select>
                </div>
                <div class="w-24">
                    <label class="text-[10px] font-black text-slate-400 uppercase">Qty</label>
                    <input
                        v-model="item.qty"
                        type="number"
                        class="w-full bg-transparent border-none font-bold text-center"
                        @input="calculateRow(idx)"
                    >
                </div>
                <div class="w-40">
                    <label class="text-[10px] font-black text-slate-400 uppercase">Harga Satuan</label>
                    <input
                        v-model="item.price"
                        type="number"
                        class="w-full bg-transparent border-none font-bold text-right"
                        @input="calculateRow(idx)"
                    >
                </div>
                <div class="w-40 text-right pr-4 font-black text-indigo-900">
                    Rp {{ item.total.toLocaleString() }}
                </div>
            </div>
        </div>

        <div class="flex gap-4">
            <UButton
                class="flex-1 py-4 rounded-2xl font-black uppercase italic justify-center"
                variant="outline"
                color="neutral"
                @click="addItem"
            >
                + Tambah Item
            </UButton>
            <UButton
                class="flex-1 py-4 rounded-2xl font-black uppercase italic shadow-xl justify-center"
                @click="submitPurchase"
            >
                Simpan Pembelian
            </UButton>
        </div>
    </UContainer>
</template>
