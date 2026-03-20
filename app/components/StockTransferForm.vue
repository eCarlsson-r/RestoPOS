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
    if (form.value.records) form.value.records?.push({
        item_code: 0,
        item_type: 'INGR',
        quantity: 0
    })
    else form.value.records = [{
        item_code: 0,
        item_type: 'INGR',
        quantity: 0
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
                <div class="grid grid-cols-2 gap-2">
                    <USelectMenu
                        v-model="form.from_branch_id"
                        :records="branches"
                        label-key="name"
                        value-key="id"
                        value-attribute="id"
                        placeholder="Branch"
                    />
                    <USelect
                        v-model="form.from_storage"
                        :records="storageList"
                    />
                </div>
            </div>
            <div class="space-y-2">
                <p class="text-[10px] font-black uppercase text-slate-400">
                    Destination (To)
                </p>
                <div class="grid grid-cols-2 gap-2">
                    <USelectMenu
                        v-model="form.to_branch_id"
                        :records="branches"
                        label-key="name"
                        value-key="id"
                        placeholder="Branch"
                        value-attribute="id"
                    />
                    <USelect
                        v-model="form.to_storage"
                        :records="storageList"
                    />
                </div>
            </div>
        </div>

        <div class="mt-4 p-4 bg-slate-50 rounded-xl">
            <h4 class="text-xs font-black uppercase mb-3">
                Daftar Produk
            </h4>
            <div
                v-for="(record, idx) in form.records"
                :key="idx"
                class="grid grid-cols-3 gap-2 mb-2 records-center"
            >
                <UFormField label="Item Type">
                    <URadioGroup
                        v-model="record.item_type"
                        orientation="horizontal"
                        :records="[{ label: 'Ingredient', value: 'INGR' }, { label: 'Utility', value: 'UTLT' }]"
                    />
                </UFormField>

                <UFormField label="Item">
                    <USelect
                        v-model="record.item_code"
                        :records="record.item_type === 'INGR' ? ingredients : utilities"
                        label-key="name"
                        value-key="id"
                        class="w-full font-bold shadow-sm"
                    />
                </UFormField>

                <div class="flex gap-2 records-center">
                    <UFormField label="Quantity">
                        <UInput
                            v-model="record.quantity"
                            type="number"
                        >
                            <template #trailing>
                                <span class="text-xs text-gray-400">{{ record.item_type === 'INGR' ? ingredients[record.item_code - 1]?.unit : utilities[record.item_code - 1]?.unit }}</span>
                            </template>
                        </UInput>
                    </UFormField>

                    <UButton
                        variant="ghost"
                        @click="form.records?.splice(idx, 1)"
                    >
                        <UIcon name="i-lucide-trash-2" />
                    </UButton>
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

        <UButton
            v-if="form.id"
            variant="outline"
            size="xl"
            class="w-full font-black uppercase italic justify-center py-4"
            @click="emit('receive')"
        >
            Receive Items
        </UButton>
        <UButton
            v-else
            size="xl"
            class="w-full font-black uppercase italic justify-center py-4"
            @click="emit('save', form)"
        >
            Submit Transfer
        </UButton>
    </div>
</template>
