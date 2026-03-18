<script setup lang="ts">
import { onMounted } from 'vue'
import { useMaster } from '~/composables/useMaster'
import type { Category } from '~/types/master'
import type { TableColumn } from '@nuxt/ui'

const { items, isFormOpen, selectedItem, fetchItems, saveItem, deleteItem, deleteExistingImage } = useMaster<Category>('categories')

const kitchenProcess = (value: string) => {
    switch (value) {
        case 'BART':
            return 'Dapur Minuman'
        case 'KTCN':
            return 'Dapur Makanan'
        default:
            return 'Tidak Diketahui'
    }
}
onMounted(() => {
    fetchItems()
})

const columns: TableColumn<Category>[] = [
    {
        accessorKey: 'id',
        header: 'ID'
    },
    {
        accessorKey: 'name',
        header: 'Nama Kategori',
        meta: { class: { td: 'uppercase' } }
    },
    {
        accessorKey: 'kitchen_process',
        header: 'Dapur Proses',
        meta: { class: { td: 'text-center' } }
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

function editItem(item: Category) {
    selectedItem.value = item
    isFormOpen.value = true
}

function removeItem(item: Category) {
    const confirm = window.confirm('Are you sure you want to delete this item?')
    if (confirm) {
        deleteItem(item)
    }
}
</script>

<template>
    <UContainer class="py-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-black uppercase italic tracking-tighter">
                Master Kategori
            </h1>
            <UButton
                icon="i-lucide-plus"
                label="Tambah Kategori"
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

                    <template #kitchen_process-cell="{ row }">
                        {{ kitchenProcess(row.original.kitchen_process) }}
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
            :title="selectedItem ? 'Edit Kategori' : 'Tambah Kategori'"
            description="Silahkan isi detail kategori di bawah ini."
            :ui="{
                title: 'text-xl font-black uppercase italic tracking-tighter'
            }"
            class="sm:max-w-xl"
        >
            <template #body>
                <CategoryForm
                    :item="selectedItem"
                    @save="saveItem"
                    @delete-existing-image="deleteExistingImage"
                    @close="isFormOpen = false"
                />
            </template>
        </UModal>
    </UContainer>
</template>
