<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { KitchenRequest } from '~/types/master'

const { items, isFormOpen, selectedItem, fetchItems, saveItem } = useMaster<KitchenRequest>('stock/requests')

onMounted(() => {
    fetchItems()
})

const columns: TableColumn<KitchenRequest>[] = [
    { accessorKey: 'id', header: 'Req #' },
    { accessorKey: 'from_branch.name', header: 'From' },
    { accessorKey: 'items.length', header: 'Items' },
    { accessorKey: 'status', header: 'Status' },
    { accessorKey: 'actions', header: '' }
]

const openRespond = (req: KitchenRequest) => {
    selectedItem.value = req
    isFormOpen.value = true
}
</script>

<template>
    <UContainer class="p-6">
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-black uppercase italic tracking-tighter">
                Kitchen Request
            </h1>
        </div>

        <UTable
            :data="items"
            :columns="columns"
        >
            <template #status-data="{ row }">
                <UBadge
                    :color="row.original.status === 'PENDING' ? 'warning' : 'success'"
                    variant="subtle"
                    class="font-black italic text-[10px]"
                >
                    {{ row.original.status }}
                </UBadge>
            </template>

            <template #actions-data="{ row }">
                <UButton
                    v-if="row.original.status === 'PENDING'"
                    size="xs"
                    variant="ghost"
                    label="Respond"
                    icon="i-lucide-reply"
                    @click="openRespond(row.original)"
                />
            </template>
        </UTable>

        <USlideover v-model="isFormOpen">
            <RespondKitchenForm
                v-if="selectedItem"
                :request-no="selectedItem.id"
                :request-from="selectedItem.from_branch.name"
                :request-items="selectedItem.items"
                @save="saveItem"
                @close="isFormOpen = false"
            />
        </USlideover>
    </UContainer>
</template>
