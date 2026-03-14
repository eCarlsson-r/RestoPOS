<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import type { ApiResponse, Ingredient, PurchaseOrder, PurchaseReturn, Supplier } from '~/types/master'

const props = defineProps<{
    type: 'order' | 'return'
    item: PurchaseOrder | PurchaseReturn | null
}>()

const emit = defineEmits(['save', 'close'])

const form = ref<Partial<PurchaseOrder | PurchaseReturn>>((props.item || {}) as Partial<PurchaseOrder | PurchaseReturn>)
const suppliers = ref<Supplier[]>([])
const supplierSelects = ref<SelectItem[]>([])
const ingredients = ref<Ingredient[]>([])
const ingredientSelects = ref<SelectItem[]>([])

watch(() => props.item, (newVal) => {
    // Avoid resetting the form if the parent component re-renders and passes a new empty object
    if (form.value && form.value.id === newVal?.id && !newVal?.id && newVal && Object.keys(newVal).length === 0) {
        return
    }
    const baseItem = newVal ? { ...newVal } : {} as Partial<PurchaseOrder | PurchaseReturn>
    if (!baseItem.items) baseItem.items = []
    form.value = baseItem
}, { deep: true, immediate: true })

const addItem = () => {
    if (form.value.items) form.value.items?.push({
        item_type: '',
        item_code: 0,
        quantity: 0,
        price: 0
    })
    else form.value.items = [{
        item_type: '',
        item_code: 0,
        quantity: 0,
        price: 0
    }]
}

const submit = async () => {
    emit('save', form.value)
}

const calculateRow = computed(() => {
    return form.value.items?.map(field => field.quantity * field.price)
})

const grandTotal = computed(() => {
    return calculateRow.value?.reduce((sum, total) => sum + total, 0)
})

onMounted(async () => {
    const supplierData = await useApi<Supplier[] | ApiResponse<Supplier[]>>('/api/suppliers')
    if (Array.isArray(supplierData)) {
        suppliers.value = supplierData
    } else if (supplierData && typeof supplierData === 'object' && 'data' in supplierData) {
        suppliers.value = (supplierData as ApiResponse<Supplier[]>).data
    } else {
        suppliers.value = []
    }

    supplierSelects.value = suppliers.value.map((b) => {
        return {
            label: b.name,
            value: b.id
        }
    })

    const ingredientData = await useApi<Ingredient[] | ApiResponse<Ingredient[]>>('/api/ingredients')
    if (Array.isArray(ingredientData)) {
        ingredients.value = ingredientData
    } else if (ingredientData && typeof ingredientData === 'object' && 'data' in ingredientData) {
        ingredients.value = (ingredientData as ApiResponse<Ingredient[]>).data
    } else {
        ingredients.value = []
    }

    ingredientSelects.value = ingredients.value.map((b) => {
        return {
            label: b.name,
            value: b.id
        }
    })
})
</script>

<template>
    <UContainer class="p-6">
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

        <div class="flex justify-between items-end mb-10">
            <div>
                <h1 class="text-4xl font-black uppercase italic tracking-tighter">
                    Input Pembelian
                </h1>
                <p class="text-slate-400 font-bold text-xs uppercase">
                    Restock Ingredients to MAIN Storage
                </p>
            </div>
            <div class="text-right">
                <p class="text-[10px] font-black text-slate-400 uppercase">
                    Total Invoice
                </p>
                <p class="text-4xl font-black text-primary">
                    Rp {{ grandTotal?.toLocaleString() }}
                </p>
            </div>
        </div>

        <div class="grid grid-cols-2 gap-6 mb-10">
            <div>
                <ULabel class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                    Supplier
                </ULabel>
                <USelect
                    v-model="form.supplier_id"
                    :items="supplierSelects"
                    class="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 ring-secondary"
                />
            </div>
            <div>
                <ULabel class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                    Tanggal Invoice
                </ULabel>
                <UInput
                    v-model="form.date"
                    type="date"
                    class="w-full p-4 bg-slate-50 border-none rounded-2xl font-bold focus:ring-2 ring-indigo-500"
                />
            </div>
        </div>

        <div class="space-y-3 mb-10">
            <div
                v-for="(record, idx) in form.items"
                :key="idx"
                class="flex gap-4 items-end bg-slate-50 p-4 rounded-2xl"
            >
                <div class="flex-1">
                    <ULabel class="text-[10px] font-black text-slate-400 uppercase">
                        Bahan
                    </ULabel>
                    <USelect
                        v-model="record.item_code"
                        :items="ingredientSelects"
                        class="w-full bg-transparent border-none font-bold"
                    />
                </div>
                <div class="w-24">
                    <ULabel class="text-[10px] font-black text-slate-400 uppercase">
                        Qty
                    </ULabel>
                    <UInput
                        v-model="record.quantity"
                        type="number"
                        class="w-full bg-transparent border-none font-bold text-center"
                    />
                </div>
                <div class="w-40">
                    <ULabel class="text-[10px] font-black text-slate-400 uppercase">
                        Harga Satuan
                    </ULabel>
                    <UInput
                        v-model="record.price"
                        type="number"
                        class="w-full bg-transparent border-none font-bold text-right"
                    />
                </div>
                <div class="w-40 text-right pr-4 font-black text-indigo-900">
                    Rp {{ ((calculateRow) ? calculateRow[idx] : 0)?.toLocaleString() }}
                </div>
            </div>
        </div>

        <div class="flex gap-4">
            <UButton
                class="flex-1 py-4 rounded-2xl font-black uppercase italic justify-center"
                variant="outline"
                color="neutral"
                @click="addItem"
            >
                + Tambah Item
            </UButton>
            <UButton
                size="xl"
                block
                :label="`Simpan ${props.type === 'order' ? 'Pembelian' : 'Retur'}`"
                class="font-black uppercase italic"
                @click="submit"
            />
        </div>
    </UContainer>
</template>
