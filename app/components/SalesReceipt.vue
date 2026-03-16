<template>
    <div class="print-area">
        <div class="receipt-header">
            <AppLogo />
            <p>{{ orderData.branch?.name }}</p>
            <p class="text-[10px]">
                {{ orderData.branch?.address }}
            </p>
        </div>

        <div class="dashed-line" />

        <div class="items">
            <div
                v-for="item in orderData.records"
                :key="item.id"
                class="item-row"
            >
                <span class="qty">{{ item.quantity }}x</span>
                <span class="name">{{ (item.package) ? item.package.name : item.product.name }}</span>
                <span class="price">{{ (item.item_price * item.quantity).toLocaleString() }}</span>
            </div>
        </div>

        <div class="dashed-line" />

        <div class="total-row">
            <span>TOTAL</span>
            <span class="font-black">Rp {{ ((orderData.records) ? orderData.records.reduce((acc, i) => acc + (i.item_price * i.quantity), 0) : 0).toLocaleString() }}</span>
        </div>

        <div class="footer">
            <div
                v-if="props.isBill"
                class="border-2 border-black my-2 p-1 text-lg"
            >
                *** BILL ONLY ***
            </div>
            <div
                v-else
                class="my-2"
            >
                <p>Settle: {{ new Date().toLocaleString() }}</p>
                <p>Terima Kasih!</p>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    orderData: Object,
    isBill: Boolean // Received from the PrintProvider
})
</script>

<style>
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
