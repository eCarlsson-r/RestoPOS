<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { user } = useAuth()
const { t } = useI18n()

const navigation = computed<NavigationMenuItem[]>(() => {
    switch (user.value?.type) {
        case 'ADMIN':
            return [
                {
                    label: t('nav.sales'),
                    icon: 'i-lucide-shopping-cart',
                    children: [
                        {
                            label: t('nav.floorMap'),
                            icon: 'i-lucide-map',
                            to: '/pos/floor-map'
                        },
                        {
                            label: t('nav.alacarteList'),
                            icon: 'i-lucide-list',
                            to: '/admin/sales/alacarte'
                        },
                        {
                            label: t('nav.buffetList'),
                            icon: 'i-lucide-list',
                            to: '/admin/sales/buffet'
                        }
                    ]
                },
                {
                    label: t('nav.purchasing'),
                    icon: 'i-lucide-shopping-cart',
                    children: [
                        {
                            label: t('nav.purchaseOrder'),
                            icon: 'i-lucide-receipt-text',
                            to: '/admin/purchase/order'
                        },
                        {
                            label: t('nav.purchaseReturn'),
                            icon: 'i-lucide-undo',
                            to: '/admin/purchase/return'
                        }
                    ]
                },
                {
                    label: t('nav.master'),
                    icon: 'i-lucide-database',
                    children: [
                        {
                            label: t('nav.branch'),
                            icon: 'i-lucide-store',
                            to: '/admin/master/branch'
                        },
                        {
                            label: t('nav.category'),
                            icon: 'i-lucide-folder',
                            to: '/admin/master/category'
                        },
                        {
                            label: t('nav.product'),
                            icon: 'i-lucide-salad',
                            to: '/admin/master/product'
                        },
                        {
                            label: t('nav.employee'),
                            icon: 'i-lucide-user',
                            to: '/admin/master/employee'
                        },
                        {
                            label: t('nav.customer'),
                            icon: 'i-lucide-users',
                            to: '/admin/master/customer'
                        },
                        {
                            label: t('nav.supplier'),
                            icon: 'i-lucide-truck',
                            to: '/admin/master/supplier'
                        },
                        {
                            label: t('nav.utility'),
                            icon: 'i-lucide-utensils',
                            to: '/admin/master/utility'
                        },
                        {
                            label: t('nav.packageAlacarte'),
                            icon: 'i-lucide-package',
                            to: '/admin/master/package'
                        },
                        {
                            label: t('nav.packageBuffet'),
                            icon: 'i-lucide-package',
                            to: '/admin/master/buffet'
                        },
                        {
                            label: t('nav.ingredient'),
                            icon: 'i-lucide-beef',
                            to: '/admin/master/ingredient'
                        },
                        {
                            label: t('nav.prepare'),
                            icon: 'i-lucide-soup',
                            to: '/admin/master/prepare'
                        }
                    ]
                },
                {
                    label: t('nav.stock'),
                    icon: 'i-lucide-package',
                    children: [
                        {
                            label: t('nav.stockDetail'),
                            icon: 'i-lucide-list',
                            to: '/admin/stock/detail'
                        },
                        {
                            label: t('nav.stockTransfer'),
                            icon: 'i-lucide-truck',
                            to: '/admin/stock/transfer'
                        },
                        {
                            label: t('nav.kitchenRequest'),
                            icon: 'i-lucide-chef-hat',
                            to: '/admin/stock/request'
                        }
                    ]
                },
                {
                    label: t('nav.reports'),
                    icon: 'i-lucide-file-text',
                    children: [
                        {
                            label: t('nav.aiAnalytics'),
                            icon: 'i-lucide-sparkles',
                            to: '/admin/dashboard'
                        },
                        {
                            label: t('nav.salesReport'),
                            icon: 'i-lucide-chart-bar-stacked',
                            to: '/report/sales'
                        },
                        {
                            label: t('nav.purchaseReport'),
                            icon: 'i-lucide-chart-line',
                            to: '/report/purchase'
                        },
                        {
                            label: t('nav.stockCard'),
                            icon: 'i-lucide-wallet-cards',
                            to: '/report/stockcard'
                        },
                        {
                            label: t('nav.stockMutation'),
                            icon: 'i-lucide-logs',
                            to: '/report/mutation'
                        }
                    ]
                }
            ]
        case 'KITCHEN':
            return [
                {
                    label: t('nav.prepareProduction'),
                    icon: 'i-lucide-cooking-pot',
                    to: '/kitchen/prepare'
                },
                {
                    label: t('nav.stockRequest'),
                    icon: 'i-lucide-receipt-text',
                    to: '/kitchen/request'
                },
                {
                    label: t('nav.reports'),
                    icon: 'i-lucide-file-text',
                    children: [
                        {
                            label: t('nav.salesReport'),
                            icon: 'i-lucide-chart-bar-stacked',
                            to: '/report/sales'
                        },
                        {
                            label: t('nav.stockCard'),
                            icon: 'i-lucide-wallet-cards',
                            to: '/report/stockcard'
                        },
                        {
                            label: t('nav.stockMutation'),
                            icon: 'i-lucide-logs',
                            to: '/report/mutation'
                        }
                    ]
                }
            ]
        case 'CASHIER':
        case 'WAITER':
            return [
                {
                    label: t('nav.posDashboard'),
                    icon: 'i-lucide-layout-dashboard',
                    to: '/pos/floor-map'
                },
                {
                    label: t('nav.activeSales'),
                    icon: 'i-lucide-list',
                    to: '/admin/sales/alacarte'
                },
                {
                    label: t('nav.reports'),
                    icon: 'i-lucide-file-text',
                    to: '/report/sales'
                }
            ]
        default:
            return []
    }
})
</script>

<template>
    <UNavigationMenu :items="navigation" />
</template>
