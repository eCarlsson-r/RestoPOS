<script setup lang="ts">
import type { ApiResponse, Prepare } from '~/types/master'

const { user } = useAuth()

const form = ref({
    prepare_code: 1,
    qty: 1,
    note: ''
})

const isProcessing = ref(false)

const prepares = ref<Prepare[]>([])

const submitPrepare = async () => {
    if (!form.value.prepare_code) return alert('Pilih bahan yang diproduksi!')

    isProcessing.value = true
    try {
        await useApi('/api/kitchen/prepare', {
            method: 'POST',
            body: {
                ...form.value,
                branch_code: Number(user.value?.username.split('_')[0]),
                storage: user.value?.username.split('_')[1]
            }
        })
        alert('Produksi berhasil! Stok bahan baku berkurang & stok hasil produksi bertambah.')
        form.value = { prepare_code: 1, qty: 1, note: '' }
    } catch (e) {
        console.log(e)
        alert('Gagal: Stok bahan baku mungkin tidak mencukupi.')
    } finally {
        isProcessing.value = false
    }
}

onMounted(async () => {
    const data = await useApi<Prepare[] | ApiResponse<Prepare[]>>('/api/prepare')
    if (Array.isArray(data)) {
        prepares.value = data
    } else if (data && typeof data === 'object' && 'data' in data) {
        prepares.value = (data as ApiResponse<Prepare[]>).data
    } else {
        prepares.value = []
    }
})
</script>

<template>
    <UContainer class="p-8">
        <div class="mb-10">
            <h1 class="text-4xl font-black uppercase italic tracking-tighter">
                Produksi Bahan
            </h1>
            <p class="text-slate-400 font-bold text-xs uppercase italic tracking-widest">
                Konversi Bahan Baku menjadi Bahan Jadi
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div class="space-y-6">
                <UFormField
                    label="Item yang Dibuat"
                    :ui="{ label: 'block text-[10px] font-black uppercase tracking-widest' }"
                >
                    <USelectMenu
                        v-model="form.prepare_code"
                        :items="prepares"
                        value-key="id"
                        label-key="name"
                        class="w-full rounded-2xl font-black text-lg"
                    />
                </UFormField>

                <UFormField
                    label="Jumlah Produksi"
                    :ui="{ label: 'block text-[10px] font-black uppercase tracking-widest' }"
                >
                    <div class="flex items-center gap-4">
                        <UInput
                            v-model="form.qty"
                            type="number"
                            size="xl"
                            class="w-full rounded-2xl font-black text-center"
                        />
                        <span class="font-black italic">BATCH</span>
                    </div>
                </UFormField>
            </div>

            <div class="bg-slate-50 rounded-4xl p-6 border border-dashed border-slate-200">
                <h3 class="text-[10px] font-black uppercase mb-4 tracking-widest text-center">
                    Estimasi Penggunaan Bahan
                </h3>
                <div
                    v-if="form.prepare_code"
                    class="space-y-2"
                >
                    <div
                        v-for="item in prepares.find((item) => item.id === form.prepare_code)?.recipe"
                        :key="item.id"
                        class="flex justify-between text-xs font-bold uppercase italic"
                    >
                        <span>{{ item.item?.name }}</span>
                        <span>- {{ item.quantity * form.qty }} {{ item.item?.unit }}</span>
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

        <UFormField
            label="Catatan"
            class="mt-6"
            :ui="{ label: 'block text-[10px] font-black uppercase tracking-widest' }"
        >
            <UTextarea
                v-model="form.note"
                required
                class="w-full font-black focus:ring-2 ring-indigo-500"
                placeholder="Contoh: Produksi untuk persiapan weekend..."
            />
        </UFormField>

        <UButton
            :disabled="isProcessing"
            class="w-full mt-10 py-6 justify-center rounded-3xl font-black uppercase italic text-lg active:scale-95 transition-all disabled:opacity-50"
            @click="submitPrepare"
        >
            {{ isProcessing ? 'Memproses...' : 'Proses Produksi' }}
        </UButton>
    </UContainer>
</template>

<style scoped>
</style>
