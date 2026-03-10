<script setup>
const form = ref({
    branch_code: 'DMBRC',
    note: '',
    items: []
})

const submitTransfer = async () => {
    await useApi('/api/admin/stock/transfer', {
        method: 'POST',
        body: form.value
    })
    alert('Stock Transferred successfully!')
    navigateTo('/admin/stock/list')
}
</script>

<template>
    <div class="p-8 max-w-5xl">
        <div class="mb-8 flex justify-between items-end">
            <div>
                <h1 class="text-3xl font-black uppercase italic tracking-tighter">
                    Pindah Stok
                </h1>
                <p class="text-slate-400 font-bold text-xs uppercase">
                    Warehouse (MAIN) → Kitchen (KTCN)
                </p>
            </div>
            <button
                class="bg-black text-white px-8 py-4 rounded-2xl font-black uppercase italic"
                @click="submitTransfer"
            >
                Konfirmasi Pemindahan
            </button>
        </div>

        <div class="bg-white rounded-[2.5rem] border border-slate-100 p-8 shadow-sm">
            <div class="space-y-4">
                <div
                    v-for="(item, idx) in form.items"
                    :key="idx"
                    class="grid grid-cols-12 gap-4 items-center border-b pb-4"
                >
                    <div class="col-span-6">
                        <label class="text-[10px] font-black text-slate-400 uppercase">Item Bahan</label>
                        <select
                            v-model="item.code"
                            class="w-full bg-slate-50 border-none rounded-xl p-3 font-bold"
                        >
                            <option
                                v-for="b in bahan"
                                :key="b.code"
                                :value="b.code"
                            >
                                {{ b.name }}
                            </option>
                        </select>
                    </div>
                    <div class="col-span-3">
                        <label class="text-[10px] font-black text-slate-400 uppercase">Jumlah</label>
                        <input
                            v-model="item.qty"
                            type="number"
                            class="w-full bg-slate-50 border-none rounded-xl p-3 font-bold"
                        >
                    </div>
                    <div class="col-span-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase">Satuan</label>
                        <div class="p-3 font-bold text-slate-400">
                            {{ getUnit(item.code) }}
                        </div>
                    </div>
                </div>

                <button
                    class="mt-4 text-indigo-600 font-black uppercase text-[10px] tracking-widest"
                    @click="form.items.push({ code: '', qty: 0 })"
                >
                    + Tambah Baris
                </button>
            </div>
        </div>
    </div>
</template>
