<template>
    <UModal>
        <UCard :ui="{ body: { base: 'p-0' } }">
            <template #header>
                <div class="flex justify-between items-center">
                    <h3 class="font-black uppercase italic">
                        Consumption Summary
                    </h3>
                    <UButton
                        color="gray"
                        variant="ghost"
                        icon="i-lucide-x"
                        @click="$emit('close')"
                    />
                </div>
            </template>

            <div class="p-6 space-y-4">
                <div class="flex justify-between border-b pb-2">
                    <span class="text-xs font-bold text-slate-400">AYCE ITEMS</span>
                    <span class="text-xs font-black text-emerald-600">{{ ayceCount }} Ordered</span>
                </div>

                <div class="flex justify-between border-b pb-2">
                    <span class="text-xs font-bold text-slate-400">ADDITIONAL CHARGES</span>
                    <span class="text-xs font-black text-rose-600">Rp {{ alaCarteTotal.toLocaleString() }}</span>
                </div>

                <div class="bg-slate-50 p-4 rounded-xl">
                    <p class="text-[10px] font-bold uppercase mb-2">
                        Ala Carte Breakdown
                    </p>
                    <div
                        v-for="item in alaCarteItems"
                        :key="item.id"
                        class="flex justify-between text-xs mb-1"
                    >
                        <span>{{ item.quantity }}x {{ item.name }}</span>
                        <span>Rp {{ (item.item_price * item.quantity).toLocaleString() }}</span>
                    </div>
                </div>
            </div>
        </UCard>
    </UModal>
</template>

<script setup>
const props = defineProps({ basket: Array })
defineEmits(['close'])
const ayceCount = computed(() => props.basket.filter(i => i.item_price === 0).reduce((a, b) => a + b.quantity, 0))
const alaCarteItems = computed(() => props.basket.filter(i => i.item_price > 0))
const alaCarteTotal = computed(() => alaCarteItems.value.reduce((a, b) => a + (b.item_price * b.quantity), 0))
</script>
