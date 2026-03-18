<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import type { ApiResponse, Branch, Ingredient, PurchaseOrder, PurchaseOrderItem, PurchaseReturn, PurchaseReturnItem, Supplier, Utility } from '~/types/master'

const props = defineProps<{
    type: 'order' | 'return'
    item: PurchaseOrder | PurchaseReturn | null
}>()

const emit = defineEmits(['save', 'close'])

const form = ref<Partial<PurchaseOrder | PurchaseReturn>>((props.item || {}) as Partial<PurchaseOrder | PurchaseReturn>)

const branches = ref<Branch[]>([])
const branchSelects = ref<SelectItem[]>([])
const suppliers = ref<Supplier[]>([])
const supplierSelects = ref<SelectItem[]>([])
const ingredients = ref<Ingredient[]>([])
const utilities = ref<Utility[]>([])

const storageList = ref<SelectItem[]>([
    { label: 'Main Storage', value: 'MAIN' },
    { label: 'Kitchen', value: 'KTCN' },
    { label: 'Bartender', value: 'BART' }
])

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
        price: 0,
        unit: ''
    })
    else form.value.items = [{
        item_type: '',
        item_code: 0,
        quantity: 0,
        price: 0,
        unit: ''
    }]
}

if (props.type === 'order') {
    watch(() => form.value.items, (newEntries) => {
        if (newEntries) {
            (newEntries as PurchaseOrderItem[]).forEach((entry) => {
                const match = compositionItems.value.find(item => item.uid === entry.uid)
                if (match) {
                    entry.item_code = match.id
                    entry.item_type = match.item_type
                    entry.unit = match.unit
                }
            })
        }
    }, { deep: true })
}

if (props.type === 'return') {
    watch(() => form.value.items, (newEntries) => {
        if (newEntries) {
            (newEntries as PurchaseReturnItem[]).forEach((entry) => {
                const match = compositionItems.value.find(item => item.uid === entry.uid)
                if (match) {
                    entry.item_code = match.id
                    entry.item_type = match.item_type
                    entry.unit = match.unit
                }
            })
        }
    }, { deep: true })
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

const compositionItems = computed(() => {
    return [
        ...ingredients.value.map(i => ({
            ...i,
            item_type: 'INGR',
            uid: `INGR-${i.id}`
        })),
        ...utilities.value.map(u => ({
            ...u,
            item_type: 'UTLT',
            uid: `UTLT-${u.id}`
        }))
    ]
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

    const branchData = await useApi<Branch[] | ApiResponse<Branch[]>>('/api/branches')
    if (Array.isArray(branchData)) {
        branches.value = branchData
    } else if (branchData && typeof branchData === 'object' && 'data' in branchData) {
        branches.value = (branchData as ApiResponse<Branch[]>).data
    } else {
        branches.value = []
    }

    branchSelects.value = branches.value.map((b) => {
        return {
            label: b.name,
            value: b.id
        }
    })

    const [ingrData, utltData] = await Promise.all([
        useApi<Ingredient[] | ApiResponse<Ingredient[]>>('/api/ingredients'),
        useApi<Utility[] | ApiResponse<Utility[]>>('/api/utilities')
    ])

    if (Array.isArray(ingrData)) ingredients.value = ingrData
    else if (ingrData && typeof ingrData === 'object' && 'data' in ingrData) ingredients.value = (ingrData as ApiResponse<Ingredient[]>).data

    if (Array.isArray(utltData)) utilities.value = utltData
    else if (utltData && typeof utltData === 'object' && 'data' in utltData) utilities.value = (utltData as ApiResponse<Utility[]>).data
})
</script>

<template>
    <UContainer class="p-6">
        <div class="flex justify-between items-center">
            <div class="w-3/4 grid grid-cols-2 gap-6 mb-6">
                <UFormField
                    label="Supplier"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <USelect
                        v-model="form.supplier_id"
                        searchable
                        :items="supplierSelects"
                        class="w-full font-bold focus:ring-2 ring-secondary"
                    />
                </UFormField>

                <div class="grid grid-cols-2 gap-3">
                    <UFormField
                        label="Tanggal Invoice"
                        :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                    >
                        <UInput
                            v-model="form.date"
                            type="date"
                            class="w-full font-bold focus:ring-2 ring-indigo-500"
                        />
                    </UFormField>

                    <UFormField
                        label="Tanggal Jalan"
                        :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                    >
                        <UInput
                            v-model="form.delivery_date"
                            type="date"
                            class="w-full font-bold focus:ring-2 ring-indigo-500"
                        />
                    </UFormField>
                </div>

                <UFormField
                    label="Branch"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <USelect
                        v-model="form.branch_id"
                        :items="branchSelects"
                        class="w-full font-bold focus:ring-2 ring-secondary"
                    />
                </UFormField>

                <UFormField
                    label="Storage"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <USelect
                        v-model="form.storage"
                        :items="storageList"
                        class="w-full font-bold focus:ring-2 ring-secondary"
                    />
                </UFormField>
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

        <UFormField
            label="Keterangan"
            name="description"
            :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
        >
            <UTextarea
                v-model="form.description"
                class="w-full font-bold shadow-sm mb-10"
                required
            />
        </UFormField>

        <div class="space-y-3 mb-10">
            <div
                v-for="(record, idx) in form.items"
                :key="idx"
                class="grid grid-cols-12 gap-4 items-end bg-slate-50 p-4 rounded-2xl"
            >
                <div class="col-span-6">
                    <ULabel class="text-[10px] font-black text-slate-400 uppercase">
                        Bahan
                    </ULabel>
                    <USelectMenu
                        v-model="record.uid"
                        :items="compositionItems"
                        label-key="name"
                        value-key="uid"
                        class="w-full bg-transparent border-none font-bold"
                    />
                </div>
                <div class="col-span-2">
                    <ULabel class="text-[10px] font-black text-slate-400 uppercase">
                        Qty
                    </ULabel>
                    <div class="flex items-center gap-2">
                        <UInput
                            v-model="record.quantity"
                            type="number"
                            class="w-full bg-transparent border-none font-bold text-center"
                        />
                        <span class="text-[10px] font-black uppercase text-slate-400">{{ record.unit }}</span>
                    </div>
                </div>
                <div class="col-span-2">
                    <ULabel class="text-[10px] font-black text-slate-400 uppercase">
                        Harga Satuan
                    </ULabel>
                    <UInput
                        v-model="record.price"
                        type="number"
                        class="w-full bg-transparent border-none font-bold text-right"
                    />
                </div>
                <div class="col-span-2 text-right pr-4 font-black text-indigo-900">
                    Rp {{ ((calculateRow) ? calculateRow[idx] : 0)?.toLocaleString() }}
                </div>
            </div>
        </div>

        <div class="grid grid-cols-4 gap-4">
            <UButton
                class="p-4 rounded-2xl font-black uppercase italic justify-center"
                variant="outline"
                color="neutral"
                @click="addItem"
            >
                + Tambah Item
            </UButton>
            <UButton
                size="xl"
                :label="`Simpan ${props.type === 'order' ? 'Pembelian' : 'Retur'}`"
                class="col-span-3 font-black uppercase italic justify-center"
                @click="submit"
            />
        </div>
    </UContainer>
</template>
