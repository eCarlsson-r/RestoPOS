import { defineStore } from 'pinia'
import type { Product } from '~/types/master'

export const useProductStore = defineStore('products', {
    state: () => ({
        items: [] as Product[]
    }),
    actions: {
        syncStatus(productId: number | undefined, isSoldOut: boolean) {
            if (!productId) return
            const product = this.items.find(p => p.id === productId)
            if (product) {
                product.soldout = isSoldOut ? 1 : 0
            }
        }
    }
})
