<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale)

const props = defineProps<{
    chartData: {
        labels: Array<string>
        datasets: Array<{
            data: Array<number>
            backgroundColor?: string | string[]
            borderRadius?: number
        }>
    }
    horizontal?: boolean
}>()

const chartOptions = computed(() => ({
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: props.horizontal ? ('y' as const) : ('x' as const),
    plugins: {
        legend: { display: false }
    },
    scales: {
        y: { beginAtZero: true, grid: { display: false } },
        x: { grid: { display: false } }
    }
}))
</script>

<template>
    <div class="h-64">
        <Bar
            :data="props.chartData"
            :options="chartOptions"
        />
    </div>
</template>
