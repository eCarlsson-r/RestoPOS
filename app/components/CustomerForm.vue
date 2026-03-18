<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import { ref } from 'vue'
import type { Customer } from '~/types/master'

const props = defineProps<{
    item: Customer | Partial<Customer> | null
}>()

const emit = defineEmits(['save', 'close'])
const form = ref<Partial<Customer>>((props.item || {}) as Partial<Customer>)

const genders = ref<SelectItem[]>([
    {
        label: 'Male',
        value: 'M'
    },
    {
        label: 'Female',
        value: 'F'
    }
])

const submit = async () => {
    emit('save', form.value)
}
</script>

<template>
    <div class="h-full flex flex-col bg-white space-y-4">
        <UForm
            :state="form"
            class="space-y-4 overflow-y-auto pr-2"
            @submit="submit"
        >
            <UFormField
                label="Nama Lengkap"
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
                    label="Discount (%)"
                    name="discount"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="form.discount"
                        class="w-full font-bold shadow-sm"
                    />
                </UFormField>
                <UFormField
                    label="Pajak (%)"
                    name="tax"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="form.tax"
                        class="w-full font-bold shadow-sm"
                    />
                </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <UFormField
                    label="Tempat Lahir"
                    name="pob"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="form.pob"
                        class="w-full font-bold shadow-sm"
                    />
                </UFormField>
                <UFormField
                    label="Tanggal Lahir"
                    name="dob"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="form.dob"
                        type="date"
                        class="w-full font-bold shadow-sm"
                    />
                </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <UFormField
                    label="Gender"
                    name="gender"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <USelect
                        v-model="form.gender"
                        :items="genders"
                        class="w-full font-bold shadow-sm"
                    />
                </UFormField>
                <UFormField
                    label="No. HP"
                    name="mobile"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="form.mobile"
                        class="w-full font-bold shadow-sm"
                    />
                </UFormField>
            </div>

            <UFormField
                label="Email"
                name="email"
                :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
            >
                <UInput
                    v-model="form.email"
                    type="email"
                    class="w-full font-bold shadow-sm"
                />
            </UFormField>

            <UFormField
                label="Alamat"
                name="address"
                :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
            >
                <UTextarea
                    v-model="form.address"
                    class="w-full font-bold shadow-sm"
                />
            </UFormField>

            <UButton
                type="submit"
                block
                class="py-4"
            >
                Simpan Pelanggan
            </UButton>
        </UForm>
    </div>
</template>
