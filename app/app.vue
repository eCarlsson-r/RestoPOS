<script setup>
import * as uiLocales from '@nuxt/ui/locale'
import PrintProvider from './components/PrintProvider.vue'

const { locale } = useI18n()

useHead({
    meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
    ],
    link: [
        { rel: 'icon', href: '/favicon.ico' }
    ],
    htmlAttrs: {
        lang: () => locale.value
    }
})

const title = 'RestoPOS'
const description = 'RestoPOS is a production-ready POS system for restaurants.'

useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
    twitterImage: 'https://ui.nuxt.com/assets/templates/nuxt/starter-light.png',
    twitterCard: 'summary_large_image'
})
</script>

<template>
    <UApp :locale="uiLocales[locale]">
        <NuxtLayout>
            <NuxtPage />
        </NuxtLayout>
    </UApp>

    <PrintProvider />
</template>
