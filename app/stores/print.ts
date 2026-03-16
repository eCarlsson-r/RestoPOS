import { defineStore } from 'pinia'
import type { Sale } from '~/types/master'

export const usePrintStore = defineStore('print', {
    state: () => ({
        data: null as unknown as Sale,
        isPrePayment: false,
        isPrinting: false
    }),
    actions: {
        async triggerPrint(payload: Sale, prePayment = false) {
            if (!payload) return
            this.data = payload
            this.isPrePayment = prePayment
            this.isPrinting = true

            // Wait for Vue to acknowledge the data change
            await nextTick()

            // Wait one more tick to ensure the child components (SalesReceipt)
            // have finished their internal setup/rendering
            await nextTick()

            setTimeout(() => {
                window.print()
                this.isPrinting = false
            }, 100) // 100ms is usually the sweet spot for thermal printer drivers
        }
    }
})
