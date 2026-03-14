<template>
    <UContainer class="p-6">
        <div class="flex justify-between items-center">
            <h1 class="text-3xl font-black uppercase italic tracking-tighter">
                Recent Movements
            </h1>
            <UButton
                @click="openTransferStock()"
            >
                New Transfer
            </UButton>
        </div>

        <UTable
            :data="items"
            :columns="moveColumns"
        >
            <template #status-data="{ row }">
                <UBadge
                    :color="row.original.status === 'COMPLETED' ? 'success' : 'warning'"
                    variant="subtle"
                >
                    {{ row.original.status }}
                </UBadge>
            </template>

            <template #actions-data="{ row }">
                <UButton
                    v-if="row.original.status === 'PENDING'"
                    size="xs"
                    label="Receive"
                    @click="receiveStock(row.original.id)"
                />
            </template>
        </UTable>

        <UModal v-model="isFormOpen">
            <template #content>
                <UCard>
                    <StockTransferForm
                        :item="selectedItem"
                        @save="saveItem"
                        @receive="receiveStock"
                        @close="isFormOpen = false"
                    />
                </UCard>
            </template>
        </UModal>
    </UContainer>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { StockMove } from '~/types/master'

const { items, isFormOpen, selectedItem, fetchItems, saveItem } = useMaster<StockMove>('stock/transfers')

const moveColumns: TableColumn<StockMove>[] = [
    { accessorKey: 'move_date', header: 'Date' },
    { accessorKey: 'from_branch_id', header: 'From Branch' },
    { accessorKey: 'from_storage', header: 'From Storage' },
    { accessorKey: 'to_branch_id', header: 'To Branch' },
    { accessorKey: 'to_storage', header: 'To Storage' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'actions', header: 'Actions' }
]

const openTransferStock = (item = null) => {
    selectedItem.value = item
    isFormOpen.value = true
}

const receiveStock = async (id: number) => {
    await useApi(`/api/stock/receive/${id}`, {
        method: 'POST'
    })
    fetchItems()
}

onMounted(() => {
    fetchItems()
})
</script>
