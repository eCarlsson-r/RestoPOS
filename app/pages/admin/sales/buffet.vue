<script setup lang="ts">
import { onMounted } from 'vue'
import { useMaster } from '~/composables/useMaster'
import type { Reservation } from '~/types/master'

const { items, isFormOpen, selectedItem, fetchItems, saveItem } = useMaster<Reservation>('reservations')
const nuxtApp = useNuxtApp()
const api = useApi()

const filterDate = ref(new Date().toISOString().slice(0, 10))

const handleCheckIn = async (id: number) => {
    await api(`reservations/${id}/check-in`, { method: 'POST' })
    fetchItems({ date: filterDate.value }) // Refresh with current date
    nuxtApp.runWithContext(() => {
        useToast().add({ title: 'Table is now OPEN', color: 'success' })
    })
}

const isToday = computed(() => {
    return filterDate.value === new Date().toISOString().slice(0, 10)
})

const getDayName = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long' })
}

onMounted(() => {
    fetchItems({ date: filterDate.value })
})

watch(filterDate, (newVal) => {
    fetchItems({ date: newVal })
})

const getStatus = (value: 'confirmed' | 'checked_in') => {
    if (value === 'confirmed') return 'Confirmed'
    else if (value === 'checked_in') return 'Checked In'
}

const statusColors: Record<string, 'neutral' | 'warning' | 'info' | 'success' | 'error'> = {
    checked_in: 'neutral',
    confirmed: 'info'
}
</script>

<template>
    <UContainer class="space-y-6 p-6">
        <div class="flex justify-between items-center">
            <h2 class="text-2xl font-black italic uppercase">
                Event Schedule
            </h2>
            <UButton
                icon="i-lucide-calendar-plus"
                @click="isFormOpen = true"
            >
                Add Booking
            </UButton>
        </div>

        <section>
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-xs font-bold text-gray-400 uppercase tracking-widest">
                    <span v-if="isToday">Arriving Today</span>
                    <span v-else>Arriving: {{ getDayName(filterDate) }}, {{ filterDate }}</span>
                </h3>
                <UInput
                    v-model="filterDate"
                    type="date"
                    size="sm"
                    class="w-48"
                    icon="i-lucide-calendar"
                />
            </div>

            <div
                v-if="items.length > 0"
                class="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
                <UCard
                    v-for="res in items"
                    :key="res.id"
                    class="border-l-4 border-primary"
                >
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-black text-lg">
                                {{ res.customer?.name }}
                            </p>
                            <p class="text-xs text-gray-500">
                                {{ res.event_time }} • {{ res.guaranteed_pax }} Pax
                            </p>
                        </div>
                        <UBadge :color="statusColors[res.status]">
                            {{ getStatus(res.status) }}
                        </UBadge>
                    </div>

                    <template #footer>
                        <UButton
                            v-if="res.status !== 'checked_in'"
                            block
                            color="primary"
                            variant="soft"
                            @click="handleCheckIn(res.id)"
                        >
                            Check-In & Open Table
                        </UButton>
                    </template>
                </UCard>
            </div>
        </section>

        <USlideover
            v-model:open="isFormOpen"
            side="right"
        >
            <template #content>
                <UCard
                    class="flex flex-col flex-1"
                    :ui="{
                        root: 'ring-0 divide-y divide-gray-100',
                        body: 'flex-1 overflow-y-auto',
                        header: 'bg-slate-50/50'
                    }"
                >
                    <template #header>
                        <div class="flex items-center justify-between">
                            <div>
                                <h3 class="text-xl font-black italic uppercase tracking-tighter text-slate-900">
                                    Event Booking
                                </h3>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    Secure a table for future buffet
                                </p>
                            </div>
                            <UButton
                                color="neutral"
                                variant="ghost"
                                icon="i-lucide-x"
                                @click="isFormOpen = false"
                            />
                        </div>
                    </template>

                    <ReservationForm
                        :reservation-id="selectedItem?.id"
                        @close="isFormOpen = false"
                        @saved="saveItem"
                    />
                </UCard>
            </template>
        </USlideover>
    </UContainer>
</template>
