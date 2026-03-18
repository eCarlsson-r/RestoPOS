<script setup lang="ts">
import { onMounted } from 'vue'
import { useMaster } from '~/composables/useMaster'
import type { Package } from '~/types/master'
import type { TableColumn } from '@nuxt/ui'

const { items, isFormOpen, selectedItem, fetchItems, saveItem, deleteItem, deleteExistingImage } = useMaster<Package>('packages')

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

function removeItem(item: Package) {
    const confirm = window.confirm('Are you sure you want to delete this item?')
    if (confirm) {
        deleteItem(item)
    }
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
                    :data="items"
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

                        <UButton
                            variant="ghost"
                            color="error"
                            icon="i-lucide-trash"
                            square
                            @click="removeItem(row.original)"
                        />
                    </template>
                </UTable>
            </ClientOnly>
        </UCard>

        <UModal
            v-model:open="isFormOpen"
            scrollable
            :title="selectedItem ? 'Edit Paket' : 'Tambah Paket'"
            description="Silahkan isi detail data master paket di bawah ini."
            :ui="{
                title: 'text-xl font-black uppercase italic tracking-tighter'
            }"
            class="sm:max-w-4xl"
        >
            <template #body>
                <PackageForm
                    :item="selectedItem"
                    @save="saveItem"
                    @delete-existing-image="deleteExistingImage"
                    @close="isFormOpen = false"
                />
            </template>
        </UModal>
    </UContainer>
</template>
