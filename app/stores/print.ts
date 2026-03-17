import { defineStore } from 'pinia'
import type { Sale } from '~/types/master'

export const usePrintStore = defineStore('print', {
    state: () => ({
        data: null as Sale | null,
        mode: 'receipt' as 'receipt' | 'captain' // New state field
    }),
    actions: {
        async triggerPrint(payload: Sale | null, mode: 'receipt' | 'captain') {
            this.data = payload
            this.mode = mode

            await nextTick()
            await nextTick()

            setTimeout(() => {
                window.print()
                setTimeout(() => {
                    this.data = null
                }, 500)
            }, 250)
        }
    }
})
