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
            apiBase: 'http://restosystem-api.test/',
            echo: {
                key: 'h041wsoaf2e5u5irq4hd', // Your Laravel Echo app key
                authentication: {
                    mode: 'cookie',
                    baseUrl: 'http://restosystem-api.test/' // Your Laravel app URL
                }
            }
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
