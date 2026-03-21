<script setup lang="ts">
import type { Branch, Table, Sale, Reservation, ApiResponse } from '~/types/master'
import TransferModal from '~/components/TransferModal.vue'

const currentFloor = ref(1)
const nuxtApp = useNuxtApp()
const { $echo } = nuxtApp
const api = useApi()
const { user } = useAuth()
const floorStore = useFloorMapStore()
const isCalling = ref(false)
const isMoveModalOpen = ref(false)
const isReservationModalOpen = ref(false)
const callingTable = ref<Table | null>(null)
const selectedTable = ref<Table | null>(null)
const isDrawerOpen = ref(false)
const isShiftingMode = ref(false)
const isMergingMode = ref(false)
const mergeSelection = ref<number[]>([])
const activeReservation = ref<Reservation | null>(null)
const branch = ref<Branch | undefined>(user.value?.employee?.branch)
const branches = ref<Branch[]>([])
const printStore = usePrintStore()

// New Missing State for Reservation Panel
const viewMode = ref<'form' | 'list'>('list')
const todaysReservations = ref<Reservation[]>([])

const refreshData = () => {
    if (branch.value?.id) {
        floorStore.fetchTables(branch.value.id, currentFloor.value)
    }
}

const fetchTodaysReservations = async () => {
    if (!branch.value?.id) return
    try {
        const today = new Date().toISOString().slice(0, 10)
        const response = await api<Reservation[] | ApiResponse<Reservation[]>>(`reservations?date=${today}&status=confirmed`)
        if (Array.isArray(response)) {
            todaysReservations.value = response
        } else if (response && typeof response === 'object' && 'data' in response) {
            todaysReservations.value = (response as ApiResponse<Reservation[]>).data
        } else {
            todaysReservations.value = []
        }
    } catch (e) {
        console.error('Failed to fetch reservations', e)
    }
}

const bindEcho = () => {
    if (!$echo) return

    if (branch.value?.id) {
        $echo.leave(`branch.*`)
        $echo.channel(`branch.${branch.value.id}`)
            .listen('WaiterCalled', (e: { table: number }) => {
                const spottedTable = floorStore.tables.find(t => t.id === e.table)
                if (spottedTable) {
                    callingTable.value = spottedTable
                    isCalling.value = true
                }
            })
    }
}

watch(branch, (newVal) => {
    if (newVal) {
        currentFloor.value = 1
        refreshData()
        fetchTodaysReservations()
        bindEcho()
    }
}, { deep: true })

watch(isReservationModalOpen, (newVal) => {
    if (newVal) {
        fetchTodaysReservations()
    }
})

const selectReservationForSeating = (res: Reservation) => {
    activeReservation.value = res
    useToast().add({
        title: 'Pilih Meja',
        description: `Silahkan pilih meja kosong untuk ${res.customer?.name}`,
        color: 'primary'
    })
}

const openActionDrawer = (table: Table) => {
    if (activeReservation.value && table.status === 'available') {
        confirmCheckIn(table.id)
    } else if (isMergingMode.value && mergeSelection.value.length > 0) {
        mergeSelection.value.push(table.id)
        confirmMerge()
    } else {
        selectedTable.value = table
        isDrawerOpen.value = true
    }
}

const guestCount = ref(1)

const openTable = async (table: Table) => {
    try {
        const response: { err: number, msg: string, sales_id: number } = await api('tables/use', {
            method: 'POST',
            body: {
                table_id: table.id,
                guest_count: guestCount.value
            }
        })

        if (response.err === 0) {
            goToOrder(response.sales_id, table.id)
        }
    } catch (e) {
        console.error('Failed to open table', e)
    }
}

const goToOrder = (salesId: number | undefined, tableId?: number) => {
    if (salesId) {
        navigateTo({
            path: `/pos/order/${tableId || selectedTable.value?.id}`,
            query: { salesId: salesId || selectedTable.value?.sales?.[0]?.id }
        })
    } else {
        useToast().add({
            title: 'Meja ini belum memiliki pesanan.',
            color: 'error'
        })
    }
}

const goToSplit = (salesId: number | undefined) => {
    if (salesId) {
        navigateTo(`/pos/split/${salesId}`)
    } else {
        useToast().add({
            title: 'Meja ini belum memiliki pesanan.',
            color: 'error'
        })
    }
}

const toggleMergeMode = (table: Table) => {
    isMergingMode.value = !isMergingMode.value
    mergeSelection.value = [table.id]
}

const updateTablePosition = async (table: Table, newX: number, newY: number) => {
    if (!branch.value?.id) return
    try {
        await api('tables/shift', {
            method: 'POST',
            body: {
                branch_id: branch.value.id,
                floor_number: currentFloor.value,
                table_id: table.id,
                position_x: newX,
                position_y: newY
            }
        })
        await floorStore.fetchTables(branch.value.id, currentFloor.value)
        isShiftingMode.value = false
    } catch (e) {
        console.error('Failed to shift table', e)
    }
}

const confirmMerge = async () => {
    if (mergeSelection.value.length !== 2 || !branch.value?.id) return

    await api('tables/merge', {
        method: 'POST',
        body: {
            table1: mergeSelection.value[0],
            table2: mergeSelection.value[1],
            branch: user.value?.employee?.branch_id
        }
    })
    isMergingMode.value = false
    mergeSelection.value = []
    floorStore.fetchTables(branch.value.id, currentFloor.value)
}

const printPrePayment = async (table: Table) => {
    const saleId = table.sales?.[0]?.id
    if (!saleId) return
    const response = await api<Sale>(`sales/${saleId}`)
    if (response) printStore.triggerPrint(response, 'receipt')
}

const splitTable = async (table: Table) => {
    if (!branch.value?.id) return
    await api('tables/split', {
        method: 'POST',
        body: {
            table_id: table.id
        }
    })
    floorStore.fetchTables(branch.value.id, currentFloor.value)
}

const printCaptainOrder = async (salesId: number | undefined) => {
    if (!salesId) {
        useToast().add({
            title: 'Meja ini belum memiliki pesanan.',
            color: 'error'
        })
        return
    }
    try {
        const data = await api<ApiResponse<Sale[]>>(`sales/orders/${salesId}`)
        if (data && data.data[0]) {
            await printStore.triggerPrint(data.data[0], 'captain')
        }
    } catch (e) {
        console.error('Failed to print captain order', e)
        alert('Could not print kitchen ticket')
    }
}

const confirmCheckIn = async (tableId: number) => {
    if (!activeReservation.value) return

    try {
        await api(`reservations/${activeReservation.value.id}/check-in`, {
            method: 'POST',
            body: { table_id: tableId }
        })

        refreshData()
        activeReservation.value = null

        nuxtApp.runWithContext(() => {
            useToast().add({ title: 'Guest Seated!', color: 'success' })
        })
    } catch (e) {
        console.info(e)
        nuxtApp.runWithContext(() => {
            useToast().add({ title: 'Check-in failed', color: 'error' })
        })
    }
}

definePageMeta({
    layout: 'default'
})

onMounted(async () => {
    const response = await api<Branch[] | ApiResponse<Branch[]>>('branches')
    if (Array.isArray(response)) {
        branches.value = response
    } else if (response?.data) {
        branches.value = response.data
    } else {
        branches.value = []
    }

    refreshData()
    fetchTodaysReservations()
    bindEcho()
})
</script>

<template>
    <div class="h-screen flex flex-col max-w-(--ui-container) mx-auto">
        <header class="p-6 flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-black uppercase italic tracking-tighter text-slate-900">
                    Waiter Console
                </h1>
            </div>
            <div class="flex gap-2 p-4 bg-white/50 backdrop-blur-md rounded-4xl border border-white shadow-sm">
                <UButton
                    v-for="f in (branch?.floor_number || 1)"
                    :key="f"
                    :variant="currentFloor === f ? 'solid': 'soft'"
                    class="px-6 py-2 rounded-xl font-black uppercase italic text-xs transition-all shadow-sm"
                    @click="currentFloor = f; refreshData()"
                >
                    Lantai {{ f }}
                </UButton>
                <div class="h-8 w-px bg-slate-200 mx-2" />
                <UFormField
                    label="Cabang"
                    class="flex items-center gap-2 font-black uppercase italic"
                >
                    <USelectMenu
                        v-model="branch"
                        :items="branches"
                        label-key="name"
                    />
                </UFormField>
            </div>
            <div class="flex gap-3">
                <UButton
                    color="neutral"
                    variant="soft"
                    icon="i-lucide-refresh-cw"
                    @click="refreshData()"
                />
                <UButton
                    color="primary"
                    icon="i-lucide-calendar-days"
                    label="Reservations"
                    @click="isReservationModalOpen = true"
                />
            </div>
        </header>

        <main class="flex-1 flex overflow-hidden">
            <div class="relative flex-1 p-6 overflow-y-auto">
                <!-- Seating Banner -->
                <Transition name="fade">
                    <div
                        v-if="activeReservation"
                        class="absolute top-4 left-1/2 -translate-x-1/2 z-50"
                    >
                        <div class="bg-primary-500 text-white px-8 py-4 rounded-full shadow-2xl flex items-center gap-6 border-2 border-white/20">
                            <span class="text-xs font-black uppercase italic tracking-widest">
                                Seating: {{ activeReservation.customer?.name }}
                            </span>
                            <div class="h-4 w-px bg-white/20" />
                            <UButton
                                size="xs"
                                color="info"
                                variant="ghost"
                                label="Cancel"
                                class="font-bold underline"
                                @click="activeReservation = null"
                            />
                        </div>
                    </div>
                </Transition>

                <TableCanvas
                    v-if="branch"
                    :tables="floorStore.tables"
                    :is-shifting-mode="isShiftingMode"
                    :is-merging-mode="isMergingMode"
                    :selected-id="selectedTable?.id"
                    :divisor="8"
                    @select="openActionDrawer"
                    @position-change="updateTablePosition"
                />
            </div>

            <!-- Action Aside -->
            <aside
                v-if="selectedTable"
                class="w-80 border-l border-slate-100 p-6 shadow-2xl bg-white"
            >
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-black uppercase italic text-slate-900 leading-none">
                        Meja {{ selectedTable.table_number }}
                    </h2>
                    <UButton
                        color="neutral"
                        variant="ghost"
                        icon="i-lucide-x"
                        @click="selectedTable = null"
                    />
                </div>

                <div
                    v-if="selectedTable.status === 'available'"
                    class="space-y-3"
                >
                    <button
                        class="w-full py-5 rounded-2xl text-white font-black uppercase italic text-sm shadow-lg transition-all active:scale-95 bg-pink-500 hover:bg-pink-600 hover:shadow-pink-200"
                        @click="openTable(selectedTable!)"
                    >
                        Pakai Meja
                    </button>
                    <div class="grid grid-cols-2 gap-2">
                        <button
                            class="py-4 rounded-2xl text-white font-black uppercase italic text-[10px] shadow-md transition-all active:scale-95 bg-sky-500 hover:bg-sky-600"
                            @click="isShiftingMode = true"
                        >
                            Geser
                        </button>
                        <button
                            class="py-4 rounded-2xl text-white font-black uppercase italic text-[10px] shadow-md transition-all active:scale-95 bg-indigo-500 hover:bg-indigo-600"
                            @click="toggleMergeMode(selectedTable!)"
                        >
                            Gabung
                        </button>
                    </div>
                    <button
                        class="w-full py-4 rounded-2xl text-white font-black uppercase italic text-[10px] shadow-md transition-all active:scale-95 bg-zinc-500 hover:bg-zinc-600"
                        @click="splitTable(selectedTable!)"
                    >
                        Pisah Jalur Meja
                    </button>
                </div>

                <div
                    v-else
                    class="space-y-3"
                >
                    <button
                        class="w-full py-5 rounded-2xl text-white font-black uppercase italic text-sm shadow-lg transition-all active:scale-95 bg-rose-500 hover:bg-rose-600 hover:shadow-rose-200"
                        @click="goToOrder(selectedTable.sales?.[0]?.id, selectedTable.id)"
                    >
                        Pesan Menu
                    </button>

                    <button
                        class="w-full py-4 rounded-2xl text-white font-black uppercase italic text-[10px] shadow-md transition-all active:scale-95 bg-teal-500 hover:bg-teal-600"
                        @click="isMoveModalOpen = true"
                    >
                        Pindah Meja
                    </button>

                    <button
                        class="w-full py-4 rounded-2xl text-white font-black uppercase italic text-[10px] shadow-md transition-all active:scale-95 bg-slate-500 hover:bg-slate-600"
                        @click="goToSplit(selectedTable.sales?.[0]?.id)"
                    >
                        Pisah Meja / Kwitansi
                    </button>

                    <div class="h-px bg-slate-100 my-4" />

                    <button
                        class="w-full py-4 rounded-2xl text-white font-black uppercase italic text-[10px] shadow-md transition-all active:scale-95 bg-cyan-400 hover:bg-cyan-500"
                        @click="printCaptainOrder(selectedTable.sales?.[0]?.id)"
                    >
                        Cetak Order Pending
                    </button>

                    <button
                        class="w-full py-4 rounded-2xl text-white font-black uppercase italic text-[10px] shadow-md transition-all active:scale-95 bg-amber-400 hover:bg-amber-500"
                        @click="printPrePayment(selectedTable!)"
                    >
                        Cetak Kwitansi
                    </button>
                </div>
            </aside>
        </main>

        <TransferModal
            v-if="isMoveModalOpen && selectedTable?.sales?.[0]"
            :sales-id="selectedTable.sales[0].id"
            :source-table="selectedTable.id"
            @close="isMoveModalOpen = false"
        />

        <USlideover
            v-model:open="isReservationModalOpen"
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
                        <div class="flex items-center justify-between mb-4">
                            <div>
                                <h3 class="text-xl font-black italic uppercase tracking-tighter text-slate-900">
                                    Event Booking
                                </h3>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {{ viewMode === 'list' ? 'Arriving Today' : 'New Reservation' }}
                                </p>
                            </div>
                            <UButton
                                color="neutral"
                                variant="ghost"
                                icon="i-lucide-x"
                                @click="isReservationModalOpen = false"
                            />
                        </div>
                        <div class="flex gap-2">
                            <UButton
                                label="Arriving List"
                                :variant="viewMode === 'list' ? 'solid' : 'soft'"
                                size="xs"
                                class="flex-1 font-bold uppercase italic justify-center py-2"
                                @click="viewMode = 'list'"
                            />
                            <UButton
                                label="Book New"
                                :variant="viewMode === 'form' ? 'solid' : 'soft'"
                                size="xs"
                                class="flex-1 font-bold uppercase italic justify-center py-2"
                                @click="viewMode = 'form'"
                            />
                        </div>
                    </template>

                    <div
                        v-if="viewMode === 'list'"
                        class="space-y-3"
                    >
                        <div
                            v-if="todaysReservations.length === 0"
                            class="text-center py-12"
                        >
                            <UIcon
                                name="i-lucide-calendar-x"
                                class="text-4xl text-slate-200 mb-2"
                            />
                            <p class="text-xs font-bold text-slate-400 uppercase">
                                No arrivals today
                            </p>
                        </div>
                        <div
                            v-for="res in todaysReservations"
                            :key="res.id"
                            class="p-5 rounded-2xl border border-slate-200 hover:border-primary cursor-pointer transition-all hover:shadow-lg bg-white"
                            @click="selectReservationForSeating(res); isReservationModalOpen = false"
                        >
                            <div class="flex justify-between items-start mb-2">
                                <p class="font-black italic uppercase text-lg text-slate-900 tracking-tighter">
                                    {{ res.customer?.name }}
                                </p>
                                <UBadge
                                    color="info"
                                    variant="soft"
                                    size="xs"
                                >
                                    {{ res.event_time }}
                                </UBadge>
                            </div>
                            <div class="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                                <UIcon name="i-lucide-users" />
                                {{ res.guaranteed_pax }} Pax
                                <div class="h-1 w-1 rounded-full bg-slate-200 mx-1" />
                                <UIcon name="i-lucide-utensils" />
                                {{ res.buffet?.name }}
                            </div>
                        </div>
                    </div>

                    <ReservationForm
                        v-else
                        @close="isReservationModalOpen = false"
                        @saved="refreshData(); isReservationModalOpen = false"
                    />
                </UCard>
            </template>
        </USlideover>
    </div>
</template>

<style scoped>
.slide-enter-active,
.slide-leave-active {
    transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(100%);
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
