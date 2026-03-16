<script setup>
const filters = ref({
    branch: 'ALL',
    employee_id: 'ALL',
    start: new Date().toISOString().substr(0, 10),
    end: new Date().toISOString().substr(0, 10),
    type: 'sales' // sales, invoice, salesman, or cancel
})

const { data: branches } = await useApi('/api/branches')
const { data: employees } = await useApi('/api/employees')
const loading = ref(false)
const reportData = ref(null)

const generateReport = async (reportType) => {
    filters.value.type = reportType
    loading.value = true
    // In Nuxt, we fetch JSON for the UI, or a Blob URL for the PDF
    try {
        const data = await useApi(`/api/reports/${reportType}`, { params: filters.value })
        reportData.value = data
    } finally {
        loading.value = false
    }
}
</script>

<template>
    <UContainer class="p-6 space-y-6">
        <header class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-3xl font-black uppercase italic tracking-tighter">
                    Report Center
                </h1>
                <div class="flex gap-2">
                    <UButton
                        color="primary"
                        variant="solid"
                        icon="i-lucide-printer"
                        @click="generateReport('sales')"
                    >
                        Sales PDF
                    </UButton>
                    <UButton
                        color="secondary"
                        variant="solid"
                        icon="i-lucide-file-text"
                        @click="generateReport('invoice')"
                    >
                        Invoices
                    </UButton>
                    <UButton
                        color="secondary"
                        icon="i-lucide-user"
                        @click="generateReport('salesman')"
                    >
                        Salesman Performance
                    </UButton>
                </div>
            </div>

            <UForm class="grid grid-cols-4 gap-4">
                <UFormField label="Branch">
                    <USelectMenu
                        v-model="filters.branch"
                        :options="branches"
                    />
                </UFormField>
                <UFormField label="Salesman">
                    <USelectMenu
                        v-model="filters.employee_id"
                        :options="employees"
                    />
                </UFormField>
                <UFormField label="Start Date">
                    <UInput
                        v-model="filters.start"
                        type="date"
                    />
                </UFormField>
                <UFormField label="End Date">
                    <UInput
                        v-model="filters.end"
                        type="date"
                    />
                </UFormField>
            </UForm>
        </header>

        <div class="grid grid-cols-1 gap-8">
            <ReportSummaryCards
                v-if="reportData"
                :data="reportData.summary"
            />

            <UCard
                v-if="reportData"
                class="rounded-[2.5rem]"
            >
                <template #header>
                    <div class="flex justify-between items-center">
                        <h3 class="font-black uppercase italic text-sm">
                            Preview: {{ filters.type }} Report
                        </h3>
                        <UButton
                            color="error"
                            variant="ghost"
                            icon="i-lucide-download"
                        >
                            Export Excel
                        </UButton>
                    </div>
                </template>
                <UTable
                    :data="reportData.items"
                    :columns="getColumnsFor(filters.type)"
                />
            </UCard>

            <UCard class="rounded-[2.5rem] border-rose-100 bg-rose-50/20">
                <div class="flex justify-between items-center">
                    <div>
                        <h3 class="font-black uppercase italic text-rose-600">
                            Cancellation Audit
                        </h3>
                        <p class="text-[10px] font-bold text-rose-400 uppercase">
                            Track voids and deleted orders
                        </p>
                    </div>
                    <UButton
                        color="error"
                        @click="generateReport('cancel')"
                    >
                        Generate Void Report
                    </UButton>
                </div>

                <CancellationReport
                    v-if="reportData"
                    :void-data="reportData.items"
                />
            </UCard>
        </div>
    </UContainer>
</template>
