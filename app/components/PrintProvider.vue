<template>
    <div
        v-if="printStore.data"
        class="global-print-portal"
    >
        <SalesReceipt
            v-if="printStore.mode === 'receipt'"
            :order-data="printStore.data"
            :is-bill="printStore.isPrePayment"
        />

        <CaptainOrder
            v-else-if="printStore.mode === 'captain'"
            :order-data="printStore.data"
        />
    </div>
</template>

<script setup>
// This component just 'listens' to the store.
// As soon as printStore.data is filled, this component renders.
const printStore = usePrintStore()

// Debugging: Log when the provider sees data
watch(() => printStore.data, (newVal) => {
    if (newVal) console.log('PrintProvider: Data received, rendering receipt...')
})
</script>
