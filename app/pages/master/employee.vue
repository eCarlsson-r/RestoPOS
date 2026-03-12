<script setup lang="ts">
import { onMounted } from 'vue'
import { useMaster } from '~/composables/useMaster'
import type { Employee } from '~/types/master'
import type { TableColumn } from '@nuxt/ui'

const { items, isFormOpen, selectedItem, fetchItems, saveItem } = useMaster<Employee>('employees')

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
                    :rows="items"
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
                    </template>
                </UTable>
            </ClientOnly>
        </UCard>

        <UModal
            v-model:open="isFormOpen"
            class="w-[500px]"
        >
            <template #content>
                <UCard class="overflow-y-auto">
                    <EmployeeForm
                        :item="selectedItem || {}"
                        @save="saveItem"
                        @close="isFormOpen = false"
                    />
                </UCard>
            </template>
        </UModal>
    </UContainer>
</template>
