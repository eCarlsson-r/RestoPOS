<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { KitchenRequest } from '~/types/master'

const { items, isFormOpen, selectedItem, fetchItems } = useMaster<KitchenRequest>('stock/requests')

onMounted(() => {
    fetchItems()
})

const columns: TableColumn<KitchenRequest>[] = [
    { accessorKey: 'id', header: 'Req #' },
    { accessorKey: 'from_branch.name', header: 'From Branch' },
    { accessorKey: 'from_storage', header: 'From Storage' },
    { accessorKey: 'to_branch.name', header: 'To Branch' },
    { accessorKey: 'to_storage', header: 'To Storage' },
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

        <UCard :ui="{ body: 'p-0' }">
            <ClientOnly>
                <UTable
                    :data="items"
                    :columns="columns"
                >
                    <template #actions-cell="{ row }">
                        <UButton
                            v-if="row.original.status === 'Q'"
                            size="xs"
                            variant="ghost"
                            label="Respond"
                            icon="i-lucide-reply"
                            @click="openRespond(row.original)"
                        />
                    </template>
                </UTable>
            </ClientOnly>
        </UCard>

        <UModal
            v-model:open="isFormOpen"
            scrollable
            :title="`Request #${selectedItem?.id}`"
            :ui="{
                title: 'text-xl font-black uppercase italic tracking-tighter'
            }"
            class="sm:max-w-4xl"
        >
            <template #body>
                <RespondKitchenForm
                    v-if="selectedItem"
                    :request-no="selectedItem.id"
                    :request-from="selectedItem.from_branch.id"
                    :request-from-storage="selectedItem.from_storage"
                    :request-to="selectedItem.to_branch.id"
                    :request-to-storage="selectedItem.to_storage"
                    :request-items="selectedItem.items"
                    @close="isFormOpen = false"
                />
            </template>
        </UModal>
    </UContainer>
</template>
