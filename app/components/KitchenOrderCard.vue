<script setup lang="ts">
import type { KitchenTicket } from '~/types/master'

const props = defineProps<{
    order: KitchenTicket
}>()
const emit = defineEmits(['refresh'])
const elapsed = ref('')

const calculateElapsed = () => {
    const start = new Date(props.order.created_at).getTime()
    const now = new Date().getTime()
    const diff = Math.floor((now - start) / 1000 / 60) // minutes
    elapsed.value = `${diff}m`
}

let timer: number
onMounted(() => {
    calculateElapsed()
    timer = setInterval(calculateElapsed, 60000)
})
onUnmounted(() => clearInterval(timer))

const isLate = computed(() => parseInt(elapsed.value) >= 15)

const statusColors = {
    O: 'bg-slate-200',
    P: 'bg-orange-200',
    C: 'bg-sky-200',
    D: 'bg-emerald-200',
    X: 'bg-rose-200'
}

const updateStatus = async (status: string) => {
    await useApi(`/api/kitchen/order/${props.order.sales_id}/status`, { method: 'POST', body: { status } })
    emit('refresh')
}
</script>

<template>
    <div :class="[statusColors[order.status], isLate ? 'ring-4 ring-rose-500 animate-pulse' : '', 'p-5 rounded-3xl transition-all border border-white/10 shadow-xl']">
        <div class="flex justify-between items-start mb-4">
            <div>
                <span class="text-xs font-black uppercase bg-black/20 px-2 py-1 rounded">Table {{ order.table_number }}</span>
                <h4 class="text-xl font-black italic mt-1 uppercase">
                    {{ order.customer_name }}
                </h4>
            </div>
            <div class="text-right">
                <p
                    class="text-lg font-black"
                    :class="isLate ? 'text-rose-600' : 'text-slate-500'"
                >
                    {{ elapsed }}
                </p>
                <p class="text-[10px] font-mono opacity-50 uppercase">
                    Waiting
                </p>
            </div>
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
