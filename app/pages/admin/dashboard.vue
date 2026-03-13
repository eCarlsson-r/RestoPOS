<script setup lang="ts">
const summary = ref({
    net_sales: 0,
    cogs: 0,
    profit: 0
})

const fetchSummary = async () => {
    const data = await useApi('/api/dashboard')
    summary.value = data
}

onMounted(() => {
    fetchSummary()
})
</script>

<template>
    <UContainer class="p-6">
        <div class="grid grid-cols-3 gap-6 mb-10">
            <div class="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
                <p class="text-[10px] font-black uppercase opacity-60">
                    Net Revenue
                </p>
                <p class="text-3xl font-black italic tracking-tighter">
                    Rp {{ summary.net_sales.toLocaleString() }}
                </p>
            </div>
            <div class="bg-rose-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-rose-100">
                <p class="text-[10px] font-black uppercase opacity-60">
                    COGS (Modal Bahan)
                </p>
                <p class="text-3xl font-black italic tracking-tighter">
                    Rp {{ summary.cogs.toLocaleString() }}
                </p>
            </div>
            <div class="bg-emerald-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100">
                <p class="text-[10px] font-black uppercase opacity-60">
                    Net Profit
                </p>
                <p class="text-3xl font-black italic tracking-tighter">
                    Rp {{ summary.profit.toLocaleString() }}
                </p>
            </div>
        </div>
    </UContainer>
</template>
