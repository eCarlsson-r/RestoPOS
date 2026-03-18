<script setup lang="ts">
import { onMounted } from 'vue'
import { useMaster } from '~/composables/useMaster'
import type { Employee } from '~/types/master'
import type { TableColumn } from '@nuxt/ui'

const { items, isFormOpen, selectedItem, fetchItems, saveItem, deleteItem } = useMaster<Employee>('employees')

onMounted(() => {
    fetchItems()
})

const columns: TableColumn<Employee>[] = [
    {
        accessorKey: 'name',
        header: 'Nama Pegawai'
    },
    {
        accessorKey: 'home_address',
        header: 'Alamat Rumah'
    },
    {
        accessorKey: 'mobile',
        header: 'Nomor Ponsel'
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

function editItem(item: Employee) {
    selectedItem.value = item
    isFormOpen.value = true
}

function removeItem(item: Employee) {
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
                Master Pegawai
            </h1>
            <UButton
                icon="i-lucide-plus"
                label="Tambah Pegawai"
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

                    <template #home_address-cell="{ row }">
                        {{ row.original.home_address }}
                    </template>

                    <template #mobile-cell="{ row }">
                        {{ row.original.mobile }}
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
            :title="selectedItem ? 'Edit Pegawai' : 'Tambah Pegawai'"
            description="Silahkan isi detail data master pegawai di bawah ini."
            :ui="{
                title: 'text-xl font-black uppercase italic tracking-tighter'
            }"
            class="sm:max-w-xl"
        >
            <template #body>
                <EmployeeForm
                    :item="selectedItem"
                    @save="saveItem"
                    @close="isFormOpen = false"
                />
            </template>
        </UModal>
    </UContainer>
</template>
