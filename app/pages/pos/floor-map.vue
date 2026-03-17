<script setup>
import TransferModal from '~/components/TransferModal.vue'

const currentFloor = ref(1)
const { user } = useAuth()
const floorStore = useFloorMapStore()
const isCalling = ref(false)
const isMoveModalOpen = ref(false)
const callingTable = ref(null)
const selectedTable = ref(null)
const isDrawerOpen = ref(false)
const isShiftingMode = ref(false)
const isMergingMode = ref(false)
const mergeSelection = ref([])
const branch = ref(user.value.employee?.branch)
const branches = ref([])
const printStore = usePrintStore()

const refreshData = () => {
    if (branch.value?.id) {
        floorStore.fetchTables(branch.value.id, currentFloor.value)
    }
}

const bindEcho = () => {
    if (branch.value?.id) {
        window.Echo.leave(`branch.*`)
        window.Echo.channel(`branch.${branch.value.id}`)
            .listen('WaiterCalled', (e) => {
                const spottedTable = floorStore.tables.find(t => t.table_number === e.table)
                if (spottedTable) {
                    callingTable.value = spottedTable
                    isCalling.value = true
                }
            })
    }
}

watch(branch, (newVal) => {
    if (newVal) {
        currentFloor.value = 1 // Reset to floor 1 on branch change
        refreshData()
        bindEcho()
    }
}, { deep: true })

const openActionDrawer = (table) => {
    if (isMergingMode.value && mergeSelection.value.length > 0) {
        mergeSelection.value.push(table.id)
        confirmMerge()
    } else {
        selectedTable.value = table
        isDrawerOpen.value = true
    }
}

// Inside the Action Drawer or a Modal
const guestCount = ref(1)

const openTable = async (table) => {
    try {
        const response = await useApi('/api/tables/use', {
            method: 'POST',
            body: {
                table_id: table.id,
                guest_count: guestCount.value // Added to track covers
            }
        })

        if (response.sales_id) {
            // Once opened, immediately take the waiter to the menu
            goToOrder(response.sales_id, table.id)
        }
    } catch (e) {
        console.error('Failed to open table', e)
    }
}

const goToOrder = (salesId, tableId) => {
    // We use route params for the table and a query for the session ID
    navigateTo({
        path: `/pos/order/${tableId || selectedTable.value.id}`,
        query: { salesId: salesId || selectedTable.value.sales[0].id }
    })
}

const goToSplit = (salesId) => {
    if (!salesId) return alert('Meja ini belum memiliki pesanan.')

    navigateTo(`/pos/split/${salesId}`)
}

const toggleMergeMode = (table) => {
    isMergingMode.value = !isMergingMode.value
    mergeSelection.value = [table.id]
}

// 1. SHIFT TABLE LOGIC
const updateTablePosition = async (table, newX, newY) => {
    try {
        await useApi('/api/tables/shift', {
            method: 'POST',
            body: {
                branch_id: branch.value.id,
                floor_number: currentFloor,
                table_id: table.id,
                position_x: newX,
                position_y: newY
            }
        })
        // Refresh the local store to show new positions
        await floorStore.fetchTables(branch.value.id, currentFloor)
        isShiftingMode.value = false
    } catch (e) {
        console.error('Failed to shift table', e)
    }
}

// 2. MERGE TABLE LOGIC
const confirmMerge = async () => {
    if (mergeSelection.value.length !== 2) return

    await useApi('/api/tables/merge', {
        method: 'POST',
        body: {
            table1: mergeSelection.value[0],
            table2: mergeSelection.value[1],
            branch: user.value.branch_id
        }
    })
    isMergingMode.value = false
    mergeSelection.value = []
    floorStore.fetchTables(branch.value.id, currentFloor)
}

// 3. PRE-PAYMENT LOGIC (Waitress Bill)
const printPrePayment = async (table) => {
    // Original Carlsson logic: Get items but don't finalize
    const response = await useApi(`/api/sales/${table.sales[0].id}`)
    if (response) printStore.triggerPrint(response, true)
}

const splitTable = async (table) => {
    await useApi('/api/tables/split', {
        method: 'POST',
        body: {
            table_id: table.id
        }
    })
    floorStore.fetchTables(branch.value.id, currentFloor)
}

const printCaptainOrder = async (salesId) => {
    try {
        // Fetch the latest state of the order
        const data = await useApi(`/api/sales/orders/${salesId}`)

        if (data) {
            // Trigger print with 'captain' mode
            await printStore.triggerPrint(data[0], 'captain')
        }
    } catch (e) {
        console.error('Failed to print captain order', e)
        alert('Could not print kitchen ticket')
    }
}

definePageMeta({
    layout: 'default'
})

// Listen for the event (using Laravel Echo)
onMounted(async () => {
    const response = await useApi('/api/branches')
    if (Array.isArray(response)) {
        branches.value = response
    } else if (response && typeof response === 'object' && 'data' in response) {
        branches.value = response.data
    } else {
        branches.value = []
    }

    refreshData()
    bindEcho()
})
</script>

<template>
    <div class="h-screen flex flex-col max-w-(--ui-container) mx-auto">
        <header class="p-6 flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-black uppercase italic tracking-tighter">
                    Waiter Console
                </h1>
            </div>
            <div class="flex gap-2 p-4 backdrop-blur-md rounded-4xl border border-white shadow-sm">
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
                        value-key="id"
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
            </div>
        </header>

        <main class="flex-1 flex overflow-hidden">
            <div class="flex-1 p-6 overflow-y-auto">
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

            <aside
                v-if="selectedTable"
                class="w-80 border-l p-6 shadow-2xl"
            >
                <h2 class="text-xl font-black uppercase italic mb-6">
                    Meja {{ selectedTable.table_number }}
                </h2>

                <div
                    v-if="selectedTable.status === 'available'"
                    class="space-y-3"
                >
                    <button
                        class="w-full py-5 rounded-2xl text-white font-black uppercase italic text-sm shadow-lg transition-transform active:scale-95 bg-pink-500"
                        @click="openTable(selectedTable)"
                    >
                        Pakai Meja
                    </button>
                    <button
                        class="w-full py-5 rounded-2xl text-white font-black uppercase italic text-sm shadow-lg transition-transform active:scale-95 bg-sky-500"
                        @click="isShiftingMode = true"
                    >
                        Geser Meja
                    </button>
                    <button
                        class="w-full py-5 rounded-2xl text-white font-black uppercase italic text-sm shadow-lg transition-transform active:scale-95 bg-indigo-500"
                        @click="toggleMergeMode(selectedTable)"
                    >
                        Gabung Meja
                    </button>
                    <button
                        class="w-full py-5 rounded-2xl text-white font-black uppercase italic text-sm shadow-lg transition-transform active:scale-95 bg-zinc-500"
                        @click="splitTable(selectedTable)"
                    >
                        Pisah Meja
                    </button>
                </div>

                <div
                    v-else
                    class="space-y-3"
                >
                    <button
                        class="w-full py-5 rounded-2xl text-white font-black uppercase italic text-sm shadow-lg transition-transform active:scale-95 bg-rose-500"
                        @click="goToOrder(selectedTable.sales[0].id, selectedTable.id)"
                    >
                        Pesan Menu
                    </button>

                    <button
                        class="w-full py-5 rounded-2xl text-white font-black uppercase italic text-sm shadow-lg transition-transform active:scale-95 bg-teal-500"
                        @click="isMoveModalOpen = true"
                    >
                        Pindah Meja
                    </button>

                    <button
                        class="w-full py-5 rounded-2xl text-white font-black uppercase italic text-sm shadow-lg transition-transform active:scale-95 bg-slate-500"
                        @click="goToSplit(selectedTable.sales[0].id)"
                    >
                        Pisah Meja / Kwitansi
                    </button>

                    <button
                        class="w-full py-5 rounded-2xl text-white font-black uppercase italic text-sm shadow-lg transition-transform active:scale-95 bg-cyan-400"
                        @click="printCaptainOrder(selectedTable.sales[0].id)"
                    >
                        Cetak Captain Order Pending
                    </button>

                    <button
                        class="w-full py-5 rounded-2xl text-white font-black uppercase italic text-sm shadow-lg transition-transform active:scale-95 bg-amber-400"
                        @click="printPrePayment(selectedTable)"
                    >
                        Cetak Kwitansi
                    </button>
                </div>
            </aside>
        </main>

        <TransferModal
            v-if="isMoveModalOpen"
            :sales-id="selectedTable.sales[0].id"
            :source-table="selectedTable.id"
            @close="isMoveModalOpen = false"
        />
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
