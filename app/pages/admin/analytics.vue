<script setup lang="ts">
import BarChartComponent from '~/components/BarChartComponent.vue'
import ForecastChartComponent from '~/components/ForecastChartComponent.vue'

type DailySale = {
    branch_name: string
    sale_date: string
    total_transactions: number
    buffet_sessions: number
    alacarte_sessions: number
    total_adult_pax: number
    total_child_pax: number
    buffet_revenue: string | number
    alacarte_revenue: number
}

type MenuPerformance = {
    product_id: string | number
    product_name: string
    category: string
    price: number
    total_qty_sold: number
    order_frequency: number
    total_revenue: number
    margin_pct: number
    avg_discount_pct: number
}

type MenuCluster = {
    product_name: string
    category: string
    cluster_id: number
    cluster_label: string
    total_qty_sold: number
    order_frequency: number
    total_revenue: number
    avg_discount: number
    total_margin: number
}

type DemandForecast = {
    branch_name: string
    forecast_date: string
    day_of_week: string
    predicted_transactions: number
    forecast_low: number
    forecast_high: number
    confidence_pct: number
}

const { t } = useI18n()
const api = useApi()

const loading = ref(true)
const failed = ref(false)
const dailySales = ref<DailySale[]>([])
const menuPerformance = ref<MenuPerformance[]>([])
const menuClusters = ref<MenuCluster[]>([])
const forecast = ref<DemandForecast[]>([])

onMounted(async () => {
    try {
        const [daily, performance, clusters, demand] = await Promise.all([
            api<{ data: DailySale[] }>('analytics/daily-sales', { params: { days: 90 } }),
            api<{ data: MenuPerformance[] }>('analytics/menu-performance'),
            api<{ data: MenuCluster[] }>('analytics/menu-clusters'),
            api<{ data: DemandForecast[] }>('analytics/demand-forecast')
        ])
        dailySales.value = daily.data
        menuPerformance.value = performance.data
        menuClusters.value = clusters.data
        forecast.value = demand.data
    } catch {
        failed.value = true
    } finally {
        loading.value = false
    }
})

const totalRevenue = computed(() =>
    dailySales.value.reduce((sum, d) => sum + Number(d.buffet_revenue) + Number(d.alacarte_revenue), 0)
)
const totalTransactions = computed(() =>
    dailySales.value.reduce((sum, d) => sum + d.total_transactions, 0)
)
const avgDailyRevenue = computed(() =>
    dailySales.value.length ? Math.round(totalRevenue.value / dailySales.value.length) : 0
)
const forecastTotal = computed(() =>
    Math.round(forecast.value.reduce((sum, f) => sum + f.predicted_transactions, 0))
)

const topProductsChart = computed(() => {
    const top = menuPerformance.value.slice(0, 8)
    return {
        labels: top.map(p => p.product_name),
        datasets: [{
            data: top.map(p => p.total_revenue),
            backgroundColor: 'rgb(79, 70, 229)',
            borderRadius: 12
        }]
    }
})

const clusterStyles: Record<string, { card: string, badge: string }> = {
    'Premium Seller': { card: 'bg-amber-600 shadow-amber-100', badge: 'bg-amber-700' },
    'Volume Staple': { card: 'bg-sky-600 shadow-sky-100', badge: 'bg-sky-700' },
    'Over-Discounted': { card: 'bg-rose-500 shadow-rose-100', badge: 'bg-rose-600' },
    'Beverage Star': { card: 'bg-emerald-500 shadow-emerald-100', badge: 'bg-emerald-600' }
}

const clusterGroups = computed(() => {
    const groups = new Map<string, MenuCluster[]>()
    for (const item of menuClusters.value) {
        const list = groups.get(item.cluster_label) ?? []
        list.push(item)
        groups.set(item.cluster_label, list)
    }
    return [...groups.entries()].map(([label, items]) => ({
        label,
        items,
        style: clusterStyles[label] ?? { card: 'bg-slate-600 shadow-slate-100', badge: 'bg-slate-700' }
    }))
})

const clusterLabel = (label: string) => {
    const key = `analytics.cluster.${label}`
    const translated = t(key)
    return translated === key ? label : translated
}

const forecastLabels = computed(() =>
    forecast.value.map(f => f.forecast_date.slice(5))
)

const rupiah = (value: number) => 'Rp ' + value.toLocaleString()
</script>

<template>
    <UContainer class="p-6">
        <div class="mb-10">
            <h2 class="text-2xl font-black uppercase italic tracking-tighter">
                {{ t('analytics.title') }}
            </h2>
            <p class="text-xs text-slate-400 font-bold uppercase">
                {{ t('analytics.subtitle') }}
            </p>
        </div>

        <div
            v-if="loading"
            class="py-24 text-center text-sm font-black uppercase italic text-slate-300"
        >
            {{ t('analytics.loading') }}
        </div>

        <div
            v-else-if="failed"
            class="py-24 text-center text-sm font-black uppercase italic text-rose-400"
        >
            {{ t('analytics.loadFailed') }}
        </div>

        <template v-else>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                <div class="bg-emerald-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-emerald-100">
                    <p class="text-[10px] font-black uppercase opacity-60">
                        {{ t('analytics.revenue90d') }}
                    </p>
                    <p class="text-2xl font-black italic tracking-tighter">
                        {{ rupiah(totalRevenue) }}
                    </p>
                </div>

                <div class="bg-sky-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-sky-100">
                    <p class="text-[10px] font-black uppercase opacity-60">
                        {{ t('analytics.transactions90d') }}
                    </p>
                    <p class="text-3xl font-black italic tracking-tighter">
                        {{ totalTransactions.toLocaleString() }}
                    </p>
                </div>

                <div class="bg-amber-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-amber-100">
                    <p class="text-[10px] font-black uppercase opacity-60">
                        {{ t('analytics.avgDailyRevenue') }}
                    </p>
                    <p class="text-2xl font-black italic tracking-tighter">
                        {{ rupiah(avgDailyRevenue) }}
                    </p>
                </div>

                <div class="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100">
                    <p class="text-[10px] font-black uppercase opacity-60">
                        {{ t('analytics.forecastNext14d') }}
                    </p>
                    <p class="text-3xl font-black italic tracking-tighter">
                        {{ forecastTotal.toLocaleString() }}
                    </p>
                    <p class="text-[10px] font-black uppercase opacity-60">
                        {{ t('analytics.predictedTransactions') }}
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                <div class="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                    <h3 class="text-xs font-black uppercase italic mb-6">
                        {{ t('analytics.topProducts') }}
                    </h3>
                    <BarChartComponent
                        :chart-data="topProductsChart"
                        horizontal
                    />
                </div>

                <div class="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm">
                    <h3 class="text-xs font-black uppercase italic mb-1">
                        {{ t('analytics.demandForecast') }}
                    </h3>
                    <p class="text-[10px] text-slate-400 font-bold uppercase mb-5">
                        {{ t('analytics.demandForecastHint') }}
                    </p>
                    <ForecastChartComponent
                        :labels="forecastLabels"
                        :predicted="forecast.map(f => f.predicted_transactions)"
                        :low="forecast.map(f => f.forecast_low)"
                        :high="forecast.map(f => f.forecast_high)"
                        :predicted-label="t('analytics.predicted')"
                        :band-label="t('analytics.confidenceBand')"
                    />
                </div>
            </div>

            <h3 class="text-xs font-black uppercase italic mb-6">
                {{ t('analytics.menuClusters') }}
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div
                    v-for="group in clusterGroups"
                    :key="group.label"
                    class="p-8 rounded-[2.5rem] text-white shadow-xl"
                    :class="group.style.card"
                >
                    <p class="text-[10px] font-black uppercase opacity-60 mb-4">
                        {{ clusterLabel(group.label) }}
                    </p>
                    <div
                        v-for="item in group.items"
                        :key="item.product_name"
                        class="mb-4 last:mb-0"
                    >
                        <p class="text-sm font-black uppercase italic leading-tight">
                            {{ item.product_name }}
                        </p>
                        <p class="text-[10px] font-bold opacity-70">
                            {{ item.total_qty_sold.toLocaleString() }}x {{ t('analytics.sold') }}
                            · {{ rupiah(item.total_revenue) }}
                            · {{ Math.round(item.avg_discount * 100) / 100 }}% {{ t('analytics.discount') }}
                        </p>
                    </div>
                </div>
            </div>
        </template>
    </UContainer>
</template>
