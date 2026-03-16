<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import type { ApiResponse, Branch } from '~/types/master'

type Mutation = {
    item_name: string
    opening: number
    qty_in: number
    qty_out: number
    closing: number
    unit: string
}

const branches = ref<Branch[]>([])
const branchList = ref<SelectItem[]>([])
const storageList = ref<SelectItem[]>([
    { label: 'Main Storage', value: 'MAIN' },
    { label: 'Kitchen', value: 'KTCN' },
    { label: 'Bartender', value: 'BART' }
])

const mutationFilter = ref({
    branch: 'ALL',
    storage: 'MAIN',
    start: new Date().toISOString().substr(0, 10),
    end: new Date().toISOString().substr(0, 10)
})

const mutationColumns = [
    { accessorKey: 'item_name', header: 'Item' },
    { accessorKey: 'opening', header: 'Opening' },
    { accessorKey: 'qty_in', header: 'Total In' },
    { accessorKey: 'qty_out', header: 'Total Out' },
    { accessorKey: 'closing', header: 'Closing' },
    { accessorKey: 'unit', header: 'Unit' }
]

const mutationData = ref<Array<{
    item_name: string
    opening: number
    qty_in: number
    qty_out: number
    closing: number
    unit: string
}>>([])

const fetchMutation = async () => {
    const response = await useApi('/api/stock/mutation', { params: mutationFilter.value })
    const result = (response && typeof response === 'object' && 'data' in response)
        ? (response as ApiResponse<Mutation[]>).data
        : (response as Mutation[])
    mutationData.value = [...result]
}

onMounted(async () => {
    const data = await useApi<Branch[] | ApiResponse<Branch[]>>('/api/branches')
    if (Array.isArray(data)) {
        branches.value = data
    } else if (data && typeof data === 'object' && 'data' in data) {
        branches.value = (data as ApiResponse<Branch[]>).data
    } else {
        branches.value = []
    }

    branchList.value = branches.value.map(branch => ({
        label: branch.name,
        value: branch.id
    }))
})

fetchMutation()
</script>

<template>
    <UContainer class="p-6 space-y-6">
        <div class="bg-primary-900 text-white p-8 rounded-[2.5rem] flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-black uppercase italic tracking-tighter">
                    Stock Mutation
                </h2>
                <p class="opacity-60 text-xs font-bold uppercase">
                    All Items Reconciliation
                </p>
            </div>
            <div class="flex gap-2">
                <USelectMenu
                    v-model="mutationFilter.branch"
                    :items="branchList"
                    class="font-bold shadow-sm w-64"
                />
                <USelectMenu
                    v-model="mutationFilter.storage"
                    :items="storageList"
                    class="font-bold shadow-sm w-64"
                />
                <UButton
                    @click="fetchMutation"
                >
                    Refresh Audit
                </UButton>
            </div>
        </div>

        <UTable
            :data="mutationData"
            :columns="mutationColumns"
        >
            <template #opening-data="{ row }">
                {{ row.original.opening }}
            </template>
            <template #qty_in-data="{ row }">
                <span class="text-emerald-500">+{{ row.original.qty_in }}</span>
            </template>
            <template #qty_out-data="{ row }">
                <span class="text-rose-500">-{{ row.original.qty_out }}</span>
            </template>
            <template #closing-data="{ row }">
                <span class="font-black underline">{{ row.original.closing }}</span>
            </template>
        </UTable>
    </UContainer>
</template>
