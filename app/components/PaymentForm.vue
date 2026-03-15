<template>
    <div class="bg-white w-full p-6">
        <div class="flex justify-between items-start mb-6">
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

        <div class="grid grid-cols-3 gap-3 mb-6">
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

        <div class="mt-6 p-8 bg-emerald-50 rounded-4xl flex justify-between items-center">
            <span class="font-black uppercase italic text-emerald-900">Kembalian</span>
            <span class="text-3xl font-black text-emerald-600">Rp {{ change.toLocaleString() }}</span>
        </div>

        <UButton
            class="w-full mt-6 oy-3 justify-center font-black uppercase italic text-xl"
            @click="processPayment"
        >
            Simpan & Cetak Struk
        </UButton>
    </div>
</template>

<template>
  <div class="p-8">
    <h3 class="text-2xl font-black uppercase italic mb-6">Payment Settlement</h3>

    <div class="grid grid-cols-2 gap-3 mb-8">
      <UButton
        v-for="m in ['CASH', 'CARD', 'QRIS', 'VOUCHER']"
        :key="m"
        :color="paymentMethod === m ? 'primary' : 'neutral'"
        variant="soft"
        class="h-16 font-black uppercase italic"
        @click="paymentMethod = m"
      >
        {{ m }}
      </UButton>
    </div>

    <div class="space-y-6">
      <div v-if="paymentMethod === 'CASH'" class="space-y-4">
        <UFormGroup label="Uang Diterima">
          <UInput v-model="cashReceived" type="number" size="xl" class="font-black" />
        </UFormGroup>
        <div class="p-4 bg-slate-100 rounded-2xl flex justify-between">
          <span class="font-bold">Kembalian:</span>
          <span class="font-black text-rose-500">Rp {{ (cashReceived - total).toLocaleString() }}</span>
        </div>
      </div>

      <div v-if="paymentMethod === 'VOUCHER'" class="space-y-4">
        <UInput v-model="voucherCode" placeholder="G10..." icon="i-lucide-ticket" />
        <UButton block color="black" @click="verifyVoucher">Cek Voucher</UButton>
      </div>
    </div>

    <UButton
        block
        color="emerald"
        size="xl"
        class="mt-8 font-black uppercase italic"
        @click="processPayment"
    >
      Finalize Payment & Print
    </UButton>
  </div>
</template>

<script setup>
const props = defineProps({
    salesId: {
        type: [String, Number],
        required: true
    },
    totalAmount: {
        type: [String, Number],
        required: true
    }
})
const emit = defineEmits(['success'])
const paymentMethod = ref('CASH')
// const cashReceived = ref(0)
// const voucherCode = ref('')

const processPayment = async () => {
    await useApi('/api/sales/checkout', {
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
