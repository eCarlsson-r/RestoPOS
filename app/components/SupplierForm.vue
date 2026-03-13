<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import { ref, onMounted } from 'vue'
import type { Supplier, Branch, ApiResponse } from '~/types/master'

const props = defineProps<{ item: Partial<Supplier | null> }>()
const emit = defineEmits(['save', 'close'])

const form = ref({
    ...props.item
})

const branches = ref<Branch[]>([])
const branchSelects = ref<SelectItem[]>([])

const storageList = ref<SelectItem[]>([
    { label: 'Main Storage', value: 'MAIN' },
    { label: 'Kitchen', value: 'KTCN' },
    { label: 'Bartender', value: 'BART' }
])

onMounted(async () => {
    const data = await useApi<Branch[] | ApiResponse<Branch[]>>('/api/branches')
    if (Array.isArray(data)) {
        branches.value = data
    } else if (data && typeof data === 'object' && 'data' in data) {
        branches.value = (data as ApiResponse<Branch[]>).data
    } else {
        branches.value = []
    }

    branchSelects.value = branches.value.map((b) => {
        return {
            label: b.name,
            value: b.id.toString()
        }
    })
})

const submit = () => emit('save', form.value)
</script>

<template>
    <div class="h-full flex flex-col bg-white">
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-black uppercase italic tracking-tighter">
                {{ form.id ? 'Edit' : 'Tambah' }} Pemasok
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
            <div class="grid grid-cols-2 gap-4">
                <UFormField
                    label="Supply to Branch"
                    name="branch_id"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <USelect
                        v-model="form.branch_id"
                        :items="branchSelects"
                        class="w-full font-bold shadow-sm"
                        required
                    />
                </UFormField>
                <UFormField
                    label="Supply to Storage"
                    name="storage"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <USelect
                        v-model="form.storage"
                        :items="storageList"
                        class="w-full font-bold shadow-sm"
                        required
                    />
                </UFormField>
            </div>

            <UFormField
                label="Supplier Name"
                name="name"
                :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
            >
                <UInput
                    v-model="form.name"
                    class="w-full font-bold shadow-sm"
                    placeholder="Supplier name..."
                    required
                />
            </UFormField>

            <UFormField
                label="Contact Person"
                name="contact_person"
                :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
            >
                <UInput
                    v-model="form.contact_person"
                    class="w-full font-bold shadow-sm"
                    placeholder="Contact person name..."
                />
            </UFormField>

            <UFormField
                label="Supplier NPWP"
                name="npwp"
                :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
            >
                <UInput
                    v-model="form.npwp"
                    class="w-full font-bold shadow-sm"
                    placeholder="NPWP number..."
                />
            </UFormField>

            <UFormField
                label="Supplier Address"
                name="address"
                :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
            >
                <UTextarea
                    v-model="form.address"
                    class="w-full font-bold shadow-sm"
                    placeholder="Address where the supplier is located."
                />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
                <UFormField
                    label="Supplier Phone"
                    name="phone"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="form.phone"
                        class="w-full font-bold shadow-sm"
                        placeholder="Phone number..."
                    />
                </UFormField>
                <UFormField
                    label="Contact Person Mobile"
                    name="mobile"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="form.mobile"
                        class="w-full font-bold shadow-sm"
                        placeholder="Mobile number..."
                    />
                </UFormField>
            </div>

            <UFormField
                label="Supplier e-Mail Address"
                name="email"
                :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
            >
                <UInput
                    v-model="form.email"
                    type="email"
                    class="w-full font-bold shadow-sm"
                    placeholder="Email address..."
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
