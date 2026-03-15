<script setup lang="ts">
defineProps<{
    data: {
        total_sales: number
        total_tax: number
        net_revenue: number
        void_count: number
    }
}>()
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-xl">
            <p class="text-[10px] font-black uppercase text-slate-400 mb-1">
                Total Sales (Gross)
            </p>
            <h3 class="text-2xl font-black italic">
                Rp {{ data.total_sales.toLocaleString() }}
            </h3>
            <div class="mt-4 h-1 bg-white/10 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-400 w-3/4" />
            </div>
        </div>

        <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase text-slate-400 mb-1">
                Net Revenue
            </p>
            <h3 class="text-2xl font-black italic text-slate-900">
                Rp {{ data.net_revenue.toLocaleString() }}
            </h3>
            <p class="text-[9px] font-bold text-emerald-500 mt-2">
                +12% vs last month
            </p>
        </div>

        <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <p class="text-[10px] font-black uppercase text-slate-400 mb-1">
                Tax Collected
            </p>
            <h3 class="text-2xl font-black italic text-slate-900">
                Rp {{ data.total_tax.toLocaleString() }}
            </h3>
        </div>

        <div class="bg-rose-50 p-6 rounded-[2.5rem] border border-rose-100 shadow-sm">
            <p class="text-[10px] font-black uppercase text-rose-400 mb-1">
                Total Voids
            </p>
            <h3 class="text-2xl font-black italic text-rose-600">
                {{ data.void_count }} <small class="text-xs">Txns</small>
            </h3>
            <p class="text-[9px] font-bold text-rose-400 mt-2 italic">
                Requires immediate audit
            </p>
        </div>
    </div>
</template>
