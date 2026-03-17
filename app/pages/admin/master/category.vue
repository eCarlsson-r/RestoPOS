<script setup lang="ts">
import { onMounted } from 'vue'
import { useMaster } from '~/composables/useMaster'
import type { Category } from '~/types/master'
import type { TableColumn } from '@nuxt/ui'

const { items, isFormOpen, selectedItem, fetchItems, saveItem } = useMaster<Category>('categories')

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
                    </template>
                </UTable>
            </ClientOnly>
        </UCard>

        <UModal
            v-model:open="isFormOpen"
            class="w-[500px]"
        >
            <template #content>
                <UCard>
                    <CategoryForm
                        :item="selectedItem"
                        @save="saveItem"
                        @close="isFormOpen = false"
                    />
                </UCard>
            </template>
        </UModal>
    </UContainer>
</template>
