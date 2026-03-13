<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const adminItems = ref<NavigationMenuItem[]>([
    {
        label: 'Guide',
        icon: 'i-lucide-book-open',
        to: '/docs/getting-started',
        children: [
            {
                label: 'Introduction',
                description: 'Fully styled and customizable components for Nuxt.',
                icon: 'i-lucide-house'
            },
            {
                label: 'Installation',
                description: 'Learn how to install and configure Nuxt UI in your application.',
                icon: 'i-lucide-cloud-download'
            },
            {
                label: 'Icons',
                icon: 'i-lucide-smile',
                description: 'You have nothing to do, @nuxt/icon will handle it automatically.'
            },
            {
                label: 'Colors',
                icon: 'i-lucide-swatch-book',
                description: 'Choose a primary and a neutral color from your Tailwind CSS theme.'
            },
            {
                label: 'Theme',
                icon: 'i-lucide-cog',
                description: 'You can customize components by using the `class` / `ui` props or in your app.config.ts.'
            }
        ]
    },
    {
        label: 'Purchasing',
        icon: 'i-lucide-shopping-cart',
        children: [
            {
                label: 'Purchase Order',
                icon: 'i-lucide-file-text',
                to: '/purchase/order'
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
                to: '/master/branch'
            },
            {
                label: 'Kategori',
                icon: 'i-lucide-folder',
                to: '/master/category'
            },
            {
                label: 'Pegawai',
                icon: 'i-lucide-user',
                to: '/master/employee'
            },
            {
                label: 'Pelanggan',
                icon: 'i-lucide-users',
                to: '/master/customer'
            },
            {
                label: 'Pemasok',
                icon: 'i-lucide-truck',
                to: '/master/supplier'
            },
            {
                label: 'Peralatan',
                icon: 'i-lucide-utensils',
                to: '/master/utility'
            },
            {
                label: 'Produk',
                icon: 'i-lucide-salad',
                to: '/master/product'
            },
            {
                label: 'Paket',
                icon: 'i-lucide-package',
                to: '/master/package'
            },
            {
                label: 'Bahan Mentah',
                icon: 'i-lucide-beef',
                to: '/master/ingredient'
            },
            {
                label: 'Bahan Jadi',
                icon: 'i-lucide-soup',
                to: '/master/prepare'
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
                to: '/stock/detail'
            },
            {
                label: 'Pindah Stok',
                icon: 'i-lucide-truck',
                to: '/stock/transfer'
            }
        ]
    }
])
</script>

<template>
    <UNavigationMenu :items="adminItems" />
</template>
