<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import { ref, onMounted, watch, computed } from 'vue'
import { useApi } from '~/composables/useApi'
import type { Product, Category, ApiResponse, Ingredient, Prepare, Recipe, PrepareRecipe } from '~/types/master'

type RecipeRow = (Recipe | PrepareRecipe) & { uid?: string }

const props = defineProps<{
    type: 'product' | 'prepare'
    item: Product | Prepare | null
}>()

const emit = defineEmits(['save', 'close'])

const form = ref<Partial<Product & Prepare>>((props.item || {}) as Partial<Product & Prepare>)
const categories = ref<Category[]>([])
const categorySelects = ref<SelectItem[]>([])
const allIngredients = ref<Ingredient[]>([])
const allPrepares = ref<Prepare[]>([])

const unitList = ref<SelectItem[]>([
    { label: 'Gram (gr)', value: 'GR' },
    { label: 'Kilogram (kg)', value: 'KG' },
    { label: 'Liter (ltr)', value: 'LTR' },
    { label: 'Pieces (pcs)', value: 'PCS' }
])

watch(() => props.item, (newVal) => {
    if (form.value && form.value.id === newVal?.id && !newVal?.id && newVal && Object.keys(newVal).length === 0) {
        return
    }
    const baseItem = newVal ? JSON.parse(JSON.stringify(newVal)) : {} as Partial<Product & Prepare>
    if (!baseItem.recipe) baseItem.recipe = []

    // Hydrate UIDs for existing recipe rows
    baseItem.recipe.forEach((row: RecipeRow) => {
        if (!row.uid && row.item_type && row.item_code) {
            row.uid = `${row.item_type}-${row.item_code}`
        }
    })

    form.value = baseItem
}, { deep: true, immediate: true })

const addIngrRow = () => {
    const newEntry: RecipeRow = {
        item_code: 0,
        quantity: 0,
        unit: 'Pcs',
        purchase_price: 0,
        item_type: 'INGR',
        uid: ''
    }
    if (form.value.recipe) {
        form.value.recipe.push(newEntry)
    } else {
        form.value.recipe = [newEntry]
    }
}

const totals = computed(() => {
    return form.value.recipe?.map(field => (field.quantity || 0) * (field.purchase_price || 0)) || []
})

const grandTotal = computed(() => {
    return totals.value.reduce((sum, total) => sum + total, 0)
})

watch(grandTotal, (newVal) => {
    form.value.cost = newVal
}, { immediate: true })

const compositionItems = computed(() => {
    if (props.type === 'product') {
        return [
            ...allIngredients.value.map(i => ({
                ...i,
                item_type: 'INGR',
                uid: `INGR-${i.id}`
            })),
            ...allPrepares.value.map(p => ({
                id: p.id,
                name: p.name,
                unit: p.unit,
                purchase_price: p.cost || 0,
                item_type: 'PREP',
                uid: `PREP-${p.id}`
            }))
        ]
    } else {
        return [
            ...allIngredients.value.map(i => ({
                ...i,
                item_type: 'INGR',
                uid: `INGR-${i.id}`
            }))
        ]
    }
})

onMounted(async () => {
    if (props.type === 'product') {
        const data = await useApi<Category[] | ApiResponse<Category[]>>('/api/categories')
        if (Array.isArray(data)) {
            categories.value = data
        } else if (data && typeof data === 'object' && 'data' in data) {
            categories.value = (data as ApiResponse<Category[]>).data
        } else {
            categories.value = []
        }

        categorySelects.value = categories.value.map((b) => {
            return {
                label: b.name,
                value: b.id
            }
        })
    }

    const [ingrData, prepData] = await Promise.all([
        useApi<Ingredient[] | ApiResponse<Ingredient[]>>('/api/ingredients'),
        useApi<Prepare[] | ApiResponse<Prepare[]>>('/api/prepare')
    ])

    if (Array.isArray(ingrData)) allIngredients.value = ingrData
    else if (ingrData && typeof ingrData === 'object' && 'data' in ingrData) allIngredients.value = (ingrData as ApiResponse<Ingredient[]>).data

    if (Array.isArray(prepData)) allPrepares.value = prepData
    else if (prepData && typeof prepData === 'object' && 'data' in prepData) allPrepares.value = (prepData as ApiResponse<Prepare[]>).data
})

watch(() => form.value.recipe, (newEntries) => {
    if (newEntries) {
        (newEntries as RecipeRow[]).forEach((entry) => {
            const match = compositionItems.value.find(item => item.uid === entry.uid)
            if (match) {
                entry.item_code = match.id
                entry.item_type = match.item_type
                entry.unit = match.unit
                entry.purchase_price = match.purchase_price || 0
            }
        })
    }
}, { deep: true })

const submit = async () => {
    emit('save', form.value)
}
</script>

<template>
    <div class="h-full flex flex-col bg-white">
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-xl font-black uppercase italic tracking-tighter">
                {{ form.id ? 'Edit' : 'Tambah' }} {{ props.type }}
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
            class="space-y-6 flex-1 overflow-y-auto pr-2"
            @submit="submit"
        >
            <div
                v-if="props.type === 'prepare'"
            >
                <div class="flex items-center gap-3">
                    <UIcon
                        name="i-lucide-anvil"
                        class="w-5 h-5 text-primary"
                    />
                    <div>
                        <h4 class="text-[10px] font-black uppercase text-primary">
                            Internal Production Item
                        </h4>
                        <p class="text-[9px] font-bold text-secondary uppercase leading-tight">
                            This item is not for sale. It is used to track kitchen production.
                        </p>
                    </div>
                </div>
            </div>

            <UFormField
                :label="`Nama ${props.type}`"
                name="name"
                :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
            >
                <UInput
                    v-model="form.name"
                    class="w-full font-bold shadow-sm"
                    required
                />
            </UFormField>

            <UFormField
                v-if="props.type === 'product'"
                label="Kategori"
                name="category_id"
                :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
            >
                <USelect
                    v-model="form.category_id"
                    :items="categorySelects"
                    class="w-full font-bold shadow-sm"
                />
            </UFormField>

            <div
                v-if="props.type === 'product'"
                class="grid grid-cols-5 gap-3"
            >
                <UFormField
                    label="Diskon (%)"
                    name="discount"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="form.discount"
                        class="w-full font-bold shadow-sm"
                        required
                    />
                </UFormField>

                <UFormField
                    class="col-span-2"
                    label="Modal"
                    name="cost"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="form.cost"
                        class="w-full font-bold shadow-sm"
                        required
                    />
                </UFormField>

                <UFormField
                    class="col-span-2"
                    label="Harga Jual"
                    name="price"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="form.price"
                        class="w-full font-bold shadow-sm"
                        required
                    />
                </UFormField>
            </div>

            <UFormField
                v-if="props.type === 'product'"
                label="Keterangan"
                name="description"
                :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
            >
                <UTextarea
                    v-model="form.description"
                    class="w-full font-bold shadow-sm"
                    required
                />
            </UFormField>

            <div
                v-if="props.type === 'prepare'"
                class="grid grid-cols-4 gap-3"
            >
                <UFormField
                    label="Jumlah / Resep"
                    name="quantity"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="form.quantity"
                        class="w-full font-bold shadow-sm"
                        required
                    />
                </UFormField>

                <UFormField
                    label="Satuan / Resep"
                    name="unit"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <USelect
                        v-model="form.unit"
                        :items="unitList"
                        class="w-full font-bold shadow-sm"
                    />
                </UFormField>

                <UFormField
                    class="col-span-2"
                    label="Jumlah Modal"
                    name="grandTotal"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="form.cost"
                        class="w-full font-bold shadow-sm"
                        required
                        disabled
                    />
                </UFormField>
            </div>

            <div class="mt-4 p-4 bg-slate-50 rounded-xl">
                <h4 class="text-xs font-black uppercase mb-3">
                    Komposisi Bahan
                </h4>
                <div
                    v-for="(ingr, idx) in (form.recipe as RecipeRow[])"
                    :key="idx"
                    class="grid grid-cols-4 gap-2 mb-2 items-center"
                >
                    <USelectMenu
                        v-model="ingr.uid"
                        :items="compositionItems"
                        label-key="name"
                        value-key="uid"
                        class="font-bold text-sm shadow-sm"
                    />

                    <div class="flex gap-2 items-center">
                        <UInput
                            v-model="ingr.quantity"
                            class="font-bold text-center shadow-sm"
                            placeholder="0"
                        />

                        <span class="text-[10px] font-black uppercase text-slate-400">{{ ingr.unit }}</span>
                    </div>

                    <div class="grid grid-cols-6 col-span-2 gap-2 items-center">
                        <UInput
                            v-model="ingr.purchase_price"
                            class="col-span-2 font-bold text-center shadow-sm"
                            placeholder="0"
                            disabled
                        />

                        <UInput
                            v-model="totals![idx]"
                            class="col-span-3 font-bold text-center shadow-sm"
                            placeholder="0"
                            disabled
                        />

                        <button
                            type="button"
                            class="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                            @click="form.recipe?.splice(idx, 1)"
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
                    @click="addIngrRow"
                >
                    + Tambah Bahan
                </UButton>
            </div>

            <UButton
                type="submit"
                size="xl"
                block
                label="Simpan Data"
                class="font-black uppercase italic"
            />
        </UForm>
    </div>
</template>
