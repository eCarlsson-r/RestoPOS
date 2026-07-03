<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import type { ApiResponse, Branch, Ingredient, KitchenRequestItem, Utility } from '~/types/master'

const { user } = useAuth()

const form = ref({
    from_branch: 1,
    from_storage: 'MAIN',
    to_branch: Number(user.value?.username.split('_')[0]),
    to_storage: user.value?.username.split('_')[1],
    items: [] as KitchenRequestItem[]
})

const storageList = ref<SelectItem[]>([
    { label: 'Main Storage', value: 'MAIN' },
    { label: 'Kitchen', value: 'KTCN' },
    { label: 'Bartender', value: 'BART' }
])

const currentItem = ref({ item_code: 1, quantity: 1, item_type: 'INGR' })

const addItem = () => {
    if (!currentItem.value.item_code) return
    form.value.items.push({ ...currentItem.value })
    currentItem.value = { item_code: 1, quantity: 1, item_type: 'INGR' } // Reset
}

const removeItem = (itemCode: number) => {
    form.value.items = form.value.items.filter(item => item.item_code !== itemCode)
}

const submitRequest = async () => {
    await useApi('stock/requests', {
        method: 'POST',
        body: form.value
    })
    navigateTo('/kitchen')
}

const branches = ref<Branch[]>([])
const ingredients = ref<Ingredient[]>([])
const utilities = ref<Utility[]>([])

onMounted(async () => {
    const data = await useApi<Branch[] | ApiResponse<Branch[]>>('branches')
    if (Array.isArray(data)) {
        branches.value = data
    } else if (data && typeof data === 'object' && 'data' in data) {
        branches.value = (data as ApiResponse<Branch[]>).data
    } else {
        branches.value = []
    }

    const ingredientData = await useApi<Ingredient[] | ApiResponse<Ingredient[]>>('ingredients')
    if (Array.isArray(ingredientData)) {
        ingredients.value = ingredientData
    } else if (ingredientData && typeof ingredientData === 'object' && 'data' in ingredientData) {
        ingredients.value = (ingredientData as ApiResponse<Ingredient[]>).data
    } else {
        ingredients.value = []
    }

    const utilityData = await useApi<Utility[] | ApiResponse<Utility[]>>('utilities')
    if (Array.isArray(utilityData)) {
        utilities.value = utilityData
    } else if (utilityData && typeof utilityData === 'object' && 'data' in utilityData) {
        utilities.value = (utilityData as ApiResponse<Utility[]>).data
    } else {
        utilities.value = []
    }
})
</script>

<template>
    <UContainer class="p-6">
        <h2 class="text-4xl font-black uppercase italic mb-8 tracking-tighter">
            Kitchen Request
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 p-6 bg-slate-50 rounded-4xl border border-slate-200">
            <UFormField label="Request From (Branch)">
                <USelectMenu
                    v-model="form.from_branch"
                    :items="branches"
                    value-key="id"
                    label-key="name"
                    class="w-full"
                />
            </UFormField>
            <UFormField label="Source Storage">
                <USelectMenu
                    v-model="form.from_storage"
                    :items="storageList"
                    value-key="value"
                    label-key="label"
                    class="w-full"
                />
            </UFormField>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-end gap-3 mb-6 bg-slate-50 p-6 rounded-3xl border border-slate-200">
            <UFormField
                label="Item Type"
            >
                <USelect
                    v-model="currentItem.item_type"
                    class="w-full"
                    :items="[{ label: 'Ingredient', value: 'INGR' }, { label: 'Utility', value: 'UTLT' }]"
                    value-key="value"
                    label-key="label"
                />
            </UFormField>
            <UFormField
                label="Select Item"
                class="col-span-2"
            >
                <USelectMenu
                    v-model="currentItem.item_code"
                    class="w-full"
                    :items="currentItem.item_type === 'INGR' ? ingredients : utilities"
                    label-key="name"
                    value-key="id"
                    searchable
                />
            </UFormField>

            <UFormField
                label="Qty"
            >
                <div class="flex gap-2 items-center">
                    <UInput
                        v-model="currentItem.quantity"
                        type="number"
                        class="w-full"
                    />
                    <span class="text-slate-400 font-bold italic">{{ currentItem.item_type === 'INGR' ? ingredients.find((item) => item.id === currentItem.item_code)?.unit : utilities.find((item) => item.id === currentItem.item_code)?.unit }}</span>
                    <UButton
                        icon="i-lucide-plus"
                        @click="addItem"
                    />
                </div>
            </UFormField>
        </div>

        <UTable
            :data="form.items"
            :columns="[{ accessorKey: 'item_code', header: 'Item' }, { accessorKey: 'quantity', header: 'Quantity' }]"
        >
            <template #item_code-cell="{ row }">
                {{ row.original.item_type === 'INGR' ? ingredients.find((item) => item.id === row.original.item_code)?.name : utilities.find((item) => item.id === row.original.item_code)?.name }}
            </template>
            <template #quantity-cell="{ row }">
                <div class="flex gap-2 items-center">
                    <UInput
                        v-model="row.original.quantity"
                        type="number"
                    />
                    <span class="text-slate-400 font-bold italic">{{ row.original.item_type === 'INGR' ? ingredients.find((item) => item.id === row.original.item_code)?.unit : utilities.find((item) => item.id === row.original.item_code)?.unit }}</span>
                    <UButton
                        icon="i-lucide-minus"
                        @click="removeItem(row.original.item_code)"
                    />
                </div>
            </template>
            <template #empty>
                <div class="py-10 text-center italic text-slate-400">
                    No items added yet.
                </div>
            </template>
        </UTable>

        <div class="mt-10 flex gap-4">
            <UButton
                size="xl"
                block
                class="flex-1 font-black italic"
                @click="submitRequest"
            >
                Send Request to Admin
            </UButton>
        </div>
    </UContainer>
</template>
