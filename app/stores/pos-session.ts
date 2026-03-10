export const usePosSession = defineStore('pos-session', {
    state: () => ({
        activeTable: null,
        currentFloor: 1,
        lastPrintTime: null
    }),
    actions: {
        selectTable(tableNumber: string) {
            this.activeTable = tableNumber
        }
    },
    persist: true // Keeps the selected table active even if the tab closes
})
