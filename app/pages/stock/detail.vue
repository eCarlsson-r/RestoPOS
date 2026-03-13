<script setup lang="ts">
import type { Stock } from '~/types/master'
import type { TableColumn } from '@nuxt/ui'

const { items, isFormOpen, selectedItem, fetchItems, saveItem } = useMaster<Stock>('stock')

onMounted(() => {
    fetchItems()
})

const columns: TableColumn<Stock>[] = [
    { accessorKey: 'branch_name', header: 'Branch' },
    { accessorKey: 'item_code', header: 'Code' },
    { accessorKey: 'item_name', header: 'Name' },
    { accessorKey: 'stock_quantity', header: 'Qty' },
    { accessorKey: 'unit', header: 'Unit' },
    { accessorKey: 'actions', header: 'Actions' }
]

const openAddStock = (item = null) => {
    selectedItem.value = item
    isFormOpen.value = true
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
                    :rows="items"
                    :columns="columns"
                >
                    <template #quantity-data="{ row }">
                        <span :class="row.original.quantity < row.original.min_stock ? 'text-rose-500 font-black' : 'text-slate-900'">
                            {{ row.original.quantity.toLocaleString() }}
                            <UIcon
                                v-if="row.original.quantity < row.original.min_stock"
                                name="i-lucide-alert-triangle"
                                class="ml-1 w-3 h-3"
                            />
                        </span>
                    </template>

                    <template #actions-data="{ row }">
                        <UButton
                            variant="ghost"
                            icon="i-lucide-history"
                            @click="navigateTo(`/stock/card?code=${row.original.item_code}`)"
                        />
                    </template>
                </UTable>
            </ClientOnly>
        </UCard>

        <UModal v-model="isFormOpen">
            <template #content>
                <UCard>
                    <StockDetailForm
                        :item="selectedItem"
                        @save="saveItem"
                        @close="isFormOpen = false"
                    />
                </UCard>
            </template>
        </UModal>
    </UContainer>
</template>
