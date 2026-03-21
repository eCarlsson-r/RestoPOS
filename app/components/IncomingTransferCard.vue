<script setup lang="ts">
import type { StockMove } from '~/types/master'

const props = defineProps<{
    transfer: StockMove
}>()

const receiveTransfer = async (transfer: StockMove) => {
    await useApi('stock/receive/' + transfer.id, {
        method: 'POST'
    })
}
</script>

<template>
    <div class="p-5 rounded-3xl transition-all border border-white/10 shadow-xl">
        <div class="flex justify-between items-start mb-4">
            <div class="flex flex-col">
                <h6 class="text-md font-black italic mt-1 uppercase">
                    🚚 {{ props.transfer.from_branch?.name }} {{ props.transfer.from_storage }}
                </h6>
                <h6 class="text-md font-black italic mt-1 uppercase">
                    &rarr; {{ props.transfer.to_branch?.name }} {{ props.transfer.to_storage }}
                </h6>
            </div>
        </div>

        <ul class="space-y-2 mb-6">
            <li
                v-for="item in transfer.records"
                :key="item.id"
                class="flex justify-between border-b border-white/10 pb-2"
            >
                <span
                    v-if="item.item_type == 'INGR'"
                    class="font-bold"
                >
                    {{ item.ingredient?.name }} <span class="text-yellow-600">x {{ item.quantity }} {{ item.ingredient?.unit }}</span>
                </span>
                <span
                    v-if="item.item_type == 'UTLT'"
                    class="font-bold"
                >
                    {{ item.utility?.name }} <span class="text-yellow-600">x {{ item.quantity }} {{ item.utility?.unit }}</span>
                </span>
            </li>
        </ul>

        <div class="flex gap-2">
            <UButton
                block
                color="success"
                icon="i-lucide-send"
                @click="receiveTransfer(transfer)"
            >
                Receive
            </UButton>
        </div>
    </div>
</template>
