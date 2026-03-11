import type { Product } from '~/types/master'

interface BasketItem extends Product {
    qty: number
    note?: string
    is_sent: boolean
}

export const useOrderStore = defineStore('order', {
    state: () => ({
        basket: [] as BasketItem[]
    }),
    actions: {
        addToBasket(product: Product) {
            this.basket.push({ ...product, qty: 1, is_sent: false })
        },
        async sendToKitchen(salesId: number | null, branchId: number, tableId: string | string[] | undefined) {
            const unsentItems = this.basket.filter(i => !i.is_sent)
            const formData = {
                sales_id: salesId,
                branch_id: branchId,
                customer_id: 1,
                table_id: tableId,
                items: unsentItems
            }
            if (salesId) formData.sales_id = salesId

            const sales = await useApi('/api/sales', {
                method: 'POST',
                body: formData
            })

            // Mark as sent so they don't print twice
            this.basket.forEach(i => i.is_sent = true)
            return sales
        }
    }
})
