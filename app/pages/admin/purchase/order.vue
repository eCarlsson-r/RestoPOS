<script setup lang="ts">
import { onMounted } from 'vue'
import { useMaster } from '~/composables/useMaster'
import type { PurchaseOrder } from '~/types/master'
import type { TableColumn } from '@nuxt/ui'

const { items, isFormOpen, selectedItem, fetchItems, saveItem } = useMaster<PurchaseOrder>('purchasing/orders')

onMounted(() => {
    fetchItems()
})

function openNewForm() {
    selectedItem.value = null
    isFormOpen.value = true
}

function editItem(item: PurchaseOrder) {
    selectedItem.value = item
    isFormOpen.value = true
}

const columns: TableColumn<PurchaseOrder>[] = [
    {
        accessorKey: 'supplier.name',
        header: 'Supplier'
    },
    {
        accessorKey: 'date',
        header: 'Tanggal'
    },
    {
        accessorKey: 'delivery_date',
        header: 'Tanggal Kirim'
    },
    {
        accessorKey: 'status',
        header: 'Status'
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
</script>

<template>
    <UContainer class="py-6">
        <div class="flex justify-between items-center mb-6">
            <h1 class="text-2xl font-black uppercase italic tracking-tighter">
                Purchase Order
            </h1>
            <UButton
                icon="i-lucide-plus"
                label="Tambah Purchase Order"
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
                        {{ row.original.supplier?.name }}
                    </template>

                    <template #date-cell="{ row }">
                        {{ row.original.date }}
                    </template>

                    <template #delivery-date-cell="{ row }">
                        {{ row.original.delivery_date }}
                    </template>

                    <template #status-cell="{ row }">
                        <UBadge
                            :color="row.original.status === 'PENDING' ? 'warning' : 'success'"
                            variant="subtle"
                            class="font-black italic text-[10px]"
                        >
                            {{ row.original.status }}
                        </UBadge>
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
        >
            <template #content>
                <UCard>
                    <PurchaseForm
                        type="order"
                        :item="selectedItem"
                        @save="saveItem"
                        @close="isFormOpen = false"
                    />
                </UCard>
            </template>
        </UModal>
    </UContainer>
</template>
