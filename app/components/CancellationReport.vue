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
            <template #date-data="{ row }">
                <span class="text-xs font-bold text-slate-500 italic uppercase">
                    {{ new Date(row.date).toLocaleDateString('id-ID') }}
                </span>
            </template>

            <template #total_price-data="{ row }">
                <span class="font-bold text-rose-500 italic">
                    Rp {{ row.total_price.toLocaleString() }}
                </span>
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
    return props.voidData.reduce((acc, item) => acc + item['total_price'], 0)
})

const columns = [
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'sales_id', header: 'Invoice' },
    { accessorKey: 'branch_name', header: 'Branch' },
    { accessorKey: 'item_name', header: 'Item' },
    { accessorKey: 'quantity', header: 'Qty' },
    { accessorKey: 'item_price', header: 'Price' },
    { accessorKey: 'discount_percent', header: 'Disc%' },
    { accessorKey: 'total_price', header: 'Amount' }
]
</script>
