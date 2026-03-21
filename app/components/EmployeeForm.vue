<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import { ref, onMounted } from 'vue'
import type { Employee, Branch, ApiResponse } from '~/types/master'

const props = defineProps<{
    item: Employee | Partial<Employee> | null
}>()

const emit = defineEmits(['save', 'close'])

const form = ref<Partial<Employee>>((props.item || {}) as Partial<Employee>)
const branches = ref<Branch[]>([])
const branchSelects = ref<SelectItem[]>([])

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

const employeeStatus = ref<SelectItem[]>([
    {
        label: 'Join',
        value: 'J'
    },
    {
        label: 'Hiatus',
        value: 'H'
    },
    {
        label: 'Quit',
        value: 'Q'
    }
])

const jobTypes = ref<SelectItem[]>([
    {
        label: 'Waiter',
        value: 'SERVICE-WT'
    },
    {
        label: 'Cashier',
        value: 'SERVICE-CH'
    },
    {
        label: 'Captain',
        value: 'SERVICE-CP'
    },
    {
        label: 'Cook',
        value: 'KITCHEN-C'
    },
    {
        label: 'Steward',
        value: 'KITCHEN-S'
    },
    {
        label: 'Bartender',
        value: 'BARTENDER'
    },
    {
        label: 'Purchasing',
        value: 'PURCHASING'
    }
])

onMounted(async () => {
    const data = await useApi<Branch[] | ApiResponse<Branch[]>>('branches')
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
            value: b.id
        }
    })
})

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
                    label="Role / Jabatan"
                    name="job_type"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <USelect
                        v-model="form.job_type"
                        :items="jobTypes"
                        class="w-full font-bold shadow-sm"
                    />
                </UFormField>
                <UFormField
                    label="Penugasan Cabang"
                    name="branch_id"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <USelect
                        v-model="form.branch_id"
                        :items="branchSelects"
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
                    label="Status"
                    name="status"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <USelect
                        v-model="form.status"
                        :items="employeeStatus"
                        class="w-full font-bold shadow-sm"
                    />
                </UFormField>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <UFormField
                    label="Join Date"
                    name="join_date"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="form.join_date"
                        type="date"
                        class="w-full font-bold shadow-sm"
                    />
                </UFormField>
                <UFormField
                    label="Quit Date"
                    name="quit_date"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="form.quit_date"
                        type="date"
                        class="w-full font-bold shadow-sm"
                    />
                </UFormField>
            </div>

            <UFormField
                label="Alamat Rumah"
                name="home_address"
                :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
            >
                <UTextarea
                    v-model="form.home_address"
                    class="w-full font-bold shadow-sm"
                    placeholder="Alamat tempat tinggal karyawan saat ini"
                />
            </UFormField>

            <div class="grid grid-cols-2 gap-4">
                <UFormField
                    label="Telepon"
                    name="phone"
                    :ui="{ label: 'text-[10px] font-black uppercase text-slate-400 tracking-widest' }"
                >
                    <UInput
                        v-model="form.phone"
                        type="text"
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
                        type="text"
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
                    type="text"
                    class="w-full font-bold shadow-sm"
                />
            </UFormField>

            <UButton
                type="submit"
                block
                class="py-4 mt-8"
            >
                Simpan Karyawan
            </UButton>
        </UForm>
    </div>
</template>
