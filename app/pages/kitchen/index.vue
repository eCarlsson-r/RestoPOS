<script setup lang="ts">
import { ref } from 'vue'

interface KitchenItem {
    id: number
    qty: number
    name: string
    note?: string
}

interface KitchenTicket {
    id: number
    table_number: string
    time_elapsed: number
    items: KitchenItem[]
}

// Filter records by the station (e.g., KTCN)
const station = ref('KTCN')
const { data: activeTickets } = await useApi<{ data: KitchenTicket[] }>(`/api/kitchen/tickets?station=${station.value}`)

// Poll every 10 seconds for new orders
/* if (import.meta.client) {
    setInterval(() => refresh(), 10000)
} */

const markAsReady = async (recordId: number) => {
    await useApi(`/api/kitchen/complete/${recordId}`, { method: 'POST' })
    // refresh()
}
</script>

<template>
    <div class="h-screen bg-zinc-950 p-6 flex flex-col">
        <header class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-black text-white uppercase italic tracking-tighter">
                Station: {{ station }}
            </h1>
            <div class="text-zinc-500 font-bold uppercase text-[10px] tracking-widest">
                {{ new Date().toLocaleTimeString() }}
            </div>
        </header>

        <div class="flex gap-6 overflow-x-auto pb-6">
            <UCard
                v-for="ticket in activeTickets"
                :key="ticket.id"
                class="w-80 shrink-0 bg-zinc-900 border-t-4 border-amber-500 rounded-b-2xl flex flex-col overflow-hidden"
            >
                <div class="p-4 border-b border-zinc-800 flex justify-between">
                    <span class="text-white font-black text-xl italic">
                        TABLE {{ ticket.table_number }}
                    </span>
                    <span class="text-amber-500 font-bold text-xs">
                        {{ ticket.time_elapsed }}m ago
                    </span>
                </div>

                <div class="p-4 flex-1 space-y-3">
                    <div
                        v-for="item in ticket.items"
                        :key="item.id"
                        class="flex flex-col"
                    >
                        <div class="flex justify-between items-start">
                            <span class="text-zinc-100 font-bold uppercase text-sm">
                                {{ item.qty }}x {{ item.name }}
                            </span>
                            <UButton
                                variant="subtle"
                                color="success"
                                icon="i-lucide-check"
                                size="xs"
                                square
                                @click="markAsReady(item.id)"
                            />
                        </div>
                        <p
                            v-if="item.note"
                            class="text-amber-200 text-[10px] font-black uppercase italic"
                        >
                            * {{ item.note }}
                        </p>
                    </div>
                </div>
            </UCard>
        </div>
    </div>
</template>
