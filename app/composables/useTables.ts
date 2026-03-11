export const useTables = () => {
    const tables = useState<any[]>('live-tables', () => [])
    const loading = ref(false)

    const fetchTables = async (branchCode: string) => {
        loading.value = true
        try {
            // Calls a specific endpoint that joins 'tables' with active 'sales'
            const data = await useApi(`/api/tables?branch=${branchCode}`)
            tables.value = data
        } finally {
            loading.value = false
        }
    }

    // Helper to get a specific table's active sales ID
    const getTableSalesId = (tableNumber: string) => {
        const table = tables.value.find(t => t.number === tableNumber)
        return table?.active_sales_id || null
    }

    return { tables, loading, fetchTables, getTableSalesId }
}
