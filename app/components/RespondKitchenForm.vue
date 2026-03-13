<script setup lang="ts">
const props = defineProps({
    requestNo: {
        type: String,
        required: true
    },
    requestFrom: {
        type: String,
        required: true
    },
    requestItems: {
        type: Array,
        required: true
    }
})
</script>

<template>
    <UCard>
        <template #header>
            <div class="flex justify-between items-center">
                <h3 class="font-black italic uppercase">
                    Request #{{ requestNo }}
                </h3>
                <UBadge
                    color="warning"
                    variant="subtle"
                >
                    PENDING
                </UBadge>
            </div>
        </template>

        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4 text-xs">
                <div><span class="text-gray-400">From:</span> {{ requestFrom }}</div>
                <div><span class="text-gray-400">To:</span> <USelect :options="branches" /></div>
            </div>

            <UTable :rows="requestItems" />

            <div class="flex gap-2">
                <UButton
                    block
                    color="error"
                    variant="soft"
                >
                    Reject
                </UButton>
                <UButton
                    block
                    color="success"
                >
                    Approve & Move Stock
                </UButton>
            </div>
        </div>
    </UCard>
</template>
