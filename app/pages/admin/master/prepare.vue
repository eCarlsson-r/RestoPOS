<script setup lang="ts">
import { onMounted } from 'vue'
import { useMaster } from '~/composables/useMaster'
import type { Prepare } from '~/types/master'
import type { TableColumn } from '@nuxt/ui'

const { items, isFormOpen, selectedItem, fetchItems, saveItem, deleteItem } = useMaster<Prepare>('prepare')

onMounted(() => {
    fetchItems()
})

const columns: TableColumn<Prepare>[] = [
    {
        accessorKey: 'id',
        header: 'ID'
    },
    {
        accessorKey: 'name',
        header: 'Nama Bahan Jadi',
        meta: { class: { td: 'uppercase' } }
    },
    {
        accessorKey: 'quantity',
        header: 'Jumlah'
    },
    {
        accessorKey: 'cost',
        header: 'Modal',
        meta: { class: { td: 'text-right' } }
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

function editItem(item: Prepare) {
    selectedItem.value = item
    isFormOpen.value = true
}

function removeItem(item: Prepare) {
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
                Master Prepare
            </h1>
            <UButton
                icon="i-lucide-plus"
                label="Tambah Prepare"
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

                    <template #quantity-cell="{ row }">
                        {{ row.original.quantity }}
                    </template>

                    <template #cost-cell="{ row }">
                        <span class="text-neutral-400">
                            {{ formatCurrency(row.original.cost) }}
                        </span>
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
            :title="selectedItem ? 'Edit Prepare' : 'Tambah Prepare'"
            description="Silahkan isi detail data master prepare di bawah ini."
            :ui="{
                title: 'text-xl font-black uppercase italic tracking-tighter'
            }"
            class="sm:max-w-4xl"
        >
            <template #body>
                <ProductForm
                    type="prepare"
                    :item="selectedItem"
                    @save="saveItem"
                    @close="isFormOpen = false"
                />
            </template>
        </UModal>
    </UContainer>
</template>
