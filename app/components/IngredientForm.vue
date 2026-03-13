<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import { ref, watch } from 'vue'
import type { Ingredient, Utility } from '~/types/master'

const props = withDefaults(defineProps<{
    type?: 'ingredient' | 'utility'
    item?: Partial<Ingredient | Utility> | null
}>(), {
    type: 'ingredient',
    item: () => ({})
})

const emit = defineEmits(['save', 'close'])

type FormData = Partial<Ingredient & Utility> & { code?: string }

const form = ref<FormData>(props.item ? ({ ...props.item } as FormData) : {})

watch(() => props.item, (newVal) => {
    if (form.value && form.value.id === newVal?.id && !newVal?.id && newVal && Object.keys(newVal).length === 0) {
        return
    }
    const baseItem = newVal ? { ...newVal } : {} as FormData

    if (props.type === 'ingredient') {
        if (!baseItem.unit) baseItem.unit = 'GR'
        if (baseItem.min_stock === undefined) baseItem.min_stock = 0
    } else {
        if (!baseItem.unit) baseItem.unit = 'g'
    }

    form.value = baseItem
}, { deep: true, immediate: true })

const unitList = ref<SelectItem[]>([
    { label: 'Gram (gr)', value: 'GR' },
    { label: 'Kilogram (kg)', value: 'KG' },
    { label: 'Liter (ltr)', value: 'LTR' },
    { label: 'Pieces (pcs)', value: 'PCS' }
])

const submit = () => emit('save', form.value)
</script>

<template>
    <div class="space-y-6">
        <header class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-black uppercase italic tracking-tighter">
                {{ form.id ? 'Edit' : 'Tambah' }} {{ props.type === 'utility' ? 'Utility' : 'Bahan Baku' }}
            </h2>
            <UButton
                variant="ghost"
                color="neutral"
                icon="i-lucide-x"
                @click="emit('close')"
            />
        </header>

        <UForm
            :state="form"
            class="space-y-4"
            @submit="submit"
        >
            <UFormField
                :label="'Nama ' + (props.type === 'utility' ? 'Alat' : 'Bahan')"
                name="name"
                :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
            >
                <UInput
                    v-model="form.name"
                    class="w-full font-bold shadow-sm"
                />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
                <UFormField
                    label="Satuan Stok"
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
                    label="Min. Stok"
                    name="min_stock"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="form.min_stock"
                        type="number"
                        class="w-full font-bold text-center shadow-sm"
                    />
                </UFormField>
            </div>

            <UFormField
                label="Keterangan"
                name="description"
                :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
            >
                <UTextarea
                    id="description"
                    v-model="form.description"
                    class="w-full font-bold shadow-sm"
                />
            </UFormField>

            <UButton
                type="submit"
                block
                size="xl"
                color="primary"
                class="font-black uppercase italic py-4 shadow-lg shadow-primary/20 mt-4"
            >
                Simpan {{ props.type === 'utility' ? 'Alat' : 'Bahan' }}
            </UButton>
        </UForm>
    </div>
</template>
