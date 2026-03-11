<template>
    <div class="print-only w-[80mm] p-4 text-[12px] font-mono bg-white text-black">
        <div class="text-center mb-4">
            <h1 class="text-lg font-bold">
                REPUBLICAN
            </h1>
            <p>{{ branch.name }}</p>
            <p>{{ branch.address }}</p>
        </div>
        <div class="border-t border-dashed my-2" />
        <div
            v-for="item in items"
            :key="item.id"
            class="flex justify-between"
        >
            <span>{{ item.qty }}x {{ item.name }}</span>
            <span>{{ item.total }}</span>
        </div>
        <div class="border-t border-dashed my-2" />
        <div class="flex justify-between font-bold">
            <span>GRAND TOTAL</span>
            <span>{{ grandTotal }}</span>
        </div>
        <p class="text-center mt-4">
            Terima Kasih!
        </p>
    </div>
</template>

<style>
@media screen { .print-only { display: none; } }
@media print {
  body * { visibility: hidden; }
  .print-only, .print-only * { visibility: visible; }
  .print-only { position: absolute; left: 0; top: 0; }
}
</style>
