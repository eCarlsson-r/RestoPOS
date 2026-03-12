<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import { ref, onMounted, watch } from 'vue'
import type { Product, Category, ApiResponse, Ingredient, Prepare } from '~/types/master'

const props = defineProps<{
    type: 'product' | 'prepare'
    item: Product | Prepare
}>()

const emit = defineEmits(['save', 'close'])

const form = ref<Partial<Product & Prepare>>(props.item as Partial<Product & Prepare>)
const categories = ref<Category[]>([])
const categorySelects = ref<SelectItem[]>([])
const allIngredients = ref<Ingredient[]>([])
const ingredientSelects = ref<SelectItem[]>([])

watch(() => props.item, (newVal) => {
    // Avoid resetting the form if the parent component re-renders and passes a new empty object
    if (form.value && form.value.id === newVal?.id && !newVal?.id && Object.keys(newVal).length === 0) {
        return
    }
    const baseItem = { ...newVal }
    if (!baseItem.recipe) baseItem.recipe = []
    form.value = baseItem
}, { deep: true, immediate: true })

const addIngrRow = () => {
    if (form.value.recipe) form.value.recipe?.push({
        ingredient_id: 0,
        qty: 0,
        unit: 'Pcs',
        purchase_price: 0
    })
    else form.value.recipe = [{
        ingredient_id: 0,
        qty: 0,
        unit: 'Pcs',
        purchase_price: 0
    }]
}

watch(() => form.value.recipe, (newIngrs) => {
    if (newIngrs) newIngrs.forEach((ingr) => {
        const match = allIngredients.value.find(a => a.id === ingr.ingredient_id)
        if (match) ingr.unit = match.unit
    })
}, { deep: true })

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

    const data = await useApi<Ingredient[] | ApiResponse<Ingredient[]>>('/api/ingredients')
    if (Array.isArray(data)) {
        allIngredients.value = data
    } else if (data && typeof data === 'object' && 'data' in data) {
        allIngredients.value = (data as ApiResponse<Ingredient[]>).data
    } else {
        allIngredients.value = []
    }

    ingredientSelects.value = allIngredients.value.map((b) => {
        return {
            label: b.name,
            value: b.id
        }
    })
})

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

        <form
            class="space-y-6 flex-1 overflow-y-auto pr-2"
            @submit.prevent="submit"
        >
            <div>
                <ULabel class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                    Nama {{ props.type }}
                </ULabel>
                <UInput
                    v-model="form.name"
                    class="w-full font-bold"
                    required
                />
            </div>

            <div v-if="props.type === 'product'">
                <ULabel class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                    Kategori
                </ULabel>
                <USelect
                    v-model="form.category_id"
                    :items="categorySelects"
                    class="w-full font-bold"
                />
            </div>

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

            <div class="mt-4 p-4 bg-slate-50 rounded-xl">
                <h4 class="text-xs font-black uppercase mb-3">
                    Komposisi Bahan
                </h4>
                <div
                    v-for="(ingr, idx) in form.recipe"
                    :key="idx"
                    class="flex gap-2 mb-2 items-center"
                >
                    <USelect
                        v-model="ingr.ingredient_id"
                        :items="ingredientSelects"
                        class="w-full font-bold text-sm shadow-sm"
                    />

                    <UInput
                        v-model="ingr.qty"
                        type="number"
                        step="0.01"
                        class="w-36 font-bold text-center shadow-sm"
                        placeholder="0"
                    />

                    <span class="w-12 text-[10px] font-black uppercase text-slate-400">{{ ingr.unit }}</span>

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
        </form>
    </div>
</template>
