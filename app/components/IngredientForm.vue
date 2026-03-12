<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import type { Ingredient } from '~/types/master'

const props = defineProps<{ item: Partial<Ingredient> }>()
const emit = defineEmits(['save', 'close'])

const form = ref<Ingredient>({
    id: 0,
    name: '',
    unit: 'GR', // Default to grams for precision
    min_stock: 0,
    ...props.item
})

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
                Master Bahan Baku
            </h2>
            <UButton
                variant="ghost"
                color="neutral"
                icon="i-lucide-x"
                @click="emit('close')"
            />
        </header>

        <div class="space-y-4">
            <div>
                <ULabel class="label-master">
                    Nama Bahan
                </ULabel>
                <UInput
                    v-model="form.name"
                    class="input-master"
                    placeholder="Nama bahan baku..."
                />
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <ULabel class="label-master">
                        Satuan Stok
                    </ULabel>
                    <USelect
                        v-model="form.unit"
                        :items="unitList"
                        class="input-master"
                    />
                </div>
                <div>
                    <ULabel class="label-master">
                        Min. Stok
                    </ULabel>
                    <UInput
                        v-model="form.min_stock"
                        type="number"
                        class="input-master text-center"
                    />
                </div>
            </div>

            <div>
                <ULabel
                    class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest"
                    for="description"
                >
                    Keterangan
                </ULabel>
                <UTextarea
                    id="description"
                    v-model="form.description"
                    class="input-master h-24 pt-4"
                />
            </div>
        </div>

        <UButton
            block
            size="xl"
            color="primary"
            class="font-black uppercase italic py-4 shadow-lg shadow-primary/20"
            @click="submit"
        >
            Simpan Bahan
        </UButton>
    </div>
</template>
