<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import type { Category } from '~/types/master'

const props = defineProps<{
    item: Category | null
}>()
const emit = defineEmits(['save', 'close'])

const form = ref({
    id: props.item?.id,
    name: props.item?.name,
    kitchen_process: props.item?.kitchen_process,
    description: props.item?.description
})

const kitchenProcessList = ref<SelectItem[]>([
    { label: 'Dapur', value: 'KTCN' },
    { label: 'Bar', value: 'BART' },
    { label: 'Tidak Ada', value: 'SRVC' }
])

watch(() => props.item, (newItem) => {
    if (newItem) {
        form.value = {
            id: newItem.id,
            name: newItem.name,
            kitchen_process: newItem.kitchen_process,
            description: newItem.description
        }
    }
}, { deep: true })
</script>

<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-xl font-black uppercase italic tracking-tighter">
                {{ form.id ? 'Edit' : 'Tambah' }} Kategori
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
            class="space-y-4"
            @submit="emit('save', form)"
        >
            <UFormField
                label="Nama Kategori"
                name="name"
                :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
            >
                <UInput
                    v-model="form.name"
                    class="w-full font-bold shadow-sm"
                />
            </UFormField>

            <UFormField
                label="Proses Dapur"
                name="kitchen_process"
                :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
            >
                <USelect
                    v-model="form.kitchen_process"
                    :items="kitchenProcessList"
                    class="w-full font-bold shadow-sm"
                />
            </UFormField>

            <UFormField
                label="Keterangan"
                name="description"
                :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
            >
                <UTextarea
                    v-model="form.description"
                    class="w-full font-bold shadow-sm"
                />
            </UFormField>

            <div class="flex gap-2 mt-8">
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
