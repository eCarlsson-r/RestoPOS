<script setup lang="ts">
import { onMounted } from 'vue'
import { useMaster } from '~/composables/useMaster'
import type { Branch } from '~/types/master'
import type { TableColumn } from '@nuxt/ui'

const { items, isFormOpen, selectedItem, fetchItems, saveItem, deleteItem, deleteExistingImage } = useMaster<Branch>('branches')

onMounted(() => {
    fetchItems()
})

const columns: TableColumn<Branch>[] = [
    {
        accessorKey: 'name',
        header: 'Nama Cabang',
        meta: { class: { td: 'uppercase' } }
    },
    {
        accessorKey: 'address',
        header: 'Alamat Cabang'
    },
    {
        accessorKey: 'phone',
        header: 'Nomor Telfon'
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

function editItem(item: Branch) {
    selectedItem.value = item
    isFormOpen.value = true
}

function removeItem(item: Branch) {
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
                Master Cabang
            </h1>
            <UButton
                icon="i-lucide-plus"
                label="Tambah Cabang"
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

                    <template #address-cell="{ row }">
                        {{ row.original.address }}
                    </template>

                    <template #phone-cell="{ row }">
                        {{ row.original.phone }}
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
            class="sm:max-w-xl"
            :title="selectedItem ? 'Edit Cabang' : 'Tambah Cabang'"
            description="Silahkan isi detail cabang di bawah ini."
            :ui="{
                title: 'text-xl font-black uppercase italic tracking-tighter'
            }"
        >
            <template #body>
                <BranchForm
                    :item="selectedItem"
                    @save="saveItem"
                    @delete-existing-image="deleteExistingImage"
                    @close="isFormOpen = false"
                />
            </template>
        </UModal>
    </UContainer>
</template>
