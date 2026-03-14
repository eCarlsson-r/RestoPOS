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
    const { data } = await useApi('/api/stock/card', {
        params: {
            type: selectedType.value,
            ingredient_id: selectedIngredient.value,
            utility_id: selectedUtility.value,
            start: dateRange.value.start,
            end: dateRange.value.end
        }
    })
    logs.value = data
}
</script>

<template>
    <UContainer class="p-6">
        <div class="flex justify-between items-end mb-8">
            <h1 class="text-3xl font-black uppercase italic tracking-tighter">
                Kartu Stok (Audit)
            </h1>
            <div class="flex gap-4">
                <USelect
                    v-model="selectedType"
                    class="font-bold shadow-sm w-64"
                    :items="[
                        { value: 'ingredient', label: 'Bahan' },
                        { value: 'utility', label: 'Alat' }
                    ]"
                    option-key="value"
                    option-label="label"
                />
                <USelect
                    v-if="selectedType === 'ingredient'"
                    v-model="selectedIngredient"
                    :options="ingredients"
                    option-key="id"
                    option-label="name"
                    class="font-bold shadow-sm w-64"
                />
                <USelect
                    v-if="selectedType === 'utility'"
                    v-model="selectedUtility"
                    :options="utilities"
                    option-key="id"
                    option-label="name"
                    class="font-bold shadow-sm w-64"
                />
                <USelect
                    v-model="selectedBranch"
                    :items="branchList"
                    class="font-bold shadow-sm w-64"
                />
                <USelect
                    v-model="selectedStorage"
                    :items="storageList"
                    class="font-bold shadow-sm w-64"
                />
                <UButton
                    class="px-8 font-black uppercase italic"
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
