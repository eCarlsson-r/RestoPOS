<script setup>
const props = defineProps(['salesId', 'totalAmount'])
const emit = defineEmits(['close', 'success'])

const amountPaid = ref(0)
const paymentMethod = ref('CASH') // CASH, QRIS, DEBIT
const change = computed(() => Math.max(0, amountPaid.value - props.totalAmount))

const quickCash = [50000, 100000, 200000]

const processPayment = async () => {
    await useApi('/api/pos/settle', {
        method: 'POST',
        body: {
            'sales-id': props.salesId,
            'payment-type': paymentMethod.value,
            'amount-paid': amountPaid.value,
            'amount-change': change.value,
            'total-final': props.totalAmount
        }
    })
    emit('success')
}
</script>

<template>
    <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-200 flex items-center justify-center p-6">
        <div class="bg-white w-full max-w-2xl rounded-[3rem] overflow-hidden shadow-2xl">
            <div class="p-10">
                <div class="flex justify-between items-start mb-10">
                    <div>
                        <h2 class="text-4xl font-black uppercase italic tracking-tighter">
                            Settlement
                        </h2>
                        <p class="text-slate-400 font-bold uppercase text-xs">
                            Sales ID: #{{ salesId }}
                        </p>
                    </div>
                    <div class="text-right">
                        <p class="text-xs font-black text-slate-400 uppercase">
                            Total Bill
                        </p>
                        <p class="text-4xl font-black text-rose-500 italic">
                            Rp {{ totalAmount.toLocaleString() }}
                        </p>
                    </div>
                </div>

                <div class="grid grid-cols-3 gap-3 mb-8">
                    <button
                        v-for="m in ['CASH', 'QRIS', 'DEBIT']"
                        :key="m"
                        :class="paymentMethod === m ? 'bg-black text-white' : 'bg-slate-100 text-slate-400'"
                        class="py-4 rounded-2xl font-black uppercase italic text-xs transition-all"
                        @click="paymentMethod = m"
                    >
                        {{ m }}
                    </button>
                </div>

                <div
                    v-if="paymentMethod === 'CASH'"
                    class="space-y-6"
                >
                    <div>
                        <label class="text-[10px] font-black uppercase text-slate-400 mb-2 block">Diterima (Cash Received)</label>
                        <input
                            v-model="amountPaid"
                            type="number"
                            class="w-full text-5xl font-black p-6 bg-slate-50 border-none rounded-3xl text-center"
                        >
                    </div>
                    <div class="flex gap-2">
                        <button
                            v-for="cash in quickCash"
                            :key="cash"
                            class="flex-1 py-4 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm"
                            @click="amountPaid = cash"
                        >
                            +{{ (cash/1000) }}k
                        </button>
                    </div>
                </div>

                <div class="mt-10 p-8 bg-emerald-50 rounded-4xl flex justify-between items-center">
                    <span class="font-black uppercase italic text-emerald-900">Kembalian</span>
                    <span class="text-3xl font-black text-emerald-600">Rp {{ change.toLocaleString() }}</span>
                </div>
            </div>

            <button
                class="w-full py-8 bg-black text-white font-black uppercase italic text-xl hover:bg-zinc-800"
                @click="processPayment"
            >
                Simpan & Cetak Struk
            </button>
        </div>
    </div>
</template>
