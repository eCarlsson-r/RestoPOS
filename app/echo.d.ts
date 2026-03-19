import type Echo from 'laravel-echo'
import type Pusher from 'pusher-js'

declare module '#app' {
    interface NuxtApp {
        $echo: Echo<'pusher'>
    }
}

declare module 'vue' {
    interface ComponentCustomProperties {
        $echo: Echo<'pusher'>
    }
}

declare module 'nuxt/schema' {
    interface PublicRuntimeConfig {
        echo: {
            key: string
            authentication: {
                mode: string
                baseUrl: string
            }
        }
    }
}

declare global {
    interface Window {
        Pusher: typeof Pusher
        Echo: Echo<'pusher'>
    }
}

export {}
