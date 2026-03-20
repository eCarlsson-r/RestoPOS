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
const storageList = ref<SelectItem[]>([
    { label: 'Main Storage', value: 'MAIN' },
    { label: 'Kitchen', value: 'KTCN' },
    { label: 'Bartender', value: 'BART' }
])

const { user } = useAuth()
const isAdmin = computed(() => user.value?.type === 'ADMIN')

const mutationFilter = ref({
    branch: 0,
    storage: 'MAIN',
    start: new Date().toISOString().substr(0, 10),
    end: new Date().toISOString().substr(0, 10)
})

// Lockdown filter for non-admin users
watchEffect(() => {
    if (user.value && !isAdmin.value) {
        mutationFilter.value.branch = Number(user.value.employee?.branch_id) || 0
        // KITCHEN users are locked to their station identifier from username (e.g., KTCN or BART)
        if (user.value.type === 'KITCHEN' && user.value.username.includes('_')) {
            mutationFilter.value.storage = user.value.username.split('_')[1] || ''
        } else {
            mutationFilter.value.storage = 'MAIN'
        }
    }
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
})

fetchMutation()
</script>

<template>
    <UContainer class="p-6 space-y-6">
        <div class="flex justify-between items-center">
            <div>
                <h2 class="text-2xl font-black uppercase italic tracking-tighter">
                    Stock Mutation
                </h2>
                <p class="opacity-60 text-xs font-bold uppercase">
                    All Items Reconciliation
                </p>
            </div>
            <div class="flex gap-2">
                <UFormField
                    label="Cabang"
                    :ui="{ label: 'block text-[10px] font-black uppercase tracking-widest' }"
                >
                    <USelectMenu
                        v-model="mutationFilter.branch"
                        :items="branches"
                        :disabled="!isAdmin"
                        value-key="id"
                        label-key="name"
                        value-attribute="id"
                        class="font-bold shadow-sm w-full"
                    />
                </UFormField>
                <UFormField
                    label="Gudang"
                    :ui="{ label: 'block text-[10px] font-black uppercase tracking-widest' }"
                >
                    <USelect
                        v-model="mutationFilter.storage"
                        :items="storageList"
                        :disabled="!isAdmin"
                        class="font-bold shadow-sm w-full"
                    />
                </UFormField>
                <UFormField
                    label="Start Date"
                    :ui="{ label: 'block text-[10px] font-black uppercase tracking-widest' }"
                >
                    <UInput
                        v-model="mutationFilter.start"
                        type="date"
                        class="w-full shadow-sm"
                    />
                </UFormField>
                <UFormField
                    label="End Date"
                    :ui="{ label: 'block text-[10px] font-black uppercase tracking-widest' }"
                >
                    <UInput
                        v-model="mutationFilter.end"
                        type="date"
                        class="w-full shadow-sm"
                    />
                </UFormField>
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
