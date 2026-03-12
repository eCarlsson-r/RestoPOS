<script setup lang="ts">
import { onMounted } from 'vue'
import { useMaster } from '~/composables/useMaster'
import type { Prepare } from '~/types/master'
import type { TableColumn } from '@nuxt/ui'

const { items, isFormOpen, selectedItem, fetchItems, saveItem } = useMaster<Prepare>('prepare')

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
                    :rows="items"
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
                    </template>
                </UTable>
            </ClientOnly>
        </UCard>

        <UModal
            v-model:open="isFormOpen"
            title="Form Produk"
            class="w-[500px]"
        >
            <template #content>
                <UCard class="overflow-y-auto">
                    <PrepareForm
                        type="product"
                        :item="selectedItem || {}"
                        @save="saveItem"
                        @close="isFormOpen = false"
                    />
                </UCard>
            </template>
        </UModal>
    </UContainer>
</template>
