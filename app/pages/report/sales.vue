<script setup>
import * as XLSX from 'xlsx'

const filters = ref({
    branch: 'ALL',
    employee_id: 'ALL',
    start: new Date().toISOString().substr(0, 10),
    end: new Date().toISOString().substr(0, 10),
    type: 'sales' // sales, invoice, salesman, or cancel
})

const { user } = useAuth()
const isAdmin = computed(() => user.value?.type === 'ADMIN')

watchEffect(() => {
    if (user.value && !isAdmin.value) {
        if (user.value.employee) filters.value.branch = Number(user.value.employee.branch_id)
        else if (user.value.username.includes('_')) filters.value.branch = Number(user.value.username.split('_')[0])
        else filters.value.branch = 0
    }
})

const { data: branches } = await useApi('/api/branches')
const { data: employees } = await useApi('/api/employees')
const loading = ref(false)
const reportData = ref(null)

const getColumnsFor = (type) => {
    const common = [
        { key: 'created_at', label: 'Date/Time', sortable: true },
        { key: 'branch.name', label: 'Branch' }
    ]

    switch (type) {
        case 'sales':
            return [
                { accessorKey: 'name', header: 'Item Name' },
                { accessorKey: 'quantity', header: 'Quantity' },
                { accessorKey: 'price', header: 'Price' },
                { accessorKey: 'total', header: 'Total' }
            ]

        case 'invoice':
            return [
                { accessorKey: 'date', header: 'Date' },
                { accessorKey: 'subtotal', header: 'Subtotal' },
                { accessorKey: 'discount', header: 'Discount' },
                { accessorKey: 'tax', header: 'Tax' },
                { accessorKey: 'total-price', header: 'Total Price' },
                { accessorKey: 'cash', header: 'Cash' },
                { accessorKey: 'credit-card', header: 'Credit Card' },
                { accessorKey: 'debit-card', header: 'Debit Card' },
                { accessorKey: 'qris', header: 'QRIS' },
                { accessorKey: 'voucher', header: 'Voucher' },
                { accessorKey: 'total-payment', header: 'Total Payment' }
            ]

        case 'salesman':
            return [
                { accessorKey: 'name', header: 'Item Name' },
                { accessorKey: 'quantity', header: 'Quantity' },
                { accessorKey: 'price', header: 'Price' },
                { accessorKey: 'total', header: 'Total' }
            ]

        case 'cancel':
            return [
                ...common,
                { key: 'table_number', header: 'Table' },
                { key: 'void_reason', header: 'Reason' },
                { key: 'void_by.name', header: 'Authorized By' },
                { key: 'total', header: 'Lost Revenue', class: 'text-red-500 font-bold' }
            ]

        case 'buffet':
            return [
                ...common,
                { key: 'table_number', header: 'Table' },
                { key: 'buffet_package.name', header: 'Package' },
                { key: 'adult_count', header: 'Adults' },
                { key: 'child_count', header: 'Children' },
                { key: 'duration_minutes', header: 'Limit' },
                { key: 'total', header: 'Revenue' }
            ]

        default:
            return common
    }
}

const generateReport = async (reportType) => {
    filters.value.type = reportType
    loading.value = true
    try {
        const { data } = await useApi(`/api/report/${reportType}`, { params: filters.value })
        reportData.value = data
    } finally {
        loading.value = false
    }
}

const isExporting = ref(false)

const exportToExcel = () => {
    isExporting.value = true

    try {
    // 1. Prepare the data (Flattening nested objects like branch.name)
        const data = reportData.value.map((row) => {
            // Map based on activeReport type to make headers look nice
            return {
                'Date': new Date(row.created_at).toLocaleString('id-ID'),
                'Branch': row.branch?.name || '-',
                'Table': row.table_number || '-',
                'Customer': row.customer_name || 'Guest',
                'Total Amount': row.total || 0,
                'Status': row.status || '-',
                'Void Reason': row.void_reason || 'No Reason Provided',
                'Authorized By': row.void_by?.name || 'Unknown',
                // Add Buffet specific columns if applicable
                ...(row.buffet_package
                    ? {
                            Package: row.buffet_package.name,
                            Adults: row.adult_count,
                            Children: row.child_count
                        }
                    : {})
            }
        })

        // 2. Create worksheet
        const worksheet = XLSX.utils.json_to_sheet(data)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Report')

        // 3. Generate filename based on date and type
        const dateStr = new Date().toISOString().split('T')[0]
        const fileName = `${activeReport.value}_report_${dateStr}.xlsx`

        // 4. Download
        XLSX.writeFile(workbook, fileName)
    } catch (error) {
        console.error('Export failed:', error)
    } finally {
        isExporting.value = false
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
                        v-if="isAdmin || user.type == 'CASHIER'"
                        color="secondary"
                        variant="solid"
                        icon="i-lucide-file-text"
                        @click="generateReport('invoice')"
                    >
                        Invoices
                    </UButton>
                    <UButton
                        v-if="isAdmin || user.employee"
                        color="secondary"
                        icon="i-lucide-user"
                        @click="generateReport('salesman')"
                    >
                        Salesman Performance
                    </UButton>
                </div>
            </div>

            <UForm
                :class="`grid grid-cols-${isAdmin || user.employee ? 4 : 3} gap-4`"
            >
                <UFormField label="Branch">
                    <USelectMenu
                        v-model="filters.branch"
                        :disabled="!isAdmin"
                        :items="branches"
                        value-key="id"
                        label-key="name"
                        value-attribute="id"
                        class="w-full shadow-sm"
                    />
                </UFormField>
                <UFormField
                    v-if="isAdmin || user.employee"
                    label="Salesman"
                >
                    <USelectMenu
                        v-model="filters.employee_id"
                        :items="employees"
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
            <ReportSummaryCards
                v-if="reportData && filters.type != 'invoice'"
                :data="reportData.summary"
            />

            <UCard
                v-if="filters.type != 'cancel' && reportData"
                class="rounded-[2.5rem]"
            >
                <template #header>
                    <div class="flex justify-between items-center">
                        <h3 class="font-black uppercase italic text-sm">
                            Preview: {{ filters.type }} Report
                        </h3>
                        <UButton
                            icon="i-lucide-download"
                            color="emerald"
                            variant="soft"
                            :loading="isExporting"
                            @click="exportToExcel"
                        >
                            Export Excel
                        </UButton>
                    </div>
                </template>
                <UTable
                    :data="reportData.items"
                    :columns="getColumnsFor(filters.type)"
                >
                    <template #price-cell="{ row }">
                        Rp {{ row.getValue('price').toLocaleString() }}
                    </template>
                    <template #total-cell="{ row }">
                        Rp {{ row.getValue('total').toLocaleString() }}
                    </template>
                    <template #subtotal-cell="{ row }">
                        Rp {{ row.getValue('subtotal').toLocaleString() }}
                    </template>
                    <template #discount-cell="{ row }">
                        Rp {{ row.getValue('discount').toLocaleString() }}
                    </template>
                    <template #tax-cell="{ row }">
                        Rp {{ row.getValue('tax').toLocaleString() }}
                    </template>
                    <template #total-price-cell="{ row }">
                        Rp {{ row.getValue('total-price').toLocaleString() }}
                    </template>
                    <template #cash-cell="{ row }">
                        Rp {{ row.getValue('cash').toLocaleString() }}
                    </template>
                    <template #credit-card-cell="{ row }">
                        Rp {{ row.getValue('credit-card').toLocaleString() }}
                    </template>
                    <template #debit-card-cell="{ row }">
                        Rp {{ row.getValue('debit-card').toLocaleString() }}
                    </template>
                    <template #go-pay-cell="{ row }">
                        Rp {{ row.getValue('go-pay').toLocaleString() }}
                    </template>
                    <template #ovo-cell="{ row }">
                        Rp {{ row.getValue('ovo').toLocaleString() }}
                    </template>
                    <template #total-payment-cell="{ row }">
                        Rp {{ row.getValue('total-payment').toLocaleString() }}
                    </template>
                </UTable>
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
                    v-if="filters.type == 'cancel' && reportData"
                    :void-data="reportData.items"
                />
            </UCard>
        </div>
    </UContainer>
</template>
