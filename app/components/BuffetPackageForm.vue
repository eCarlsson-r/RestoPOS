<script setup lang="ts">
import type { BuffetPackage, Category, Product } from '~/types/master'

const props = defineProps<{
    item: BuffetPackage | null
}>()
const emit = defineEmits(['save', 'deleteExistingImage', 'close'])
const value = ref<File[]>([])

const tabs = [
    { label: 'General Info', icon: 'i-lucide-info', slot: 'general-info' },
    { label: 'Menu Items (AYCE)', icon: 'i-lucide-utensils', slot: 'menu-items' }
]

const { data: categories } = await useApi<{ data: Category[] }>('categories')
const selectedProductIds = ref<number[]>(props.item?.products?.map(p => p.id) || [])

const form = ref({
    ...props.item,
    // Add product_ids to the form state
    product_ids: props.item?.products?.map(p => p.id) || []
})

const deleteExistingImage = (id: number) => {
    emit('deleteExistingImage', id)
    form.value.files = form.value.files?.filter(file => file.id !== id)
}

// Sync selectedProductIds into form.value before saving
watch(selectedProductIds, (newVal) => {
    form.value.product_ids = newVal
})

const toggleProduct = (productId: number, checked: boolean | 'indeterminate') => {
    if (checked === true) {
        if (!selectedProductIds.value.includes(productId)) {
            selectedProductIds.value.push(productId)
        }
    } else {
        selectedProductIds.value = selectedProductIds.value.filter(id => id !== productId)
    }
}

const categorySummary = computed(() => {
    if (!categories) return []

    return categories.map((cat) => {
        const totalInCategory = cat.products?.length || 0
        const selectedInCategory = cat.products?.filter(p =>
            selectedProductIds.value.includes(p.id)
        ).length || 0

        return {
            name: cat.name,
            count: selectedInCategory,
            total: totalInCategory,
            percentage: totalInCategory > 0 ? (selectedInCategory / totalInCategory) * 100 : 0
        }
    })
})

const toggleCategory = (category: Category) => {
    const categoryProductIds = category.products?.map((p: Product) => p.id) || []
    const allSelected = categoryProductIds.every((id: number) => selectedProductIds.value.includes(id))

    if (allSelected) {
        selectedProductIds.value = selectedProductIds.value.filter((id: number) => !categoryProductIds.includes(id))
    } else {
        const newIds = categoryProductIds.filter((id: number) => !selectedProductIds.value.includes(id))
        selectedProductIds.value.push(...newIds)
    }
}

watch(() => props.item, (newItem) => {
    if (newItem) {
        form.value = {
            id: newItem.id,
            name: newItem.name,
            price_adult: newItem.price_adult,
            price_child: newItem.price_child,
            duration_minutes: newItem.duration_minutes,
            description: newItem.description,
            product_ids: newItem.products?.map(p => p.id) || []
        }
        selectedProductIds.value = newItem.products?.map(p => p.id) || []
    }
}, { deep: true })
</script>

<template>
    <div class="space-y-6">
        <UForm
            :state="form"
            class="space-y-4"
            @submit="emit('save', objectToFormData(form, value))"
        >
            <UTabs
                :items="tabs"
                class="space-y-4"
            >
                <template #general-info>
                    <div class="grid grid-cols-4 gap-4 mb-4">
                        <UFormField
                            label="Package Name"
                            class="col-span-3 mb-4"
                            :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                        >
                            <UInput
                                v-model="form.name"
                                class="w-full shadow-sm"
                                placeholder="e.g. Regular Lunch Buffet"
                            />
                        </UFormField>

                        <UFormField
                            label="Duration (Minutes)"
                            class="mb-4"
                            :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                        >
                            <UInput
                                v-model="form.duration_minutes"
                                class="w-full shadow-sm"
                                type="number"
                            />
                        </UFormField>
                    </div>

                    <div class="grid grid-cols-2 gap-4 mb-4">
                        <UFormField
                            label="Adult Price"
                            :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                        >
                            <UInput
                                v-model="form.price_adult"
                                class="w-full shadow-sm"
                                type="number"
                            />
                        </UFormField>
                        <UFormField
                            label="Child Price"
                            :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                        >
                            <UInput
                                v-model="form.price_child"
                                class="w-full shadow-sm"
                                type="number"
                            />
                        </UFormField>
                    </div>

                    <UFormField
                        label="Keterangan"
                        name="description"
                        class="mb-4"
                        :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                    >
                        <UTextarea
                            v-model="form.description"
                            class="w-full font-bold shadow-sm"
                        />
                    </UFormField>

                    <UFormField
                        label="Foto Paket"
                        name="images"
                        class="mb-6"
                        :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                    >
                        <div
                            v-if="form.files && form.files.length"
                            class="flex flex-wrap gap-4"
                        >
                            <div
                                v-for="file in form.files"
                                :key="file.id"
                                class="relative rounded-lg overflow-hidden border border-slate-200"
                            >
                                <img
                                    :src="file.url"
                                    class="w-24 h-24 object-cover"
                                    alt="Branch Photo"
                                >
                                <!-- Optional: Add a button to delete existing images -->
                                <button
                                    type="button"
                                    class="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                    @click="deleteExistingImage(file.id)"
                                >
                                    <UIcon
                                        name="i-lucide-x"
                                        class="w-3 h-3"
                                    />
                                </button>
                            </div>
                        </div>
                        <UFileUpload
                            v-model="value"
                            accept="image/*"
                            icon="i-lucide-image"
                            label="Drop your images here"
                            description="SVG, PNG, JPG or GIF (max. 2MB)"
                            layout="list"
                            multiple
                        />
                    </UFormField>
                </template>

                <template #menu-items>
                    <div class="flex justify-between items-center bg-neutral-200 p-3 rounded-xl mb-4">
                        <div class="flex flex-col">
                            <span class="text-[10px] uppercase font-bold opacity-70">Global Selection</span>
                            <span class="text-sm font-black">{{ selectedProductIds.length }} Items Total</span>
                        </div>
                        <div class="flex gap-2">
                            <UButton
                                size="xs"
                                variant="ghost"
                                label="Clear All"
                                @click="selectedProductIds = []"
                            />
                            <UButton
                                size="xs"
                                label="Select Every Product"
                                @click="selectedProductIds = categories.flatMap(c => c.products?.map(p => p.id) || [])"
                            />
                        </div>
                    </div>

                    <div class="grid grid-cols-2 md:grid-cols-3 gap-2 mb-6">
                        <div
                            v-for="stat in categorySummary"
                            :key="stat.name"
                            class="p-2 rounded-lg border border-slate-200 bg-white shadow-sm"
                        >
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-[10px] font-black uppercase text-slate-400">{{ stat.name }}</span>
                                <span class="text-[10px] font-bold text-primary">{{ stat.count }}/{{ stat.total }}</span>
                            </div>
                            <div class="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                    class="bg-primary h-full transition-all duration-500"
                                    :style="{ width: `${stat.percentage}%` }"
                                />
                            </div>
                        </div>
                    </div>

                    <div class="max-h-[60vh] overflow-y-auto pr-2">
                        <div
                            v-for="cat in categories"
                            :key="cat.id"
                            class="p-4 bg-slate-50 rounded-xl border border-slate-100"
                        >
                            <div class="flex justify-between items-center mb-3">
                                <h4 class="text-xs font-black uppercase italic">
                                    {{ cat.name }}
                                </h4>
                                <UButton
                                    size="xs"
                                    color="neutral"
                                    variant="soft"
                                    @click="toggleCategory(cat)"
                                >
                                    Toggle Category
                                </UButton>
                            </div>

                            <div class="grid grid-cols-2 gap-2">
                                <UCheckbox
                                    v-for="prod in cat.products"
                                    :key="prod.id"
                                    :model-value="selectedProductIds.includes(prod.id)"
                                    :label="prod.name"
                                    :ui="{ label: 'text-xs' }"
                                    @update:model-value="(checked: boolean | 'indeterminate') => toggleProduct(prod.id, checked)"
                                />
                            </div>
                        </div>
                    </div>
                </template>
            </UTabs>

            <div class="flex justify-end gap-2">
                <UButton
                    variant="outline"
                    color="neutral"
                    class="flex-1 font-bold justify-center"
                    @click="emit('close')"
                >
                    Batal
                </UButton>
                <UButton
                    type="submit"
                    class="flex-1 font-black uppercase italic justify-center py-4"
                >
                    Simpan
                </UButton>
            </div>
        </UForm>
    </div>
</template>
