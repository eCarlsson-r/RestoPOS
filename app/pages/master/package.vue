<script setup lang="ts">
import { onMounted } from 'vue'
import { useMaster } from '~/composables/useMaster'
import type { Package } from '~/types/master'
import type { TableColumn } from '@nuxt/ui'

const { items, isFormOpen, selectedItem, fetchItems, saveItem } = useMaster<Package>('packages')

onMounted(() => {
    fetchItems()
})

const columns: TableColumn<Package>[] = [
    {
        accessorKey: 'name',
        header: 'Nama Paket',
        meta: { class: { td: 'uppercase' } }
    },
    {
        accessorKey: 'price',
        header: 'Harga Jual',
        meta: { class: { td: 'text-right' } }
    },
    {
        accessorKey: 'description',
        header: 'Keterangan'
    },
    {
        accessorKey: 'actions',
        header: 'Aksi',
        meta: { class: { td: 'text-center text-right' } }
    }
]

function openNewForm() {
    selectedItem.value = null
    isFormOpen.value = true
}

function editItem(item: Package) {
    selectedItem.value = item
    isFormOpen.value = true
}

const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(val)
}
</script>

<template>
    <UContainer class="py-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-black uppercase italic tracking-tighter">
                Master Paket
            </h1>
            <UButton
                icon="i-lucide-plus"
                label="Tambah Paket"
                size="md"
                @click="openNewForm"
            />
        </div>

        <UCard :ui="{ body: 'p-0' }">
            <ClientOnly>
                <UTable
                    :key="items.length"
                    :rows="items"
                    :columns="columns"
                >
                    <template #name-cell="{ row }">
                        {{ row.original.name }}
                    </template>

                    <template #price-cell="{ row }">
                        {{ formatCurrency(row.original.price) }}
                    </template>

                    <template #description-cell="{ row }">
                        {{ row.original.description }}
                    </template>

                    <template #actions-cell="{ row }">
                        <UButton
                            variant="ghost"
                            color="primary"
                            icon="i-lucide-pencil"
                            square
                            @click="editItem(row.original)"
                        />
                    </template>
                </UTable>
            </ClientOnly>
        </UCard>

        <UModal
            v-model:open="isFormOpen"
            title="Form Paket"
        >
            <template #content>
                <UCard class="overflow-y-auto">
                    <PackageForm
                        :item="selectedItem"
                        @save="saveItem"
                        @close="isFormOpen = false"
                    />
                </UCard>
            </template>
        </UModal>
    </UContainer>
</template>
