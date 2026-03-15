<script setup>
const { data: prepareList } = await useApi('/api/prepare') // Items like 'Nasi', 'Sambal', 'Ayam Marinated'
const activeBranch = useCookie('active_branch')

const emit = defineEmits(['success'])

const form = ref({
    prepare_code: '',
    qty: 1,
    note: ''
})

const isProcessing = ref(false)

const submitPrepare = async () => {
    if (!form.value.prepare_code) return alert('Pilih bahan yang diproduksi!')

    isProcessing.value = true
    try {
        await useApi('/api/prepare', {
            method: 'POST',
            body: {
                ...form.value,
                branch_code: activeBranch.value
            }
        })
        alert('Produksi berhasil! Stok bahan baku berkurang & stok hasil produksi bertambah.')
        form.value = { prepare_code: '', qty: 1, note: '' }
    } catch (e) {
        console.log(e)
        alert('Gagal: Stok bahan baku mungkin tidak mencukupi.')
    } finally {
        isProcessing.value = false
    }
}
</script>

<template>
    <div class="p-8">
        <div class="flex justify-between items-center mb-8">
            <div class="mb-10">
                <h1 class="text-4xl font-black uppercase italic tracking-tighter">
                    Produksi Dapur
                </h1>
                <p class="text-slate-400 font-bold text-xs uppercase italic tracking-widest">
                    Konversi Bahan Baku menjadi Bahan Jadi
                </p>
            </div>
            <UButton
                variant="ghost"
                color="neutral"
                icon="i-lucide-x"
                @click="emit('success')"
            />
        </div>

        <div class="bg-white rounded-[3rem] p-10 shadow-sm border border-slate-100">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div class="space-y-6">
                    <div>
                        <label class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest;">Item yang Dibuat</label>
                        <select
                            v-model="form.prepare_code"
                            class="w-full p-5 bg-slate-50 border-none rounded-2xl font-black focus:ring-2 ring-indigo-500 text-lg"
                        >
                            <option
                                value=""
                                disabled
                            >
                                Pilih Menu Produksi...
                            </option>
                            <option
                                v-for="p in prepareList"
                                :key="p.code"
                                :value="p.code"
                            >
                                {{ p.name }} (per {{ p.unit }})
                            </option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest;">Jumlah Produksi</label>
                        <div class="flex items-center gap-4">
                            <input
                                v-model="form.qty"
                                type="number"
                                class="w-full p-5 bg-slate-50 border-none rounded-2xl font-black focus:ring-2 ring-indigo-500 text-center text-2xl"
                            >
                            <span class="font-black text-slate-300 italic">BATCH</span>
                        </div>
                    </div>
                </div>

                <div class="bg-slate-50 rounded-4xl p-6 border border-dashed border-slate-200">
                    <h3 class="text-[10px] font-black uppercase text-slate-400 mb-4 tracking-widest text-center">
                        Estimasi Penggunaan Bahan
                    </h3>
                    <div
                        v-if="form.prepare_code"
                        class="space-y-2"
                    >
                        <div class="flex justify-between text-xs font-bold uppercase italic">
                            <span>Bahan Baku A</span>
                            <span>- {{ 2 * form.qty }} kg</span>
                        </div>
                        <div class="flex justify-between text-xs font-bold uppercase italic text-rose-500">
                            <span>Bahan Baku B</span>
                            <span>- {{ 0.5 * form.qty }} kg</span>
                        </div>
                    </div>
                    <p
                        v-else
                        class="text-center text-slate-300 italic text-xs py-10"
                    >
                        Pilih item untuk melihat estimasi bahan.
                    </p>
                </div>
            </div>

            <div class="mt-10">
                <label class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest;">Catatan (Optional)</label>
                <textarea
                    v-model="form.note"
                    class="w-full p-5 bg-slate-50 border-none rounded-2xl font-black focus:ring-2 ring-indigo-500 h-24 pt-4"
                    placeholder="Contoh: Produksi untuk persiapan weekend..."
                />
            </div>

            <button
                :disabled="isProcessing"
                class="w-full mt-10 bg-indigo-600 text-white py-6 rounded-3xl font-black uppercase italic text-lg shadow-xl shadow-indigo-100 active:scale-95 transition-all disabled:opacity-50"
                @click="submitPrepare"
            >
                {{ isProcessing ? 'Memproses...' : 'Proses Produksi' }}
            </button>
        </div>
    </div>
</template>

<style scoped>
</style>
