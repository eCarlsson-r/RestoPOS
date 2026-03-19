<script setup>
const dateRange = ref({ start: new Date(), end: new Date() })
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
const selectedType = ref('ingredient')
const logs = ref([])

const fetchAudit = async () => {
    const params = {
        item_type: selectedType.value,
        start: dateRange.value.start.toISOString().substr(0, 10),
        end: dateRange.value.end.toISOString().substr(0, 10)
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
        <div class="flex justify-between items-start mb-8">
            <h1 class="text-3xl font-black uppercase italic tracking-tighter">
                Kartu Stok (Audit)
            </h1>
            <div class="grid grid-cols-5 gap-4">
                <USelect
                    v-model="selectedType"
                    class="font-bold shadow-sm w-full"
                    :items="[
                        { value: 'INGR', label: 'Bahan' },
                        { value: 'UTLT', label: 'Alat' }
                    ]"
                />
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
                <USelectMenu
                    v-model="selectedBranch"
                    :items="branchList"
                    value-key="id"
                    label-key="name"
                    value-attribute="id"
                    class="font-bold shadow-sm w-full"
                />
                <USelectMenu
                    v-model="selectedStorage"
                    :items="storageList"
                    class="font-bold shadow-sm w-full"
                />
                <UButton
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
                            {{ log.created_at }}
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
