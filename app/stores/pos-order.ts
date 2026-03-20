import type { Package, Product, Sale, SaleRecord } from '~/types/master'

interface BasketItem extends SaleRecord {
    is_sent: boolean
    printed_at?: string
}

export const useOrderStore = defineStore('order', {
    state: () => ({
        basket: [] as BasketItem[],
        employee: ''
    }),
    actions: {
        addProductToBasket(product: Product) {
            const existing = this.basket.find(i => i.item_code === product.id && !i.is_sent)
            if (existing) {
                existing.quantity++
            } else {
                this.basket.push({
                    item: product,
                    item_type: 'product',
                    item_code: product.id,
                    quantity: 1,
                    item_price: product.price,
                    discount_pcnt: 0,
                    discount_amnt: 0,
                    item_note: '',
                    item_status: 'O',
                    is_sent: false
                })
            }
        },
        addPackageToBasket(paket: Package) {
            const existing = this.basket.find(i => i.item_code === paket.id && !i.is_sent)
            if (existing) {
                existing.quantity++
            } else {
                this.basket.push({
                    item: paket,
                    item_type: 'package',
                    item_code: paket.id,
                    quantity: 1,
                    item_price: paket.price,
                    discount_pcnt: 0,
                    discount_amnt: 0,
                    item_note: '',
                    item_status: 'O',
                    is_sent: false
                })
            }
        },
        removeFromBasket(item: BasketItem) {
            const existing = this.basket.find(i => i.item_code === item.id && !i.is_sent)
            if (existing) {
                existing.quantity--
                if (existing.quantity === 0) {
                    this.basket = this.basket.filter(i => i.id !== item.id || i.is_sent)
                }
            }
        },
        clearBasket() {
            this.basket = []
        },
        async loadBasket(salesId: number) {
            const sale = await useApi<Sale>(`/api/sales/${salesId}`)
            this.basket = (sale.records || []).map((record: SaleRecord & { product?: Product }) => ({
                item: record.product!,
                item_type: 'product',
                item_code: record.product!.id,
                quantity: record.quantity,
                item_price: record.item_price,
                discount_pcnt: record.discount_pcnt,
                discount_amnt: record.discount_amnt,
                item_note: record.item_note || '',
                item_status: record.item_status,
                order_employee: record.order_employee,
                order_date: record.order_date,
                order_time: record.order_time,
                deliver_employee: record.deliver_employee,
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
        },
        // In your Table Store / Order Logic
        startBuffet: async (tableId: number, packageId: number, guestCount: { adult: number, child: number }) => {
            const startTime = new Date()
            const duration = 90 // 90 minutes
            const endTime = new Date(startTime.getTime() + duration * 60000)

            await useApi('/api/buffet/start', {
                method: 'POST',
                body: {
                    table_id: tableId,
                    package_id: packageId,
                    adults: guestCount.adult,
                    children: guestCount.child,
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString()
                }
            })
        }
    }
})
