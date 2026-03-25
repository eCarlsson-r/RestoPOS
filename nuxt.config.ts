// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
        '@nuxt/eslint',
        '@nuxt/ui',
        '@pinia/nuxt'
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
    }
})
