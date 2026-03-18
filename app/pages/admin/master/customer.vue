<script setup lang="ts">
import { onMounted } from 'vue'
import { useMaster } from '~/composables/useMaster'
import type { Customer } from '~/types/master'
import type { TableColumn } from '@nuxt/ui'

const { items, isFormOpen, selectedItem, fetchItems, saveItem, deleteItem } = useMaster<Customer>('customers')

onMounted(() => {
    fetchItems()
})

const columns: TableColumn<Customer>[] = [
    {
        accessorKey: 'name',
        header: 'Nama Pelanggan'
    },
    {
        accessorKey: 'address',
        header: 'Alamat'
    },
    {
        accessorKey: 'dob',
        header: 'Tanggal Lahir'
    },
    {
        accessorKey: 'mobile',
        header: 'Nomor Ponsel'
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

function editItem(item: Customer) {
    selectedItem.value = item
    isFormOpen.value = true
}

function removeItem(item: Customer) {
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
                Master Pelanggan
            </h1>
            <UButton
                icon="i-lucide-plus"
                label="Tambah Pelanggan"
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

                    <template #dob-cell="{ row }">
                        {{ row.original.dob }}
                    </template>

                    <template #mobile-cell="{ row }">
                        {{ row.original.mobile }}
                    </template>

                    <template #address-cell="{ row }">
                        {{ row.original.address }}
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
            :title="selectedItem ? 'Edit Pelanggan' : 'Tambah Pelanggan'"
            description="Silahkan isi detail data master pelanggan di bawah ini."
            :ui="{
                title: 'text-xl font-black uppercase italic tracking-tighter'
            }"
            class="sm:max-w-xl"
        >
            <template #body>
                <CustomerForm
                    :item="selectedItem"
                    @save="saveItem"
                    @close="isFormOpen = false"
                />
            </template>
        </UModal>
    </UContainer>
</template>
