<script setup>
const filters = ref({
    branch: 'ALL',
    supplier_id: 'ALL',
    start: new Date().toISOString().substr(0, 10),
    end: new Date().toISOString().substr(0, 10),
    type: 'purchase' // purchase, supplier
})

const getColumnsFor = (type) => {
    const common = [
        { key: 'created_at', label: 'Date/Time', sortable: true },
        { key: 'branch.name', label: 'Branch' }
    ]

    switch (type) {
        case 'purchase':
            return [
                { accessorKey: 'name', header: 'Item Name' },
                { accessorKey: 'quantity', header: 'Quantity' },
                { accessorKey: 'price', header: 'Price' },
                { accessorKey: 'total', header: 'Total' }
            ]

        case 'supplier':
            return [
                { accessorKey: 'name', header: 'Item Name' },
                { accessorKey: 'quantity', header: 'Quantity' },
                { accessorKey: 'price', header: 'Price' },
                { accessorKey: 'total', header: 'Total' }
            ]
        default:
            return common
    }
}

const { data: branches } = await useApi('branches')
const { data: suppliers } = await useApi('suppliers')
const loading = ref(false)
const reportData = ref(null)

const generateReport = async (reportType) => {
    filters.value.type = reportType
    loading.value = true
    // In Nuxt, we fetch JSON for the UI, or a Blob URL for the PDF
    try {
        const { data } = await useApi(`report/${reportType}`, { params: filters.value })
        reportData.value = data
    } finally {
        loading.value = false
    }
}

const { exportPDF, exportExcel } = useReportExporter()

const handleExport = (format) => {
    const type = filters.value.type

    if (format === 'pdf') {
        exportPDF(
            reportData.value.items,
            getColumnsFor(type),
            `${type} Report`,
            filters.value,
            'p'
        )
    } else {
        exportExcel(reportData.value.items, `${type}_Report`, type)
    }
}
</script>

<template>
    <UContainer class="p-6 space-y-6">
        <header class="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-3xl font-black uppercase italic tracking-tighter">
                    Purchase Report
                </h1>
                <div class="flex gap-2">
                    <UButton
                        color="primary"
                        variant="solid"
                        icon="i-lucide-printer"
                        @click="generateReport('purchase')"
                    >
                        Purchase PDF
                    </UButton>
                    <UButton
                        color="secondary"
                        icon="i-lucide-user"
                        @click="generateReport('supplier')"
                    >
                        Purchase from Supplier
                    </UButton>
                </div>
            </div>

            <UForm class="grid grid-cols-4 gap-4">
                <UFormField label="Branch">
                    <USelectMenu
                        v-model="filters.branch"
                        :items="branches"
                        value-key="id"
                        label-key="name"
                        value-attribute="id"
                        class="w-full shadow-sm"
                    />
                </UFormField>
                <UFormField label="Supplier">
                    <USelectMenu
                        v-model="filters.supplier_id"
                        :items="suppliers"
                        value-key="id"
                        label-key="name"
                        value-attribute="id"
                        class="w-full shadow-sm"
                    />
                </UFormField>
                <UFormField label="Start Date">
                    <UInput
                        v-model="filters.start"
                        type="date"
                        class="w-full shadow-sm"
                    />
                </UFormField>
                <UFormField label="End Date">
                    <UInput
                        v-model="filters.end"
                        type="date"
                        class="w-full shadow-sm"
                    />
                </UFormField>
            </UForm>
        </header>

        <div class="grid grid-cols-1 gap-8">
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
                            icon="i-lucide-download"
                            color="success"
                            variant="soft"
                            @click="handleExport('pdf')"
                        >
                            Export PDF
                        </UButton>
                        <UButton
                            icon="i-lucide-download"
                            color="success"
                            variant="soft"
                            @click="handleExport('excel')"
                        >
                            Export Excel
                        </UButton>
                    </div>
                </template>
                <UTable
                    :data="reportData"
                    :columns="getColumnsFor(filters.type)"
                >
                    <template #price-cell="{ row }">
                        Rp {{ row.getValue('price').toLocaleString() }}
                    </template>
                    <template #total-cell="{ row }">
                        Rp {{ row.getValue('total').toLocaleString() }}
                    </template>
                </UTable>
            </UCard>
        </div>
    </UContainer>
</template>
