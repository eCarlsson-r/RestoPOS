<template>
    <div class="p-8">
        <h3 class="text-2xl font-black uppercase italic mb-6">
            Payment Settlement
        </h3>

        <!-- Status Summary -->
        <div
            class="p-4 bg-slate-900 text-white rounded-2xl mb-8 flex justify-between items-center shadow-xl"
        >
            <div>
                <p class="text-xs uppercase font-bold text-slate-400">
                    Total Bill
                </p>
                <p class="text-2xl font-black italic">
                    Rp {{ totalAmount.toLocaleString() }}
                </p>
            </div>
            <div class="text-right">
                <p class="text-xs uppercase font-bold text-rose-400">
                    Remaining
                </p>
                <p class="text-2xl font-black italic text-rose-500">
                    Rp {{ remainingBalance.toLocaleString() }}
                </p>
            </div>
        </div>

        <!-- Added Payments List -->
        <div
            v-if="addedPayments.length > 0"
            class="mb-8 space-y-2"
        >
            <h4 class="text-xs font-bold uppercase text-slate-500 mb-2">
                Added Payments
            </h4>
            <div
                v-for="(p, i) in addedPayments"
                :key="i"
                class="flex justify-between items-center p-3 bg-slate-100 rounded-xl border border-slate-200"
            >
                <div class="flex items-center gap-3">
                    <UBadge
                        color="primary"
                        variant="subtle"
                    >
                        {{ p.method }}
                    </UBadge>
                    <span class="font-bold">
                        Rp {{ p.amount.toLocaleString() }}
                    </span>
                    <span
                        v-if="p.method === 'CARD' || p.method === 'QRIS'"
                        class="text-xs text-slate-500"
                    >
                        {{ p.pay_bank }} ({{ p.card_number }})
                    </span>
                </div>
                <UButton
                    color="rose"
                    variant="ghost"
                    icon="i-lucide-trash-2"
                    size="xs"
                    @click="removePayment(i)"
                />
            </div>
        </div>

        <div v-if="remainingBalance > 0">
            <div class="grid grid-cols-4 gap-3 mb-6">
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
                <!-- Amount to pay with this method -->
                <UFormField
                    label="Payment Amount"
                    size="xl"
                >
                    <UInput
                        v-model="currentPaymentAmount"
                        type="number"
                        class="w-full font-black"
                    />
                </UFormField>

                <div
                    v-if="paymentMethod === 'CASH'"
                    class="space-y-4"
                >
                    <UFormField
                        label="Uang Diterima (Tendered)"
                        size="xl"
                    >
                        <UInput
                            v-model="cashReceived"
                            type="number"
                            class="w-full font-black"
                        />
                    </UFormField>
                    <div
                        class="p-4 bg-emerald-50 rounded-2xl flex justify-between border border-emerald-100"
                    >
                        <span class="font-bold text-emerald-700">
                            Change:
                        </span>
                        <span class="font-black text-emerald-600 uppercase italic">
                            Rp {{ change.toLocaleString() }}
                        </span>
                    </div>
                </div>

                <div
                    v-if="paymentMethod === 'CARD' || paymentMethod === 'QRIS'"
                    class="space-y-4"
                >
                    <UFormField
                        label="Payment Provider / Bank"
                        size="xl"
                    >
                        <div class="grid grid-cols-2 gap-3">
                            <USelect
                                v-model="cardType"
                                :items="[{ label: 'Kartu Kredit', value: 'CR' }, { label: 'Kartu Debit', value: 'DB' }]"
                                placeholder="Type"
                            />
                            <USelect
                                v-model="payBank"
                                :items="[{ label: 'BCA', value: 'BCA' }, { label: 'Xendit', value: 'Xendit' }]"
                                placeholder="Bank/EDC"
                            />
                        </div>
                    </UFormField>
                    <UFormField
                        label="Reference / Label"
                        size="xl"
                    >
                        <UInput
                            v-model="cardNumber"
                            placeholder="Last 4 digits or Ref #"
                            class="w-full font-black"
                        />
                    </UFormField>
                </div>

                <div
                    v-if="paymentMethod === 'VOUCHER'"
                    class="space-y-4"
                >
                    <div class="flex gap-2">
                        <UInput
                            v-model="voucherCode"
                            placeholder="G10..."
                            icon="i-lucide-ticket"
                            class="flex-1"
                        />
                        <UButton
                            color="info"
                            @click="verifyVoucher"
                        >
                            Check
                        </UButton>
                    </div>
                    <p
                        v-if="voucherMessage"
                        class="text-sm font-medium text-info-600"
                    >
                        {{ voucherMessage }}
                    </p>
                </div>

                <UButton
                    block
                    color="primary"
                    size="lg"
                    variant="solid"
                    class="font-black uppercase italic"
                    @click="addPayment"
                >
                    Add Rp {{ (currentPaymentAmount || 0).toLocaleString() }} to Payment
                </UButton>
            </div>
        </div>

        <UButton
            v-if="remainingBalance <= 0 && addedPayments.length > 0"
            block
            color="success"
            size="xl"
            class="mt-8 font-black uppercase italic h-16 text-xl shadow-lg shadow-success-200"
            @click="processPayment"
        >
            Finalize Settlement & Print
        </UButton>
    </div>
</template>

<script setup>
const props = defineProps({
    salesId: { type: [String, Number], required: true },
    totalAmount: { type: Number, required: true },
    orderData: { type: Object, required: true }
})

const emit = defineEmits(['success'])
const printStore = usePrintStore()

const addedPayments = ref([])
const paymentMethod = ref('CASH')
const currentPaymentAmount = ref(props.totalAmount)
const cashReceived = ref(0)
const voucherCode = ref('')
const voucherMessage = ref('')
const cardType = ref('')
const payBank = ref('')
const cardNumber = ref('')

// Track remaining
const remainingBalance = computed(() => {
    const paid = addedPayments.value.reduce((acc, p) => acc + p.amount, 0)
    return Math.max(0, props.totalAmount - paid)
})

watch(remainingBalance, (newVal) => {
    currentPaymentAmount.value = newVal
    cashReceived.value = newVal
}, { immediate: true })

const verifyVoucher = async () => {
    const { data } = await useApi(`/api/vouchers/${voucherCode.value}`)
    if (data) {
        voucherMessage.value = data.message
    }
}

const change = computed(() => {
    return Math.max(0, cashReceived.value - currentPaymentAmount.value)
})

const addPayment = () => {
    if (currentPaymentAmount.value <= 0) return

    const p = {
        method: paymentMethod.value,
        amount: Number(currentPaymentAmount.value)
    }

    if (paymentMethod.value === 'CASH') {
        p.tendered = Number(cashReceived.value)
    } else if (paymentMethod.value === 'VOUCHER') {
        p.voucher_code = voucherCode.value
    } else {
        p.card_type = cardType.value
        p.pay_bank = payBank.value
        p.card_number = cardNumber.value
    }

    addedPayments.value.push(p)

    // Reset inputs
    voucherCode.value = ''
    voucherMessage.value = ''
    cardType.value = ''
    payBank.value = ''
    cardNumber.value = ''
}

const removePayment = (index) => {
    addedPayments.value.splice(index, 1)
}

const processPayment = async () => {
    try {
        const result = await useApi('/api/sales/checkout', {
            method: 'POST',
            body: {
                sales_id: props.salesId,
                total: props.totalAmount,
                payments: addedPayments.value
            }
        })

        if (result.err == 0) {
            if (result.data && result.data[0]) {
                await printStore.triggerPrint(result.data[0], false)
            }
            emit('success')
        } else {
            alert('Error: ' + result.msg)
        }
    } catch (e) {
        alert('Payment failed: ' + e.message)
    }
}
</script>
