<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import type { Branch, Ingredient, Utility, ApiResponse, Stock } from '~/types/master'

const props = defineProps<{
    item: Stock | null
}>()

const emit = defineEmits(['save', 'close'])

const form = ref<Partial<Stock>>((props.item || {}) as Partial<Stock>)

const branches = ref<Branch[]>([])
const ingredients = ref<Ingredient[]>([])
const utilities = ref<Utility[]>([])

const storageList = ref<SelectItem[]>([
    { label: 'Main Storage', value: 'MAIN' },
    { label: 'Kitchen', value: 'KTCN' },
    { label: 'Bartender', value: 'BART' }
])

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
    <div class="h-full flex flex-col bg-white">
        <UForm
            :state="form"
            :submit="emit('save', form)"
            class="space-y-4"
        >
            <div class="grid grid-cols-2 gap-4">
                <UFormField label="Branch">
                    <USelectMenu
                        v-model="form.branch_id"
                        :items="branches"
                        label-key="name"
                        value-key="id"
                        class="w-full font-bold shadow-sm"
                    />
                </UFormField>
                <UFormField label="Storage">
                    <USelect
                        v-model="form.storage"
                        :items="storageList"
                        class="w-full font-bold shadow-sm"
                    />
                </UFormField>
            </div>

            <div class="grid grid-cols-4 gap-4">
                <UFormField label="Jenis Barang">
                    <URadioGroup
                        v-model="form.item_type"
                        :items="[{ label: 'Bahan Baku', value: 'INGR' }, { label: 'Peralatan', value: 'UTLT' }]"
                    />
                </UFormField>

                <UFormField
                    label="Barang"
                    class="col-span-3"
                >
                    <USelect
                        v-model="form.item_code"
                        :items="form.item_type === 'INGR' ? ingredients : utilities"
                        label-key="name"
                        value-key="id"
                        searchable
                        class="w-full font-bold shadow-sm"
                    />
                </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <UFormField label="Purchase Price">
                    <UInput
                        v-model="form.purchase_price"
                        type="number"
                        icon="i-lucide-banknote"

                        class="w-full font-bold shadow-sm"
                    />
                </UFormField>
                <UFormField label="Quantity">
                    <UInput
                        v-model="form.quantity"
                        type="number"
                        class="w-full font-bold shadow-sm"
                    >
                        <template #trailing>
                            <span class="text-xs text-gray-400">grams</span>
                        </template>
                    </UInput>
                </UFormField>
            </div>

            <UFormField
                label="Keterangan"
                name="description"
                :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
            >
                <UTextarea
                    v-model="form.description"
                    class="w-full font-bold shadow-sm"
                />
            </UFormField>

            <UButton
                type="submit"
                size="xl"
                block
                icon="i-lucide-save"
                label="Simpan Data"
                class="font-black uppercase italic"
            />
        </UForm>
    </div>
</template>
