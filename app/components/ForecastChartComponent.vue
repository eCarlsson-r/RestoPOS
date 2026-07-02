<script setup lang="ts">
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement, Filler)

const props = defineProps<{
    labels: string[]
    predicted: number[]
    low: number[]
    high: number[]
    predictedLabel: string
    bandLabel: string
}>()

const chartData = computed(() => ({
    labels: props.labels,
    datasets: [
        {
            label: props.bandLabel,
            data: props.low,
            borderColor: 'transparent',
            pointRadius: 0,
            fill: false
        },
        {
            label: props.bandLabel,
            data: props.high,
            borderColor: 'transparent',
            backgroundColor: 'rgba(79, 70, 229, 0.12)',
            pointRadius: 0,
            fill: '-1' as const
        },
        {
            label: props.predictedLabel,
            data: props.predicted,
            borderColor: 'rgb(79, 70, 229)',
            backgroundColor: 'rgb(79, 70, 229)',
            pointRadius: 3,
            tension: 0.35,
            fill: false
        }
    ]
}))

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        filler: { propagate: true }
    },
    scales: {
        y: { beginAtZero: true, grid: { display: false } },
        x: { grid: { display: false } }
    }
}
</script>

<template>
    <div class="h-64">
        <Line
            :data="chartData"
            :options="chartOptions"
        />
    </div>
</template>
