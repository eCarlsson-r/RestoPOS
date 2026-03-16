<template>
    <div class="p-8">
        <h3 class="text-2xl font-black uppercase italic mb-6">
            Payment Settlement
        </h3>

        <div class="grid grid-cols-4 gap-3 mb-8">
            <UButton
                v-for="m in ['CASH', 'CARD', 'QRIS', 'VOUCHER']"
                :key="m"
                :color="paymentMethod === m ? 'primary' : 'neutral'"
                variant="soft"
                class="h-12 justify-center font-black uppercase italic"
                @click="paymentMethod = m"
            >
                {{ m }}
            </UButton>
        </div>

        <div class="space-y-6">
            <div
                v-if="paymentMethod === 'CASH'"
                class="space-y-4"
            >
                <UFormField
                    label="Uang Diterima"
                    size="xl"
                >
                    <UInput
                        v-model="cashReceived"
                        type="number"
                        class="w-full font-black"
                    />
                </UFormField>
                <div class="p-4 bg-slate-100 rounded-2xl flex justify-between">
                    <span class="font-bold text-primary">Kembalian:</span>
                    <span class="font-black text-rose-500">Rp {{ change.toLocaleString() }}</span>
                </div>
            </div>

            <div
                v-if="paymentMethod === 'CARD'"
                class="space-y-4"
            >
                <UFormField
                    label="Jenis Kartu"
                    size="xl"
                >
                    <div class="grid grid-cols-2 gap-3">
                        <USelectMenu
                            v-model="cardType"
                            :items="[{ label: 'Kartu Kredit', value: 'CR' }, { label: 'Kartu Debit', value: 'DB' }]"
                        />
                        <USelectMenu
                            v-model="payBank"
                            :items="[{ label: 'BCA', value: 'BCA' }, { label: 'Xendit', value: 'Xendit' }]"
                        />
                    </div>
                </UFormField>
                <UFormField
                    label="No.Kartu"
                    size="xl"
                >
                    <UInput
                        v-model="cardNumber"
                        class="w-full font-black"
                    />
                </UFormField>
            </div>

            <div
                v-if="paymentMethod === 'VOUCHER'"
                class="space-y-4"
            >
                <UInput
                    v-model="voucherCode"
                    placeholder="G10..."
                    icon="i-lucide-ticket"
                />
                <UButton
                    color="info"
                    @click="verifyVoucher"
                >
                    Cek Voucher
                </UButton>
                <p v-if="voucherMessage">
                    {{ voucherMessage }}
                </p>
            </div>
        </div>

        <UButton
            block
            color="success"
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
    salesId: { type: [String, Number], required: true },
    totalAmount: { type: Number, required: true },
    orderData: { type: Object, required: true } // Pass the full order for the receipt
})

const emit = defineEmits(['success'])
const printStore = usePrintStore()
const paymentMethod = ref('CASH')
const cashReceived = ref(0)
const voucherCode = ref('')
const voucherMessage = ref('')
const cardType = ref('')
const payBank = ref('')
const cardNumber = ref('')

const verifyVoucher = async () => {
    const { data } = await useApi(`/api/vouchers/${voucherCode.value}`)
    if (data) {
        voucherMessage.value = data.message
    }
}

// Logic for change calculation
const change = computed(() => {
    return Math.max(0, cashReceived.value - props.totalAmount)
})

const processPayment = async () => {
    const paymentDetails = {
        sales_id: props.salesId,
        payment_method: paymentMethod.value,
        total: props.totalAmount
    }

    if (paymentMethod.value === 'CASH') {
        paymentDetails.payment_cash = cashReceived.value
    }

    if (paymentMethod.value === 'VOUCHER') {
        paymentDetails.voucher_code = voucherCode.value
    }

    if (paymentMethod.value === 'CARD') {
        paymentDetails.card_type = cardType.value
        paymentDetails.card_edc = payBank.value
        paymentDetails.card_number = cardNumber.value
    }

    try {
        const result = await useApi('/api/sales/checkout', {
            method: 'POST',
            body: paymentDetails
        })

        if (result.err == 0) await printStore.triggerPrint(result.data[0], false)
        emit('success')
    } catch (e) {
        alert('Payment failed: ' + e.message)
    }
}
</script>
