<template>
    <div class="print-area">
        <div class="receipt-header">
            <AppLogo class="mx-auto w-32 h-auto" />
            <p class="font-bold">
                {{ orderData?.branch?.name }}
            </p>
            <p class="text-[10px]">
                {{ orderData?.branch?.address }}
            </p>
        </div>

        <div class="dashed-line" />

        <div class="items">
            <div
                v-for="item in orderData?.records"
                :key="item.id"
                class="item-row"
            >
                <span class="qty">{{ item.quantity }}x</span>
                <span class="name">
                    {{ item.package ? item.package.name : item.product?.name }}
                </span>
                <span class="price">
                    {{ (item.item_price * item.quantity).toLocaleString() }}
                </span>
            </div>
        </div>

        <div class="dashed-line" />

        <div class="total-row">
            <span class="font-bold">TOTAL</span>
            <span class="font-black text-lg">Rp {{ grandTotal.toLocaleString() }}</span>
        </div>

        <div
            v-if="!props.isBill && orderData?.invoices?.length"
            class="mt-4 space-y-1"
        >
            <div
                v-for="inv in orderData.invoices"
                :key="inv.id"
                class="flex justify-between text-[11px]"
            >
                <span class="uppercase italic">{{ inv.pay_method }}</span>
                <span v-if="inv.pay_method === 'CASH'">
                    Tendered: {{ inv.pay_amount.toLocaleString() }}
                </span>
                <span v-else>
                    {{ inv.pay_amount.toLocaleString() }}
                </span>
            </div>

            <div
                v-if="totalChange > 0"
                class="flex justify-between text-[11px] font-bold border-t border-black pt-1"
            >
                <span>CHANGE</span>
                <span>Rp {{ totalChange.toLocaleString() }}</span>
            </div>
        </div>

        <div class="footer mt-4">
            <div
                v-if="props.isBill"
                class="border-2 border-black my-2 p-2 text-center font-black"
            >
                *** PRE-PAYMENT BILL ***
            </div>
            <div
                v-else
                class="text-xs"
            >
                <p>Settle: {{ new Date().toLocaleString() }}</p>
                <p class="mt-2 font-bold uppercase italic">
                    Terima Kasih!
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    orderData: Object,
    isBill: Boolean
})

const grandTotal = computed(() => {
    if (!props.orderData?.records) return 0
    return props.orderData.records.reduce((acc, item) => {
        return acc + (item.item_price * item.quantity)
    }, 0)
})

const totalChange = computed(() => {
    if (!props.orderData?.invoices) return 0
    return props.orderData.invoices.reduce((acc, inv) => {
        return acc + (inv.pay_change || 0)
    }, 0)
})

// DEBUG: Log to see what data finally reached the receipt
onMounted(() => {
    console.log('Receipt Mounted. Data:', props.orderData)
})
</script>

<style scoped>
.print-area {
    width: 80mm;
    padding: 10px;
    font-family: 'Courier New', Courier, monospace;
  color: #000 !important;
  background-color: #fff !important;
  -webkit-print-color-adjust: exact; /* Forces background colors to show */
  print-color-adjust: exact;
}

.print-area * {
  color: #000 !important;
}

.dashed-line { border-top: 1px dashed #000; margin: 8px 0; }
.item-row { display: flex; gap: 5px; font-size: 11px; }
.name { flex: 1; }
.total-row { display: flex; justify-content: space-between; font-size: 14px; }
.receipt-header, .footer { text-align: center; }
</style>
