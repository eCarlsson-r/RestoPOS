import { useApi } from './useApi'
import type { Table, ApiResponse } from '~/types/master'

export const useTables = () => {
    const tables = useState<Table[]>('live-tables', () => [])
    const loading = ref(false)

    const fetchTables = async (branchCode: string) => {
        loading.value = true
        try {
            const response = await useApi<Table[] | ApiResponse<Table[]>>(`/api/tables?branch=${branchCode}`)
            const result = (response && typeof response === 'object' && 'data' in response)
                ? (response as ApiResponse<Table[]>).data
                : (response as Table[])
            tables.value = [...result] // Spread to trigger a new reference
        } finally {
            loading.value = false
        }
    }

    // Helper to get a specific table's active sales ID
    const getTableSalesId = (tableId: number) => {
        const table = tables.value.find(t => t.id === tableId)
        return table?.active_sales_id || null
    }

    return { tables, loading, fetchTables, getTableSalesId }
}
