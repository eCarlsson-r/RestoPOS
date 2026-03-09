export const useFloorMapStore = defineStore('floorMap', {
  state: () => ({
    tables: [] as any[],
    loading: false
  }),
  actions: {
    async fetchTables() {
      const { data } = await useApi('/api/pos/tables');
      this.tables = data
    },
    // This will be triggered by Laravel Reverb (WebSockets) later
    updateTableStatus(tableId: number, status: string) {
      const table = this.tables.find(t => t.id === tableId)
      if (table) table.status = status
    }
  }
})
