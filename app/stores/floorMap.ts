interface Table {
    id: number
    status: string
}

export const useFloorMapStore = defineStore('floorMap', {
    state: () => ({
        tables: [] as Table[],
        loading: false
    }),
    actions: {
        async fetchTables(floor: string) {
            const { data } = await useApi<{ data: Table[] }>(`/api/tables?floor=${floor}`)
            this.tables = data || []
        },
        // This will be triggered by Laravel Reverb (WebSockets) later
        updateTableStatus(tableId: number, status: string) {
            const table = this.tables.find(t => t.id === tableId)
            if (table) table.status = status
        }
    }
})
