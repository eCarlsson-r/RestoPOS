<script setup lang="ts">
import { onMounted } from 'vue'
import { useMaster } from '~/composables/useMaster'
import type { Product } from '~/types/master'
import type { TableColumn } from '@nuxt/ui'

const { items, isFormOpen, selectedItem, fetchItems, saveItem, deleteItem, deleteExistingImage } = useMaster<Product>('products')

onMounted(() => {
    fetchItems()
})

const columns: TableColumn<Product>[] = [
    {
        accessorKey: 'name',
        header: 'Nama Produk',
        meta: { class: { td: 'uppercase' } }
    },
    {
        accessorKey: 'category.name',
        header: 'Kategori'
    },
    {
        accessorKey: 'price',
        header: 'Harga Jual'
    },
    {
        accessorKey: 'cost',
        header: 'Modal'
    },
    {
        accessorKey: 'actions',
        header: 'Aksi'
    }
]

function openNewForm() {
    selectedItem.value = null
    isFormOpen.value = true
}

function editItem(item: Product) {
    selectedItem.value = item
    isFormOpen.value = true
}

function removeItem(item: Product) {
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
                Master Produk
            </h1>
            <UButton
                icon="i-lucide-plus"
                label="Tambah Produk"
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
                    <template #price-cell="{ row }">
                        {{ formatCurrency(row.original.price) }}
                    </template>

                    <template #cost-cell="{ row }">
                        <span class="text-neutral-400">
                            {{ formatCurrency(row.original.cost || 0) }}
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
            :title="selectedItem ? 'Edit Produk' : 'Tambah Produk'"
            description="Lengkapi detail produk di bawah ini."
            :ui="{
                title: 'text-xl font-black uppercase italic tracking-tighter'
            }"
            class="sm:max-w-4xl"
        >
            <template #body>
                <ProductForm
                    type="product"
                    :item="selectedItem"
                    @save="saveItem"
                    @delete-existing-image="deleteExistingImage"
                    @close="isFormOpen = false"
                />
            </template>
        </UModal>
    </UContainer>
</template>
