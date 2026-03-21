<script setup>
const props = defineProps({ endTime: String })
const timeLeft = ref('')

const updateTimer = () => {
    const now = new Date().getTime()
    const end = new Date(props.endTime).getTime()
    const diff = end - now

    if (diff <= 0) {
        timeLeft.value = 'TIME UP'
        return
    }

    const hour = Math.floor(diff / 3600000)
    const mins = Math.floor((diff % 3600000) / 60000)
    const secs = Math.floor((diff % 60000) / 1000)
    if (hour > 0) {
        timeLeft.value = `${hour.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    } else {
        timeLeft.value = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
}

onMounted(() => {
    updateTimer()
    setInterval(updateTimer, 1000)
})
</script>

<template>
    <div class="text-[10px] font-bold text-yellow-600 animate-pulse">
        {{ timeLeft }}
    </div>
</template>
