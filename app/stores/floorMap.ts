import type { ApiResponse, Table } from '~/types/master'

export const useFloorMapStore = defineStore('floorMap', {
    state: () => ({
        tables: [] as Table[],
        loading: false
    }),
    actions: {
        async fetchTables(branch: number, floor: number) {
            const response = await useApi<Table[] | ApiResponse<Table[]>>(`tables?branch_id=${branch || 1}&floor_number=${floor}`)
            if (Array.isArray(response)) {
                this.tables = response
            } else if (response && typeof response === 'object' && 'data' in response) {
                this.tables = (response as ApiResponse<Table[]>).data
            } else {
                this.tables = []
            }
        },
        // This will be triggered by Laravel Reverb (WebSockets) later
        updateTableStatus(tableId: number, status: 'available' | 'occupied' | 'reserved' | 'dirty') {
            const table = this.tables.find(t => t.id === tableId)
            if (table) table.status = status
        }
    }
})
