<script setup>
const floorStore = useFloorMapStore()
const props = defineProps(['table'])
const isCalling = ref(false)

// Listen for the event (using Laravel Echo)
onMounted(() => {
  floorStore.fetchTables()
  window.Echo.channel(`branch.${props.table.branch}`)
    .listen('WaiterCalled', (e) => {
      if (e.table === props.table.number) {
        isCalling.value = true
      }
    })
})

const clearAlert = () => {
  isCalling.value = false
  // Send API request to clear the alert on other tablets
}

const getStatusColor = (status) => {
  const colors = {
    available: 'bg-emerald-500 border-emerald-600',
    occupied: 'bg-rose-500 border-rose-600',
    reserved: 'bg-amber-500 border-amber-600',
    dirty: 'bg-slate-400 border-slate-500'
  }
  return colors[status] || 'bg-gray-200'
}
</script>

<template>
  <div class="p-8 bg-slate-900 min-h-screen text-white">
    <header class="mb-10 flex justify-between items-center">
      <h1 class="text-3xl font-black uppercase italic tracking-tighter">
        Main Dining Floor
      </h1>
      <div class="flex gap-4 text-[10px] font-bold uppercase">
        <span class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-emerald-500" /> Available
        </span>
        <span class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-rose-500" /> Occupied
        </span>
        <span class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-amber-500" /> Reserved
        </span>
        <span class="flex items-center gap-2">
          <div class="w-3 h-3 rounded-full bg-slate-400" /> Dirty
        </span>
      </div>
    </header>

    <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
      <div v-for="table in floorStore.tables" :key="table.id" :class="[
        'aspect-square rounded-3xl border-b-4 cursor-pointer p-6 flex flex-col justify-between transition-all hover:scale-105 active:scale-95',
        getStatusColor(table.status)
      ]" @click="navigateTo(`/pos/order/${table.id}`)">
        <div class="flex justify-between items-start">
          <span class="text-2xl font-black tracking-tighter">{{ table.number }}</span>
          <span class="text-[10px] opacity-70 font-bold uppercase">{{ table.capacity }} PAX</span>
        </div>

        <div v-if="table.active_order" class="mt-auto">
          <p class="text-[10px] font-black uppercase tracking-widest leading-none">
            Total
          </p>
          <p class="text-lg font-black italic">
            Rp {{ table.active_order.total }}k
          </p>
        </div>
        <div v-else class="text-[10px] font-black uppercase tracking-widest opacity-50">
          Empty
        </div>
      </div>
    </div>

    <div :class="[
      'relative p-6 rounded-3xl transition-all',
      isCalling ? 'bg-red-600 animate-pulse text-white' : 'bg-white'
    ]" @click="clearAlert">
      <span class="text-2xl font-black">{{ table.number }}</span>
      <span v-if="isCalling"
        class="absolute -top-2 -right-2 bg-yellow-400 text-black text-[8px] p-1 rounded-md font-black">
        NEED HELP
      </span>
    </div>
  </div>
</template>
