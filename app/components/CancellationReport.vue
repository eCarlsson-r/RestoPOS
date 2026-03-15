<template>
    <div class="space-y-4">
        <div class="bg-rose-600 text-white p-6 rounded-4xl mb-6 shadow-lg shadow-rose-100">
            <p class="text-[10px] font-black uppercase opacity-70 italic">
                Total Revenue Lost (Voids)
            </p>
            <h2 class="text-3xl font-black italic tracking-tighter">
                Rp {{ totalLost.toLocaleString() }}
            </h2>
        </div>

        <UTable
            :rows="voidData"
            :columns="columns"
        >
            <template #reason-data="{ row }">
                <span class="text-xs font-bold text-rose-500 italic uppercase">
                    "{{ row.reason }}"
                </span>
            </template>

            <template #authorized_by-data="{ row }">
                <UBadge
                    color="white"
                    variant="solid"
                    class="border border-slate-200 text-slate-700 font-black italic"
                >
                    {{ row.authorized_by }}
                </UBadge>
            </template>
        </UTable>
    </div>
</template>

<script setup>
const props = defineProps({
    voidData: {
        type: Array,
        required: true
    }
})

const totalLost = computed(() => {
    return props.voidData.reduce((acc, item) => acc + item.total_lost, 0)
})

const columns = [
    { key: 'time', label: 'Time' },
    { key: 'invoice', label: 'Inv #' },
    { key: 'items', label: 'Items Voided' },
    { key: 'reason', label: 'Reason' },
    { key: 'waiter', label: 'Waiter' },
    { key: 'authorized_by', label: 'Auth By' },
    { key: 'total_lost', label: 'Amount' }
]
</script>
