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
    <div class="h-full flex flex-col bg-white">
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-xl font-black uppercase italic tracking-tighter">
                {{ form.id ? 'Edit' : 'Tambah' }} Stok
            </h2>
            <UButton
                variant="ghost"
                color="neutral"
                icon="i-lucide-x"
                @click="emit('close')"
            />
        </div>

        <UForm
            :state="form"
            :submit="emit('save', form)"
            class="space-y-4 p-4"
        >
            <div class="grid grid-cols-2 gap-4">
                <UFormField label="Branch">
                    <USelectMenu
                        v-model="form.branch_id"
                        :options="branches"
                    />
                </UFormField>
                <UFormField label="Storage">
                    <USelectMenu
                        v-model="form.storage"
                        :options="storageList"
                    />
                </UFormField>
            </div>

            <UFormField label="Item Type">
                <URadioGroup
                    v-model="form.item_type"
                    :options="[{ label: 'Ingredient', value: 'INGR' }, { label: 'Utility', value: 'UTLT' }]"
                />
            </UFormField>

            <UFormField label="Item">
                <USelectMenu
                    v-model="form.item_code"
                    :options="form.item_type === 'INGR' ? ingredients : utilities"
                    searchable
                />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
                <UFormField label="Purchase Price">
                    <UInput
                        v-model="form.purchase_price"
                        type="number"
                        icon="i-lucide-banknote"
                    />
                </UFormField>
                <UFormField label="Quantity">
                    <UInput
                        v-model="form.quantity"
                        type="number"
                    >
                        <template #trailing>
                            <span class="text-xs text-gray-400">grams</span>
                        </template>
                    </UInput>
                </UFormField>
            </div>

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
