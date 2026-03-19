<script setup lang="ts">
import type { Stock } from '~/types/master'
import type { TableColumn } from '@nuxt/ui'

const { items, isFormOpen, selectedItem, fetchItems, saveItem, deleteItem } = useMaster<Stock>('stock')

onMounted(() => {
    fetchItems()
})

const columns: TableColumn<Stock>[] = [
    { accessorKey: 'branch.name', header: 'Branch' },
    { accessorKey: 'storage', header: 'Storage' },
    { accessorKey: 'item_type', header: 'Type' },
    { accessorKey: 'item_name', header: 'Name' },
    { accessorKey: 'quantity', header: 'Qty' },
    { accessorKey: 'unit', header: 'Unit' },
    { accessorKey: 'actions', header: 'Actions' }
]

const openAddStock = (item = null) => {
    selectedItem.value = item
    isFormOpen.value = true
}

function editStock(item: Stock) {
    selectedItem.value = item
    isFormOpen.value = true
}

function removeStock(stock: Stock) {
    const confirm = window.confirm('Are you sure you want to delete this stock?')
    if (confirm) {
        deleteItem(stock)
    }
}
</script>

<template>
    <UContainer class="p-6">
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-black uppercase italic tracking-tighter">
                Stock Balance
            </h1>
            <UButton
                icon="i-lucide-plus"
                @click="openAddStock()"
            >
                Manual Adjustment
            </UButton>
        </div>

        <UCard :ui="{ body: 'p-0' }">
            <ClientOnly>
                <UTable
                    :key="items.length"
                    :data="items"
                    :columns="columns"
                >
                    <template #quantity-cell="{ row }">
                        <span :class="row.original.quantity < row.original.min_stock ? 'text-rose-500 font-black' : ''">
                            {{ row.original.quantity.toLocaleString() }}
                            <UIcon
                                v-if="row.original.quantity < row.original.min_stock"
                                name="i-lucide-alert-triangle"
                                class="ml-1 w-3 h-3"
                            />
                        </span>
                    </template>

                    <template #actions-cell="{ row }">
                        <UButton
                            variant="ghost"
                            icon="i-lucide-history"
                            @click="navigateTo(`/stock/card?code=${row.original.item_code}`)"
                        />

                        <UButton
                            variant="ghost"
                            color="primary"
                            icon="i-lucide-pencil"
                            square
                            @click="editStock(row.original)"
                        />

                        <UButton
                            variant="ghost"
                            color="error"
                            icon="i-lucide-trash"
                            square
                            @click="removeStock(row.original)"
                        />
                    </template>
                </UTable>
            </ClientOnly>
        </UCard>

        <UModal
            v-model:open="isFormOpen"
            scrollable
            :title="selectedItem ? 'Edit Stok' : 'Tambah Stok'"
            description="Silahkan isi detail stok di bawah ini."
            :ui="{
                title: 'text-xl font-black uppercase italic tracking-tighter'
            }"
            class="sm:max-w-xl"
        >
            <template #body>
                <StockDetailForm
                    :item="selectedItem"
                    @save="saveItem"
                    @close="isFormOpen = false"
                />
            </template>
        </UModal>
    </UContainer>
</template>
