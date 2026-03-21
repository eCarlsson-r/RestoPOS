<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import { ref, onMounted, watch, computed } from 'vue'
import { useApi } from '~/composables/useApi'
import type { Product, ApiResponse, Package, PackageProduct } from '~/types/master'

const props = defineProps<{
    item: Package | null
}>()

const emit = defineEmits(['save', 'deleteExistingImage', 'close'])
const value = ref<File[]>([])

const deleteExistingImage = (id: number) => {
    emit('deleteExistingImage', id)
    form.value.files = form.value.files?.filter(file => file.id !== id)
}

const form = ref<Partial<Package>>((props.item || {}) as Partial<Package>)
const allProducts = ref<Product[]>([])
const productSelects = ref<SelectItem[]>([])

watch(() => props.item, (newVal) => {
    // Avoid resetting the form if the parent component re-renders and passes a new empty object
    if (form.value && form.value.id === newVal?.id && !newVal?.id && newVal && Object.keys(newVal).length === 0) {
        return
    }
    const baseItem = newVal ? { ...newVal } : {} as Partial<Package>
    if (!baseItem.products) baseItem.products = []
    form.value = baseItem
}, { deep: true, immediate: true })

const addProductRow = () => {
    if (form.value.products) form.value.products?.push({
        product_id: 0,
        quantity: 0,
        price: 0
    })
    else form.value.products = [{
        product_id: 0,
        quantity: 0,
        price: 0
    }]
}

// 2. Computed total for each row
const totals = computed(() => {
    return form.value.products?.map(field => field.quantity * field.price)
})

onMounted(async () => {
    const data = await useApi<Product[] | ApiResponse<Product[]>>('products')
    if (Array.isArray(data)) {
        allProducts.value = data
    } else if (data && typeof data === 'object' && 'data' in data) {
        allProducts.value = (data as ApiResponse<Product[]>).data
    } else {
        allProducts.value = []
    }

    productSelects.value = allProducts.value.map((b) => {
        return {
            label: b.name,
            value: b.id
        }
    })
})

const onProductSelect = (productId: number, row: PackageProduct) => {
    if (!productId) return
    const product = allProducts.value.find(p => p.id === productId)
    if (product) {
        row.price = product.price
        if (!row.quantity || row.quantity === 0) {
            row.quantity = 1
        }
    }
}

const submit = async () => {
    const fd = objectToFormData(form.value, value.value)
    emit('save', fd)
}
</script>

<template>
    <div class="h-full flex flex-col bg-white">
        <UForm
            :state="form"
            class="space-y-6 flex-1 overflow-y-auto pr-2"
            @submit="submit"
        >
            <div
                class="grid grid-cols-3 gap-3"
            >
                <UFormField
                    class="col-span-2"
                    label="Nama Paket"
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

            <div class="mt-4 p-4 bg-slate-50 rounded-xl">
                <h4 class="text-xs font-black uppercase mb-3">
                    Daftar Produk
                </h4>
                <div
                    v-for="(prd, idx) in form.products"
                    :key="idx"
                    class="grid grid-cols-4 gap-2 mb-2 items-center"
                >
                    <USelectMenu
                        v-model="prd.product_id"
                        :items="productSelects"
                        value-key="value"
                        class="font-bold text-sm shadow-sm"
                        @update:model-value="val => onProductSelect(Number(val), prd)"
                    />

                    <UInput
                        v-model="prd.quantity"
                        class="font-bold text-center shadow-sm"
                        placeholder="0"
                    />

                    <UInput
                        v-model="prd.price"
                        class="font-bold text-center shadow-sm"
                        placeholder="0"
                        disabled
                    />

                    <div class="flex gap-2 items-center">
                        <UInput
                            v-model="totals![idx]"
                            class="font-bold text-center shadow-sm"
                            placeholder="0"
                            disabled
                        />

                        <button
                            type="button"
                            class="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                            @click="form.products?.splice(idx, 1)"
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
                    @click="addProductRow"
                >
                    + Tambah Produk
                </UButton>
            </div>

            <UFormField
                label="Foto Paket"
                name="images"
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
