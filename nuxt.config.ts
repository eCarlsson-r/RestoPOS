// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    modules: [
        '@nuxt/eslint',
        '@nuxt/ui',
        '@pinia/nuxt',
        'nuxt-laravel-echo'
    ],

    devtools: {
        enabled: true
    },

    css: ['~/assets/css/main.css'],

    runtimeConfig: {
        public: {
            apiBase: 'http://restosystem-api.test/'
        }
    },

    routeRules: {
        '/': { prerender: true }
    },

    compatibilityDate: '2025-01-15',

    vite: {
        optimizeDeps: {
            include: ['nuxt-laravel-echo > pusher-js']
        }
    },

    echo: {
        key: 'REPLACE_ME', // Your Laravel Echo app key
        authentication: {
            mode: 'cookie',
            baseUrl: 'http://restosystem-api.test/' // Your Laravel app URL
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
