<script setup lang="ts">
const voucherForm = ref({ qty: 1, amount: 20000, prefix: 'GV2' })
const nextRange = computed(() => {
    const start = 105 // Mock data from API
    return { start, end: start + voucherForm.value.qty - 1 }
})

watch(() => voucherForm.value.amount, (val) => {
    if (val == 20000) voucherForm.value.prefix = 'GV2'
    if (val == 50000) voucherForm.value.prefix = 'GV5'
})
</script>

<template>
    <UContainer class="p-6">
        <UForm class="space-y-4">
            <div class="grid grid-cols-3 gap-4">
                <UFormField label="Nominal Voucher">
                    <USelect
                        v-model="voucherForm.amount"
                        :items="[{ label: 'Rp 20.000', value: 20000 }, { label: 'Rp 50.000', value: 50000 }]"
                    />
                </UFormField>

                <UFormField label="Prefix">
                    <UInput
                        v-model="voucherForm.prefix"
                        readonly
                    />
                </UFormField>
                <UFormField label="Jumlah">
                    <UInput
                        v-model="voucherForm.qty"
                        type="number"
                    />
                </UFormField>
            </div>
            <div class="p-4 bg-indigo-50 rounded-xl">
                <p class="text-xs font-bold text-indigo-600">
                    Generated Range:
                </p>
                <p class="text-lg font-black">
                    {{ voucherForm.prefix }}{{ nextRange.start }} — {{ voucherForm.prefix }}{{ nextRange.end }}
                </p>
            </div>
            <UButton
                block
            >
                Register & Generate PDF
            </UButton>
        </UForm>
        <div class="border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center text-slate-400 italic text-sm">
            PDF Preview (voucher_output)
        </div>
    </UContainer>
</template>
