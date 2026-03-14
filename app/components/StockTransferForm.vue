<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import type { ApiResponse, Branch, Ingredient, StockMove, Utility } from '~/types/master'

const props = defineProps<{
    item: StockMove | null
}>()

const emit = defineEmits(['save', 'receive', 'close'])

const form = ref<Partial<StockMove>>((props.item || {}) as Partial<StockMove>)

const branches = ref<Branch[]>([])
const ingredients = ref<Ingredient[]>([])
const utilities = ref<Utility[]>([])

const storageList = ref<SelectItem[]>([
    { label: 'Main Storage', value: 'MAIN' },
    { label: 'Kitchen', value: 'KTCN' },
    { label: 'Bartender', value: 'BART' }
])

const addRecordRow = () => {
    if (form.value.items) form.value.items?.push({
        item_code: '',
        item_type: 'INGR',
        qty: 0
    })
    else form.value.items = [{
        item_code: '',
        item_type: 'INGR',
        qty: 0
    }]
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

    const ingredientData = await useApi<Ingredient[] | ApiResponse<Ingredient[]>>('/api/ingredients')
    if (Array.isArray(ingredientData)) {
        ingredients.value = ingredientData
    } else if (ingredientData && typeof ingredientData === 'object' && 'data' in ingredientData) {
        ingredients.value = (ingredientData as ApiResponse<Ingredient[]>).data
    } else {
        ingredients.value = []
    }

    const utilityData = await useApi<Utility[] | ApiResponse<Utility[]>>('/api/utilities')
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
    <div class="space-y-6">
        <div class="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl">
            <div class="space-y-2">
                <p class="text-[10px] font-black uppercase text-slate-400">
                    Source (From)
                </p>
                <USelect
                    v-model="form.from_branch_id"
                    :options="branches"
                    placeholder="Branch"
                />
                <USelect
                    v-model="form.from_storage"
                    :items="storageList"
                />
            </div>
            <div class="space-y-2">
                <p class="text-[10px] font-black uppercase text-slate-400">
                    Destination (To)
                </p>
                <USelect
                    v-model="form.to_branch_id"
                    :options="branches"
                    placeholder="Branch"
                />
                <USelect
                    v-model="form.to_storage"
                    :items="storageList"
                />
            </div>
        </div>

        <div class="mt-4 p-4 bg-slate-50 rounded-xl">
            <h4 class="text-xs font-black uppercase mb-3">
                Daftar Produk
            </h4>
            <div
                v-for="(record, idx) in form.items"
                :key="idx"
                class="grid grid-cols-3 gap-2 mb-2 items-center"
            >
                <UFormGroup label="Item Type">
                    <URadioGroup
                        v-model="record.item_type"
                        :options="[{ label: 'Ingredient', value: 'INGR' }, { label: 'Utility', value: 'UTLT' }]"
                    />
                </UFormGroup>

                <UFormGroup label="Item">
                    <USelectMenu
                        v-model="record.item_code"
                        :options="record.item_type === 'INGR' ? ingredients : utilities"
                        searchable
                    />
                </UFormGroup>

                <div class="flex gap-2 items-center">
                    <UFormGroup label="Quantity">
                        <UInput
                            v-model="record.qty"
                            type="number"
                        >
                            <template #trailing>
                                <span class="text-xs text-gray-400">grams</span>
                            </template>
                        </UInput>
                    </UFormGroup>

                    <button
                        type="button"
                        class="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                        @click="form.items?.splice(idx, 1)"
                    >
                        <UIcon
                            name="i-lucide-trash-2"
                            class="w-4 h-4"
                        />
                    </button>
                </div>
            </div>

            <UButton
                type="button"
                class="mt-2 text-[10px] font-black uppercase italic px-4 py-2 rounded-lg"
                @click="addRecordRow"
            >
                + Tambah
            </UButton>
        </div>

        <div class="flex gap-4">
            <UButton
                flex-1
                variant="outline"
                @click="emit('receive')"
            >
                Receive Items
            </UButton>
            <UButton
                flex-1
                @click="emit('save', form)"
            >
                Submit Transfer
            </UButton>
        </div>
    </div>
</template>
