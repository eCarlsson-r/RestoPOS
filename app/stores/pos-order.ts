import type { Product, Sale, SaleRecord } from '~/types/master'

interface BasketItem extends Product {
    qty: number
    note?: string
    is_sent: boolean
}

export const useOrderStore = defineStore('order', {
    state: () => ({
        basket: [] as BasketItem[],
        employee: ''
    }),
    actions: {
        addToBasket(product: Product) {
            const existing = this.basket.find(i => i.id === product.id && !i.is_sent)
            if (existing) {
                existing.qty++
            } else {
                this.basket.push({ ...product, qty: 1, is_sent: false })
            }
        },
        removeFromBasket(product: Product) {
            const existing = this.basket.find(i => i.id === product.id && !i.is_sent)
            if (existing) {
                existing.qty--
                if (existing.qty === 0) {
                    this.basket = this.basket.filter(i => i.id !== product.id || i.is_sent)
                }
            }
        },
        clearBasket() {
            this.basket = []
        },
        async loadBasket(salesId: number) {
            const sale = await useApi<Sale>(`/api/sales/${salesId}`)
            this.basket = (sale.records || []).map((record: SaleRecord & { product?: Product }) => ({
                ...record.product!,
                qty: 1,
                note: record.item_note || '',
                is_sent: true // Already sent to kitchen since it's loaded from DB
            }))
            if (sale.employee?.name) this.employee = sale.employee?.name
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
