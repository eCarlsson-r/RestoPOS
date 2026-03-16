<script setup lang="ts">
import type { KitchenTicket } from '~/types/master'

const props = defineProps<{
    order: KitchenTicket
}>()

const statusColors = {
    O: 'bg-slate-200',
    P: 'bg-orange-200',
    C: 'bg-sky-200',
    D: 'bg-emerald-200',
    X: 'bg-rose-200'
}

const updateStatus = async (status: string) => {
    // Call API to notify waiter/change status
    await useApi(`/api/kitchen/order/${props.order.sales_id}/status`, { method: 'POST', body: { status } })
}
</script>

<template>
    <div :class="[statusColors[order.status], 'p-5 rounded-3xl transition-all border border-white/10 shadow-xl']">
        <div class="flex justify-between items-start mb-4">
            <div>
                <span class="text-xs font-black uppercase bg-black/20 px-2 py-1 rounded">Table {{ order.table_number }}</span>
                <h4 class="text-xl font-black italic mt-1 uppercase">
                    {{ order.customer_name }}
                </h4>
            </div>
            <p class="text-xs font-mono opacity-70">
                {{ new Date(order.created_at).toLocaleString() }}
            </p>
        </div>

        <ul class="space-y-2 mb-6">
            <li
                v-for="item in order.items"
                :key="item.id"
                class="flex justify-between border-b border-white/10 pb-2"
            >
                <span class="font-bold">
                    <span class="text-yellow-600">x{{ item.quantity }}</span> {{ item.name }}
                </span>
                {{ item.note }}
                <UIcon
                    v-if="item.item_status === 'D'"
                    name="i-lucide-check-circle"
                    class="text-emerald-300"
                />
            </li>
        </ul>

        <div class="flex gap-2">
            <UButton
                v-if="order.status === 'O'"
                block
                color="neutral"
                @click="updateStatus('P')"
            >
                Cook Now
            </UButton>
            <UButton
                v-if="order.status === 'P'"
                block
                color="secondary"
                @click="updateStatus('C')"
            >
                Ready / Notify
            </UButton>
            <UButton
                v-if="order.status === 'C'"
                block
                color="success"
                icon="i-lucide-send"
            >
                Deliver
            </UButton>
        </div>
    </div>
</template>
