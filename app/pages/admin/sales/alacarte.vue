<script setup lang="ts">
import { onMounted } from 'vue'
import { useMaster } from '~/composables/useMaster'
import type { Sale } from '~/types/master'
import type { TableColumn } from '@nuxt/ui'

const { items, fetchItems } = useMaster<Sale>('sales')

onMounted(() => {
    fetchItems()
})

const columns: TableColumn<Sale>[] = [
    { accessorKey: 'created_at', header: 'Created At' },
    { accessorKey: 'branch.name', header: 'Branch Name' },
    { accessorKey: 'customer.name', header: 'Customer Name' },
    { accessorKey: 'employee.name', header: 'Employee Name' },
    { accessorKey: 'table.floor_number', header: 'Floor' },
    { accessorKey: 'table.table_number', header: 'Table' },
    { accessorKey: 'status', header: 'Status' }
]

const getStatus = (value: 'O' | 'P' | 'C' | 'D' | 'X') => {
    if (value === 'O') return 'Not Yet Proccesed'
    else if (value === 'P') return 'Processing Order'
    else if (value === 'C') return 'Ready to Deliver'
    else if (value === 'D') return 'Order Delivered'
    else if (value === 'X') return 'Order Cancelled'
}

const statusColors: Record<string, 'neutral' | 'warning' | 'info' | 'success' | 'error'> = {
    O: 'neutral',
    P: 'warning',
    C: 'info',
    D: 'success',
    X: 'error'
}
</script>

<template>
    <UContainer class="py-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-black uppercase italic tracking-tighter">
                Alacarte Sales
            </h1>
            <UButton
                icon="i-lucide-plus"
                label="Penjualan Baru"
                size="md"
                to="/pos/order"
            />
        </div>

        <UCard :ui="{ body: 'p-0' }">
            <ClientOnly>
                <UTable
                    :key="items.length"
                    :data="items"
                    :columns="columns"
                >
                    <template #created_at-cell="{ row }">
                        {{ new Date(row.original.created_at??'').toLocaleString() }}
                    </template>
                    <template #status-cell="{ row }">
                        <UBadge
                            :color="statusColors[row.original.status]"
                            variant="subtle"
                            class="font-black italic text-[10px]"
                        >
                            {{ getStatus(row.original.status) }}
                        </UBadge>
                    </template>
                </UTable>
            </ClientOnly>
        </UCard>
    </UContainer>
</template>
