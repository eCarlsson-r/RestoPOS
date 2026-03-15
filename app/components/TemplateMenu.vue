<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { user } = useAuth()

const navigation = computed<NavigationMenuItem[]>(() => {
    switch (user.value?.type) {
        case 'ADMIN':
            return [
                {
                    label: 'Purchasing',
                    icon: 'i-lucide-shopping-cart',
                    children: [
                        {
                            label: 'Purchase Order',
                            icon: 'i-lucide-file-text',
                            to: '/admin/purchase/order'
                        }
                    ]
                },
                {
                    label: 'Master',
                    icon: 'i-lucide-database',
                    children: [
                        {
                            label: 'Cabang',
                            icon: 'i-lucide-store',
                            to: '/admin/master/branch'
                        },
                        {
                            label: 'Kategori',
                            icon: 'i-lucide-folder',
                            to: '/admin/master/category'
                        },
                        {
                            label: 'Pegawai',
                            icon: 'i-lucide-user',
                            to: '/admin/master/employee'
                        },
                        {
                            label: 'Pelanggan',
                            icon: 'i-lucide-users',
                            to: '/admin/master/customer'
                        },
                        {
                            label: 'Pemasok',
                            icon: 'i-lucide-truck',
                            to: '/admin/master/supplier'
                        },
                        {
                            label: 'Peralatan',
                            icon: 'i-lucide-utensils',
                            to: '/admin/master/utility'
                        },
                        {
                            label: 'Produk',
                            icon: 'i-lucide-salad',
                            to: '/admin/master/product'
                        },
                        {
                            label: 'Paket',
                            icon: 'i-lucide-package',
                            to: '/admin/master/package'
                        },
                        {
                            label: 'Bahan Mentah',
                            icon: 'i-lucide-beef',
                            to: '/admin/master/ingredient'
                        },
                        {
                            label: 'Bahan Jadi',
                            icon: 'i-lucide-soup',
                            to: '/admin/master/prepare'
                        }
                    ]
                },
                {
                    label: 'Stock',
                    icon: 'i-lucide-package',
                    children: [
                        {
                            label: 'Rincian Stok',
                            icon: 'i-lucide-list',
                            to: '/admin/stock/detail'
                        },
                        {
                            label: 'Pindah Stok',
                            icon: 'i-lucide-truck',
                            to: '/admin/stock/transfer'
                        },
                        {
                            label: 'Cek Voucher',
                            icon: 'i-lucide-ticket',
                            to: '/admin/stock/voucher'
                        },
                        {
                            label: 'Buat Voucher',
                            icon: 'i-lucide-tickets',
                            to: '/admin/stock/register-voucher'
                        },
                        {
                            label: 'Request Dapur',
                            icon: 'i-lucide-chef-hat',
                            to: '/admin/stock/request'
                        }
                    ]
                },
                {
                    label: 'Laporan',
                    icon: 'i-lucide-file-text',
                    children: [
                        {
                            label: 'Penjualan',
                            icon: 'i-lucide-chart-bar-stacked',
                            to: '/report/sales'
                        },
                        {
                            label: 'Kartu Stok',
                            icon: 'i-lucide-wallet-cards',
                            to: '/report/stockcard'
                        },
                        {
                            label: 'Mutasi Stok',
                            icon: 'i-lucide-logs',
                            to: '/report/mutation'
                        }
                    ]
                }
            ]
        case 'KITCHEN':
            return [
                {
                    label: 'Laporan',
                    icon: 'i-lucide-file-text',
                    children: [
                        {
                            label: 'Penjualan',
                            icon: 'i-lucide-chart-bar-stacked',
                            to: '/report/sales'
                        },
                        {
                            label: 'Kartu Stok',
                            icon: 'i-lucide-wallet-cards',
                            to: '/report/stockcard'
                        }
                    ]
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
