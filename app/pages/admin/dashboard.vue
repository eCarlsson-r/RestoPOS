<script setup lang="ts">
import ChartComponent from '~/components/ChartComponent.vue'

type Dashboard = {
    id?: number
    active_orders: number
    completed_orders: number
    today_sales: number
    top_items: {
        name: string
        qty_sold: number
        percent: number
    }[]
    top_employee: string
    monthly_income: {
        month: string
        income: number
    }[]
}

const summary = ref<Dashboard>({
    active_orders: 0,
    completed_orders: 0,
    today_sales: 0,
    top_items: [],
    top_employee: '',
    monthly_income: []
})

const chartData = ref<{
    labels: string[]
    datasets: {
        data: number[]
    }[]
}>({
    labels: [],
    datasets: []
})

const { items, fetchItems } = useMaster<Dashboard>('dashboard')

onMounted(async () => {
    await fetchItems()
    summary.value = items.value[0] ?? {
        active_orders: 0,
        completed_orders: 0,
        today_sales: 0,
        top_items: [],
        top_employee: '',
        monthly_income: []
    }

    chartData.value = {
        labels: summary.value.monthly_income.map(item => item.month),
        datasets: [{
            data: summary.value.monthly_income.map(item => item.income)
        }]
    }
})
</script>

<template>
    <UContainer class="p-6">
        <div class="grid grid-cols-4 gap-6 mb-10">
            <div class="bg-amber-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-amber-100">
                <p class="text-[10px] font-black uppercase opacity-60">
                    Active Orders
                </p>
                <p class="text-3xl font-black italic tracking-tighter">
                    {{ summary.active_orders }}
                </p>
            </div>

            <div class="bg-sky-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-sky-100">
                <p class="text-[10px] font-black uppercase opacity-60">
                    Completed Orders
                </p>
                <p class="text-3xl font-black italic tracking-tighter">
                    {{ summary.completed_orders }}
                </p>
            </div>

            <div class="bg-emerald-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100">
                <p class="text-[10px] font-black uppercase opacity-60">
                    Today Sales
                </p>
                <p class="text-3xl font-black italic tracking-tighter">
                    Rp {{ summary.today_sales.toLocaleString() }}
                </p>
            </div>

            <div class="bg-rose-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-rose-100">
                <p class="text-[10px] font-black uppercase opacity-60">
                    Top Employee
                </p>
                <p class="text-3xl font-black italic tracking-tighter">
                    {{ summary.top_employee }}
                </p>
            </div>
        </div>

        <div class="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div class="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                <h3 class="text-xs font-black uppercase italic mb-6">
                    Top 5 Best Sellers
                </h3>
                <div
                    v-for="(item, idx) in summary.top_items"
                    :key="idx"
                    class="flex items-center gap-4 mb-4"
                >
                    <span class="text-2xl font-black italic text-slate-200">#{{ idx + 1 }}</span>
                    <div class="flex-1">
                        <p class="text-sm font-black uppercase italic">
                            {{ item.name }}
                        </p>
                        <div class="w-full bg-slate-100 h-2 rounded-full mt-1">
                            <div
                                class="bg-indigo-600 h-2 rounded-full"
                                :style="{ width: item.percent + '%' }"
                            />
                        </div>
                    </div>
                    <span class="font-black text-xs italic">{{ item.qty_sold }}x</span>
                </div>
            </div>

            <div class="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col justify-center items-center">
                <ChartComponent :chart-data="chartData" />
            </div>
        </div>
    </UContainer>
</template>
