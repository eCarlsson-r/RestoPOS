<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { BuffetPackage } from '~/types/master'

const { items, isFormOpen, selectedItem, fetchItems, saveItem, deleteItem, deleteExistingImage } = useMaster<BuffetPackage>('buffet')

const editItem = (item: BuffetPackage) => {
    selectedItem.value = item
    isFormOpen.value = true
}

function removeItem(item: BuffetPackage) {
    const confirm = window.confirm('Are you sure you want to delete this item?')
    if (confirm) {
        deleteItem(item)
    }
}

onMounted(() => {
    fetchItems()
})

const columns: TableColumn<BuffetPackage>[] = [
    {
        accessorKey: 'name',
        header: 'Nama Paket'
    },
    {
        accessorKey: 'price_adult',
        header: 'Harga Dewasa'
    },
    {
        accessorKey: 'price_child',
        header: 'Harga Anak'
    },
    {
        accessorKey: 'duration_minutes',
        header: 'Durasi'
    },
    {
        accessorKey: 'actions',
        header: 'Aksi'
    }
]
</script>

<template>
    <UContainer class="py-6">
        <header class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-black italic uppercase">
                Buffet Packages
            </h1>
            <UButton
                icon="i-lucide-plus"
                @click="isFormOpen = true"
            >
                Create Package
            </UButton>
        </header>

        <UTable
            :data="items"
            :columns="columns"
        >
            <template #price_adult-cell="{ row }">
                Rp {{ row.original.price_adult.toLocaleString() }}
            </template>
            <template #price_child-cell="{ row }">
                Rp {{ row.original.price_child.toLocaleString() }}
            </template>
            <template #duration_minutes-cell="{ row }">
                {{ row.original.duration_minutes }} Min
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

        <UModal
            v-model:open="isFormOpen"
            scrollable
            :title="selectedItem ? 'Edit Paket Buffet' : 'Tambah Paket Buffet'"
            description="Silahkan isi detail paket buffet di bawah ini."
            :ui="{
                title: 'text-xl font-black uppercase italic tracking-tighter'
            }"
            class="sm:max-w-2xl"
        >
            <template #body>
                <BuffetPackageForm
                    :item="selectedItem"
                    @save="saveItem"
                    @delete-existing-image="deleteExistingImage"
                    @close="isFormOpen = false"
                />
            </template>
        </UModal>
    </UContainer>
</template>
