<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import type { ApiResponse, Branch, KitchenRequestItem, StockMove } from '~/types/master'

const props = defineProps({
    requestNo: {
        type: Number,
        required: true
    },
    requestFrom: {
        type: Number,
        required: true
    },
    requestFromStorage: {
        type: String,
        required: true
    },
    requestTo: {
        type: Number,
        required: true
    },
    requestToStorage: {
        type: String,
        required: true
    },
    requestItems: {
        type: Array<KitchenRequestItem>
    }
})

const branches = ref<Branch[]>([])

const storageList = ref<SelectItem[]>([
    { label: 'Main Storage', value: 'MAIN' },
    { label: 'Kitchen', value: 'KTCN' },
    { label: 'Bartender', value: 'BART' }
])

onMounted(async () => {
    const data = await useApi<Branch[] | ApiResponse<Branch[]>>('/api/branches')
    if (Array.isArray(data)) {
        branches.value = data
    } else if (data && typeof data === 'object' && 'data' in data) {
        branches.value = (data as ApiResponse<Branch[]>).data
    } else {
        branches.value = []
    }
})

const emit = defineEmits(['close'])

const columns = [
    { accessorKey: 'name', header: 'Item Name' },
    { accessorKey: 'quantity', header: 'Quantity' },
    { accessorKey: 'unit', header: 'Unit' }
]

const approveRequest = async () => {
    const data = await useApi<ApiResponse<StockMove>>(
        '/api/stock/requests/approve',
        {
            method: 'POST',
            body: { id: props.requestNo }
        })
    if (data.err === 0) {
        emit('close')
    }
}
</script>

<template>
    <div class="space-y-4">
        <div class="grid grid-cols-2 gap-4 text-xs">
            <div class="w-full grid grid-cols-7 gap-4 items-center">
                <span class="text-gray-400">From:</span>
                <USelect
                    :model-value="props.requestFrom"
                    readonly
                    class="col-span-3"
                    :items="branches"
                    label-key="name"
                    value-key="id"
                />
                <USelect
                    :model-value="props.requestFromStorage"
                    readonly
                    class="col-span-3"
                    :items="storageList"
                />
            </div>
            <div class="w-full grid grid-cols-7 gap-4 items-center">
                <span class="text-gray-400">To:</span>
                <USelect
                    :model-value="props.requestTo"
                    readonly
                    class="col-span-3"
                    :items="branches"
                    label-key="name"
                    value-key="id"
                />
                <USelect
                    :model-value="props.requestToStorage"
                    readonly
                    class="col-span-3"
                    :items="storageList"
                />
            </div>
        </div>

        <UTable
            :data="props.requestItems"
            :columns="columns"
        >
            <template #name-cell="{ row }">
                {{
                    row.original.item_type === 'INGR'
                        ? row.original.ingredient?.name
                        : row.original.utility?.name
                }}
            </template>
            <template #unit-cell="{ row }">
                {{
                    row.original.item_type === 'INGR'
                        ? row.original.ingredient?.unit
                        : row.original.utility?.unit
                }}
            </template>
        </UTable>

        <div class="flex gap-2">
            <UButton
                block
                color="error"
                variant="soft"
                @click="emit('close')"
            >
                Reject
            </UButton>
            <UButton
                block
                color="success"
                @click="approveRequest"
            >
                Approve & Move Stock
            </UButton>
        </div>
    </div>
</template>
