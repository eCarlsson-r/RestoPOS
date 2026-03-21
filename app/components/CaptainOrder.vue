<template>
    <div class="print-area captain-order">
        <div class="text-center border-b-2 border-black pb-2 mb-2">
            <h1 class="text-2xl font-black">
                TABLE {{ props.orderData.table.table_number }}
            </h1>
            <p class="text-sm font-bold uppercase italic">
                {{ props.orderData.sales_id }}
            </p>
            <p class="text-[10px]">
                {{ new Date().toLocaleTimeString() }}
            </p>
        </div>

        <div class="items">
            <div
                v-for="item in props.orderData.records"
                :key="item.id"
                class="border-b border-dotted border-black py-1"
            >
                <div class="flex justify-between items-start">
                    <span class="text-xl font-black">{{ item.quantity }}x</span>
                    <span class="text-lg font-bold flex-1 ml-3 uppercase">
                        {{ (item.item) ? item.item.name : item.item_type == "product" ? item.product?.name : item.package?.name }}
                    </span>
                </div>
                <div
                    v-if="item.item_note"
                    class="ml-10 text-sm italic font-bold"
                >
                    ** NOTE: {{ item.item_note }}
                </div>
            </div>
        </div>

        <div class="mt-4 pt-2 border-t-2 border-black text-center">
            <p class="font-black italic">
                CAPTAIN ORDER
            </p>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({ orderData: Object })
</script>

<style scoped>
.captain-order {
  width: 80mm;
  background: white;
  color: black;
  padding: 2mm;
  font-family: 'Courier New', Courier, monospace;
}
</style>
