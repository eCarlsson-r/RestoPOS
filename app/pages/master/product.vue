<script setup lang="ts">
import { onMounted } from 'vue'
import { useMaster } from '~/composables/useMaster'
import type { Product } from '~/types/master'
import type { TableColumn } from '@nuxt/ui'

const { items, isFormOpen, selectedItem, fetchItems, saveItem } = useMaster<Product>('products')

onMounted(() => {
    fetchItems()
})

const columns: TableColumn<Product>[] = [
    {
        accessorKey: 'id',
        header: 'ID'
    },
    {
        accessorKey: 'name',
        header: 'Nama Produk',
        meta: { class: { td: 'uppercase' } }
    },
    {
        accessorKey: 'category_id',
        header: 'Kategori'
    },
    {
        accessorKey: 'price',
        header: 'Harga Jual',
        meta: { class: { td: 'text-right' } }
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

function editItem(item: Product) {
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
                    :rows="items"
                    :columns="columns"
                >
                    <template #category_id-cell="{ row }">
                        <UBadge
                            variant="subtle"
                            color="neutral"
                            size="sm"
                        >
                            {{ row.original.category_id }}
                        </UBadge>
                    </template>

                    <template #price-cell="{ row }">
                        {{ formatCurrency(row.original.price) }}
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
        >
            <template #content>
                <UCard class="overflow-y-auto">
                    <ProductForm
                        type="product"
                        :item="selectedItem"
                        @save="saveItem"
                        @close="isFormOpen = false"
                    />
                </UCard>
            </template>
        </UModal>
    </UContainer>
</template>
