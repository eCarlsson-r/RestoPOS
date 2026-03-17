import Echo from 'laravel-echo'
import { defineNuxtPlugin, useCookie, useRuntimeConfig } from 'nuxt/app'
import Pusher from 'pusher-js'

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

declare module 'nuxt/app' {
    interface NuxtApp {
        $echo: Echo<'pusher'>
    }
}

declare module 'vue' {
    interface ComponentCustomProperties {
        $echo: Echo<'pusher'>
    }
}

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig()
    const token = useCookie('auth_token')

    window.Pusher = Pusher

    const echo = new Echo({
        broadcaster: 'reverb' as 'pusher',
        key: config.public.echo?.key || 'h041wsoaf2e5u5irq4hd',
        wsHost: 'localhost', // Or your production host
        wsPort: 8080,
        wssPort: 8080,
        forceTLS: false,
        enabledTransports: ['ws', 'wss'],
        // Authentication for Private Channels
        authEndpoint: 'http://restosystem-api.test/api/broadcasting/auth',
        auth: {
            headers: {
                Authorization: token.value ? `Bearer ${token.value}` : '',
                Accept: 'application/json'
            }
        }
    })

    return {
        provide: {
            echo
        }
    }
})
