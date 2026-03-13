<script setup lang="ts">
import type { Branch } from '~/types/master'

const props = defineProps<{
    item: Branch | null
}>()
const emit = defineEmits(['save', 'close'])

const form = ref({
    ...props.item
})
</script>

<template>
    <div class="space-y-6">
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-xl font-black uppercase italic tracking-tighter">
                {{ form.id ? 'Edit' : 'Tambah' }} Cabang
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
            <div class="grid grid-cols-4 gap-2">
                <UFormField
                    class="col-span-2"
                    label="Nama Cabang"
                    name="name"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="form.name"
                        class="w-full font-bold shadow-sm"
                    />
                </UFormField>

                <UFormField
                    label="Jumlah Lantai"
                    name="floor_number"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="form.floor_number"
                        class="w-full font-bold shadow-sm"
                    />
                </UFormField>

                <UFormField
                    label="Jumlah Meja / Lt"
                    name="table_number"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="form.table_number"
                        class="w-full font-bold shadow-sm"
                    />
                </UFormField>
            </div>

            <UFormField
                label="Alamat Cabang"
                name="address"
                :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
            >
                <UTextarea
                    v-model="form.address"
                    class="w-full font-bold shadow-sm"
                />
            </UFormField>

            <div class="grid grid-cols-4 gap-2">
                <UFormField
                    class="col-span-2"
                    label="Nomor Telfon Cabang"
                    name="phone"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="form.phone"
                        class="w-full font-bold shadow-sm"
                    />
                </UFormField>

                <UFormField
                    label="Jumlah Dapur"
                    name="kitchen_no"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="form.kitchen_no"
                        class="w-full font-bold shadow-sm"
                    />
                </UFormField>

                <UFormField
                    label="Jumlah Bartndr"
                    name="bartender_no"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="form.bartender_no"
                        class="w-full font-bold shadow-sm"
                    />
                </UFormField>
            </div>

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
