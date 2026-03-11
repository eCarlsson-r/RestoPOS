<script setup>
import TransferModal from '~/components/TransferModal.vue'

const floors = [1, 2, 3] // Pull from branch-code floor-number logic
const currentFloor = 1
const { branch } = useAuth()
const floorStore = useFloorMapStore()
const isCalling = ref(false)
const isMoveModalOpen = ref(false)
const callingTable = ref(null)
const selectedTable = ref(null)
const isDrawerOpen = ref(false)

const openActionDrawer = (table) => {
    selectedTable.value = table
    isDrawerOpen.value = true
}

// Inside the Action Drawer or a Modal
const guestCount = ref(1)

const openTable = async (table) => {
    try {
        const response = await useApi('/api/tables/use', {
            method: 'POST',
            body: {
                table_number: table.table_number,
                floor_number: table.floor_number,
                sales_branch: user.value.branch_code,
                guest_count: guestCount.value, // Added to track covers
                sales_employee: user.value.id
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

const goToOrder = (salesId, tableNumber) => {
    // We use route params for the table and a query for the session ID
    navigateTo({
        path: `/pos/order/${tableNumber || selectedTable.value.id}`,
        query: { salesId: salesId || selectedTable.value.sales[0].id }
    })
}

const goToSplit = (salesId) => {
    if (!salesId) return alert('Meja ini belum memiliki pesanan.')

    navigateTo(`/pos/split/${salesId}`)
}

definePageMeta({
    layout: 'default'
})

// Listen for the event (using Laravel Echo)
onMounted(() => {
    floorStore.fetchTables(currentFloor)

    if (branch.value) {
        window.Echo.channel(`branch.${branch.id}`)
            .listen('WaiterCalled', (e) => {
                // Find the table in the store to get full details if needed
                const spottedTable = floorStore.tables.find(t => t.table_number === e.table)
                if (spottedTable) {
                    callingTable.value = spottedTable
                    isCalling.value = true
                }
            })
    }
})

const getStatusColor = (status) => {
    const colors = {
        available: 'bg-emerald-500 border-emerald-600',
        occupied: 'bg-rose-500 border-rose-600',
        reserved: 'bg-amber-500 border-amber-600',
        dirty: 'bg-slate-400 border-slate-500'
    }
    return colors[status] || 'bg-gray-200'
}
</script>

<template>
    <div class="h-screen flex flex-col max-w-(--ui-container) mx-auto">
        <header class="p-6 flex justify-between items-center">
            <div>
                <h1 class="text-2xl font-black uppercase italic tracking-tighter">
                    Waiter Console
                </h1>
            </div>
            <div class="flex gap-2 p-4 bg-white/50 backdrop-blur-md rounded-4xl border border-white shadow-sm">
                <button
                    v-for="f in floors"
                    :key="f"
                    :class="currentFloor === f ? 'bg-primary text-white' : 'bg-white text-slate-400'"
                    class="px-6 py-2 rounded-xl font-black uppercase italic text-xs transition-all shadow-sm"
                    @click="currentFloor = f;floorStore.fetchTables(f)"
                >
                    Lantai {{ f }}
                </button>
                <div class="h-8 w-px bg-slate-200 mx-2" />
                <div class="flex items-center px-4 text-[10px] font-black uppercase text-indigo-600 italic">
                    Branch: {{ branch.name }}
                </div>
            </div>
            <div class="flex gap-3">
                <UButton
                    color="black"
                    variant="soft"
                    icon="i-lucide-refresh-cw"
                    @click="floorStore.fetchTables(currentFloor)"
                />
                <UButton
                    color="rose"
                    label="Pending Captain Order"
                    icon="i-lucide-printer"
                />
            </div>
        </header>

        <main class="flex-1 flex overflow-hidden">
            <div class="flex-1 p-6 overflow-y-auto">
                <div class="grid grid-cols-4 lg:grid-cols-6 gap-4">
                    <div
                        v-for="table in floorStore.tables"
                        :key="table.id"
                        :class="[
                            'h-32 rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all shadow-sm border-2',
                            getStatusColor(table.status)
                        ]"
                        @click="openActionDrawer(table)"
                    >
                        <span class="text-3xl font-black italic">{{ table.table_number }}</span>
                        <span class="text-[8px] font-black uppercase tracking-widest opacity-60">
                            {{ table.status }}
                        </span>
                    </div>
                </div>
            </div>

            <aside
                v-if="selectedTable"
                class="w-80 bg-white border-l p-6 shadow-2xl"
            >
                <h2 class="text-xl font-black uppercase italic mb-6">
                    Meja {{ selectedTable.table_number }}
                </h2>

                <div class="space-y-4 p-6">
                    <div
                        v-if="selectedTable.status === 'available'"
                        class="space-y-4"
                    >
                        <div class="bg-slate-50 p-4 rounded-2xl">
                            <label class="text-[10px] font-black uppercase text-slate-400">Jumlah Tamu</label>
                            <div class="flex items-center gap-4 mt-2">
                                <UButton
                                    icon="i-lucide-minus"
                                    @click="guestCount--"
                                />
                                <span class="text-xl font-black">{{ guestCount }}</span>
                                <UButton
                                    icon="i-lucide-plus"
                                    @click="guestCount++"
                                />
                            </div>
                        </div>
                        <button
                            class="w-full py-5 rounded-2xl text-white font-black uppercase italic text-sm shadow-lg transition-transform active:scale-95 bg-emerald-500"
                            @click="openTable(selectedTable)"
                        >
                            Pakai Meja
                        </button>
                    </div>

                    <div
                        v-else
                        class="space-y-3"
                    >
                        <button
                            class="w-full py-5 rounded-2xl text-white font-black uppercase italic text-sm shadow-lg transition-transform active:scale-95 bg-rose-500"
                            @click="goToOrder(selectedTable.sales_id, selectedTable.number)"
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
                            @click="goToSplit(selectedTable.sales_id)"
                        >
                            Pisah Meja / Kwitansi
                        </button>

                        <button
                            class="w-full py-5 rounded-2xl text-white font-black uppercase italic text-sm shadow-lg transition-transform active:scale-95 bg-cyan-400 mt-6"
                            @click="printCaptainOrder(selectedTable.sales_id)"
                        >
                            Cetak Captain Order Pending
                        </button>
                    </div>
                </div>
            </aside>
        </main>

        <TransferModal v-if="isMoveModalOpen" />
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
