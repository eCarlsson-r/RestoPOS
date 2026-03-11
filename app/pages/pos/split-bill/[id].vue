<script setup>
const route = useRoute()
const originalSale = await useApi(`/api/sales/${route.params.id}`)
console.info(originalSale)

definePageMeta({
    layout: 'default'
})

const selectedItems = ref([]) // Array of IDs to move

const toggleSelection = (id) => {
    const idx = selectedItems.value.indexOf(id)
    if (idx > -1) selectedItems.value.splice(idx, 1)
    else selectedItems.value.push(id)
}

const processSplit = async () => {
    await useApi('/api/sales/split', {
        method: 'POST',
        body: {
            original_sales_id: route.params.id,
            record_ids: selectedItems.value
        }
    })
    navigateTo('/pos/floor-map')
}
</script>

<template>
    <div class="h-screen p-8 flex flex-col max-w-(--ui-container) mx-auto">
        <header class="flex justify-between items-center mb-8">
            <h1 class="text-2xl font-black uppercase italic tracking-tighter">
                Split Bill: Table {{ originalSale?.table_number }}
            </h1>
            <UButton
                class="px-8 py-4 rounded-2xl font-black uppercase italic shadow-lg"
                @click="processSplit"
            >
                Confirm Split
            </UButton>
        </header>

        <div class="flex-1 grid grid-cols-2 gap-8 overflow-hidden">
            <div class="rounded-[2.5rem] p-6 flex flex-col overflow-hidden">
                <h2 class="text-xs font-black text-zinc-500 uppercase mb-4">
                    Original Bill Items
                </h2>
                <div class="flex-1 overflow-y-auto space-y-2">
                    <div
                        v-for="item in originalSale?.records"
                        :key="item.id"
                        :class="selectedItems.includes(item.id) ? 'bg-rose-600 border-rose-400 text-zinc-50' : 'text-zinc-700 border-zinc-600'"
                        class="p-4 rounded-xl border-2 cursor-pointer transition-all flex justify-between"
                        @click="toggleSelection(item.id)"
                    >
                        <span class="font-bold uppercase text-sm">{{ item.product.name }}</span>
                        <span class="font-black italic">Rp {{ item.item_price.toLocaleString() }}</span>
                    </div>
                </div>
            </div>

            <div class="border-2 border-dashed border-zinc-700 rounded-[2.5rem] p-6">
                <h2 class="text-xs font-black text-zinc-500 uppercase mb-4">
                    New Bill Preview
                </h2>
                <div class="space-y-2">
                    <div
                        v-if="selectedItems.length === 0"
                        class="text-center py-20 text-zinc-600 font-bold italic"
                    >
                        Tap items on the left to move them here
                    </div>
                    <div
                        v-for="id in selectedItems"
                        :key="id"
                        class="p-4 bg-zinc-700/50 rounded-xl flex justify-between"
                    >
                        <span class="text-sm uppercase font-bold text-white italic">Moving...</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
