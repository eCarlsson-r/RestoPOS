// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
        '@nuxt/eslint',
        '@nuxt/ui',
        '@pinia/nuxt',
        '@nuxtjs/i18n',
        '@vite-pwa/nuxt'
    ],

    devtools: {
        enabled: true
    },

    css: ['~/assets/css/main.css'],

    runtimeConfig: {
        public: {
            apiBase: process.env.APP_URL + '/api',
            serverURL: process.env.APP_URL || 'http://localhost:8000',
            reverbHost: process.env.REVERB_HOST || 'localhost',
            reverbKey: process.env.REVERB_KEY,
            vapidPublicKey: process.env.VAPID_PUBLIC_KEY || ''
        }
    },

    routeRules: {
        '/': { prerender: true }
    },

    compatibilityDate: '2025-01-15',

    vite: {
        optimizeDeps: {
            include: ['pusher-js', 'laravel-echo']
        }
    },

    eslint: {
        config: {
            stylistic: {
                indent: 4,
                commaDangle: 'never',
                braceStyle: '1tbs'
            }
        }
    },

    i18n: {
        strategy: 'no_prefix',
        defaultLocale: 'en',
        locales: [
            { code: 'en', name: 'English', file: 'en.json' },
            { code: 'id', name: 'Bahasa Indonesia', file: 'id.json' }
        ],
        detectBrowserLanguage: {
            useCookie: true,
            cookieKey: 'restopos_locale',
            fallbackLocale: 'en'
        }
    },

    pwa: {
        registerType: 'autoUpdate',
        manifest: {
            name: 'RestoPOS — Restaurant Management',
            short_name: 'RestoPOS',
            description: 'Point of sale and management for RestoSystem',
            theme_color: '#d97706',
            background_color: '#ffffff',
            display: 'standalone',
            start_url: '/',
            icons: [
                { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
                { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
                { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
            ]
        },
        workbox: {
            navigateFallback: null,
            globPatterns: ['**/*.{js,css,html,png,svg,ico,woff2}'],
            runtimeCaching: [
                {
                    // POS data must stay live — never serve API responses from cache.
                    urlPattern: /\/api\//,
                    handler: 'NetworkOnly'
                }
            ]
        },
        client: {
            installPrompt: true
        }
    }
})
