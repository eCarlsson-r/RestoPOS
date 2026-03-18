<script setup lang="ts">
import { onMounted } from 'vue'
import { useMaster } from '~/composables/useMaster'
import type { Supplier } from '~/types/master'
import type { TableColumn } from '@nuxt/ui'

const { items, isFormOpen, selectedItem, fetchItems, saveItem, deleteItem } = useMaster<Supplier>('suppliers')

onMounted(() => {
    fetchItems()
})

const columns: TableColumn<Supplier>[] = [
    {
        accessorKey: 'name',
        header: 'Nama Pemasok'
    },
    {
        accessorKey: 'address',
        header: 'Alamat'
    },
    {
        accessorKey: 'phone',
        header: 'Nomor Telfon'
    },
    {
        accessorKey: 'mobile',
        header: 'Nomor Ponsel'
    },
    {
        accessorKey: 'email',
        header: 'Alamat eMail'
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

function editItem(item: Supplier) {
    selectedItem.value = item
    isFormOpen.value = true
}

function removeItem(item: Supplier) {
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
                Master Pemasok
            </h1>
            <UButton
                icon="i-lucide-plus"
                label="Tambah Pemasok"
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

                    <template #mobile-cell="{ row }">
                        {{ row.original.mobile }}
                    </template>

                    <template #email-cell="{ row }">
                        {{ row.original.email }}
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
            :title="selectedItem ? 'Edit Pemasok' : 'Tambah Pemasok'"
            description="Lengkapi detail pemasok di bawah ini untuk menyimpan data master."
            :ui="{
                title: 'text-xl font-black uppercase italic tracking-tighter'
            }"
            class="sm:max-w-xl"
        >
            <template #body>
                <SupplierForm
                    :item="selectedItem"
                    @save="saveItem"
                    @close="isFormOpen = false"
                />
            </template>
        </UModal>
    </UContainer>
</template>
