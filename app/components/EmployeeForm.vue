<script setup lang="ts">
import type { SelectItem } from '@nuxt/ui'
import { ref, onMounted } from 'vue'
import type { Employee, Branch, ApiResponse } from '~/types/master'

const props = defineProps<{
    item: Employee | Partial<Employee>
}>()

const emit = defineEmits(['save', 'close'])

const form = ref<Employee>({ ...props.item } as Employee)
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
        <div class="flex justify-between items-center mb-8">
            <h2 class="text-xl font-black uppercase italic tracking-tighter">
                {{ form.id ? 'Edit' : 'Tambah' }} Pegawai
            </h2>
            <UButton
                variant="ghost"
                color="neutral"
                icon="i-lucide-x"
                @click="emit('close')"
            />
        </div>

        <div>
            <ULabel class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                Nama Lengkap
            </ULabel>
            <UInput
                v-model="form.name"
                class="w-full font-bold"
            />
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div>
                <ULabel class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                    Role / Jabatan
                </ULabel>
                <USelect
                    v-model="form.job_type"
                    :items="jobTypes"
                    class="w-full font-bold"
                />
            </div>
            <div>
                <ULabel class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                    Penugasan Cabang
                </ULabel>
                <USelect
                    v-model="form.branch_id"
                    :items="branchSelects"
                    class="w-full font-bold"
                />
            </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div>
                <ULabel class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                    Gender
                </ULabel>
                <USelect
                    v-model="form.gender"
                    :items="genders"
                    class="w-full font-bold"
                />
            </div>
            <div>
                <ULabel class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                    Status
                </ULabel>
                <USelect
                    v-model="form.status"
                    :items="employeeStatus"
                    class="w-full font-bold"
                />
            </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div>
                <ULabel class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                    Join Date
                </ULabel>
                <UInput
                    v-model="form.join_date"
                    type="date"
                    class="w-full font-bold"
                />
            </div>
            <div>
                <ULabel class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                    Quit Date
                </ULabel>
                <UInput
                    v-model="form.quit_date"
                    type="date"
                    class="w-full font-bold"
                />
            </div>
        </div>

        <div>
            <ULabel class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                Alamat Rumah
            </ULabel>
            <UTextarea
                v-model="form.home_address"
                class="w-full font-bold"
                placeholder="Alamat tempat tinggal karyawan saat ini"
            />
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div>
                <ULabel class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                    Telepon
                </ULabel>
                <UInput
                    v-model="form.phone"
                    type="text"
                    class="w-full font-bold"
                />
            </div>
            <div>
                <ULabel class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                    No. HP
                </ULabel>
                <UInput
                    v-model="form.mobile"
                    type="text"
                    class="w-full font-bold"
                />
            </div>
        </div>

        <div>
            <ULabel class="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">
                Email
            </ULabel>
            <UInput
                v-model="form.email"
                type="text"
                class="w-full font-bold"
            />
        </div>

        <UButton
            block
            class="py-4"
            @click="submit"
        >
            Simpan Karyawan
        </UButton>
    </div>
</template>
