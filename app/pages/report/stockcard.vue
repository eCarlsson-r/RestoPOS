<script setup>
import { today, getLocalTimeZone } from '@internationalized/date'

const dateRange = ref({
    start: today(getLocalTimeZone()),
    end: today(getLocalTimeZone())
})
const selectedIngredient = ref(null)
const { data: ingredients } = await useApi('/api/ingredients')
const selectedUtility = ref(null)
const { data: utilities } = await useApi('/api/utilities')
const selectedBranch = ref(null)
const { data: branchList } = await useApi('/api/branches')
const selectedStorage = ref(null)
const storageList = ref([
    { label: 'Main Storage', value: 'MAIN' },
    { label: 'Kitchen', value: 'KTCN' },
    { label: 'Bartender', value: 'BART' }
])
const selectedType = ref('INGR')
const { user } = useAuth()
const isAdmin = computed(() => user.value?.type === 'ADMIN')

watchEffect(() => {
    if (user.value && !isAdmin.value) {
        if (user.value.type === 'KITCHEN' && user.value.username.includes('_')) {
            selectedBranch.value = Number(user.value.username.split('_')[0]) || null
            selectedStorage.value = user.value.username.split('_')[1]
        } else {
            selectedBranch.value = Number(user.value.employee?.branch_id) || null
            selectedStorage.value = 'MAIN'
        }
    }
})

const logs = ref([])

const fetchAudit = async () => {
    const params = {
        item_type: selectedType.value,
        branch_id: selectedBranch.value,
        storage: selectedStorage.value,
        start: dateRange.value.start.toString(),
        end: dateRange.value.end.toString()
    }
    if (selectedType.value === 'INGR') {
        params.item_code = selectedIngredient.value
    } else {
        params.item_code = selectedUtility.value
    }

    const { data } = await useApi('/api/stock/card', { params })
    logs.value = data
}
</script>

<template>
    <UContainer class="p-6">
        <div class="flex justify-between items-center mb-8 gap-4">
            <h1 class="text-3xl font-black uppercase italic tracking-tighter">
                Kartu Stok (Audit)
            </h1>
            <div class="grid grid-cols-4 gap-4">
                <UFormField
                    label="Tipe"
                    class="w-full"
                    :ui="{ label: 'block text-[10px] font-black uppercase tracking-widest' }"
                >
                    <USelect
                        v-model="selectedType"
                        class="font-bold shadow-sm w-full"
                        :items="[
                            { value: 'INGR', label: 'Bahan' },
                            { value: 'UTLT', label: 'Alat' }
                        ]"
                    />
                </UFormField>

                <UFormField
                    label="Item"
                    class="w-full"
                    :ui="{ label: 'block text-[10px] font-black uppercase tracking-widest' }"
                >
                    <USelectMenu
                        v-if="selectedType === 'INGR'"
                        v-model="selectedIngredient"
                        :items="ingredients"
                        value-key="id"
                        label-key="name"
                        value-attribute="id"
                        class="font-bold shadow-sm w-full"
                    />
                    <USelectMenu
                        v-if="selectedType === 'UTLT'"
                        v-model="selectedUtility"
                        :items="utilities"
                        value-key="id"
                        label-key="name"
                        value-attribute="id"
                        class="font-bold shadow-sm w-full"
                    />
                </UFormField>

                <UFormField
                    label="Cabang"
                    class="w-full"
                    :ui="{ label: 'block text-[10px] font-black uppercase tracking-widest' }"
                >
                    <USelectMenu
                        v-model="selectedBranch"
                        :items="branchList"
                        :disabled="!isAdmin"
                        value-key="id"
                        label-key="name"
                        value-attribute="id"
                        class="font-bold shadow-sm w-full"
                    />
                </UFormField>

                <UFormField
                    label="Gudang"
                    class="w-full"
                    :ui="{ label: 'block text-[10px] font-black uppercase tracking-widest' }"
                >
                    <USelect
                        v-model="selectedStorage"
                        :items="storageList"
                        :disabled="!isAdmin"
                        class="font-bold shadow-sm w-full"
                    />
                </UFormField>
            </div>
            <div class="grid grid-cols-4 gap-4 items-end">
                <UFormField
                    label="Periode"
                    class="col-span-3"
                    :ui="{ label: 'block text-[10px] font-black uppercase tracking-widest' }"
                >
                    <UInputDate
                        v-model="dateRange"
                        range
                        class="font-bold shadow-sm w-full"
                    />
                </UFormField>
                <UButton
                    block
                    class="justify-center font-black uppercase italic"
                    @click="fetchAudit"
                >
                    Filter
                </UButton>
            </div>
        </div>

        <div class="bg-white rounded-4xl overflow-hidden shadow-sm border border-slate-100">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        <th class="p-6">
                            Waktu
                        </th>
                        <th class="p-6">
                            Keterangan
                        </th>
                        <th class="p-6 text-right">
                            Masuk
                        </th>
                        <th class="p-6 text-right">
                            Keluar
                        </th>
                        <th class="p-6 text-right">
                            Saldo
                        </th>
                    </tr>
                </thead>
                <tbody class="text-sm font-bold uppercase italic">
                    <tr
                        v-for="log in logs"
                        :key="log.id"
                        class="border-t border-slate-50 hover:bg-slate-50/50"
                    >
                        <td class="p-6 text-slate-400 text-xs">
                            {{ log.date }}
                        </td>
                        <td class="p-6">
                            {{ log.description }}
                        </td>
                        <td class="p-6 text-right text-emerald-600">
                            {{ log.in > 0 ? `+${log.in}` : '-' }}
                        </td>
                        <td class="p-6 text-right text-rose-500">
                            {{ log.out > 0 ? `-${log.out}` : '-' }}
                        </td>
                        <td class="p-6 text-right font-black">
                            {{ log.balance }}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </UContainer>
</template>
