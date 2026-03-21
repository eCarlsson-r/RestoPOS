<script setup>
const query = ref('')
const voucherData = ref(null)
const loading = ref(false)

const checkVoucher = async () => {
    loading.value = true
    try {
        voucherData.value = await useApi(`vouchers/${query.value}`)
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UContainer class="p-6">
        <div class="flex justify-between items-center mb-8">
            <h1 class="text-3xl font-black uppercase italic tracking-tighter">
                Cek Voucher
            </h1>
        </div>

        <UCard class="bg-slate-50 border-none shadow-none">
            <div class="flex gap-2">
                <UInput
                    v-model="query"
                    placeholder="Enter Voucher Code..."
                    class="flex-1"
                    @keyup.enter="checkVoucher"
                />
                <UButton
                    :loading="loading"
                    @click="checkVoucher"
                >
                    Check
                </UButton>
            </div>

            <div
                v-if="voucherData"
                class="mt-6 p-6 bg-white rounded-2xl border border-slate-200"
            >
                <div class="flex justify-between border-b pb-4 mb-4">
                    <span class="text-xs font-bold text-slate-400 uppercase">Status</span>
                    <UBadge :color="voucherData.is_used ? 'error' : 'success'">
                        {{ voucherData.is_used ? 'ALREADY USED' : 'READY TO USE' }}
                    </UBadge>
                </div>

                <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                        <span>Nominal:</span><span class="font-black">Rp {{ voucherData.amount.toLocaleString() }}</span>
                    </div>
                    <div class="flex justify-between">
                        <span>Registered:</span><span>{{ voucherData.created_at }}</span>
                    </div>
                    <div
                        v-if="voucherData.is_used"
                        class="flex justify-between text-rose-500"
                    >
                        <span>Used On:</span><span>{{ voucherData.used_at }}</span>
                    </div>
                </div>
            </div>
        </UCard>
    </UContainer>
</template>
