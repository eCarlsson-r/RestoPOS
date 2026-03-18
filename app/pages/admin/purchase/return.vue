<script setup lang="ts">
import { onMounted } from 'vue'
import { useMaster } from '~/composables/useMaster'
import type { PurchaseReturn } from '~/types/master'
import type { TableColumn } from '@nuxt/ui'

const { items, isFormOpen, selectedItem, fetchItems, saveItem } = useMaster<PurchaseReturn>('purchasing/returns')

onMounted(() => {
    fetchItems()
})

function openNewForm() {
    selectedItem.value = null
    isFormOpen.value = true
}

const columns: TableColumn<PurchaseReturn>[] = [
    {
        accessorKey: 'supplier.name',
        header: 'Supplier'
    },
    {
        accessorKey: 'date',
        header: 'Tanggal'
    },
    {
        accessorKey: 'delivery_date',
        header: 'Tanggal Kirim'
    },
    {
        accessorKey: 'description',
        header: 'Keterangan'
    }
]
</script>

<template>
    <UContainer class="py-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-black uppercase italic tracking-tighter">
                Retur Pembelian
            </h1>
            <UButton
                icon="i-lucide-plus"
                label="Retur Barang"
                size="md"
                @click="openNewForm"
            />
        </div>

        <UCard :ui="{ body: 'p-0' }">
            <ClientOnly>
                <UTable
                    :key="items.length"
                    :data="items"
                    :columns="columns"
                >
                    <template #name-cell="{ row }">
                        {{ row.original.supplier?.name }}
                    </template>

                    <template #date-cell="{ row }">
                        {{ row.original.date }}
                    </template>

                    <template #delivery-date-cell="{ row }">
                        {{ row.original.delivery_date }}
                    </template>

                    <template #description-cell="{ row }">
                        {{ row.original.description }}
                    </template>
                </UTable>
            </ClientOnly>
        </UCard>

        <UModal
            v-model:open="isFormOpen"
            scrollable
            fullscreen
            :title="selectedItem ? 'Edit Retur Pembelian' : 'Tambah Retur Pembelian'"
            :ui="{
                title: 'text-xl font-black uppercase italic tracking-tighter'
            }"
        >
            <template #body>
                <PurchaseForm
                    type="return"
                    :item="selectedItem"
                    @save="saveItem"
                    @close="isFormOpen = false"
                />
            </template>
        </UModal>
    </UContainer>
</template>
