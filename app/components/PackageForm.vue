<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import { ref, onMounted, watch, computed } from 'vue'
import { useApi } from '~/composables/useApi'
import type { Product, ApiResponse, Package } from '~/types/master'

const props = defineProps<{
    item: Package | null
}>()

const emit = defineEmits(['save', 'close'])

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
    const data = await useApi<Product[] | ApiResponse<Product[]>>('/api/products')
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

const submit = async () => {
    emit('save', form.value)
}
</script>

<template>
    <div class="h-full flex flex-col bg-white">
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-xl font-black uppercase italic tracking-tighter">
                {{ form.id ? 'Edit' : 'Tambah' }} Paket
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
                    <USelect
                        v-model="prd.product_id"
                        :items="productSelects"
                        class="font-bold text-sm shadow-sm"
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
