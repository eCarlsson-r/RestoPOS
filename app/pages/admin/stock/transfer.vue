<template>
    <UContainer class="p-6">
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-black uppercase italic tracking-tighter">
                Recent Movements
            </h1>
            <UButton
                @click="openTransferStock()"
            >
                New Transfer
            </UButton>
        </div>

        <UCard :ui="{ body: 'p-0' }">
            <ClientOnly>
                <UTable
                    :data="items"
                    :columns="moveColumns"
                >
                    <template #status-cell="{ row }">
                        <UBadge
                            :color="row.original.status === 'COMPLETED' ? 'success' : 'warning'"
                            variant="subtle"
                        >
                            {{ row.original.status }}
                        </UBadge>
                    </template>

                    <template #actions-cell="{ row }">
                        <UButton
                            v-if="row.original.status === 'M'"
                            size="xs"
                            label="Receive"
                            @click="receiveStock(row.original.id)"
                        />
                    </template>
                </UTable>
            </ClientOnly>
        </UCard>

        <UModal
            v-model:open="isFormOpen"
            scrollable
            :title="selectedItem ? 'Terima Stok' : 'Pindah Stok'"
            :ui="{
                title: 'text-xl font-black uppercase italic tracking-tighter'
            }"
            class="sm:max-w-4xl"
        >
            <template #body>
                <StockTransferForm
                    :item="selectedItem"
                    @save="saveItem"
                    @receive="receiveStock"
                    @close="isFormOpen = false"
                />
            </template>
        </UModal>
    </UContainer>
</template>

<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { StockMove } from '~/types/master'

const { items, isFormOpen, selectedItem, fetchItems, saveItem } = useMaster<StockMove>('stock/transfers')

const moveColumns: TableColumn<StockMove>[] = [
    { accessorKey: 'date', header: 'Date' },
    { accessorKey: 'from_branch.name', header: 'From Branch' },
    { accessorKey: 'from_storage', header: 'From Storage' },
    { accessorKey: 'to_branch.name', header: 'To Branch' },
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
