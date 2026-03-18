<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import type { Category } from '~/types/master'

const props = defineProps<{
    item: Category | null
}>()
const emit = defineEmits(['save', 'deleteExistingImage', 'close'])
const value = ref<File[]>([])

const form = ref({
    ...props.item
})

const deleteExistingImage = (id: number) => {
    emit('deleteExistingImage', id)
    form.value.files = form.value.files?.filter(file => file.id !== id)
}
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
        <UForm
            :state="form"
            class="space-y-4"
            @submit="emit('save', objectToFormData(form, value))"
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

            <UFormField
                label="Foto Kategori"
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
